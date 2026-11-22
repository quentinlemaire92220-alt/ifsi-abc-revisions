"""Exercise full service-worker installations, Cache Storage and network failures in Chromium."""
import base64
import hashlib
import json
import re
from urllib.parse import urlsplit

THUMBNAIL = 'assets/course-thumbnails/biomolecules.webp'
PDF = 'assets/psychometrie-20261112/Psychometrie_Cours_complet.pdf'


def fingerprint(data):
    return base64.b64encode(hashlib.sha256(data).digest()).decode()


def register(page, build, *, reject=False, attempt=''):
    state = page.evaluate("""async url => {
        const registration = await navigator.serviceWorker.register(url, {scope:'/', updateViaCache:'none'});
        const worker = registration.installing || registration.waiting || registration.active;
        return new Promise(resolve => {
            function changed() {
                if (['activated','redundant'].includes(worker.state)) resolve(worker.state);
            }
            worker.addEventListener('statechange', changed);
            changed();
        });
    }""", '/sw.js?v=' + build + attempt)
    assert state == ('redundant' if reject else 'activated'), (build, state)
    if not reject:
        page.evaluate("navigator.serviceWorker.controller?.postMessage({type:'IFSI_ACTIVE_BUILD'})")
        page.wait_for_function('v => window.mediaTestBuild === v', arg=build)


def check_media_updates(browser, baseline, candidate, site, *, damaged=False):
    current_worker = (candidate / 'sw.js').read_text()
    match = re.search(r'const MEDIA_DIGESTS = (\{.*?\n\});', current_worker, re.S)
    hashes = json.loads(match[1])
    media = {name.removeprefix('./') for name in hashes}
    old_build = json.loads((baseline / 'build-meta.json').read_text())['build']
    build = json.loads((candidate / 'build-meta.json').read_text())['build']
    if old_build == build:
        return
    with site(baseline) as (server, url):
        context = browser.new_context()
        page = context.new_page()
        page.goto(url.replace('/index.html', '/depannage/reparer-cache.html'))
        page.evaluate("""() => {
            const sw = navigator.serviceWorker;
            sw.addEventListener('message', e => {
                if (e.source === sw.controller && e.data?.type === 'IFSI_ACTIVE_BUILD') window.mediaTestBuild=e.data.build;
            });
            sw.addEventListener('controllerchange', () => sw.controller?.postMessage({type:'IFSI_ACTIVE_BUILD'}));
        }""")
        register(page, old_build)
        old_assets = set(context.service_workers[0].evaluate('BASE_ASSETS'))
        changed = {name for name in media if './' + name not in old_assets or
                   fingerprint((baseline / name).read_bytes()) != hashes['./' + name]}
        if damaged:
            # Reproduce a 503 cached by a legacy worker and a PDF evicted by the browser.
            page.evaluate("""async ([thumbnail,pdf]) => {
                const shell=await caches.open((await caches.keys()).find(k=>k.startsWith('ifsi-abc-v')));
                await shell.put('/'+thumbnail,new Response('indisponible',{status:503}));
                if (!await shell.delete('/'+pdf)) throw Error('Legacy PDF missing from fixture');
            }""", [THUMBNAIL, PDF])
            changed.update([THUMBNAIL, PDF])
        server.root = candidate
        handler = server.RequestHandlerClass
        normal_get = handler.do_GET
        blocked = media - changed
        requests = []
        overrides = {}

        def serve(request):
            name = urlsplit(request.path).path.lstrip('/')
            if name in media:
                requests.append(name)
            if name in blocked:
                request.send_error(503)
            elif name in overrides:
                body, mime = overrides[name]
                request.send_response(200)
                request.send_header('Content-Type', mime)
                request.send_header('Content-Length', str(len(body)))
                request.send_header('Cache-Control', 'no-store')
                request.end_headers()
                request.wfile.write(body)
            else:
                normal_get(request)

        handler.do_GET = serve
        register(page, build)
        assert sorted(requests) == sorted(changed), requests
        print(f'Upgrade {old_build} -> {build}: {len(media)-len(changed)}/{len(media)} media reused; '
              f'{len(requests)} media requests', flush=True)

        def check_thumbnail(expected):
            digest = page.evaluate("""async path => {
                const image=new Image();
                image.src='/'+path;
                await image.decode();
                if (!image.naturalWidth) throw Error('Empty thumbnail');
                const r=await fetch('/'+path);
                const sum=await crypto.subtle.digest('SHA-256',await r.arrayBuffer());
                return btoa(String.fromCharCode(...new Uint8Array(sum)));
            }""", THUMBNAIL)
            assert digest == expected

        blocked = media
        requests.clear()
        check_thumbnail(hashes['./' + THUMBNAIL])
        context.set_offline(True)
        check_thumbnail(hashes['./' + THUMBNAIL])
        assert page.evaluate("""async path => {
            const r=await fetch('/'+path,{headers:{Range:'bytes=0-4'}});
            return [r.status,await r.text()];
        }""", PDF) == [206, '%PDF-']
        context.set_offline(False)
        assert not requests

        if damaged:
            context.close()
            return

        # Keep the URL while changing the bytes in a fixture release. Refuse a corrupted
        # download, keep serving the active release, then retry with the approved bytes.
        next_build = build + '-fixture'
        other = next(n for n in sorted(media) if n.endswith('.webp') and hashes['./'+n] != hashes['./'+THUMBNAIL])
        replacement = (candidate / other).read_bytes()
        next_hashes = {**hashes, './' + THUMBNAIL: fingerprint(replacement)}
        next_worker = current_worker[:match.start(1)] + json.dumps(next_hashes) + current_worker[match.end(1):]
        next_worker = next_worker.replace("const BUILD='" + build + "'", "const BUILD='" + next_build + "'")
        next_worker = next_worker.replace("const CACHE='", "const CACHE='ifsi-abc-v-fixture-")
        overrides['sw.js'] = (next_worker.encode(), 'text/javascript')
        blocked = media - {THUMBNAIL}
        overrides[THUMBNAIL] = (b'damaged', 'image/webp')
        register(page, next_build, reject=True)
        check_thumbnail(hashes['./' + THUMBNAIL])
        assert requests == [THUMBNAIL], requests
        requests.clear()
        overrides[THUMBNAIL] = (replacement, 'image/webp')
        register(page, next_build, attempt='-retry')
        check_thumbnail(fingerprint(replacement))
        assert requests == [THUMBNAIL], requests
        print('Changed thumbnail: invalid bytes rejected, old release available, '
              'only the replacement fetched on retry', flush=True)
        context.close()
