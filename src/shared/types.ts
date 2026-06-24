export type OutputMode = 'same' | 'downloads' | 'custom'

export type ConvOptions = {
  quality: number        // 1..100, default 90
  lossless: boolean      // default false
  nearLossless: boolean  // images only, default false
  fpsCap: number | null  // null = keep source fps
  maxWidth: number | null
  keepMetadata: boolean  // stills only, default false
}

export const DEFAULT_OPTIONS: ConvOptions = {
  quality: 90,
  lossless: false,
  nearLossless: false,
  fpsCap: null,
  maxWidth: null,
  keepMetadata: false,
}

export type FileEntry = {
  path: string
  name: string
  kind: 'image-static' | 'image-animated' | 'video' | 'unknown'
  bytes: number
  width?: number
  height?: number
  durationSec?: number
  fps?: number
}

export type ConvJob = {
  path: string
  options: ConvOptions
}

export type ConversionResult = {
  input: string
  output: string | null
  kind: 'static' | 'animated' | 'video' | 'skipped' | 'failed'
  inBytes: number
  outBytes: number | null
  larger: boolean
  error?: string
}

export type ConvertResponse = {
  outDir: string
  results: ConversionResult[]
}
