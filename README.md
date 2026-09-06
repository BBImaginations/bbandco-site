# BB & Co Imaginations website

Static site for https://bbandcoimaginations.co.uk, hosted free on GitHub Pages.

## Folder map
- `index.html` — home
- `books.html`, `music.html`, `youtube.html`, `games.html`, `about.html` — main pages
- `blog/index.html` — blog list; each post is its own file in `blog/`
- `assets/style.css` — all styling
- `assets/covers/` — book covers (see README.txt inside)
- `CNAME` — tells GitHub Pages which domain this site answers to. Do not delete.

## Adding a blog post
1. Copy `blog/2026-09-christmas-markets.html`, rename it e.g. `blog/2026-11-new-post.html`.
2. Change the title, date and paragraphs inside.
3. Add a matching `<li class="post-card">...</li>` entry at the top of the list in `blog/index.html`.
4. Commit. The site updates in about a minute.

## Things to fill in
- Formspree form ID `moeqnalk` is already in place.
- YouTube embed in `youtube.html` once the channel exists (see the HTML comment).
