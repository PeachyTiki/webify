# WebP Converter

Convert any image or video to WebP. Electron + Vite + React + TypeScript.

## Install

```bash
npm install
```

> **Note on native modules:** `sharp` contains precompiled C++ bindings for the current platform.
> `ffmpeg-static` bundles a platform-specific ffmpeg binary.
> Both are downloaded for your host OS at install time — you **cannot** cross-build.
> Build the macOS `.dmg` on macOS; build the Windows `.exe` on Windows.

## Development

```bash
npm run dev
```

## Production builds

```bash
# macOS → release/WebP Converter-x.y.z.dmg  (must run on macOS)
npm run dist:mac

# Windows → release/WebP Converter Setup x.y.z.exe  (must run on Windows)
npm run dist:win
```

## ffmpeg libwebp check

On startup the app verifies the bundled ffmpeg has the `libwebp` encoder:

```
ffmpeg -hide_banner -encoders | grep libwebp
```

If the encoder is absent the "Video: off" pill appears in the header and video
conversion is disabled. The officially distributed `ffmpeg-static` builds include
libwebp on all platforms.

## macOS Gatekeeper

The distributed `.dmg` is not code-signed. On first launch macOS will say
"unidentified developer". To open anyway: **right-click → Open**.

For distribution, sign and notarize the app with an Apple Developer ID:
- Set `mac.identity` in `electron-builder` config.
- Run `electron-builder --mac` on a Mac with the certificate in Keychain.
- Submit to Apple notarization via `xcrun notarytool`.

## Windows SmartScreen

The unsigned `.exe` installer may trigger a SmartScreen warning. Click
"More info → Run anyway" for personal use. For distribution, sign the
installer with an EV code-signing certificate.

## Architecture notes

- **Renderer (React):** UI only — no filesystem access.
- **Main process:** all conversion (sharp + ffmpeg) runs here.
- **Preload:** exposes a typed `window.api` via `contextBridge`.
  - `contextIsolation: true` — renderer JS cannot access Node APIs.
  - `nodeIntegration: false` — renderer cannot `require()` Node modules.
  - `sandbox: false` — required so the preload script itself can load native
    modules (sharp, ffmpeg-static) on behalf of the main process. With
    `sandbox: true` the preload runs in a Chromium sandbox that blocks
    `require()` for native binaries entirely.

## Output

Converted files land in a timestamped folder inside your Downloads directory:

```
~/Downloads/webp_2026-06-24_140312/
```

The folder opens automatically when conversion finishes.
