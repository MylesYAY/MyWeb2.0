# MyWeb Installers

MyWeb desktop installers are produced by `electron-builder` and written to `dist/` after running:

```bash
npm install
npm run build
```

Artifacts are named using the pattern `MyWeb-${version}-${os}-${arch}.${ext}` (configured in `package.json`).

Expected outputs include:
- macOS: `MyWeb-${version}-mac-${arch}.dmg`
- Windows: `MyWeb-${version}-win-${arch}.exe` (NSIS)
- Linux: `MyWeb-${version}-linux-${arch}.AppImage`

Note: The `dist/` directory is `.gitignore`d; rebuild locally to obtain installers.
