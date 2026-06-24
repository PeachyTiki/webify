import React, { useState, useRef } from 'react'
import styles from './InputZone.module.css'

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
}

export default function InputZone({
  onChooseFiles,
  onChooseFolder,
  onDrop,
  recursive,
  onRecursiveChange,
  fileCount,
  imageCount,
  animatedCount,
  videoCount,
  unknownCount,
}: Props): React.JSX.Element {
  const [dragging, setDragging] = useState(false)
  const dragCounter = useRef(0)

  const handleDragEnter = (e: React.DragEvent) => {
    e.preventDefault()
    dragCounter.current++
    setDragging(true)
  }
  const handleDragLeave = () => {
    dragCounter.current--
    if (dragCounter.current === 0) setDragging(false)
  }
  const handleDragOver = (e: React.DragEvent) => e.preventDefault()
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    dragCounter.current = 0
    setDragging(false)
    const paths: string[] = []
    for (const item of Array.from(e.dataTransfer.files)) {
      // webkitGetAsEntry / getAsFile — use path from Electron's File object
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
        <p className={styles.dropLabel}>
          {dragging ? 'Release to add files' : 'Drop files or folders here'}
        </p>
        <div className={styles.buttons}>
          <button className={styles.btn} onClick={onChooseFiles}>
            Choose Files…
          </button>
          <button className={styles.btn} onClick={onChooseFolder}>
            Choose Folder…
          </button>
        </div>
        <label className={styles.recursive}>
          <input
            type="checkbox"
            checked={recursive}
            onChange={(e) => onRecursiveChange(e.target.checked)}
          />
          Include subfolders
        </label>
      </div>

      {fileCount > 0 && (
        <p className={styles.summary}>
          <strong>{fileCount}</strong> item{fileCount !== 1 ? 's' : ''}
          {summaryParts.length > 0 && <> — {summaryParts.join(', ')}</>}
        </p>
      )}
    </div>
  )
}
