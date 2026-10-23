const HEADER_STYLE = {
  color: '#FFFFFF',
  backgroundColor: '#0F2A4A',
  fontWeight: 'bold',
  align: 'center',
}

function header(value) {
  return { value, ...HEADER_STYLE }
}

function dateCell(value) {
  const date = new Date(value)
  if (!value || Number.isNaN(date.getTime())) return { value: 'Sin fecha' }
  return { value: date, type: Date, format: 'dd/mm/yyyy hh:mm' }
}

function numberCell(value) {
  return { value: Number.isFinite(Number(value)) ? Number(value) : 0, type: Number, format: '#,##0' }
}

function formatOrders(orders) {
  if (!orders || typeof orders !== 'object') return ''
  return Object.entries(orders)
    .filter(([, value]) => String(value).trim())
    .sort(([first], [second]) => Number(first) - Number(second))
    .map(([cart, value]) => `Carro ${cart}: ${value}`)
    .join('; ')
}

export async function exportTransferRecords(records) {
  if (!records.length) return

  const { default: writeExcelFile } = await import('write-excel-file/browser')
  const columns = [
    { header: header('Fecha y hora'), cell: (record) => dateCell(record.createdAt), width: 20 },
    { header: header('Piezas'), cell: (record) => numberCell(record.pieces), width: 12 },
    { header: header('Tamaño'), cell: (record) => ({ value: record.pieceSizeLabel ?? '' }), width: 14 },
    { header: header('Capacidad por carro'), cell: (record) => numberCell(record.capacity), width: 20 },
    { header: header('Carros necesarios'), cell: (record) => numberCell(record.requiredCarts), width: 19 },
    { header: header('Carros disponibles'), cell: (record) => numberCell(record.availableCarts), width: 19 },
    { header: header('Carros utilizados'), cell: (record) => numberCell(record.usedCarts), width: 18 },
    { header: header('Piezas primera tanda'), cell: (record) => numberCell(record.firstBatchPieces), width: 21 },
    { header: header('Piezas pendientes'), cell: (record) => numberCell(record.pendingPieces), width: 19 },
    { header: header('Cargó los datos'), cell: (record) => ({ value: record.loadedBy ?? '' }), width: 24 },
    { header: header('Trasladó el material'), cell: (record) => ({ value: record.transportedBy ?? '' }), width: 25 },
    { header: header('OT asignadas'), cell: (record) => ({ value: formatOrders(record.orders) }), width: 38 },
  ]
  const now = new Date()
  const today = [now.getFullYear(), String(now.getMonth() + 1).padStart(2, '0'), String(now.getDate()).padStart(2, '0')].join('-')

  await writeExcelFile(records, {
    columns,
    sheet: 'Traslados',
    stickyRowsCount: 1,
  }).toFile(`registro-traslados-${today}.xlsx`)
}
