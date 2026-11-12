#!/usr/bin/env python3
"""Builds the two downloadable archives in release/ from an existing build.

    npm run build && npm run build:standalone      # then copy dist/ into release/site/ (keep serve.mjs)
    python3 tools/make-package.py

release/DermiQ-Complete-Package.zip   the website at the TOP LEVEL (index.html, assets/, demo/ ...) plus
                                      source/, docs/, the single-file build and a README.
release/DermiQ-site.zip               the website alone.

Why the website is at the top level: static hosts (Netlify, Vercel, GitHub Pages ...) serve the index.html found
at the top of the uploaded folder. A package that keeps the site in a sub-folder answers "Page not found" at "/".
Neither archive has a wrapper folder, so the folder produced by unzipping is itself the folder to upload.
"""
import os, re, sys, zipfile

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
REL = os.path.join(ROOT, 'release')
SITE = os.path.join(REL, 'site')
PKG = os.path.join(ROOT, 'tools', 'package')
SKIP_DIRS = {'node_modules', 'dist', 'release', 'shots', '.git', '__pycache__', '.vite', '.cache'}


def walk(base):
    for d, dirs, files in os.walk(base):
        dirs[:] = sorted(x for x in dirs if x not in SKIP_DIRS)
        for f in sorted(files):
            if f.endswith('.zip') or f == '.DS_Store':
                continue
            yield os.path.join(d, f)


def check_site_root(names, label):
    """The archive must be uploadable as it is: a home page at the top, and every file that page asks for."""
    assert 'index.html' in names, f'{label}: no index.html at the top level'
    tops = {n.split('/')[0] for n in names}
    assert not (len(tops) == 1 and 'index.html' not in tops), f'{label}: wrapped in a single folder'
    return tops


def main():
    for need in (os.path.join(SITE, 'index.html'), os.path.join(REL, 'DermiQ-standalone.html')):
        if not os.path.exists(need):
            sys.exit(f'missing {need} — build first')
    html = open(os.path.join(SITE, 'index.html'), encoding='utf-8').read()
    refs = sorted(set(re.findall(r'(?:src|href)="\./([^"#?]+)"', html)))

    # 1) the complete package: website at the top level, everything else beside it
    out = os.path.join(REL, 'DermiQ-Complete-Package.zip')
    with zipfile.ZipFile(out + '.new', 'w', zipfile.ZIP_DEFLATED, compresslevel=9) as z:
        for p in walk(SITE):
            rel = os.path.relpath(p, SITE).replace(os.sep, '/')
            if rel == '_redirects':
                continue                                   # replaced by the package rules below
            z.write(p, rel)
        z.write(os.path.join(PKG, '_redirects'), '_redirects')
        z.write(os.path.join(PKG, 'README.txt'), 'README.txt')
        z.write(os.path.join(REL, 'DermiQ-standalone.html'), 'DermiQ-standalone.html')
        for p in walk(os.path.join(ROOT, 'docs')):
            z.write(p, 'docs/' + os.path.relpath(p, os.path.join(ROOT, 'docs')).replace(os.sep, '/'))
        for p in walk(ROOT):
            z.write(p, 'source/' + os.path.relpath(p, ROOT).replace(os.sep, '/'))
    os.replace(out + '.new', out)

    # 2) the website alone
    out2 = os.path.join(REL, 'DermiQ-site.zip')
    with zipfile.ZipFile(out2 + '.new', 'w', zipfile.ZIP_DEFLATED, compresslevel=9) as z:
        for p in walk(SITE):
            rel = os.path.relpath(p, SITE).replace(os.sep, '/')
            if rel != 'serve.mjs':
                z.write(p, rel)
    os.replace(out2 + '.new', out2)

    for path in (out, out2):
        z = zipfile.ZipFile(path)
        names = set(z.namelist())
        label = os.path.basename(path)
        tops = check_site_root(names, label)
        missing = [r for r in refs if r not in names]
        assert not missing, f'{label}: index.html refers to files that are not in the archive: {missing}'
        assert '_redirects' in names and '404.html' in names, f'{label}: hosting rules missing'
        assert z.testzip() is None, f'{label}: corrupt entry'
        assert not any('node_modules/' in n for n in names), f'{label}: node_modules leaked in'
        print(f'{label}: {len(names)} files, {os.path.getsize(path) / 1e6:.2f} MB — index.html at the top level; '
              f'top level: {", ".join(sorted(tops))}')


if __name__ == '__main__':
    main()
