import { useContext, useEffect, useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { createPortal } from 'react-dom'
import { TutorialContext, TUTORIAL_STEPS } from '../../context/TutorialContext'

const TOOLTIP_W = 340
const SPOT_PAD  = 10

function getTooltipPos(rect, position) {
  if (!rect) return null
  const vw  = window.innerWidth
  const vh  = window.innerHeight
  const GAP = 16
  const EST_H = 230  // estimated tooltip height

  let top, left

  if (position === 'top') {
    top  = rect.top - EST_H - GAP
    left = rect.left + rect.width / 2 - TOOLTIP_W / 2
  } else {
    // bottom (default)
    top  = rect.top + rect.height + GAP
    left = rect.left + rect.width / 2 - TOOLTIP_W / 2
  }

  // Clamp within viewport
  left = Math.max(16, Math.min(left, vw - TOOLTIP_W - 16))
  top  = Math.max(70, Math.min(top,  vh - EST_H - 16))

  return { top, left }
}

export default function Tutorial() {
  const ctx      = useContext(TutorialContext)
  const navigate = useNavigate()
  const location = useLocation()
  const [rect, setRect] = useState(null)

  const { active, stepIndex, next, prev, skip } = ctx ?? {}
  const step = active ? TUTORIAL_STEPS[stepIndex] : null

  // Navigate to the step's route when the step changes
  useEffect(() => {
    if (!step) return
    if (location.pathname !== step.route) {
      navigate(step.route)
    }
    // Reset rect so we don't show stale spotlight during transition
    setRect(null)
  }, [stepIndex, active])

  // Measure the target element after navigation settles
  useEffect(() => {
    if (!step?.target) { setRect(null); return }
    if (location.pathname !== step.route) return

    const measure = () => {
      const el = document.querySelector(step.target)
      if (el) {
        const r = el.getBoundingClientRect()
        setRect({ top: r.top, left: r.left, width: r.width, height: r.height })
      }
    }

    measure()
    const t1 = setTimeout(measure, 150)
    const t2 = setTimeout(measure, 600)
    return () => { clearTimeout(t1); clearTimeout(t2) }
  }, [stepIndex, active, location.pathname])

  if (!step) return null

  const isCenter = !step.target || step.position === 'center'
  const pos      = isCenter ? null : getTooltipPos(rect, step.position)

  const tooltipStyle = (isCenter || !rect || !pos)
    ? {
        position: 'fixed',
        top: '50%', left: '50%',
        transform: 'translate(-50%, -50%)',
        width: TOOLTIP_W,
        zIndex: 10000,
      }
    : {
        position: 'fixed',
        top:  pos.top,
        left: pos.left,
        width: TOOLTIP_W,
        zIndex: 10000,
      }

  const spotlightStyle = rect ? {
    position:  'fixed',
    top:       rect.top    - SPOT_PAD,
    left:      rect.left   - SPOT_PAD,
    width:     rect.width  + SPOT_PAD * 2,
    height:    rect.height + SPOT_PAD * 2,
    borderRadius: 10,
    boxShadow: '0 0 0 9999px rgba(0,0,0,0.7)',
    zIndex:    9999,
    pointerEvents: 'none',
  } : null

  const isLast = stepIndex === TUTORIAL_STEPS.length - 1

  return createPortal(
    <>
      {/* Full overlay when no spotlight rect (center steps or during transition) */}
      {!rect && (
        <div className="tutorial-overlay" />
      )}

      {/* Spotlight cutout */}
      {spotlightStyle && <div style={spotlightStyle} />}

      {/* Tooltip card */}
      <div className="tutorial-tooltip" style={tooltipStyle}>

        <div className="tutorial-header">
          <span className="tutorial-step-label">
            Step {stepIndex + 1} of {TUTORIAL_STEPS.length}
          </span>
          <button className="tutorial-close" onClick={skip} aria-label="Skip tutorial">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4"
              strokeLinecap="round" strokeLinejoin="round" style={{ width: 13, height: 13 }}>
              <path d="M18 6L6 18M6 6l12 12"/>
            </svg>
          </button>
        </div>

        <h3 className="tutorial-title">{step.title}</h3>
        <p className="tutorial-body">{step.body}</p>

        {/* Progress dots */}
        <div className="tutorial-dots">
          {TUTORIAL_STEPS.map((_, i) => (
            <span key={i} className={`tutorial-dot${i === stepIndex ? ' active' : ''}`} />
          ))}
        </div>

        <div className="tutorial-footer">
          {stepIndex > 0 && (
            <button className="btn btn-outline btn-sm" onClick={prev}>Back</button>
          )}
          <button
            className="btn btn-primary btn-sm tutorial-next-btn"
            onClick={next}
          >
            {isLast ? "Let's Go!" : 'Next →'}
          </button>
        </div>

      </div>
    </>,
    document.body
  )
}
