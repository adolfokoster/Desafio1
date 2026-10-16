import { useEffect, useRef, useState } from 'react'

const PHRASES = [
  '¡Excelente trabajo, seguí así!',
  '¡Cada traslado cuenta!',
  '¡La organización hace la diferencia!',
  '¡Vamos, que esos carros no se cargan solos!',
  '¡Hoy es un gran día para ser eficiente!',
  '¡Un traslado bien planificado vale por dos!',
  '¡Sos una máquina organizando piezas!',
  '¡La logística está en buenas manos!',
  '¡Seguimos mejorando, carro a carro!',
  '¡La eficiencia también puede ser divertida!',
  '¡Planificar bien es avanzar mejor!',
  '¡Ese traslado ya está tomando forma!',
  '¡Orden, precisión y a mover piezas!',
  '¡Gran equipo, gran resultado!',
  '¡Todo listo para una jornada productiva!',
  '¡Menos cuentas, más eficiencia!',
]

export default function DragonMascot() {
  const [message, setMessage] = useState('¡Hola! Estoy acá para ayudarte a planificar el traslado.')
  const [isVisible, setIsVisible] = useState(true)
  const [isMuted, setIsMuted] = useState(false)
  const lastIndex = useRef(-1)
  const hideTimeout = useRef(null)

  useEffect(() => {
    if (isMuted) return undefined

    hideTimeout.current = window.setTimeout(() => setIsVisible(false), 5000)
    const interval = window.setInterval(() => {
      let nextIndex
      do {
        nextIndex = Math.floor(Math.random() * PHRASES.length)
      } while (nextIndex === lastIndex.current)

      lastIndex.current = nextIndex
      setMessage(PHRASES[nextIndex])
      setIsVisible(true)
      window.clearTimeout(hideTimeout.current)
      hideTimeout.current = window.setTimeout(() => setIsVisible(false), 5000)
    }, 20000)

    return () => {
      window.clearTimeout(hideTimeout.current)
      window.clearInterval(interval)
    }
  }, [isMuted])

  function toggleMessages() {
    setIsMuted((current) => {
      const next = !current
      setIsVisible(!next)
      return next
    })
  }

  return (
    <aside className="mascot" aria-label="Dragón asistente">
      <div className={`speech-bubble ${isVisible && !isMuted ? 'speech-bubble--visible' : ''}`} aria-live="polite">
        {message}
      </div>
      <div className="dragon-wrap" aria-hidden="true">
        <svg className="dragon" viewBox="0 0 220 180">
          <path className="dragon-wing" d="M67 104C31 93 21 55 30 34c21 16 43 25 60 58Z" />
          <path className="dragon-wing" d="M151 102c30-16 39-49 25-70-18 18-36 29-49 62Z" />
          <path className="dragon-tail" d="M151 130c34 8 40 29 25 37 4-13-10-15-27-10" />
          <ellipse className="dragon-body" cx="109" cy="116" rx="57" ry="47" />
          <path className="dragon-belly" d="M88 98c-8 31 2 55 21 61 19-7 28-30 20-61-11 8-29 8-41 0Z" />
          <circle className="dragon-head" cx="109" cy="66" r="48" />
          <path className="dragon-horn" d="m76 32-7-24 24 15M142 31l9-23-25 15" />
          <path className="dragon-ear" d="m66 54-26-8 18 23M152 53l27-8-19 23" />
          <ellipse className="dragon-eye" cx="91" cy="62" rx="8" ry="10" />
          <ellipse className="dragon-eye" cx="127" cy="62" rx="8" ry="10" />
          <circle className="dragon-pupil" cx="93" cy="64" r="3" />
          <circle className="dragon-pupil" cx="125" cy="64" r="3" />
          <path className="dragon-snout" d="M83 78c7 18 45 18 52 0-13-8-39-8-52 0Z" />
          <circle className="dragon-nostril" cx="99" cy="80" r="2" />
          <circle className="dragon-nostril" cx="120" cy="80" r="2" />
          <path className="dragon-smile" d="M99 88c7 6 14 6 21 0" />
          <path className="dragon-arm" d="M70 111c-13 7-18 17-12 24M148 111c13 7 18 17 12 24" />
          <ellipse className="dragon-foot" cx="81" cy="156" rx="21" ry="10" />
          <ellipse className="dragon-foot" cx="137" cy="156" rx="21" ry="10" />
        </svg>
      </div>
      <button className="mascot-toggle" onClick={toggleMessages} type="button">
        {isMuted ? 'Mostrar mensajes' : 'Silenciar mensajes'}
      </button>
    </aside>
  )
}
