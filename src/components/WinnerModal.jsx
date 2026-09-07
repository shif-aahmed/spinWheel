import React, { useEffect, useState, useRef } from 'react'
import './WinnerModal.css'

function WinnerModal({ 
  winner, 
  showWinner, 
  onClose, 
  onRemove,
  popupMessage = 'We have a winner!',
  displayRemoveButton = true,
  autoRemoveWinner = false
}) {
  const [countdown, setCountdown] = useState(5)
  const onRemoveRef = useRef(onRemove)

  useEffect(() => {
    onRemoveRef.current = onRemove
  }, [onRemove])

  useEffect(() => {
    if (!showWinner || !autoRemoveWinner) return

    setCountdown(5)
    const countdownInterval = setInterval(() => {
      setCountdown(prev => Math.max(0, prev - 1))
    }, 1000)

    const removeTimer = setTimeout(() => {
      if (onRemoveRef.current) {
        onRemoveRef.current()
      }
    }, 5000)

    return () => {
      clearInterval(countdownInterval)
      clearTimeout(removeTimer)
    }
  }, [showWinner, autoRemoveWinner])

  if (!showWinner || !winner) return null

  return (
    <div className="winner-overlay" onClick={onClose}>
      <div className="winner-popup" onClick={(e) => e.stopPropagation()}>
        <div className="winner-header" style={{ backgroundColor: winner.color }}>
          <h2>{popupMessage || 'We have a winner!'}</h2>
          <button className="winner-close-btn" onClick={onClose}>×</button>
        </div>
        <div className="winner-content">
          <div className="winner-name">{winner.name}</div>
          {autoRemoveWinner && (
            <div className="winner-countdown">
              Auto-removing in {countdown}s...
            </div>
          )}
          <div className="winner-buttons">
            <button className="winner-btn close-btn" onClick={onClose}>Close</button>
            {displayRemoveButton !== false && (
              <button className="winner-btn remove-btn" onClick={onRemove}>Remove</button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default WinnerModal
