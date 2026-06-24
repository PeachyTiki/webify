import React, { useState, useRef } from 'react'
import styles from './InputZone.module.css'
import type { Strings } from '../i18n'

interface Props {
  onChooseFiles: () => void
  onChooseFolder: () => void
  onDrop: (paths: string[]) => void
  recursive: boolean
  onRecursiveChange: (v: boolean) => void
  fileCount: number
  imageCount: number
  animatedCount: number
  videoCount: number
  unknownCount: number
  t: Strings
}

export default function InputZone({
  onChooseFiles, onChooseFolder, onDrop, recursive, onRecursiveChange,
  fileCount, imageCount, animatedCount, videoCount, unknownCount, t,
}: Props): React.JSX.Element {
  const [dragging, setDragging] = useState(false)
  const dragCounter = useRef(0)

  const handleDragEnter = (e: React.DragEvent) => { e.preventDefault(); dragCounter.current++; setDragging(true) }
  const handleDragLeave = () => { dragCounter.current--; if (dragCounter.current === 0) setDragging(false) }
  const handleDragOver = (e: React.DragEvent) => e.preventDefault()
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    dragCounter.current = 0
    setDragging(false)
    const paths: string[] = []
    for (const item of Array.from(e.dataTransfer.files)) {
      const file = item as File & { path?: string }
      if (file.path) paths.push(file.path)
    }
    if (paths.length) onDrop(paths)
  }

  const summaryParts: string[] = []
  if (imageCount) summaryParts.push(`${imageCount} image${imageCount !== 1 ? 's' : ''}`)
  if (animatedCount) summaryParts.push(`${animatedCount} animated`)
  if (videoCount) summaryParts.push(`${videoCount} video${videoCount !== 1 ? 's' : ''}`)
  if (unknownCount) summaryParts.push(`${unknownCount} unknown`)

  return (
    <div className={styles.zone}>
      <div
        className={`${styles.dropArea} ${dragging ? styles.dragging : ''}`}
        onDragEnter={handleDragEnter}
        onDragLeave={handleDragLeave}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
      >
        <div className={styles.iconWrap}>
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="16 16 12 12 8 16"/>
            <line x1="12" y1="12" x2="12" y2="21"/>
            <path d="M20.39 18.39A5 5 0 0 0 18 9h-1.26A8 8 0 1 0 3 16.3"/>
          </svg>
        </div>
        <p className={styles.dropLabel}>
          {dragging ? t.release : t.dropHere}
        </p>
        <div className={styles.buttons}>
          <button className={styles.btn} onClick={onChooseFiles}>{t.chooseFiles}</button>
          <button className={styles.btn} onClick={onChooseFolder}>{t.chooseFolder}</button>
        </div>
        <label className={styles.recursive}>
          <input
            type="checkbox"
            checked={recursive}
            onChange={(e) => onRecursiveChange(e.target.checked)}
          />
          {t.subfolders}
        </label>
      </div>

      {fileCount > 0 && (
        <p className={styles.summary}>
          <strong>{fileCount}</strong> file{fileCount !== 1 ? 's' : ''}
          {summaryParts.length > 0 && <span className={styles.summaryDetail}> — {summaryParts.join(', ')}</span>}
        </p>
      )}
    </div>
  )
}
