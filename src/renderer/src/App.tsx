import React, { useState, useEffect, useCallback, useRef } from 'react'
import type { ConvOptions, ConversionResult, FileEntry, OutputMode } from '../../shared/types'
import { DEFAULT_OPTIONS } from '../../shared/types'
import type { Lang } from './i18n'
import { getStrings } from './i18n'
import styles from './App.module.css'
import Header from './components/Header'
import SettingsPanel from './components/SettingsPanel'
import InputZone from './components/InputZone'
import GlobalOptions from './components/GlobalOptions'
import AdvancedTable from './components/AdvancedTable'
import Results from './components/Results'

type Phase = 'idle' | 'converting' | 'done'

function load<T>(key: string, fallback: T): T {
  try { const v = localStorage.getItem(key); return v ? JSON.parse(v) as T : fallback } catch { return fallback }
}
function save<T>(key: string, value: T) {
  try { localStorage.setItem(key, JSON.stringify(value)) } catch {}
}

export default function App(): React.JSX.Element {
  const [theme, setTheme] = useState<'dark' | 'light'>(() => load('theme', 'dark'))
  const [lang, setLang] = useState<Lang>(() => load('lang', 'en'))
  const [settingsOpen, setSettingsOpen] = useState(false)
  const [outputMode, setOutputMode] = useState<OutputMode>(() => load('outputMode', 'downloads'))
  const [customOutputDir, setCustomOutputDir] = useState<string>(() => load('customOutputDir', ''))

  const [videoAvailable, setVideoAvailable] = useState(false)
  const [files, setFiles] = useState<FileEntry[]>([])
  const [globalOpts, setGlobalOpts] = useState<ConvOptions>(DEFAULT_OPTIONS)
  const [perFileOpts, setPerFileOpts] = useState<Map<string, Partial<ConvOptions>>>(new Map())
  const [showAdvanced, setShowAdvanced] = useState(false)
  const [recursive, setRecursive] = useState(true)
  const [phase, setPhase] = useState<Phase>('idle')
  const [results, setResults] = useState<ConversionResult[]>([])
  const [outDir, setOutDir] = useState('')
  const unsubscribeRef = useRef<(() => void) | null>(null)

  const t = getStrings(lang)

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme)
    save('theme', theme)
  }, [theme])

  useEffect(() => { save('lang', lang) }, [lang])
  useEffect(() => { save('outputMode', outputMode) }, [outputMode])
  useEffect(() => { save('customOutputDir', customOutputDir) }, [customOutputDir])

  useEffect(() => {
    const unsub = window.api.onVideoStatus(setVideoAvailable)
    return unsub
  }, [])

  useEffect(() => {
    return () => { unsubscribeRef.current?.() }
  }, [])

  const addFiles = useCallback((entries: FileEntry[]) => {
    setFiles((prev) => {
      const existing = new Set(prev.map((f) => f.path))
      return [...prev, ...entries.filter((e) => !existing.has(e.path))]
    })
  }, [])

  const handleChooseFiles = async () => {
    const entries = await window.api.chooseFiles()
    if (entries.length) addFiles(entries)
  }

  const handleChooseFolder = async () => {
    const entries = await window.api.chooseFolder(recursive)
    if (entries.length) addFiles(entries)
  }

  const handleDrop = async (paths: string[]) => {
    const entries = await window.api.probe(paths)
    addFiles(entries)
  }

  const handleRemoveFile = (filePath: string) => {
    setFiles((prev) => prev.filter((f) => f.path !== filePath))
    setPerFileOpts((prev) => { const next = new Map(prev); next.delete(filePath); return next })
  }

  const handleClear = () => {
    setFiles([])
    setPerFileOpts(new Map())
    setResults([])
    setOutDir('')
    setPhase('idle')
  }

  const handleChooseOutputDir = async () => {
    const dir = await window.api.chooseOutputDir()
    if (dir) setCustomOutputDir(dir)
  }

  const handleConvert = async () => {
    if (!files.length) return
    setPhase('converting')
    setResults([])

    const jobs = files.map((f) => ({
      path: f.path,
      options: { ...globalOpts, ...(perFileOpts.get(f.path) ?? {}) },
    }))

    const progressResults: ConversionResult[] = []
    const unsub = window.api.onConvertProgress((r) => {
      progressResults.push(r)
      setResults([...progressResults])
    })
    unsubscribeRef.current = unsub

    try {
      const response = await window.api.convert(jobs, outputMode, customOutputDir || undefined)
      setOutDir(response.outDir)
    } finally {
      unsub()
      unsubscribeRef.current = null
      setPhase('done')
    }
  }

  const imageCount = files.filter((f) => f.kind === 'image-static').length
  const animatedCount = files.filter((f) => f.kind === 'image-animated').length
  const videoCount = files.filter((f) => f.kind === 'video').length
  const unknownCount = files.filter((f) => f.kind === 'unknown').length

  return (
    <div className={styles.app}>
      <Header
        theme={theme}
        onToggleTheme={() => setTheme((v) => v === 'dark' ? 'light' : 'dark')}
        settingsOpen={settingsOpen}
        onToggleSettings={() => setSettingsOpen((v) => !v)}
        t={t}
      />

      {settingsOpen && (
        <SettingsPanel
          outputMode={outputMode}
          customOutputDir={customOutputDir}
          onOutputModeChange={setOutputMode}
          onChooseOutputDir={handleChooseOutputDir}
          lang={lang}
          onLangChange={setLang}
          t={t}
        />
      )}

      <div className={styles.scroll}>
        {phase !== 'done' && (
          <>
            <InputZone
              onChooseFiles={handleChooseFiles}
              onChooseFolder={handleChooseFolder}
              onDrop={handleDrop}
              recursive={recursive}
              onRecursiveChange={setRecursive}
              fileCount={files.length}
              imageCount={imageCount}
              animatedCount={animatedCount}
              videoCount={videoCount}
              unknownCount={unknownCount}
              t={t}
            />

            {files.length > 0 && (
              <>
                <GlobalOptions
                  opts={globalOpts}
                  onChange={setGlobalOpts}
                  showAdvanced={showAdvanced}
                  onToggleAdvanced={() => setShowAdvanced((v) => !v)}
                  t={t}
                />

                {showAdvanced && (
                  <AdvancedTable
                    files={files}
                    globalOpts={globalOpts}
                    perFileOpts={perFileOpts}
                    onPerFileChange={setPerFileOpts}
                    onRemove={handleRemoveFile}
                    t={t}
                  />
                )}

                <div className={styles.actions}>
                  <button
                    className={styles.convertBtn}
                    onClick={handleConvert}
                    disabled={phase === 'converting'}
                  >
                    {phase === 'converting'
                      ? t.converting
                      : `${t.convert} ${files.length} ${files.length === 1 ? 'file' : 'files'}`}
                  </button>
                  <button className={styles.clearBtn} onClick={handleClear}>
                    {t.clear}
                  </button>
                </div>
              </>
            )}
          </>
        )}

        {(phase === 'converting' || phase === 'done') && (
          <Results
            results={results}
            total={files.length}
            outDir={outDir}
            done={phase === 'done'}
            onConvertAnother={handleClear}
            t={t}
          />
        )}
      </div>
    </div>
  )
}
