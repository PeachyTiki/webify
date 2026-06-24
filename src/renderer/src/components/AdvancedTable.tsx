import React from 'react'
import type { ConvOptions, FileEntry } from '../../../shared/types'
import type { Strings } from '../i18n'
import styles from './AdvancedTable.module.css'

interface Props {
  files: FileEntry[]
  globalOpts: ConvOptions
  perFileOpts: Map<string, Partial<ConvOptions>>
  onPerFileChange: (m: Map<string, Partial<ConvOptions>>) => void
  onRemove: (path: string) => void
  t: Strings
}

function fmt(bytes: number): string {
  if (bytes < 1024) return `${bytes}B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)}KB`
  return `${(bytes / 1024 / 1024).toFixed(1)}MB`
}

function kindLabel(k: FileEntry['kind']): string {
  switch (k) {
    case 'image-static': return 'image'
    case 'image-animated': return 'animated'
    case 'video': return 'video'
    default: return 'unknown'
  }
}

export default function AdvancedTable({
  files, globalOpts, perFileOpts, onPerFileChange, onRemove, t,
}: Props): React.JSX.Element {

  const setField = <K extends keyof ConvOptions>(path: string, key: K, value: ConvOptions[K] | undefined) => {
    const next = new Map(perFileOpts)
    const cur = { ...(next.get(path) ?? {}) }
    if (value === undefined) { delete cur[key] } else { cur[key] = value }
    if (Object.keys(cur).length === 0) next.delete(path)
    else next.set(path, cur)
    onPerFileChange(next)
  }

  const reset = (path: string) => {
    const next = new Map(perFileOpts)
    next.delete(path)
    onPerFileChange(next)
  }

  return (
    <div className={styles.wrap}>
      <p className={styles.hint}>{t.advancedHint}</p>
      <div className={styles.tableWrap}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>{t.file}</th>
              <th>{t.kind}</th>
              <th>{t.size}</th>
              <th>{t.quality}</th>
              <th>{t.lossless}</th>
              <th>{t.nearLossless}</th>
              <th>{t.fpsCap}</th>
              <th>{t.maxWidth}</th>
              <th>{t.keepMeta}</th>
              <th />
            </tr>
          </thead>
          <tbody>
            {files.map((f) => {
              const overrides = perFileOpts.get(f.path) ?? {}
              const effQ = overrides.quality ?? globalOpts.quality
              const effL = overrides.lossless ?? globalOpts.lossless
              const effNL = overrides.nearLossless ?? globalOpts.nearLossless
              const hasOverride = Object.keys(overrides).length > 0

              return (
                <tr key={f.path} className={hasOverride ? styles.overridden : ''}>
                  <td className={styles.name} title={f.path}>{f.name}</td>
                  <td>
                    <span className={`${styles.badge} ${styles[`badge_${f.kind.replace('-', '_')}`]}`}>
                      {kindLabel(f.kind)}
                    </span>
                  </td>
                  <td className={styles.mono}>{fmt(f.bytes)}</td>

                  <td>
                    <input
                      type="number" min={1} max={100} value={effQ}
                      onChange={(e) => setField(f.path, 'quality', e.target.value ? Number(e.target.value) : undefined)}
                    />
                  </td>

                  <td className={styles.center}>
                    <input type="checkbox" checked={effL}
                      onChange={(e) => setField(f.path, 'lossless', e.target.checked)}
                    />
                  </td>

                  <td className={styles.center}>
                    {f.kind !== 'video' ? (
                      <input type="checkbox" checked={effNL}
                        onChange={(e) => setField(f.path, 'nearLossless', e.target.checked)}
                      />
                    ) : <span className={styles.na}>—</span>}
                  </td>

                  <td>
                    <input
                      type="number" min={1} max={240} placeholder="—"
                      value={overrides.fpsCap ?? ''}
                      onChange={(e) => setField(f.path, 'fpsCap', e.target.value ? Number(e.target.value) : null)}
                    />
                  </td>

                  <td>
                    <input
                      type="number" min={1} placeholder="—"
                      value={overrides.maxWidth ?? ''}
                      onChange={(e) => setField(f.path, 'maxWidth', e.target.value ? Number(e.target.value) : null)}
                    />
                  </td>

                  <td className={styles.center}>
                    {f.kind !== 'video' ? (
                      <input type="checkbox"
                        checked={overrides.keepMetadata ?? globalOpts.keepMetadata}
                        onChange={(e) => setField(f.path, 'keepMetadata', e.target.checked)}
                      />
                    ) : <span className={styles.na}>—</span>}
                  </td>

                  <td className={styles.actions}>
                    {hasOverride && (
                      <button className={styles.resetBtn} onClick={() => reset(f.path)} title="Reset to global">
                        reset
                      </button>
                    )}
                    <button className={styles.removeBtn} onClick={() => onRemove(f.path)} title="Remove">×</button>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}
