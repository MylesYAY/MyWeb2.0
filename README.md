# MyWeb2.0

A slick, Google-inspired experience with a blue accent in always-on dark mode. Quickly search Wikipedia definitions and share queries via the `?q=` URL parameter.

## Getting started

### Web
1. Open `index.html` in your browser (or run a static server such as `python -m http.server 8000`).
2. Use the central search bar:
   - Type anything to search Wikipedia definitions.
   - Click **Go** (or press Enter) to update results and the page URL with `?q=your+search`.
   - Click **Clear** to reset the UI.
3. To deep-link a search, append `?q=your+search` to the page URL; the query will auto-load on visit.
4. Keyboard: press <kbd>Ctrl/Cmd + K</kbd> to focus the search box.

### Desktop (Electron)
1. Install dependencies: `npm install`.
2. Run the desktop app in development: `npm start`.
3. Build platform installers: `npm run build` (outputs to `dist/`; targets dmg, nsis, and AppImage by default).
