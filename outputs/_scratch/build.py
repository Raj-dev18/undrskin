#!/usr/bin/env python3
"""Assemble the single-file UndrSkin demo: head + body + three.js tag + app.js,
   with every {{A:name}} token swapped for an inlined base64 WebP data URI."""
import re, sys, pathlib

SRC = pathlib.Path('/sessions/gallant-sharp-allen/mnt/outputs/_scratch/src')
B64 = pathlib.Path('/tmp/w/b64')
OUT = pathlib.Path('/sessions/gallant-sharp-allen/mnt/outputs/undrskin-3d-demo.html')

head = (SRC / 'head.html').read_text(encoding='utf-8')
body = (SRC / 'body.html').read_text(encoding='utf-8')
app = (SRC / 'app.js').read_text(encoding='utf-8')

three = ('<script src="https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js" '
         'crossorigin="anonymous" referrerpolicy="no-referrer"></script>\n')

doc = head + body + '\n' + three + '<script>\n' + app + '\n</script>\n</body>\n</html>\n'

used = {}
def sub(m):
    n = m.group(1)
    p = B64 / (n + '.txt')
    if not p.exists():
        sys.exit('MISSING ASSET: ' + n)
    used[n] = used.get(n, 0) + 1
    return p.read_text(encoding='utf-8').strip()

doc, n_sub = re.subn(r'\{\{A:([a-z0-9_]+)\}\}', sub, doc)

leftover = re.findall(r'\{\{[^}]*\}\}', doc)
if leftover:
    sys.exit('UNRESOLVED TOKENS: ' + str(set(leftover)))

OUT.parent.mkdir(parents=True, exist_ok=True)
OUT.write_text(doc, encoding='utf-8')

# ---- verification -------------------------------------------------------
scratch = pathlib.Path('/tmp/w/verify')
scratch.mkdir(parents=True, exist_ok=True)
js = doc.split('<script>\n', 1)[1].rsplit('\n</script>', 1)[0]
(scratch / 'inline.js').write_text(js, encoding='utf-8')

print('substitutions: %d  (%s)' % (n_sub, ', '.join('%s x%d' % kv for kv in sorted(used.items()))))
print('output: %s' % OUT)
print('size:   %.1f KB' % (OUT.stat().st_size / 1024))
for tag in ('<body', '</body>', '</html>', '<style>', '</style>'):
    print('  %-9s %d' % (tag, doc.count(tag)))
print('script tags: %d   data:image/webp: %d' % (doc.count('<script'), doc.count('data:image/webp')))

ids_used = set(re.findall(r"[\$#]\('#([A-Za-z0-9_]+)'\)", js)) | set(re.findall(r"getElementById\('([A-Za-z0-9_]+)'\)", js))
ids_html = set(re.findall(r'\sid="([A-Za-z0-9_]+)"', body))
missing = sorted(i for i in ids_used if i not in ids_html)
print('ids referenced in JS but absent from markup: %s' % (missing or 'none'))
