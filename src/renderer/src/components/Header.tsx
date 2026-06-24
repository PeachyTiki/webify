import React from 'react'
import styles from './Header.module.css'

export default function Header(): React.JSX.Element {
  return (
    <header className={styles.header}>
      <h1 className={styles.title}>WebP Converter</h1>
    </header>
  )
}
