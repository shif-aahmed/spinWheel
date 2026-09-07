import React from 'react'
import './Wheel.css'

function Wheel({
  names,
  colors,
  rotation,
  isSpinning,
  showWinner,
  winner,
  onWheelClick,
  wheelRef,
  settings = {}
}) {
  // Synchronized active pool of displayed names
  const displayNames = names || []

  // 3. Center image radius and font size based on settings.imageSize
  const centerRadius = settings.imageSize === 'L' ? 75 : settings.imageSize === 'M' ? 55 : 38
  const centerFontSize = settings.imageSize === 'L' ? 44 : settings.imageSize === 'M' ? 32 : 22

  // 4. Dynamic pointer color
  let pointerColor = 'rgb(0, 0, 172)'
  if (settings.pointerChangesColor && displayNames.length > 0 && colors.length > 0) {
    const sliceAngle = 360 / displayNames.length
    const normAngle = ((-rotation % 360) + 360) % 360
    const normalizedFromStart = ((normAngle + 90) % 360 + 360) % 360
    const currentIndex = Math.floor(normalizedFromStart / sliceAngle) % displayNames.length
    pointerColor = colors[currentIndex % colors.length] || pointerColor
  }

  return (
    <div className="wheel-container">
      {settings.showTitle && (
        <h1 className="wheel-app-title">Wheel of Names</h1>
      )}

      <div
        className="wheel-wrapper"
        onClick={onWheelClick}
        style={{ cursor: (isSpinning || showWinner || displayNames.length === 0) ? 'not-allowed' : 'pointer' }}
      >
        <svg 
          className={`wheel ${settings.contours ? 'wheel--contours' : ''}`}
          viewBox="0 0 750 750"
          ref={wheelRef}
          style={{ 
            transform: `rotate(${rotation}deg)`, 
            transition: 'none',
            filter: settings.wheelShadow !== false ? 'drop-shadow(0 10px 28px rgba(0,0,0,0.5))' : 'none'
          }}
        >
          <defs>
            <filter id="shadow">
              <feDropShadow dx="0" dy="4" stdDeviation="8" floodOpacity="0.3"/>
            </filter>

            {/* Cookie pattern */}
            <pattern id="cookie-pattern" patternUnits="userSpaceOnUse" width="60" height="60">
              <rect width="60" height="60" fill="#d97706" />
              <circle cx="15" cy="15" r="4" fill="#78350f" />
              <circle cx="45" cy="20" r="5" fill="#78350f" />
              <circle cx="25" cy="45" r="4" fill="#78350f" />
              <circle cx="50" cy="50" r="3" fill="#78350f" />
            </pattern>

            {/* Star pattern */}
            <pattern id="stars-pattern" patternUnits="userSpaceOnUse" width="80" height="80">
              <rect width="80" height="80" fill="#0f172a" />
              <circle cx="20" cy="20" r="2" fill="#e2e8f0" />
              <circle cx="60" cy="30" r="1.5" fill="#38bdf8" />
              <circle cx="35" cy="65" r="2.5" fill="#fbbf24" />
              <circle cx="70" cy="70" r="1" fill="#e2e8f0" />
            </pattern>

            {/* Polka dots pattern */}
            <pattern id="dots-pattern" patternUnits="userSpaceOnUse" width="40" height="40">
              <rect width="40" height="40" fill="#1e293b" />
              <circle cx="20" cy="20" r="6" fill="#38bdf8" fillOpacity="0.4" />
            </pattern>
          </defs>

          {/* Background image pattern on wheel if enabled */}
          {settings.wheelBackgroundImage ? (
            <circle
              cx="375"
              cy="375"
              r="340"
              fill={
                settings.wheelBackgroundImage === 'stars' 
                  ? 'url(#stars-pattern)' 
                  : settings.wheelBackgroundImage === 'dots'
                  ? 'url(#dots-pattern)'
                  : 'url(#cookie-pattern)'
              }
              stroke={settings.contours ? '#ffffff' : '#000000'}
              strokeWidth={settings.contours ? '5' : '1'}
            />
          ) : null}

          {displayNames.length === 0 ? (
            <g>
              <circle cx="375" cy="375" r="340" fill="#4b5563" stroke={settings.contours ? '#ffffff' : '#000000'} strokeWidth={settings.contours ? '4' : '1'} />
              <text x="375" y="375" fill="white" fontSize="24" textAnchor="middle" dominantBaseline="middle">
                Add names
              </text>
            </g>
          ) : (
            displayNames.map((name, index) => {
              const angle = (360 / displayNames.length)
              const startAngle = (index * angle - 90) * (Math.PI / 180)
              const endAngle = ((index + 1) * angle - 90) * (Math.PI / 180)
              const largeArc = angle > 180 ? 1 : 0
              
              const x1 = 375 + 340 * Math.cos(startAngle)
              const y1 = 375 + 340 * Math.sin(startAngle)
              const x2 = 375 + 340 * Math.cos(endAngle)
              const y2 = 375 + 340 * Math.sin(endAngle)
              
              const path = `M 375 375 L ${x1} ${y1} A 340 340 0 ${largeArc} 1 ${x2} ${y2} Z`
              
              const midAngle = (startAngle + endAngle) / 2
              const innerRadius = 120
              const outerRadius = 280
              const textRadius = (innerRadius + outerRadius) / 2
              const textX = 375 + textRadius * Math.cos(midAngle)
              const textY = 375 + textRadius * Math.sin(midAngle)
              const textRotationDeg = (midAngle * 180 / Math.PI)

              const isWinningEntry = winner && winner.index === index && showWinner && settings.animateWinningEntry
              
              return (
                <g key={index} className={isWinningEntry ? 'wheel-segment--winning' : ''}>
                  {!settings.wheelBackgroundImage && (
                    <path
                      d={path}
                      fill={colors[index % colors.length]}
                      stroke={settings.contours ? '#ffffff' : 'black'}
                      strokeWidth={settings.contours ? '2.5' : '0.5'}
                    />
                  )}
                  {settings.wheelBackgroundImage && (
                    <line
                      x1="375"
                      y1="375"
                      x2={x1}
                      y2={y1}
                      stroke={settings.contours ? '#ffffff' : 'rgba(255, 255, 255, 0.4)'}
                      strokeWidth={settings.contours ? '2.5' : '1.5'}
                    />
                  )}
                  <text
                    x={textX}
                    y={textY}
                    fill="white"
                    fontSize={displayNames.length > 20 ? "14" : "18"}
                    fontWeight="bold"
                    textAnchor="middle"
                    dominantBaseline="middle"
                    transform={`rotate(${textRotationDeg} ${textX} ${textY})`}
                    style={{ 
                      whiteSpace: 'nowrap',
                      letterSpacing: '0.5px',
                      textShadow: settings.wheelBackgroundImage ? '0 2px 4px rgba(0,0,0,0.8)' : 'none'
                    }}
                  >
                    {name}
                  </text>
                </g>
              )
            })
          )}

          {/* Outer contour ring */}
          {settings.contours && (
            <circle
              cx="375"
              cy="375"
              r="340"
              fill="none"
              stroke="#ffffff"
              strokeWidth="5"
            />
          )}

          {/* Center Cap Circle & Center Image */}
          <circle 
            cx="375" 
            cy="375" 
            r={centerRadius} 
            fill="white" 
            filter="url(#shadow)"
            stroke={settings.contours ? '#2563eb' : 'none'}
            strokeWidth={settings.contours ? '3' : '0'}
          />
          {settings.centerImage && (
            <text
              x="375"
              y="375"
              fontSize={centerFontSize}
              textAnchor="middle"
              dominantBaseline="middle"
              style={{ pointerEvents: 'none', userSelect: 'none' }}
            >
              {settings.centerImage}
            </text>
          )}
        </svg>

        {/* Dynamic Pointer */}
        <div 
          className="wheel-pointer"
          style={{ borderRightColor: pointerColor }}
        ></div>

        {/* Center overlay trigger */}
        <div className="wheel-overlay" onClick={onWheelClick} style={{ cursor: (isSpinning || showWinner || displayNames.length === 0) ? "not-allowed" : "pointer" }}>
          {!settings.centerImage ? (
            <>
              <div className="spin-text">
                {isSpinning ? 'Spinning...' : displayNames.length === 0 ? 'Add names' : 'Click to spin'}
              </div>
              <div className="spin-text-small">
                {displayNames.length > 0 && !isSpinning ? 'or press ctrl+enter' : ''}
              </div>
            </>
          ) : (
            isSpinning && <div className="spin-text" style={{ color: '#fff', textShadow: '0 2px 4px #000' }}>Spinning...</div>
          )}
        </div>
      </div>
    </div>
  )
}

export default Wheel
