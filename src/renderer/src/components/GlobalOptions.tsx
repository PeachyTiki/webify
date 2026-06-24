import React from 'react'
import type { ConvOptions } from '../../../shared/types'
import type { Strings } from '../i18n'
import styles from './GlobalOptions.module.css'

interface Props {
  opts: ConvOptions
  onChange: (opts: ConvOptions) => void
  showAdvanced: boolean
  onToggleAdvanced: () => void
  t: Strings
}

export default function GlobalOptions({ opts, onChange, showAdvanced, onToggleAdvanced, t }: Props): React.JSX.Element {
  const set = <K extends keyof ConvOptions>(key: K, value: ConvOptions[K]) =>
    onChange({ ...opts, [key]: value })

  return (
    <div className={styles.panel}>
      <div className={styles.row}>
        <label className={styles.label}>{t.quality}</label>
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
        <label className={styles.label}>{t.lossless}</label>
        <input
          type="checkbox"
          checked={opts.lossless}
          onChange={(e) => set('lossless', e.target.checked)}
        />
      </div>

      <p className={styles.note}>{t.advancedNote}</p>

      <button
        className={`${styles.advancedBtn} ${showAdvanced ? styles.open : ''}`}
        onClick={onToggleAdvanced}
      >
        {showAdvanced ? t.hideAdvanced : t.showAdvanced}
      </button>
    </div>
  )
}
