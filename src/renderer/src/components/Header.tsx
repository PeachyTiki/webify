import React from 'react'
import styles from './Header.module.css'

interface Props {
  videoAvailable: boolean
}

export default function Header({ videoAvailable }: Props): React.JSX.Element {
  return (
    <header className={styles.header}>
      <h1 className={styles.title}>WebP Converter</h1>
      <span className={`${styles.pill} ${videoAvailable ? styles.on : styles.off}`}>
        {videoAvailable ? 'Video: on' : 'Video: off'}
      </span>
    </header>
  )
}
