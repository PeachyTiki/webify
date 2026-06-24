export type Lang = 'en' | 'es' | 'fr' | 'de' | 'ja'

export const LANG_LABELS: Record<Lang, string> = {
  en: 'English',
  es: 'Español',
  fr: 'Français',
  de: 'Deutsch',
  ja: '日本語',
}

export type Strings = {
  dropHere: string
  release: string
  chooseFiles: string
  chooseFolder: string
  subfolders: string
  quality: string
  lossless: string
  showAdvanced: string
  hideAdvanced: string
  advancedNote: string
  advancedHint: string
  convert: string
  converting: string
  file: string
  kind: string
  size: string
  nearLossless: string
  fpsCap: string
  maxWidth: string
  keepMeta: string
  clear: string
  done: string
  convertingOf: string
  openFolder: string
  convertAnother: string
  tip: string
  settings: string
  language: string
  outputFolder: string
  sameFolder: string
  downloads: string
  custom: string
  noFolder: string
  browse: string
  theme: string
}

const en: Strings = {
  dropHere: 'Drop files or folders here',
  release: 'Release to add',
  chooseFiles: 'Choose Files…',
  chooseFolder: 'Choose Folder…',
  subfolders: 'Include subfolders',
  quality: 'Quality',
  lossless: 'Lossless',
  showAdvanced: 'Advanced per-file overrides',
  hideAdvanced: 'Hide Advanced',
  advancedNote: 'Audio is stripped from video. Frame rate and looping are preserved.',
  advancedHint: 'Per-file overrides — blank fields inherit global settings.',
  convert: 'Convert',
  converting: 'Converting…',
  file: 'File',
  kind: 'Kind',
  size: 'Size',
  nearLossless: 'Near-lossless',
  fpsCap: 'FPS cap',
  maxWidth: 'Max width',
  keepMeta: 'Keep meta',
  clear: 'Clear',
  done: 'Done',
  convertingOf: 'of',
  openFolder: 'Open folder',
  convertAnother: 'Convert another batch',
  tip: "Keep WebP only where it's actually smaller — short clips and simple GIFs sometimes don't shrink.",
  settings: 'Settings',
  language: 'Language',
  outputFolder: 'Output',
  sameFolder: 'Same Folder',
  downloads: 'Downloads',
  custom: 'Custom…',
  noFolder: 'No folder chosen',
  browse: 'Browse…',
  theme: 'Theme',
}

const es: Strings = {
  dropHere: 'Arrastra archivos o carpetas aquí',
  release: 'Suelta para agregar',
  chooseFiles: 'Elegir archivos…',
  chooseFolder: 'Elegir carpeta…',
  subfolders: 'Incluir subcarpetas',
  quality: 'Calidad',
  lossless: 'Sin pérdida',
  showAdvanced: 'Opciones avanzadas por archivo',
  hideAdvanced: 'Ocultar avanzado',
  advancedNote: 'El audio se elimina del vídeo. La velocidad de fotogramas y el bucle se conservan.',
  advancedHint: 'Anulaciones por archivo — los campos vacíos heredan la configuración global.',
  convert: 'Convertir',
  converting: 'Convirtiendo…',
  file: 'Archivo',
  kind: 'Tipo',
  size: 'Tamaño',
  nearLossless: 'Casi sin pérdida',
  fpsCap: 'Límite FPS',
  maxWidth: 'Ancho máx.',
  keepMeta: 'Metadatos',
  clear: 'Limpiar',
  done: 'Listo',
  convertingOf: 'de',
  openFolder: 'Abrir carpeta',
  convertAnother: 'Convertir otro lote',
  tip: 'Conserva WebP solo donde sea más pequeño — los clips cortos y GIF simples a veces no se reducen.',
  settings: 'Ajustes',
  language: 'Idioma',
  outputFolder: 'Destino',
  sameFolder: 'Misma carpeta',
  downloads: 'Descargas',
  custom: 'Personalizado…',
  noFolder: 'Sin carpeta elegida',
  browse: 'Explorar…',
  theme: 'Apariencia',
}

const fr: Strings = {
  dropHere: 'Déposez des fichiers ou dossiers ici',
  release: 'Relâchez pour ajouter',
  chooseFiles: 'Choisir des fichiers…',
  chooseFolder: 'Choisir un dossier…',
  subfolders: 'Inclure les sous-dossiers',
  quality: 'Qualité',
  lossless: 'Sans perte',
  showAdvanced: 'Options avancées par fichier',
  hideAdvanced: 'Masquer les options',
  advancedNote: "L'audio est supprimé des vidéos. La fréquence d'images et la boucle sont conservées.",
  advancedHint: 'Remplacements par fichier — les champs vides héritent des paramètres globaux.',
  convert: 'Convertir',
  converting: 'Conversion…',
  file: 'Fichier',
  kind: 'Type',
  size: 'Taille',
  nearLossless: 'Quasi sans perte',
  fpsCap: 'Limite FPS',
  maxWidth: 'Largeur max.',
  keepMeta: 'Métadonnées',
  clear: 'Effacer',
  done: 'Terminé',
  convertingOf: 'sur',
  openFolder: 'Ouvrir le dossier',
  convertAnother: 'Convertir un autre lot',
  tip: "Conservez le WebP uniquement s'il est plus petit — les courts clips et GIF simples ne réduisent pas toujours.",
  settings: 'Paramètres',
  language: 'Langue',
  outputFolder: 'Sortie',
  sameFolder: 'Même dossier',
  downloads: 'Téléchargements',
  custom: 'Personnalisé…',
  noFolder: 'Aucun dossier choisi',
  browse: 'Parcourir…',
  theme: 'Apparence',
}

const de: Strings = {
  dropHere: 'Dateien oder Ordner hierher ziehen',
  release: 'Loslassen zum Hinzufügen',
  chooseFiles: 'Dateien auswählen…',
  chooseFolder: 'Ordner auswählen…',
  subfolders: 'Unterordner einschließen',
  quality: 'Qualität',
  lossless: 'Verlustlos',
  showAdvanced: 'Erweiterte Optionen pro Datei',
  hideAdvanced: 'Erweitert ausblenden',
  advancedNote: 'Audio wird aus Videos entfernt. Bildrate und Schleife bleiben erhalten.',
  advancedHint: 'Überschreibungen pro Datei — leere Felder erben globale Einstellungen.',
  convert: 'Konvertieren',
  converting: 'Konvertierung…',
  file: 'Datei',
  kind: 'Art',
  size: 'Größe',
  nearLossless: 'Nahezu verlustlos',
  fpsCap: 'FPS-Limit',
  maxWidth: 'Max. Breite',
  keepMeta: 'Metadaten',
  clear: 'Löschen',
  done: 'Fertig',
  convertingOf: 'von',
  openFolder: 'Ordner öffnen',
  convertAnother: 'Weiteres Paket konvertieren',
  tip: 'Behalte WebP nur, wenn es tatsächlich kleiner ist — kurze Clips und einfache GIFs schrumpfen manchmal nicht.',
  settings: 'Einstellungen',
  language: 'Sprache',
  outputFolder: 'Ausgabe',
  sameFolder: 'Gleicher Ordner',
  downloads: 'Downloads',
  custom: 'Benutzerdefiniert…',
  noFolder: 'Kein Ordner gewählt',
  browse: 'Durchsuchen…',
  theme: 'Design',
}

const ja: Strings = {
  dropHere: 'ここにファイルまたはフォルダをドロップ',
  release: 'リリースして追加',
  chooseFiles: 'ファイルを選択…',
  chooseFolder: 'フォルダを選択…',
  subfolders: 'サブフォルダを含む',
  quality: '品質',
  lossless: '可逆圧縮',
  showAdvanced: 'ファイルごとの詳細設定',
  hideAdvanced: '詳細を非表示',
  advancedNote: 'ビデオから音声を削除します。フレームレートとループは保持されます。',
  advancedHint: 'ファイルごとの上書き — 空白のフィールドはグローバル設定を継承します。',
  convert: '変換',
  converting: '変換中…',
  file: 'ファイル',
  kind: '種類',
  size: 'サイズ',
  nearLossless: '準可逆圧縮',
  fpsCap: 'FPS上限',
  maxWidth: '最大幅',
  keepMeta: 'メタデータ',
  clear: 'クリア',
  done: '完了',
  convertingOf: '/',
  openFolder: 'フォルダを開く',
  convertAnother: '別のバッチを変換',
  tip: 'WebPが実際に小さい場合のみ使用してください。',
  settings: '設定',
  language: '言語',
  outputFolder: '出力先',
  sameFolder: '同じフォルダ',
  downloads: 'ダウンロード',
  custom: 'カスタム…',
  noFolder: 'フォルダ未選択',
  browse: '参照…',
  theme: 'テーマ',
}

const map: Record<Lang, Strings> = { en, es, fr, de, ja }

export function getStrings(lang: Lang): Strings {
  return map[lang] ?? en
}
