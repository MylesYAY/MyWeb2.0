# MyWeb2.0

A slick, Google-inspired experience with a blue accent in always-on dark mode. Search Wikipedia definitions, take notes with MyDocs, and use `/commands` to multitask quickly.

## Getting started

1. Open `index.html` in your browser (or run a static server such as `python -m http.server 8000`).
2. Use the central search bar:
   - Type anything to search Wikipedia definitions.
   - `/wiki topic` for definitions only.
   - `/doc name` to open or create a MyDoc note.
   - `/clear` to reset the UI.
3. MyDocs:
   - Enter a name and write notes; click **Save** to store encrypted content locally, or **Download .mydoc** to export (Caesar cipher + Base64).
   - Use the file picker to import a `.mydoc` file; it will be decrypted and stored locally.
4. Keyboard: press <kbd>Ctrl/Cmd + K</kbd> to focus the search box.
