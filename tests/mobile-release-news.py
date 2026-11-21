"""Compare access to the same revision sheet on two static builds, using Chromium."""
import argparse
import base64
from contextlib import contextmanager
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path
import json
import os
import shutil
import threading
import time

from playwright.sync_api import TimeoutError as PlaywrightTimeout, sync_playwright

PDF = 'assets/psychometrie-20261112/Psychometrie_Cours_complet.pdf'
PROFILE = dict(latency=80, downloadThroughput=2_000_000, uploadThroughput=1_000_000,
               connectionType='cellular4g', offline=False)


@contextmanager
def site(directory, local_pdf_links=False):
    class Handler(SimpleHTTPRequestHandler):
        def __init__(self, request, client_address, server):
            super().__init__(request, client_address, server, directory=str(server.root))

        def do_GET(self):
            # On Pages the absolute catalogue links and the worker share an origin.
            if local_pdf_links and self.path == '/sheets-3.json':
                data = (server.root / 'sheets-3.json').read_bytes().replace(
                    b'https://quentinlemaire92220-alt.github.io/ifsi-abc-revisions/assets/', b'/assets/')
                self.send_response(200)
                self.send_header('Content-Type', 'application/json')
                self.send_header('Content-Length', str(len(data)))
                self.end_headers()
                self.wfile.write(data)
            else:
                super().do_GET()

        def log_message(self, *args):
            pass

    server = ThreadingHTTPServer(('127.0.0.1', 0), Handler)
    server.root = directory
    thread = threading.Thread(target=server.serve_forever, daemon=True)
    thread.start()
    try:
        yield server, f'http://127.0.0.1:{server.server_port}/index.html'
    finally:
        server.shutdown()
        server.server_close()


def find_course(page):
    # Use the same student-visible search, course and expandable section in both builds.
    search = page.locator('#v813Search')
    search.fill('Psychométrie')
    page.locator('#v813Results [data-v813course="psychometrie"]').click()


def sheet_link(page):
    detail = page.locator('#v74CourseDetail')
    # Decoration moves the initially visible link into a collapsed panel.
    # Wait for the finished control before interacting, on both versions.
    toggle = page.get_by_role('button', name='Fiches de révision', exact=False)
    section = detail.locator('.mku-resource').filter(has=toggle)
    section.get_by_role('button', name='Fiches de révision', expanded=False).click()
    return section.locator(f'.mku-panel:not([hidden]) a[href$="{PDF}"]').first


def open_sheet(page, started, legacy=False):
    find_course(page)
    link = sheet_link(page)
    # The clock stops when the actual document link is activated. PDF rendering is separate.
    page.evaluate("""() => {
        window.activatedSheet = null;
        function activated(event) {
            const link = event.target.closest('a[href]');
            if (link && event.isTrusted) {
                window.activatedSheet = link.href;
                document.removeEventListener('click', activated, true);
            }
        }
        document.addEventListener('click', activated, true);
    }""")
    if legacy:
        # The previous build could close the panel once as late data arrived.
        try:
            link.click(timeout=3500)
        except PlaywrightTimeout:
            if not link.is_visible():
                link = sheet_link(page)
            link.click()
    else:
        link.click()
    duration = time.monotonic() - started
    assert page.evaluate('window.activatedSheet').endswith('/' + PDF)
    for popup in page.context.pages:
        if popup != page:
            popup.close()
    return round(duration, 2)


def installed(page):
    page.wait_for_function("""() => navigator.serviceWorker.controller &&
        window.IFSI_QCM_LOAD?.status === 'ready'""", timeout=150_000)


def check_journal(page):
    page.locator('#v87Settings').click()
    page.locator('#v87LogDisclosure > summary').click()
    more = page.locator('#v87HistoryMore')
    more.click()
    assert page.locator('#v87Log summary').filter(has_text='V7.4.2').count() == 1
    assert page.locator('#v87Log summary').filter(has_text='V8.30.195').count() == 1


def run(browser, baseline, candidate, upgrade):
    with site(baseline) as (server, url):
        context = browser.new_context(viewport={'width': 390, 'height': 844},
                                      is_mobile=True, has_touch=True, device_scale_factor=2)
        context.add_init_script("localStorage.setItem('ifsiabc_analytics_optout_v1', '1')")
        # Keep copied GitHub Pages links local. The PDF is excluded from the timing.
        context.route(f'https://*/**/{PDF}', lambda route: route.fulfill(
            path=str(server.root / PDF), content_type='application/pdf'))
        page = context.new_page()
        page.set_default_timeout(60_000)
        cdp = context.new_cdp_session(page)
        cdp.send('Network.enable')
        cdp.send('Network.emulateNetworkConditions', PROFILE)
        started = time.monotonic()
        page.goto(url, wait_until='commit')
        cold = open_sheet(page, started, legacy=upgrade)
        print(f'{baseline.name}: first document link activated in {cold}s',flush=True)
        cdp.send('Network.emulateNetworkConditions', dict(PROFILE, latency=0, downloadThroughput=-1, uploadThroughput=-1))
        installed(page)
        # Block the local server's responses, including fetches made by the service worker.
        # A fresh navigation must still show the course and allow its sheet to be selected.
        if not upgrade:
            check_journal(page)
        def stop_serving(*args):
            args[0].close()
        original = server.finish_request
        server.finish_request = stop_serving
        started = time.monotonic()
        page.goto(url, wait_until='commit')
        offline = open_sheet(page, started, legacy=upgrade)
        if not upgrade:
            check_journal(page)
        server.finish_request = original
        print(f'{baseline.name}: cold={cold}s offline={offline}s', flush=True)
        version = json.loads((candidate / 'build-meta.json').read_text())['version']
        if upgrade and page.evaluate('window.IFSI_APP_VERSION') != version:
            server.root = candidate
            cdp.send('Network.emulateNetworkConditions', PROFILE)
            started = time.monotonic()
            page.evaluate('navigator.serviceWorker.getRegistration().then(r => r.update()).then(()=>true)')
            page.wait_for_function('v=>window.IFSI_APP_VERSION===v', arg=version, timeout=180_000)
            print(f'After update including activation: {open_sheet(page, started)}s', flush=True)
        context.close()


def check_progressive_offline(browser, directory):
    import pymupdf

    with site(directory, local_pdf_links=True) as (server, url):
        context = browser.new_context(viewport={'width': 390, 'height': 844},
                                      is_mobile=True, has_touch=True)
        context.add_init_script(r"""(() => {
            localStorage.setItem('ifsiabc_analytics_optout_v1', '1');
            const fetchData = window.fetch.bind(window);
            const gates = {};
            for (const name of ['sheet', 'rest']) {
                gates[name] = new Promise(resolve => { window['release_' + name] = resolve });
            }
            window.fetch = async (input, ...args) => {
                const path = new URL(input.url || input, location.href).pathname;
                if (path.endsWith('/sheets-3.json')) await gates.sheet;
                else if (/\/(sheets-[12]|questions-\d+|infographics|vocals|vocabulaire-v1|audio-series-v1)\.json$/.test(path))
                    await gates.rest;
                return fetchData(input, ...args);
            };
        })()""")
        page = context.new_page()
        page.set_default_timeout(30_000)
        page.goto(url, wait_until='commit')
        find_course(page)
        assert page.locator('#v74CourseDetail h2').inner_text() == 'Psychométrie'
        assert page.evaluate("IFSI_V741.resourcesForCourse('psychometrie').sheets.length") == 0
        page.evaluate('release_sheet()')
        link = sheet_link(page)
        link.wait_for()
        assert page.evaluate("IFSI_V741.resourcesForCourse('psychometrie').questions.length") == 0
        page.evaluate('release_rest()')
        installed(page)
        page.wait_for_function("IFSI_V741.resourcesForCourse('psychometrie').questions.length >= 49")
        link.wait_for()
        assert page.locator('#v74CourseDetail #v74CourseAll').count() == 1

        # Reopen the installed app with a fresh tab, no server and no browser network.
        page.close()
        server.finish_request = lambda sock, _: sock.close()
        context.set_offline(True)
        page = context.new_page()
        started = time.monotonic()
        page.goto(url, wait_until='commit')
        find_course(page)
        page.evaluate('release_sheet()')
        link = sheet_link(page)
        # The trusted click stays on the real PDF URL. Capture its navigation response.
        pdf_url = link.evaluate('a => a.href')
        # Chrome can expose its PDF viewer's own document in response.body().
        # Observe the worker's reply to this exact navigation before the viewer takes over.
        worker_url = page.evaluate('navigator.serviceWorker.controller.scriptURL')
        worker = next(w for w in context.service_workers if w.url == worker_url)
        worker.evaluate("""url => {
            const respond = FetchEvent.prototype.respondWith;
            FetchEvent.prototype.respondWith = function(response) {
                if (this.request.mode === 'navigate' && this.request.url === url) {
                    FetchEvent.prototype.respondWith = respond;
                    self.offlinePdfBytes = Promise.resolve(response).then(r => r.clone().arrayBuffer());
                    this.waitUntil(self.offlinePdfBytes);
                }
                return respond.call(this, response);
            };
        }""", pdf_url)
        with context.expect_event('response', predicate=lambda r: r.url == pdf_url and
                                  r.request.is_navigation_request()) as opened:
            link.click()
        response = opened.value
        assert response.from_service_worker and response.status == 200
        assert response.headers['content-type'].startswith('application/pdf')
        elapsed_click = time.monotonic() - started
        encoded = worker.evaluate("""async () => {
            if (!self.offlinePdfBytes) throw Error('Navigation PDF absente du service worker');
            const bytes = new Uint8Array(await self.offlinePdfBytes);
            return btoa(Array.from(bytes, b => String.fromCharCode(b)).join(''));
        }""")
        data = base64.b64decode(encoded, validate=True)
        assert data == (directory / PDF).read_bytes(), 'Le PDF servi hors ligne diffère du fichier publié'
        with pymupdf.open(stream=data, filetype='pdf') as document:
            pixels = document[0].get_pixmap().digest
        elapsed_render = time.monotonic() - started
        with pymupdf.open(directory / PDF) as reference:
            assert pixels == reference[0].get_pixmap().digest
        ranged = page.evaluate("""async url => {
            const response = await fetch(url, {headers: {Range:'bytes=0-4'}});
            return [response.status, response.headers.get('Content-Range'), await response.text()];
        }""", pdf_url)
        assert ranged == [206, f'bytes 0-4/{len(data)}', '%PDF-']
        print(f'Offline, other catalogues held: PDF opened {elapsed_click:.2f}s; '
              f'first page rasterized and checked with MuPDF {elapsed_render:.2f}s', flush=True)
        context.close()


def check_early_revision(browser, directory):
    # Keep sheets pending so the background timer cannot win the race with the student.
    with site(directory) as (_, url):
        context = browser.new_context(viewport={'width': 390, 'height': 844}, is_mobile=True,
                                      has_touch=True, service_workers='block')
        context.add_init_script(r"""(() => {
            localStorage.setItem('ifsiabc_analytics_optout_v1', '1');
            window.bankRequests = [];
            const bank = new Promise(resolve => {window.releaseBank = resolve});
            const fetchData = window.fetch.bind(window);
            window.fetch = async (input, ...args) => {
                const path = new URL(input.url || input, location.href).pathname;
                if (/\/(sheets-\d+|vocabulaire-v1)\.json$/.test(path)) return new Promise(()=>{});
                if (/\/questions-\d+\.json$/.test(path)) {
                    window.bankRequests.push(path);
                    await bank;
                }
                return fetchData(input, ...args);
            };
        })()""")
        page = context.new_page()
        page.goto(url, wait_until='commit')
        center = page.locator('#v87Center')
        center.wait_for()
        assert page.evaluate('bankRequests.length') == 0
        center.click()
        page.wait_for_function('bankRequests.length === 5')
        page.locator('#fcOpen').click()
        status = page.locator('#fcApp [role="status"]')
        assert 'Chargement des flashcards' in status.inner_text()
        page.evaluate('releaseBank()')
        page.locator('#fcContinue').click()
        page.locator('#fcQuit').wait_for()
        assert page.evaluate('new Set(bankRequests).size === 5 && bankRequests.length === 5')
        page.close()

        for leave in [False, True]:
            page = context.new_page()
            page.goto(url, wait_until='commit')
            page.locator('#v87Center').click()
            page.locator('#v8312Start').click()
            assert page.locator('#v8312Start').is_disabled()
            if leave:
                page.locator('#v87Home').click()
            page.evaluate('releaseBank()')
            page.wait_for_function("window.IFSI_QCM_LOAD.status === 'ready'")
            if leave:
                assert page.locator('#quiz').is_hidden() and page.locator('#home').is_visible()
            else:
                page.locator('#quiz').wait_for()
                assert page.locator('#qtext').inner_text().strip()
            page.close()
        context.close()
        print('Mobile: early revision fetched each pack once, started a quiz or flashcards, and respected a return home', flush=True)


if __name__ == '__main__':
    parser = argparse.ArgumentParser()
    parser.add_argument('baseline', type=Path)
    args = parser.parse_args()
    candidate = Path.cwd()
    with sync_playwright() as api:
        browser = api.chromium.launch(executable_path=os.getenv('CHROME_BIN') or shutil.which('google-chrome') or shutil.which('chromium'),
                                      args=['--no-sandbox', '--disable-dev-shm-usage'])
        run(browser, args.baseline.resolve(), candidate, upgrade=True)
        run(browser, candidate, candidate, upgrade=False)
        check_progressive_offline(browser, candidate)
        check_early_revision(browser, candidate)
        browser.close()
