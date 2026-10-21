import { useEffect, useMemo, useState } from 'react'
import DragonMascot from './components/DragonMascot.jsx'
import { calculateTransport, getCartLoad, PIECE_SIZES, validateInteger } from './utils/transport.js'
import { readStoredArray, readStoredObject, storeObject } from './utils/storage.js'
import './App.css'

const CARTS_PER_PAGE = 12
const CAPACITY_KEY = 'traslados-capacidades-v2'
const OT_KEY = 'traslados-ot-v2'
const RECORDS_KEY = 'traslados-registros-v2'

function createRecordMetadata() {
  const createdAt = new Date().toISOString()
  return {
    id: globalThis.crypto?.randomUUID?.() ?? createdAt,
    createdAt,
  }
}

function Icon({ name, size = 20 }) {
  const paths = {
    boxes: (<><path d="m21 8-9-5-9 5 9 5 9-5Z" /><path d="m3 8 9 5 9-5" /><path d="M12 13v9" /><path d="m21 8v9l-9 5-9-5V8" /></>),
    cart: (<><path d="M4 5h2l1.7 9.2a2 2 0 0 0 2 1.6h7.7a2 2 0 0 0 2-1.6L21 8H7" /><path d="M10 8v4M14 8v4M18 8v4" /><circle cx="10" cy="20" r="1.5" /><circle cx="18" cy="20" r="1.5" /></>),
    check: <path d="m5 12 4 4L19 6" />,
    gauge: (<><path d="M20.4 15a9 9 0 1 0-16.8 0" /><path d="M12 12 16 8" /><path d="M12 3v2M4.2 7.5 6 8.5M19.8 7.5 18 8.5" /></>),
    alert: (<><path d="M12 3 2.8 19h18.4L12 3Z" /><path d="M12 9v4M12 16h.01" /></>),
    layers: (<><path d="m12 2 9 5-9 5-9-5 9-5Z" /><path d="m3 12 9 5 9-5M3 17l9 5 9-5" /></>),
    clipboard: (<><rect x="5" y="4" width="14" height="17" rx="2" /><path d="M9 4.5V3h6v1.5M9 10h6M9 14h6" /></>),
    user: (<><circle cx="12" cy="8" r="4" /><path d="M4.5 21c.7-4.2 3.2-6.5 7.5-6.5s6.8 2.3 7.5 6.5" /></>),
    save: (<><path d="M5 3h12l3 3v15H4V3h1Z" /><path d="M8 3v6h8V3M8 21v-7h8v7" /></>),
    arrow: <path d="m9 18 6-6-6-6" />,
  }
  return <svg aria-hidden="true" className="icon" fill="none" height={size} viewBox="0 0 24 24" width={size}><g stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8">{paths[name]}</g></svg>
}

function TextField({ id, label, value, onChange, hint, placeholder }) {
  return (
    <div className="field person-field">
      <label htmlFor={id}>{label}</label>
      <div className="input-shell">
        <span className="input-icon"><Icon name="user" size={19} /></span>
        <input id={id} maxLength="80" onChange={(event) => onChange(event.target.value)} placeholder={placeholder} type="text" value={value} />
      </div>
      <p className="field-message">{hint}</p>
    </div>
  )
}

function NumberField({ id, label, value, onChange, error, hint, icon, unit, allowZero = true }) {
  return (
    <div className={`field ${error ? 'field--error' : ''}`}>
      <label htmlFor={id}>{label}</label>
      <div className="input-shell">
        <span className="input-icon"><Icon name={icon} size={19} /></span>
        <input aria-describedby={`${id}-message`} aria-invalid={Boolean(error)} id={id} inputMode="numeric" min={allowZero ? '0' : '1'} onChange={(event) => onChange(event.target.value)} step="1" type="number" value={value} />
        <span className="input-unit">{unit}</span>
      </div>
      <p className="field-message" id={`${id}-message`}>{error || hint}</p>
    </div>
  )
}

function SizeSelector({ value, onChange }) {
  return (
    <fieldset className="size-field">
      <legend>Tamaño de las piezas</legend>
      <div className="size-options">
        {PIECE_SIZES.map((size) => (
          <label className={value === size.id ? 'size-option size-option--active' : 'size-option'} key={size.id}>
            <input checked={value === size.id} name="piece-size" onChange={() => onChange(size.id)} type="radio" value={size.id} />
            <span className={`size-dot size-dot--${size.id}`}><i /><i /><i /></span>
            <span><strong>{size.label}</strong><small>{size.hint}</small></span>
          </label>
        ))}
      </div>
    </fieldset>
  )
}

function StatCard({ icon, label, value, detail, tone = 'blue' }) {
  return <article className={`stat-card stat-card--${tone}`}><div className="stat-icon"><Icon name={icon} size={21} /></div><div><p className="stat-label">{label}</p><p className="stat-value">{value}</p><p className="stat-detail">{detail}</p></div></article>
}

function AvailabilityBanner({ plan, pieces }) {
  if (pieces === 0) {
    return <div className="availability availability--neutral"><Icon name="cart" size={23} /><div><strong>No hay piezas para trasladar.</strong><span>Ingresá una cantidad mayor que cero para preparar una tanda.</span></div></div>
  }
  if (plan.missingCarts > 0) {
    return <div className="availability availability--warning" role="status"><Icon name="alert" size={23} /><div><strong>Se necesitan {plan.requiredCarts} carros, pero solamente hay {plan.usedCarts} disponibles. {plan.missingCarts === 1 ? 'Falta 1 carro.' : `Faltan ${plan.missingCarts} carros.`}</strong><span>En la primera tanda se trasladan {plan.firstBatchPieces} piezas y quedan {plan.pendingPieces} pendientes.</span></div></div>
  }
  return <div className="availability availability--success" role="status"><Icon name="check" size={23} /><div><strong>El traslado puede realizarse con los carros disponibles.</strong><span>{plan.surplusCarts === 0 ? 'La disponibilidad coincide con lo necesario.' : `${plan.surplusCarts} ${plan.surplusCarts === 1 ? 'carro quedará disponible' : 'carros quedarán disponibles'}.`}</span></div></div>
}

function CartCard({ number, pieces, capacity, ot, onOtChange }) {
  const isFull = pieces === capacity
  const percentage = Math.round((pieces / capacity) * 100)
  return (
    <article className={`cart-card ${isFull ? 'cart-card--full' : 'cart-card--partial'}`}>
      <div className="cart-card__header">
        <div className="cart-symbol"><Icon name="cart" size={22} /></div>
        <div><h3>Carro {number}</h3><p>{isFull ? 'Carga completa' : 'Carga parcial'}</p></div>
        <span className="status-pill">{isFull ? <><Icon name="check" size={14} /> Completo</> : 'Parcial'}</span>
      </div>
      <div className="cart-load"><span><strong>{pieces}</strong> de {capacity} piezas</span><strong>{percentage}%</strong></div>
      <div aria-label={`${percentage}% de ocupación`} aria-valuemax="100" aria-valuemin="0" aria-valuenow={percentage} className="progress" role="progressbar"><span style={{ width: `${percentage}%` }} /></div>
      <label className="ot-field"><span><Icon name="clipboard" size={15} /> OT asignada</span><input aria-label={`OT asignada al carro ${number}`} maxLength="30" onChange={(event) => onOtChange(number, event.target.value)} placeholder="Ej: 10542 o A-10542" type="text" value={ot} /></label>
    </article>
  )
}

function EmptyDistribution({ zeroAvailable }) {
  return <div className="empty-state"><div className="empty-state__icon"><Icon name={zeroAvailable ? 'alert' : 'cart'} size={30} /></div><h3>{zeroAvailable ? 'No hay carros disponibles' : 'No hay traslados por planificar'}</h3><p>{zeroAvailable ? 'Indicá al menos un carro disponible para preparar la primera tanda.' : 'Ingresá una cantidad de piezas mayor que cero para ver la distribución.'}</p></div>
}

function App() {
  const [piecesInput, setPiecesInput] = useState('37')
  const [availableInput, setAvailableInput] = useState('4')
  const [pieceSize, setPieceSize] = useState('medianas')
  const [capacities, setCapacities] = useState(() => readStoredObject(CAPACITY_KEY, { grandes: '', medianas: '', pequenas: '' }))
  const [orders, setOrders] = useState(() => readStoredObject(OT_KEY, {}))
  const [loadedBy, setLoadedBy] = useState('')
  const [transportedBy, setTransportedBy] = useState('')
  const [records, setRecords] = useState(() => readStoredArray(RECORDS_KEY))
  const [saveResult, setSaveResult] = useState(null)
  const [page, setPage] = useState(1)

  const capacityInput = capacities[pieceSize] ?? ''
  const piecesError = validateInteger(piecesInput)
  const capacityError = validateInteger(capacityInput, { allowZero: false })
  const availableError = validateInteger(availableInput)
  const isValid = !piecesError && !capacityError && !availableError

  useEffect(() => {
    storeObject(CAPACITY_KEY, capacities)
  }, [capacities])
  useEffect(() => {
    storeObject(OT_KEY, orders)
  }, [orders])

  const plan = useMemo(() => {
    if (!isValid) return null
    return calculateTransport({ pieces: Number(piecesInput), capacity: Number(capacityInput), availableCarts: Number(availableInput) })
  }, [availableInput, capacityInput, isValid, piecesInput])

  const totalPages = plan ? Math.max(1, Math.ceil(plan.usedCarts / CARTS_PER_PAGE)) : 1
  const currentPage = Math.min(page, totalPages)

  const visibleCarts = useMemo(() => {
    if (!plan || plan.usedCarts === 0) return []
    const start = (currentPage - 1) * CARTS_PER_PAGE
    const count = Math.min(CARTS_PER_PAGE, plan.usedCarts - start)
    return Array.from({ length: count }, (_, position) => {
      const index = start + position
      return { number: index + 1, pieces: getCartLoad(index, Number(piecesInput), Number(capacityInput)) }
    })
  }, [capacityInput, currentPage, piecesInput, plan])

  function updateCapacity(value) {
    setCapacities((current) => ({ ...current, [pieceSize]: value }))
  }

  function updateOrder(cartNumber, value) {
    setOrders((current) => ({ ...current, [cartNumber]: value }))
  }

  const selectedSize = PIECE_SIZES.find((size) => size.id === pieceSize)
  const balanceValue = plan ? plan.missingCarts || plan.surplusCarts : 0
  const balanceLabel = plan?.missingCarts ? 'Carros faltantes' : 'Carros sobrantes'
  const saveSignature = JSON.stringify({ loadedBy, transportedBy, piecesInput, availableInput, pieceSize, capacityInput, orders })
  const canSave = isValid && Number(piecesInput) > 0 && loadedBy.trim() !== '' && transportedBy.trim() !== ''
  const visibleSaveResult = saveResult?.type === 'error' || saveResult?.signature === saveSignature ? saveResult : null

  function saveTransfer() {
    if (!canSave || !plan) return

    const usedOrders = Object.fromEntries(
      Object.entries(orders).filter(([cartNumber, value]) => Number(cartNumber) <= plan.usedCarts && value.trim() !== ''),
    )
    const record = {
      ...createRecordMetadata(),
      loadedBy: loadedBy.trim(),
      transportedBy: transportedBy.trim(),
      pieces: Number(piecesInput),
      pieceSize,
      pieceSizeLabel: selectedSize.label,
      capacity: Number(capacityInput),
      availableCarts: Number(availableInput),
      ...plan,
      orders: usedOrders,
    }
    const nextRecords = [record, ...records]

    if (!storeObject(RECORDS_KEY, nextRecords)) {
      setSaveResult({ type: 'error', message: 'No se pudo guardar el registro en este navegador.' })
      return
    }

    setRecords(nextRecords)
    setSaveResult({ type: 'success', signature: saveSignature, createdAt: record.createdAt })
  }

  return (
    <div className="app-shell">
      <header className="topbar"><div className="brand-mark"><Icon name="boxes" size={23} /></div><div><p className="eyebrow">LOGÍSTICA INTERNA</p><p className="brand-name">Planificador de Traslado de Piezas</p></div><span className="version-badge">Versión 2.1</span></header>
      <main>
        <section className="intro">
          <div><span className="section-kicker"><span /> PLANIFICACIÓN DE CARGA</span><h1>Organizá cada traslado<br />con <em>precisión</em></h1><p>Configurá las piezas y los carros disponibles. El sistema prepara una primera tanda realista y te muestra lo que queda pendiente.</p></div>
          <DragonMascot />
        </section>

        <section className="calculator-panel" aria-labelledby="data-title">
          <div className="panel-heading"><div className="step-number">01</div><div><h2 id="data-title">Configuración del traslado</h2><p>Los resultados se actualizan automáticamente con cada cambio.</p></div></div>
          <div className="fields-grid fields-grid--top">
            <NumberField error={piecesError} hint="Cantidad total a transportar" icon="boxes" id="pieces" label="Cantidad total de piezas" onChange={setPiecesInput} unit="piezas" value={piecesInput} />
            <NumberField allowZero error={availableError} hint="Carros físicamente disponibles" icon="cart" id="available" label="Carros disponibles en el sector" onChange={setAvailableInput} unit="carros" value={availableInput} />
          </div>
          <SizeSelector onChange={(value) => { setPieceSize(value); setPage(1) }} value={pieceSize} />
          <div className="capacity-row">
            <NumberField allowZero={false} error={capacityError} hint={`Capacidad guardada para piezas ${selectedSize.label.toLowerCase()}`} icon="gauge" id="capacity" label={`Capacidad por carro — ${selectedSize.label}`} onChange={updateCapacity} unit="piezas" value={capacityInput} />
            <div className="capacity-note"><Icon name="layers" size={20} /><p><strong>Configuración por tamaño</strong><span>La capacidad se guarda por separado para cada opción y podés modificarla cuando sea necesario.</span></p></div>
          </div>
          <div className="responsible-divider"><span>RESPONSABLES DEL TRASLADO</span></div>
          <div className="fields-grid responsible-grid">
            <TextField hint="Persona responsable de ingresar la información" id="loaded-by" label="Nombre de quien carga los datos" onChange={setLoadedBy} placeholder="Nombre y apellido" value={loadedBy} />
            <TextField hint="Persona responsable de llevar el material" id="transported-by" label="Nombre de quien lleva el material" onChange={setTransportedBy} placeholder="Nombre y apellido" value={transportedBy} />
          </div>
        </section>

        {!isValid ? (
          <div className="validation-banner" role="alert"><Icon name="alert" size={22} /><div><strong>{capacityInput === '' ? `Definí la capacidad para piezas ${selectedSize.label.toLowerCase()}.` : 'Revisá los datos ingresados.'}</strong><span>Completá correctamente los campos marcados para calcular el traslado.</span></div></div>
        ) : (
          <>
            <section className="results-section" aria-labelledby="result-title" aria-live="polite">
              <div className="section-heading"><div><span className="section-kicker"><span /> RESULTADO</span><h2 id="result-title">Resumen del traslado</h2></div><p>Primera tanda calculada según la disponibilidad real</p></div>
              <AvailabilityBanner pieces={Number(piecesInput)} plan={plan} />
              <div className="stats-grid">
                <StatCard icon="cart" label="Carros necesarios" value={plan.requiredCarts} detail="Para completar el traslado" />
                <StatCard icon="check" label="Carros disponibles" value={Number(availableInput)} detail={`${plan.usedCarts} se usarán en la tanda`} tone="green" />
                <StatCard icon={plan.missingCarts ? 'alert' : 'layers'} label={balanceLabel} value={balanceValue} detail="Balance de disponibilidad" tone={plan.missingCarts ? 'red' : 'gray'} />
                <StatCard icon="boxes" label="Primera tanda" value={plan.firstBatchPieces} detail="Piezas que se trasladan" tone="amber" />
                <StatCard icon="layers" label="Piezas pendientes" value={plan.pendingPieces} detail="Para una próxima tanda" tone={plan.pendingPieces ? 'red' : 'green'} />
              </div>
            </section>

            <section className="distribution-section" aria-labelledby="distribution-title">
              <div className="section-heading"><div><span className="section-kicker"><span /> DISTRIBUCIÓN</span><h2 id="distribution-title">Carga y OT de los carros</h2></div>{plan.usedCarts > 0 && <p>{plan.usedCarts} {plan.usedCarts === 1 ? 'carro asignado' : 'carros asignados'} · máximo {CARTS_PER_PAGE} por página</p>}</div>
              {plan.usedCarts === 0 ? <EmptyDistribution zeroAvailable={Number(piecesInput) > 0 && Number(availableInput) === 0} /> : <>
                <div className="carts-grid">{visibleCarts.map((cart) => <CartCard capacity={Number(capacityInput)} key={cart.number} onOtChange={updateOrder} ot={orders[cart.number] ?? ''} {...cart} />)}</div>
                {totalPages > 1 && <nav aria-label="Páginas de carros" className="pagination"><button disabled={currentPage === 1} onClick={() => setPage(Math.max(1, currentPage - 1))} type="button">Anterior</button><span>Página <strong>{currentPage}</strong> de {totalPages}</span><button disabled={currentPage === totalPages} onClick={() => setPage(Math.min(totalPages, currentPage + 1))} type="button">Siguiente <Icon name="arrow" size={14} /></button></nav>}
              </>}
            </section>

            <section className="save-section" aria-labelledby="save-title">
              <div className="save-copy">
                <div className="save-icon"><Icon name="save" size={23} /></div>
                <div><h2 id="save-title">Guardar registro del traslado</h2><p>Por ahora se guarda en este dispositivo. Luego conectaremos este mismo registro con Firebase.</p></div>
              </div>
              <div className="save-actions">
                <span>{records.length} {records.length === 1 ? 'registro guardado' : 'registros guardados'}</span>
                <button disabled={!canSave} onClick={saveTransfer} type="button"><Icon name="save" size={17} /> Guardar traslado</button>
              </div>
              {!canSave && <p className="save-help">Completá ambos nombres y los datos válidos del traslado para guardar.</p>}
              {visibleSaveResult?.type === 'success' && <div className="save-feedback save-feedback--success" role="status"><Icon name="check" size={18} /><span><strong>Traslado guardado correctamente.</strong> {new Date(visibleSaveResult.createdAt).toLocaleString('es-AR')}</span></div>}
              {visibleSaveResult?.type === 'error' && <div className="save-feedback save-feedback--error" role="alert"><Icon name="alert" size={18} /><span>{visibleSaveResult.message}</span></div>}
            </section>
          </>
        )}
      </main>
      <footer><span>PLANIFICADOR DE TRASLADOS · V2.1</span><p>Herramienta de apoyo para la logística interna de planta.</p></footer>
    </div>
  )
}

export default App
