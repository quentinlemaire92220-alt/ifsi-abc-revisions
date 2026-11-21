"""Compare access to the same revision sheet on two static builds, using Chromium."""
import argparse
from contextlib import contextmanager
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path
import json
import os
import shutil
import threading
import time

from playwright.sync_api import sync_playwright

PDF = 'assets/psychometrie-20261112/Psychometrie_Cours_complet.pdf'
PROFILE = dict(latency=80, downloadThroughput=2_000_000, uploadThroughput=1_000_000,
               connectionType='cellular4g', offline=False)


@contextmanager
def site(directory):
    class Handler(SimpleHTTPRequestHandler):
        def __init__(self, request, client_address, server):
            super().__init__(request, client_address, server, directory=str(server.root))

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


def open_sheet(page, started):
    # Use the same student-visible search, course and expandable section in both builds.
    search = page.locator('#v813Search')
    search.fill('Psychométrie')
    page.locator('#v813Results [data-v813course="psychometrie"]').click()
    detail = page.locator('#v74CourseDetail')
    link = detail.locator(f'a[href$="{PDF}"]').first
    link.wait_for(state='attached')
    if not link.is_visible():
        detail.get_by_role('button', name='Fiches de révision', exact=False).first.click()
    # The clock stops when the actual document link is activated. PDF rendering is separate.
    page.evaluate("""() => document.addEventListener('click', event => {
        const link = event.target.closest('a[href]');
        if (link && event.isTrusted) window.activatedSheet = link.href;
    }, {capture: true, once: true})""")
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
        cold = open_sheet(page, started)
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
        offline = open_sheet(page, started)
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
        browser.close()
