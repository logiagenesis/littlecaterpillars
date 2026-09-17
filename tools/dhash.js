/**
 * Difference hash (dHash) — 64-bit perceptual fingerprint.
 * Resize to 9x8 greyscale, compare each pixel to its right-hand neighbour.
 * Near-identical frames land within a small Hamming distance of each other.
 */
import sharp from 'sharp'

export async function dhash (file) {
  const { data } = await sharp(file)
    .greyscale()
    .resize(9, 8, { fit: 'fill' })
    .raw()
    .toBuffer({ resolveWithObject: true })

  let bits = 0n
  for (let row = 0; row < 8; row++) {
    for (let col = 0; col < 8; col++) {
      const left = data[row * 9 + col]
      const right = data[row * 9 + col + 1]
      bits = (bits << 1n) | (left > right ? 1n : 0n)
    }
  }
  return bits
}

export function hamming (a, b) {
  let x = a ^ b
  let n = 0
  while (x) { n += Number(x & 1n); x >>= 1n }
  return n
}
