import { contextBridge, ipcRenderer } from 'electron'
import type { ConvJob, ConversionResult, ConvertResponse, FileEntry, OutputMode } from '../shared/types'

const api = {
  chooseFiles: (): Promise<FileEntry[]> =>
    ipcRenderer.invoke('choose-files'),

  chooseFolder: (recursive?: boolean): Promise<FileEntry[]> =>
    ipcRenderer.invoke('choose-folder', recursive),

  probe: (paths: string[]): Promise<FileEntry[]> =>
    ipcRenderer.invoke('probe', paths),

  chooseOutputDir: (): Promise<string | null> =>
    ipcRenderer.invoke('choose-output-dir'),

  convert: (jobs: ConvJob[], outputMode: OutputMode, customDir?: string): Promise<ConvertResponse> =>
    ipcRenderer.invoke('convert', jobs, outputMode, customDir),

  openPath: (p: string): Promise<void> =>
    ipcRenderer.invoke('open-path', p),

  onConvertProgress: (cb: (result: ConversionResult) => void) => {
    const handler = (_e: Electron.IpcRendererEvent, result: ConversionResult) => cb(result)
    ipcRenderer.on('convert:progress', handler)
    return () => ipcRenderer.off('convert:progress', handler)
  },

  onVideoStatus: (cb: (available: boolean) => void) => {
    const handler = (_e: Electron.IpcRendererEvent, available: boolean) => cb(available)
    ipcRenderer.on('video-status', handler)
    return () => ipcRenderer.off('video-status', handler)
  },
}

contextBridge.exposeInMainWorld('api', api)

export type Api = typeof api
