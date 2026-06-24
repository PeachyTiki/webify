import React from 'react'
import type { ConversionResult } from '../../../shared/types'
import styles from './Results.module.css'

interface Props {
  results: ConversionResult[]
  total: number
  outDir: string
  done: boolean
  onConvertAnother: () => void
}

function fmtBytes(b: number): string {
  if (b < 1024) return `${b}B`
  if (b < 1024 * 1024) return `${(b / 1024).toFixed(0)}KB`
  return `${(b / 1024 / 1024).toFixed(1)}MB`
}

function pct(inB: number, outB: number): string {
  const delta = ((outB - inB) / inB) * 100
  return delta >= 0 ? `+${delta.toFixed(0)}%` : `${delta.toFixed(0)}%`
}

function kindLabel(k: ConversionResult['kind']): string {
  switch (k) {
    case 'static': return 'image'
    case 'animated': return 'animated'
    case 'video': return 'video'
    case 'skipped': return 'skipped'
    case 'failed': return 'failed'
  }
}

export default function Results({ results, total, outDir, done, onConvertAnother }: Props): React.JSX.Element {
  const converted = results.filter((r) => r.kind !== 'skipped' && r.kind !== 'failed')
  const smaller = converted.filter((r) => !r.larger)
  const larger = converted.filter((r) => r.larger)
  const skipped = results.filter((r) => r.kind === 'skipped' || r.kind === 'failed')

  return (
    <div className={styles.wrap}>
      <div className={styles.topBar}>
        <h2 className={styles.heading}>
          {done ? 'Done' : `Converting… ${results.length} / ${total}`}
        </h2>
        {done && outDir && (
          <button className={styles.openBtn} onClick={() => window.api.openPath(outDir)}>
            Open folder
          </button>
        )}
      </div>

      <div className={styles.list}>
        {results.map((r) => {
          const name = r.input.split(/[\\/]/).pop() ?? r.input
          const isOk = r.kind !== 'skipped' && r.kind !== 'failed'
          return (
            <div key={r.input} className={`${styles.row} ${!isOk ? styles.bad : ''}`}>
              <span className={styles.name} title={r.input}>{name}</span>
              <span className={`${styles.kind} ${styles[`kind_${r.kind}`]}`}>{kindLabel(r.kind)}</span>
              {isOk && r.outBytes != null ? (
                <>
                  <span className={styles.sizes}>
                    {fmtBytes(r.inBytes)} → {fmtBytes(r.outBytes)}
                    <span className={r.larger ? styles.pctRed : styles.pctGreen}>
                      &nbsp;({pct(r.inBytes, r.outBytes)})
                    </span>
                  </span>
                  {r.larger && <span className={styles.largerBadge}>LARGER</span>}
                </>
              ) : (
                <span className={styles.error}>{r.error ?? r.kind}</span>
              )}
            </div>
          )
        })}
      </div>

      {done && (
        <>
          <p className={styles.summary}>
            {converted.length} converted — {smaller.length} smaller, {larger.length} larger
            {skipped.length > 0 && `, ${skipped.length} skipped/failed`}.
          </p>
          <p className={styles.tip}>
            Keep WebP only where it's actually smaller — simple GIFs and short clips sometimes don't shrink.
          </p>
          <button className={styles.anotherBtn} onClick={onConvertAnother}>
            Convert another batch
          </button>
        </>
      )}
    </div>
  )
}
