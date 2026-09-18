import { existsSync } from 'node:fs'
import path from 'node:path'

const ROOT = path.resolve(import.meta.dirname, '..')

/** True only when npm run images has written derivatives into dist/gallery. */
export function galleryFilesPresent (stem = 'lc-003') {
  return existsSync(path.join(ROOT, 'dist', 'gallery', `${stem}-800.jpg`))
}
