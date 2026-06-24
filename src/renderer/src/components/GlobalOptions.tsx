import React from 'react'
import type { ConvOptions, OutputMode } from '../../../shared/types'
import styles from './GlobalOptions.module.css'

interface Props {
  opts: ConvOptions
  onChange: (opts: ConvOptions) => void
  outputMode: OutputMode
  customOutputDir: string
  onOutputModeChange: (mode: OutputMode) => void
  onChooseOutputDir: () => void
  showAdvanced: boolean
  onToggleAdvanced: () => void
}

export default function GlobalOptions({ opts, onChange, outputMode, customOutputDir, onOutputModeChange, onChooseOutputDir, showAdvanced, onToggleAdvanced }: Props): React.JSX.Element {
  const set = <K extends keyof ConvOptions>(key: K, value: ConvOptions[K]) =>
    onChange({ ...opts, [key]: value })

  return (
    <div className={styles.panel}>
      <div className={styles.row}>
        <label className={styles.label}>Quality</label>
        <div className={styles.sliderRow}>
          <input
            type="range"
            min={1}
            max={100}
            value={opts.quality}
            onChange={(e) => set('quality', Number(e.target.value))}
            className={styles.slider}
          />
          <span className={styles.sliderVal}>{opts.quality}</span>
        </div>
      </div>

      <div className={styles.row}>
        <label className={styles.label}>Lossless</label>
        <input
          type="checkbox"
          checked={opts.lossless}
          onChange={(e) => set('lossless', e.target.checked)}
        />
      </div>

      <div className={styles.row}>
        <label className={styles.label}>Output</label>
        <div className={styles.segmentGroup}>
          {(['same', 'downloads', 'custom'] as OutputMode[]).map((mode) => (
            <button
              key={mode}
              className={`${styles.segmentBtn} ${outputMode === mode ? styles.segmentActive : ''}`}
              onClick={() => onOutputModeChange(mode)}
            >
              {mode === 'same' ? 'Same Folder' : mode === 'downloads' ? 'Downloads' : 'Custom…'}
            </button>
          ))}
        </div>
      </div>

      {outputMode === 'custom' && (
        <div className={styles.row}>
          <label className={styles.label} />
          <div className={styles.customDirRow}>
            <span className={styles.customDirPath} title={customOutputDir}>
              {customOutputDir || 'No folder chosen'}
            </span>
            <button className={styles.browseBtn} onClick={onChooseOutputDir}>
              Browse…
            </button>
          </div>
        </div>
      )}

      <p className={styles.note}>
        Audio is always removed from video. Length, frame rate, and looping are preserved.
      </p>

      <button
        className={`${styles.advancedBtn} ${showAdvanced ? styles.open : ''}`}
        onClick={onToggleAdvanced}
      >
        {showAdvanced ? 'Hide Advanced' : 'Advanced (per-file overrides)'}
      </button>
    </div>
  )
}
