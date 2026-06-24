import { execFile } from 'node:child_process'
import * as fs from 'node:fs'
import * as path from 'node:path'
import { app } from 'electron'
import type { ConvJob, ConversionResult, FileEntry } from '../shared/types'

// Known extension sets for routing
const IMAGE_EXTS = new Set([
  'jpg', 'jpeg', 'png', 'webp', 'gif', 'avif', 'tiff', 'tif',
  'bmp', 'svg', 'heic', 'heif', 'jp2', 'jxl', 'ico'
])
const VIDEO_EXTS = new Set([
  'mp4', 'mov', 'webm', 'avi', 'mkv', 'm4v', 'mpg', 'mpeg',
  'wmv', 'flv', '3gp', 'ogv', 'ts', 'mts', 'm2ts'
])

// ffmpeg-static returns undefined when the binary isn't found in some edge cases
let ffmpegBin: string | null = null
let videoAvailable = false

async function initFfmpeg(): Promise<{ available: boolean; reason?: string }> {
  try {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const rawPath: string | null = require('ffmpeg-static')
    if (!rawPath) return { available: false, reason: 'ffmpeg-static returned no path' }
    ffmpegBin = resolveFfmpeg(rawPath)
    const hasLibwebp = await checkFfmpegHasLibwebp(ffmpegBin)
    if (!hasLibwebp) {
      return { available: false, reason: 'Bundled ffmpeg lacks libwebp encoder' }
    }
    videoAvailable = true
    return { available: true }
  } catch (e: unknown) {
    return { available: false, reason: String(e) }
  }
}

// Fixes the asar path for packaged builds.
// sharp and ffmpeg-static are listed in asarUnpack, so their binaries live in
// app.asar.unpacked — but Node resolves them from inside app.asar initially.
function resolveFfmpeg(p: string): string {
  if (app.isPackaged) {
    return p.replace('app.asar', 'app.asar.unpacked')
  }
  return p
}

function checkFfmpegHasLibwebp(bin: string): Promise<boolean> {
  return new Promise((resolve) => {
    execFile(bin, ['-hide_banner', '-encoders'], { timeout: 10000 }, (err, stdout) => {
      if (err) { resolve(false); return }
      resolve(stdout.includes('libwebp'))
    })
  })
}

function getExt(filePath: string): string {
  return path.extname(filePath).toLowerCase().replace('.', '')
}

async function probeImage(filePath: string): Promise<Omit<FileEntry, 'path' | 'name' | 'bytes'>> {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const sharp = require('sharp')
  const meta = await sharp(filePath, { animated: true }).metadata()
  const kind: FileEntry['kind'] = (meta.pages && meta.pages > 1) ? 'image-animated' : 'image-static'
  return {
    kind,
    width: meta.width,
    height: meta.height,
    durationSec: meta.delay
      ? (meta.delay.reduce((a: number, b: number) => a + b, 0) / 1000)
      : undefined,
    fps: (meta.delay && meta.delay.length > 1)
      ? Math.round(1000 / (meta.delay.reduce((a: number, b: number) => a + b, 0) / meta.delay.length))
      : undefined,
  }
}

function probeVideo(filePath: string): Promise<Omit<FileEntry, 'path' | 'name' | 'bytes' | 'kind'>> {
  return new Promise((resolve) => {
    if (!ffmpegBin) { resolve({}); return }
    execFile(
      ffmpegBin,
      ['-hide_banner', '-i', filePath],
      { timeout: 15000 },
      (_err, _stdout, stderr) => {
        // ffprobe-style info comes through stderr on ffmpeg -i
        const durMatch = stderr.match(/Duration:\s*([\d:.]+)/)
        const fpsMatch = stderr.match(/(\d+(?:\.\d+)?)\s*fps/)
        const dimMatch = stderr.match(/\s(\d{2,5})x(\d{2,5})/)
        let durationSec: number | undefined
        if (durMatch) {
          const [h, m, s] = durMatch[1].split(':').map(Number)
          durationSec = h * 3600 + m * 60 + s
        }
        resolve({
          durationSec,
          fps: fpsMatch ? parseFloat(fpsMatch[1]) : undefined,
          width: dimMatch ? parseInt(dimMatch[1]) : undefined,
          height: dimMatch ? parseInt(dimMatch[2]) : undefined,
        })
      }
    )
  })
}

async function classifyPath(filePath: string): Promise<FileEntry> {
  const name = path.basename(filePath)
  const ext = getExt(filePath)
  let bytes = 0
  try { bytes = fs.statSync(filePath).size } catch {}

  const base: FileEntry = { path: filePath, name, kind: 'unknown', bytes }

  if (IMAGE_EXTS.has(ext)) {
    try {
      const info = await probeImage(filePath)
      return { ...base, ...info }
    } catch {
      // fall through to video probe
    }
  }

  if (VIDEO_EXTS.has(ext) && videoAvailable) {
    const info = await probeVideo(filePath)
    return { ...base, kind: 'video', ...info }
  }

  // Unknown extension — sniff
  if (!IMAGE_EXTS.has(ext) && !VIDEO_EXTS.has(ext)) {
    try {
      const info = await probeImage(filePath)
      return { ...base, ...info }
    } catch {}
    if (videoAvailable) {
      try {
        const info = await probeVideo(filePath)
        return { ...base, kind: 'video', ...info }
      } catch {}
    }
  }

  return base
}

export async function probeFiles(filePaths: string[]): Promise<FileEntry[]> {
  return Promise.all(filePaths.map(classifyPath))
}

function buildOutputPath(outDir: string, inputPath: string): string {
  const base = path.basename(inputPath, path.extname(inputPath))
  return path.join(outDir, `${base}.webp`)
}

async function convertImage(
  inputPath: string,
  outputPath: string,
  opts: ConvJob['options']
): Promise<void> {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const sharp = require('sharp')
  // sharp also needs the asar-unpacked path for its native bindings when packaged
  let img = sharp(inputPath, { animated: true })
  const meta = await img.metadata()

  if (opts.maxWidth && meta.width && meta.width > opts.maxWidth) {
    img = img.resize({ width: opts.maxWidth })
  }
  if (opts.keepMetadata) img = img.withMetadata()

  await img
    .webp({
      quality: opts.quality,
      lossless: opts.lossless,
      nearLossless: opts.nearLossless,
      effort: 6,
      loop: meta.loop ?? 0,
    })
    .toFile(outputPath)
}

async function convertVideo(
  inputPath: string,
  outputPath: string,
  opts: ConvJob['options']
): Promise<void> {
  if (!ffmpegBin) throw new Error('ffmpeg not available')

  const vf: string[] = []
  if (opts.fpsCap) vf.push(`fps=${opts.fpsCap}`)
  if (opts.maxWidth) vf.push(`scale=${opts.maxWidth}:-2`)

  const args = [
    '-y',
    '-i', inputPath,
    '-vcodec', 'libwebp',
    ...(vf.length ? ['-filter:v', vf.join(',')] : []),
    '-lossless', opts.lossless ? '1' : '0',
    '-compression_level', '6',
    '-q:v', String(opts.quality),
    '-loop', '0',   // loop forever
    '-an',          // strip audio — WebP has no audio track
    '-preset', 'default',
    outputPath,
  ]

  await new Promise<void>((resolve, reject) => {
    execFile(ffmpegBin!, args, { maxBuffer: 1 << 26, timeout: 0 }, (err) => {
      if (err) reject(err)
      else resolve()
    })
  })
}

export async function convertBatch(
  jobs: ConvJob[],
  outDir: string,
  onProgress: (result: ConversionResult) => void
): Promise<ConversionResult[]> {
  fs.mkdirSync(outDir, { recursive: true })
  const results: ConversionResult[] = []

  for (const job of jobs) {
    const { path: inputPath, options: opts } = job
    const inBytes = (() => { try { return fs.statSync(inputPath).size } catch { return 0 } })()
    const outputPath = buildOutputPath(outDir, inputPath)

    let result: ConversionResult

    const ext = getExt(inputPath)
    const isVideo = VIDEO_EXTS.has(ext)

    try {
      if (isVideo && videoAvailable) {
        await convertVideo(inputPath, outputPath, opts)
        const outBytes = fs.statSync(outputPath).size
        result = {
          input: inputPath,
          output: outputPath,
          kind: 'video',
          inBytes,
          outBytes,
          larger: outBytes > inBytes,
        }
      } else {
        // Try image first; if it's actually animated, sharp handles it
        await convertImage(inputPath, outputPath, opts)
        const outBytes = fs.statSync(outputPath).size
        // Determine if it was animated by checking if output is > 1 frame
        // eslint-disable-next-line @typescript-eslint/no-var-requires
        const sharp = require('sharp')
        const outMeta = await sharp(outputPath, { animated: true }).metadata()
        const kind = outMeta.pages && outMeta.pages > 1 ? 'animated' : 'static'
        result = {
          input: inputPath,
          output: outputPath,
          kind,
          inBytes,
          outBytes,
          larger: outBytes > inBytes,
        }
      }
    } catch (e: unknown) {
      // Try video fallback for unknown/misidentified files
      if (!isVideo && videoAvailable) {
        try {
          await convertVideo(inputPath, outputPath, opts)
          const outBytes = fs.statSync(outputPath).size
          result = {
            input: inputPath,
            output: outputPath,
            kind: 'video',
            inBytes,
            outBytes,
            larger: outBytes > inBytes,
          }
        } catch {
          result = {
            input: inputPath,
            output: null,
            kind: 'failed',
            inBytes,
            outBytes: null,
            larger: false,
            error: String(e),
          }
        }
      } else {
        result = {
          input: inputPath,
          output: null,
          kind: 'failed',
          inBytes,
          outBytes: null,
          larger: false,
          error: String(e),
        }
      }
    }

    results.push(result)
    onProgress(result)
  }

  return results
}

export { initFfmpeg, videoAvailable, VIDEO_EXTS, IMAGE_EXTS }
