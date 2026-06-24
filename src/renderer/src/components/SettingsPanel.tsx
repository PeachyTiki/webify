import React from 'react'
import type { OutputMode } from '../../../shared/types'
import type { Lang, Strings } from '../i18n'
import { LANG_LABELS } from '../i18n'
import styles from './SettingsPanel.module.css'

interface Props {
  outputMode: OutputMode
  customOutputDir: string
  onOutputModeChange: (mode: OutputMode) => void
  onChooseOutputDir: () => void
  lang: Lang
  onLangChange: (l: Lang) => void
  t: Strings
}

export default function SettingsPanel({
  outputMode, customOutputDir, onOutputModeChange, onChooseOutputDir,
  lang, onLangChange, t,
}: Props): React.JSX.Element {
  return (
    <div className={styles.panel}>
      <div className={styles.row}>
        <span className={styles.label}>{t.outputFolder}</span>
        <div className={styles.segGroup}>
          {(['same', 'downloads', 'custom'] as OutputMode[]).map((m) => (
            <button
              key={m}
              className={`${styles.seg} ${outputMode === m ? styles.segActive : ''}`}
              onClick={() => onOutputModeChange(m)}
            >
              {m === 'same' ? t.sameFolder : m === 'downloads' ? t.downloads : t.custom}
            </button>
          ))}
        </div>
        {outputMode === 'custom' && (
          <div className={styles.customRow}>
            <span className={styles.customPath} title={customOutputDir}>
              {customOutputDir || t.noFolder}
            </span>
            <button className={styles.browseBtn} onClick={onChooseOutputDir}>
              {t.browse}
            </button>
          </div>
        )}
      </div>

      <div className={styles.divider} />

      <div className={styles.row}>
        <span className={styles.label}>{t.language}</span>
        <select
          className={styles.select}
          value={lang}
          onChange={(e) => onLangChange(e.target.value as Lang)}
        >
          {(Object.entries(LANG_LABELS) as [Lang, string][]).map(([code, name]) => (
            <option key={code} value={code}>{name}</option>
          ))}
        </select>
      </div>
    </div>
  )
}
