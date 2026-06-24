import { app, BrowserWindow, dialog, ipcMain, shell } from 'electron'
import * as path from 'node:path'
import * as fs from 'node:fs'
import { electronApp, optimizer, is } from '@electron-toolkit/utils'
import { initFfmpeg, probeFiles, convertBatch, VIDEO_EXTS, IMAGE_EXTS } from './converter'
import type { ConvJob, ConversionResult } from '../shared/types'

let mainWindow: BrowserWindow | null = null
let _videoAvailable = false

function createWindow(): void {
  mainWindow = new BrowserWindow({
    width: 900,
    height: 720,
    minWidth: 700,
    minHeight: 500,
    show: false,
    autoHideMenuBar: true,
    backgroundColor: '#1a1a1a',
    webPreferences: {
      // contextIsolation keeps renderer code sandboxed from Node.
      // nodeIntegration is off so renderer cannot require() Node modules.
      // sandbox:false is required because the preload script needs to load
      // native modules (sharp, ffmpeg-static) via require() on behalf of main.
      // With sandbox:true the preload runs in a restricted environment that
      // blocks native module loading entirely.
      preload: path.join(__dirname, '../preload/index.js'),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: false,
    },
  })

  mainWindow.on('ready-to-show', () => {
    mainWindow?.show()
    mainWindow?.webContents.send('video-status', _videoAvailable)
  })

  if (is.dev && process.env['ELECTRON_RENDERER_URL']) {
    mainWindow.loadURL(process.env['ELECTRON_RENDERER_URL'])
  } else {
    mainWindow.loadFile(path.join(__dirname, '../../dist/index.html'))
  }
}

app.whenReady().then(async () => {
  electronApp.setAppUserModelId('com.monteo.webpconverter')

  app.on('browser-window-created', (_, window) => {
    optimizer.watchWindowShortcuts(window)
  })

  const ffmpegStatus = await initFfmpeg()
  _videoAvailable = ffmpegStatus.available

  createWindow()

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit()
})

// ---------------------------------------------------------------------------
// IPC handlers
// ---------------------------------------------------------------------------

ipcMain.handle('choose-files', async () => {
  if (!mainWindow) return []
  const { canceled, filePaths } = await dialog.showOpenDialog(mainWindow, {
    title: 'Choose Files',
    properties: ['openFile', 'multiSelections'],
    filters: [{ name: 'All Files', extensions: ['*'] }],
  })
  if (canceled || !filePaths.length) return []
  return probeFiles(filePaths)
})

ipcMain.handle('choose-folder', async (_e, recursive: boolean = true) => {
  if (!mainWindow) return []
  const { canceled, filePaths } = await dialog.showOpenDialog(mainWindow, {
    title: 'Choose Folder',
    properties: ['openDirectory'],
  })
  if (canceled || !filePaths.length) return []

  const folder = filePaths[0]
  const allFiles = collectFiles(folder, recursive)
  const supported = allFiles.filter((f) => {
    const ext = path.extname(f).toLowerCase().replace('.', '')
    return IMAGE_EXTS.has(ext) || VIDEO_EXTS.has(ext) || ext === ''
  })
  return probeFiles(supported)
})

ipcMain.handle('probe', async (_e, paths: string[]) => {
  return probeFiles(paths)
})

ipcMain.handle('convert', async (event, jobs: ConvJob[]) => {
  const stamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19)
  const outDir = path.join(app.getPath('downloads'), `webp_${stamp}`)

  const results = await convertBatch(jobs, outDir, (result: ConversionResult) => {
    event.sender.send('convert:progress', result)
  })

  // Auto-open output folder when done
  shell.openPath(outDir)

  return { outDir, results }
})

ipcMain.handle('open-path', (_e, p: string) => {
  shell.openPath(p)
})

// ---------------------------------------------------------------------------
// Helper: collect files from a directory
// ---------------------------------------------------------------------------
function collectFiles(dir: string, recursive: boolean): string[] {
  const results: string[] = []
  try {
    const entries = fs.readdirSync(dir, { withFileTypes: true })
    for (const entry of entries) {
      const full = path.join(dir, entry.name)
      if (entry.isDirectory() && recursive) {
        results.push(...collectFiles(full, true))
      } else if (entry.isFile()) {
        results.push(full)
      }
    }
  } catch {}
  return results
}
