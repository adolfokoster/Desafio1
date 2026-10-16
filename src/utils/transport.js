export const PIECE_SIZES = [
  { id: 'grandes', label: 'Grandes', hint: 'Mayor volumen' },
  { id: 'medianas', label: 'Medianas', hint: 'Volumen intermedio' },
  { id: 'pequenas', label: 'Pequeñas', hint: 'Menor volumen' },
]

export function validateInteger(value, { allowZero = true } = {}) {
  if (value === '') return 'Este campo es obligatorio.'
  if (!/^\d+$/.test(value)) return 'Ingresá un número entero, sin decimales.'

  const number = Number(value)
  if (!Number.isSafeInteger(number)) return 'El valor ingresado es demasiado grande.'
  if (!allowZero && number === 0) return 'El valor debe ser mayor que cero.'
  return ''
}

export function calculateTransport({ pieces, capacity, availableCarts }) {
  const requiredCarts = pieces === 0 ? 0 : Math.ceil(pieces / capacity)
  const usedCarts = Math.min(requiredCarts, availableCarts)
  const firstBatchPieces = Math.min(pieces, usedCarts * capacity)
  const pendingPieces = pieces - firstBatchPieces
  const missingCarts = Math.max(requiredCarts - availableCarts, 0)
  const surplusCarts = Math.max(availableCarts - requiredCarts, 0)

  return {
    requiredCarts,
    usedCarts,
    firstBatchPieces,
    pendingPieces,
    missingCarts,
    surplusCarts,
  }
}

export function getCartLoad(cartIndex, pieces, capacity) {
  return Math.min(capacity, Math.max(pieces - cartIndex * capacity, 0))
}
