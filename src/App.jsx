import { useMemo, useState } from 'react'
import './App.css'

const MAX_VISIBLE_CARTS = 12

function Icon({ name, size = 20 }) {
  const paths = {
    boxes: (<><path d="m21 8-9-5-9 5 9 5 9-5Z" /><path d="m3 8 9 5 9-5" /><path d="M12 13v9" /><path d="m21 8v9l-9 5-9-5V8" /></>),
    cart: (<><path d="M4 5h2l1.7 9.2a2 2 0 0 0 2 1.6h7.7a2 2 0 0 0 2-1.6L21 8H7" /><path d="M10 8v4M14 8v4M18 8v4" /><circle cx="10" cy="20" r="1.5" /><circle cx="18" cy="20" r="1.5" /></>),
    check: <path d="m5 12 4 4L19 6" />,
    gauge: (<><path d="M20.4 15a9 9 0 1 0-16.8 0" /><path d="M12 12 16 8" /><path d="M12 3v2M4.2 7.5 6 8.5M19.8 7.5 18 8.5" /></>),
    layers: (<><path d="m12 2 9 5-9 5-9-5 9-5Z" /><path d="m3 12 9 5 9-5M3 17l9 5 9-5" /></>),
    info: (<><circle cx="12" cy="12" r="9" /><path d="M12 11v5M12 8h.01" /></>),
  }

  return (
    <svg aria-hidden="true" className="icon" fill="none" height={size} viewBox="0 0 24 24" width={size}>
      <g stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8">{paths[name]}</g>
    </svg>
  )
}

function validateInteger(value, { allowZero }) {
  if (value === '') return 'Este campo es obligatorio.'
  if (!/^\d+$/.test(value)) return 'Ingresá un número entero, sin decimales.'
  const number = Number(value)
  if (!Number.isSafeInteger(number)) return 'El valor ingresado es demasiado grande.'
  if (!allowZero && number === 0) return 'La capacidad debe ser mayor que cero.'
  return ''
}

function NumberField({ id, label, value, onChange, error, hint, icon }) {
  return (
    <div className={`field ${error ? 'field--error' : ''}`}>
      <label htmlFor={id}>{label}</label>
      <div className="input-shell">
        <span className="input-icon"><Icon name={icon} size={19} /></span>
        <input aria-describedby={`${id}-message`} aria-invalid={Boolean(error)} id={id} inputMode="numeric" min={id === 'capacity' ? '1' : '0'} onChange={(event) => onChange(event.target.value)} step="1" type="number" value={value} />
        <span className="input-unit">piezas</span>
      </div>
      <p className="field-message" id={`${id}-message`}>{error || hint}</p>
    </div>
  )
}

function StatCard({ icon, label, value, detail, tone = 'blue' }) {
  return (
    <article className={`stat-card stat-card--${tone}`}>
      <div className="stat-icon"><Icon name={icon} size={21} /></div>
      <div><p className="stat-label">{label}</p><p className="stat-value">{value}</p><p className="stat-detail">{detail}</p></div>
    </article>
  )
}

function CartCard({ number, pieces, capacity, aggregate }) {
  const isFull = pieces === capacity
  const percentage = Math.round((pieces / capacity) * 100)
  const title = aggregate ? `Carros 1–${aggregate}` : `Carro ${number}`

  return (
    <article className={`cart-card ${isFull ? 'cart-card--full' : 'cart-card--partial'}`}>
      <div className="cart-card__header">
        <div className="cart-symbol"><Icon name="cart" size={22} /></div>
        <div><h3>{title}</h3><p>{aggregate ? `${aggregate} unidades con igual carga` : isFull ? 'Carga completa' : 'Carga parcial'}</p></div>
        <span className="status-pill">{isFull ? <><Icon name="check" size={14} /> Completo</> : 'Parcial'}</span>
      </div>
      <div className="cart-load"><span><strong>{pieces}</strong> de {capacity} piezas</span><strong>{percentage}%</strong></div>
      <div aria-label={`${percentage}% de ocupación`} aria-valuemax="100" aria-valuemin="0" aria-valuenow={percentage} className="progress" role="progressbar"><span style={{ width: `${percentage}%` }} /></div>
      {!isFull && <p className="free-space">{capacity - pieces} espacios disponibles</p>}
    </article>
  )
}

function EmptyState() {
  return (
    <div className="empty-state">
      <div className="empty-state__icon"><Icon name="cart" size={30} /></div>
      <h3>No hay traslados por planificar</h3>
      <p>Ingresá una cantidad de piezas mayor que cero para ver la distribución.</p>
    </div>
  )
}

function App() {
  const [piecesInput, setPiecesInput] = useState('37')
  const [capacityInput, setCapacityInput] = useState('8')
  const piecesError = validateInteger(piecesInput, { allowZero: true })
  const capacityError = validateInteger(capacityInput, { allowZero: false })
  const isValid = !piecesError && !capacityError

  const plan = useMemo(() => {
    if (!isValid) return null
    const pieces = Number(piecesInput)
    const capacity = Number(capacityInput)
    const totalCarts = Math.ceil(pieces / capacity)
    const remainder = pieces % capacity
    const fullCarts = Math.floor(pieces / capacity)
    const lastCartPieces = totalCarts === 0 ? 0 : remainder || capacity
    const freeSpaces = totalCarts === 0 ? 0 : capacity - lastCartPieces
    return { pieces, capacity, totalCarts, fullCarts, lastCartPieces, freeSpaces, remainder }
  }, [capacityInput, isValid, piecesInput])

  const carts = useMemo(() => {
    if (!plan || plan.totalCarts === 0 || plan.totalCarts > MAX_VISIBLE_CARTS) return []
    return Array.from({ length: plan.totalCarts }, (_, index) => ({ number: index + 1, pieces: index === plan.totalCarts - 1 ? plan.lastCartPieces : plan.capacity }))
  }, [plan])

  return (
    <div className="app-shell">
      <header className="topbar">
        <div className="brand-mark"><Icon name="boxes" size={23} /></div>
        <div><p className="eyebrow">LOGÍSTICA INTERNA</p><p className="brand-name">Planificador de traslados</p></div>
        <span className="version-badge">Versión 1.0</span>
      </header>

      <main>
        <section className="intro">
          <div>
            <span className="section-kicker"><span /> PLANIFICACIÓN DE CARGA</span>
            <h1>Calculá el traslado<br />de <em>piezas</em></h1>
            <p>Definí la cantidad y capacidad. El sistema organiza automáticamente los carros necesarios para el traslado.</p>
          </div>
          <div className="intro-illustration" aria-hidden="true"><span className="route-line" /><div className="illustration-box box-one"><Icon name="boxes" size={28} /></div><div className="illustration-cart"><Icon name="cart" size={40} /></div><div className="illustration-box box-two"><Icon name="boxes" size={24} /></div></div>
        </section>

        <section className="calculator-panel" aria-labelledby="data-title">
          <div className="panel-heading"><div className="step-number">01</div><div><h2 id="data-title">Datos del traslado</h2><p>Completá los valores para calcular la distribución.</p></div></div>
          <div className="fields-grid">
            <NumberField error={piecesError} hint="Cantidad total a transportar" icon="boxes" id="pieces" label="Cantidad total de piezas" onChange={setPiecesInput} value={piecesInput} />
            <NumberField error={capacityError} hint="Máximo permitido por carro" icon="gauge" id="capacity" label="Capacidad por carro" onChange={setCapacityInput} value={capacityInput} />
          </div>
        </section>

        {!isValid ? (
          <div className="validation-banner" role="alert"><Icon name="info" size={22} /><div><strong>Revisá los datos ingresados</strong><span>Corregí los campos marcados para calcular el traslado.</span></div></div>
        ) : (
          <>
            <section className="results-section" aria-labelledby="result-title" aria-live="polite">
              <div className="section-heading"><div><span className="section-kicker"><span /> RESULTADO</span><h2 id="result-title">Resumen del traslado</h2></div><p>{plan.pieces === 0 ? 'Sin piezas para trasladar' : `${plan.pieces} piezas distribuidas en ${plan.totalCarts} ${plan.totalCarts === 1 ? 'carro' : 'carros'}`}</p></div>
              <div className="stats-grid">
                <StatCard icon="cart" label="Carros necesarios" value={plan.totalCarts} detail="Total a preparar" />
                <StatCard icon="check" label="Carros completos" value={plan.fullCarts} detail="Al 100% de capacidad" tone="green" />
                <StatCard icon="boxes" label="Carga último carro" value={plan.lastCartPieces} detail={plan.totalCarts === 0 ? 'Sin carga asignada' : plan.remainder === 0 ? 'Carga completa' : 'Piezas asignadas'} tone="amber" />
                <StatCard icon="layers" label="Espacios libres" value={plan.freeSpaces} detail="En el último carro" tone="gray" />
              </div>
            </section>

            <section className="distribution-section" aria-labelledby="distribution-title">
              <div className="section-heading"><div><span className="section-kicker"><span /> DISTRIBUCIÓN</span><h2 id="distribution-title">Carga de los carros</h2></div>{plan.totalCarts > 0 && <div className="legend"><span className="legend-full" /> Completo <span className="legend-partial" /> Parcial</div>}</div>
              {plan.totalCarts === 0 ? <EmptyState /> : plan.totalCarts <= MAX_VISIBLE_CARTS ? (
                <div className="carts-grid">{carts.map((cart) => <CartCard capacity={plan.capacity} key={cart.number} {...cart} />)}</div>
              ) : (
                <div className="compact-view"><div className="compact-note"><Icon name="info" size={20} /><span>Vista resumida para facilitar la lectura de un traslado grande.</span></div><div className="carts-grid carts-grid--compact">{plan.fullCarts > 0 && <CartCard aggregate={plan.fullCarts} capacity={plan.capacity} pieces={plan.capacity} />}{plan.remainder > 0 && <CartCard capacity={plan.capacity} number={plan.totalCarts} pieces={plan.remainder} />}</div></div>
              )}
            </section>
          </>
        )}
      </main>
      <footer><span>PLANIFICADOR DE TRASLADOS</span><p>Herramienta de apoyo para la logística interna de planta.</p></footer>
    </div>
  )
}

export default App
