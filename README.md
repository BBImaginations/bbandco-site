# BB & Co Imaginations website

Static site for https://bbandcoimaginations.co.uk, hosted free on GitHub Pages.

## Folder map
- `index.html` — home
- `books.html`, `music.html`, `youtube.html`, `about.html` — main pages
- `blog/index.html` — blog list; each post is its own file in `blog/`
- `assets/style.css` — all styling
- `assets/covers/` — book covers (see README.txt inside)
- `CNAME` — tells GitHub Pages which domain this site answers to. Do not delete.

## Adding a blog post
1. Copy `blog/2026-09-hello.html`, rename it e.g. `blog/2026-11-new-song.html`.
2. Change the title, date and paragraphs inside.
3. Add a matching `<li class="post-card">...</li>` entry at the top of the list in `blog/index.html`.
4. Commit. The site updates in about a minute.

## Things to fill in
- `YOUR_FORM_ID` in every `formspree.io/f/...` form action (5 places) — get it from formspree.io after creating a free form.
- YouTube embed in `youtube.html` once the channel exists (see the HTML comment).
- Cover images and song artwork (see `assets/covers/README.txt`).
