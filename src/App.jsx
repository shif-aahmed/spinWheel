import { useState, useEffect, useRef, useCallback } from 'react'
import Header from './components/Header'
import Wheel from './components/Wheel'
import Sidebar from './components/Sidebar'
import WinnerModal from './components/WinnerModal'
import CustomizeModal, { THEMES, PALETTE_COLORS } from './components/CustomizeModal'
import { playTickSound, playApplauseSound, playClickSound, speakName } from './utils/audio'
import { launchConfetti } from './utils/confetti'
import { parseExcelFile } from './utils/excel'
import { exportWinnersToPdf } from './utils/pdf'
import { FiMaximize } from 'react-icons/fi'
import './App.css'

function App() {
  const [names, setNames] = useState([
    'Ali', 'Beatriz', 'Charles', 'Diya', 'Eric', 'Fatima', 'Gabriel', 'Hanna'
  ])
  const [results, setResults] = useState([])
  const [activeTab, setActiveTab] = useState('entries')
  const [newName, setNewName] = useState('')
  const [showAdvanced, setShowAdvanced] = useState(false)
  const [rotation, setRotation] = useState(0)
  const [isSpinning, setIsSpinning] = useState(false)
  const [isSidebarHidden, setIsSidebarHidden] = useState(false)
  const [showWinner, setShowWinner] = useState(false)
  const [winner, setWinner] = useState(null)
  const [showCustomize, setShowCustomize] = useState(false)
  const [customizeTab, setCustomizeTab] = useState('during-spin')
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [settings, setSettings] = useState({
    sound: 'Ticking sound',
    volume: 50,
    displayDuplicates: true,
    spinSlowly: false,
    showTitle: true,
    spinTime: 10,
    maxNamesVisible: 1000,
    afterSpinSound: 'Subdued applause',
    afterSpinVolume: 50,
    animateWinningEntry: false,
    launchConfetti: true,
    autoRemoveWinner: false,
    displayPopup: true,
    popupMessage: 'We have a winner!',
    displayRemoveButton: true,
    playClickSoundOnRemove: false,
    oneColorPerSection: true,
    wheelBackgroundImage: false,
    wheelBackgroundPattern: 'cookie',
    selectedTheme: 'Default',
    customColors: ['#ffd900', '#00b100', '#00c3ff', '#ff4040', '#ff8c00', '#a855f7', '#ec4899', '#14b8a6'],
    colorPalettes: [true, true, true, true, false, false, false, false],
    centerImage: '',
    imageSize: 'S',
    pageBackgroundColor: false,
    pageBgColor: '#18181b',
    displayColorGradient: true,
    contours: false,
    wheelShadow: true,
    pointerChangesColor: true
  })

  const wheelRef = useRef(null)
  const rotationRef = useRef(0)
  const animationFrameRef = useRef(null)
  const lastTickAngleRef = useRef(0)
  const isSpinningRef = useRef(false)
  const hasWinnerProcessedRef = useRef(false)
  const slowRafRef = useRef(null)

  // Compute active colors from checked custom palette colors
  const palette = settings.customColors || PALETTE_COLORS
  const checkedColors = palette.filter((_, idx) => settings.colorPalettes[idx])
  const activeColors = checkedColors.length > 0 ? checkedColors : palette.slice(0, 4)

  // Compute active pool considering displayDuplicates and maxNamesVisible settings
  let activePool = names
  if (settings.displayDuplicates === false) {
    activePool = [...new Set(names)]
  }
  const maxAllowed = settings.maxNamesVisible || 1000
  if (activePool.length > maxAllowed) {
    activePool = activePool.slice(0, maxAllowed)
  }

  // Sync ref with rotation state
  useEffect(() => {
    rotationRef.current = rotation
  }, [rotation])

  // Idle slow rotation (if settings.spinSlowly is enabled and not spinning)
  useEffect(() => {
    if (!settings.spinSlowly || isSpinning || showWinner) {
      if (slowRafRef.current) {
        cancelAnimationFrame(slowRafRef.current)
        slowRafRef.current = null
      }
      return
    }

    let lastTime = performance.now()

    const tickSlow = (now) => {
      const delta = now - lastTime
      lastTime = now
      const newRot = (rotationRef.current + (18 * delta / 1000)) % 360
      rotationRef.current = newRot
      setRotation(newRot)
      slowRafRef.current = requestAnimationFrame(tickSlow)
    }

    slowRafRef.current = requestAnimationFrame(tickSlow)
    return () => {
      if (slowRafRef.current) {
        cancelAnimationFrame(slowRafRef.current)
        slowRafRef.current = null
      }
    }
  }, [settings.spinSlowly, isSpinning, showWinner])

  // Cleanup animation frame on unmount
  useEffect(() => {
    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current)
      }
      if (slowRafRef.current) {
        cancelAnimationFrame(slowRafRef.current)
      }
    }
  }, [])

  const addName = () => {
    const trimmed = newName.trim()
    if (trimmed) {
      setNames(prev => [...prev, trimmed])
      setNewName('')
    }
  }

  const removeName = (indexToRemove, nameToRemove) => {
    if (settings.playClickSoundOnRemove) {
      playClickSound(settings.volume)
    }
    if (typeof indexToRemove === 'number') {
      setNames(prev => prev.filter((_, idx) => idx !== indexToRemove))
    } else {
      setNames(prev => prev.filter(name => name !== nameToRemove))
    }
  }

  const shuffleNames = () => {
    const shuffled = [...names].sort(() => Math.random() - 0.5)
    setNames(shuffled)
  }

  const sortNames = () => {
    const sorted = [...names].sort((a, b) => {
      return a.localeCompare(b, undefined, { sensitivity: 'base' })
    })
    setNames(sorted)
  }

  const sortResults = () => {
    setResults(prev => [...prev].sort((a, b) => a.localeCompare(b)))
  }

  const clearResults = () => {
    setResults([])
  }

  const handleNew = () => {
    setNames(['Ali', 'Beatriz', 'Charles', 'Diya', 'Eric', 'Fatima', 'Gabriel', 'Hanna'])
    setResults([])
    setWinner(null)
    setShowWinner(false)
  }

  const handleImportExcel = async (file) => {
    try {
      const imported = await parseExcelFile(file)
      if (imported && imported.length > 0) {
        setNames(imported)
        setWinner(null)
        setShowWinner(false)
        setActiveTab('entries')
      } else {
        alert('No valid entries found in the selected Excel file.')
      }
    } catch (err) {
      console.error('Error importing Excel file:', err)
      alert('Failed to read Excel file. Please ensure it is a valid .xlsx or .xls file.')
    }
  }

  const handleSave = () => {
    exportWinnersToPdf(results)
  }

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      addName()
    }
  }

  // Pointer angle index calculation
  const getSegmentIndexAtRotation = (deg, count) => {
    const sliceAngle = 360 / count
    const norm = ((-deg % 360) + 360) % 360
    const pointerAngle = ((norm + 90) % 360 + 360) % 360
    return Math.floor(pointerAngle / sliceAngle) % count
  }

  // Main spin function
  const spinWheel = useCallback(() => {
    // Check synchronous lock to prevent double clicks or bubbling duplicates
    if (isSpinningRef.current || isSpinning || activePool.length === 0) return

    isSpinningRef.current = true
    hasWinnerProcessedRef.current = false
    setIsSpinning(true)
    setShowWinner(false)
    setWinner(null)

    if (slowRafRef.current) {
      cancelAnimationFrame(slowRafRef.current)
      slowRafRef.current = null
    }

    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current)
      animationFrameRef.current = null
    }

    // Capture pool at spin start to guarantee mathematical consistency
    const poolCount = activePool.length
    const currentPool = [...activePool]
    const currentColors = [...activeColors]

    // Select winner uniformly from activePool
    const winnerIndex = Math.floor(Math.random() * poolCount)
    const sliceAngle = 360 / poolCount
    const targetSliceMid = winnerIndex * sliceAngle + sliceAngle / 2
    const targetModAngle = ((targetSliceMid - 90) % 360 + 360) % 360
    const desiredStopMod = (360 - targetModAngle) % 360

    const startRotation = rotationRef.current
    const currentMod = ((startRotation % 360) + 360) % 360

    const fullRotations = 6 + Math.floor(Math.random() * 3)
    let delta = desiredStopMod - currentMod
    if (delta <= 0) {
      delta += 360
    }
    const totalDelta = fullRotations * 360 + delta
    const endRotation = startRotation + totalDelta

    lastTickAngleRef.current = startRotation

    // Duration from settings.spinTime
    const duration = Math.max((settings.spinTime || 5) * 1000, 1500)
    const startTime = performance.now()

    const easeInOutCubic = (t) => {
      return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2
    }

    const animate = (currentTime) => {
      const elapsed = currentTime - startTime
      const progress = Math.min(elapsed / duration, 1)
      const eased = easeInOutCubic(progress)
      const current = startRotation + totalDelta * eased

      // Ticking sound as slices cross pointer
      if (settings.sound === 'Ticking sound' && settings.volume > 0) {
        if (Math.abs(current - lastTickAngleRef.current) >= sliceAngle) {
          playTickSound(settings.volume)
          lastTickAngleRef.current = current
        }
      }

      rotationRef.current = current
      setRotation(current)

      if (progress < 1) {
        animationFrameRef.current = requestAnimationFrame(animate)
      } else {
        rotationRef.current = endRotation
        setRotation(endRotation)
        isSpinningRef.current = false
        setIsSpinning(false)
        animationFrameRef.current = null

        // Only process and append the winner once
        if (!hasWinnerProcessedRef.current) {
          hasWinnerProcessedRef.current = true

          // Determine winner strictly from segment under pointer
          const selectedIndex = getSegmentIndexAtRotation(endRotation, poolCount)
          const winnerName = currentPool[selectedIndex]
          const winnerColor = currentColors[selectedIndex % currentColors.length]

          setWinner({ name: winnerName, color: winnerColor, index: selectedIndex })
          setResults(prev => [...prev, winnerName])
          setActiveTab('results')

          // After-spin effects
          if (settings.afterSpinSound !== 'None') {
            playApplauseSound(settings.afterSpinVolume, settings.afterSpinSound)
          }
          if (settings.sound === 'Read out the name') {
            speakName(winnerName, settings.volume)
          }
          if (settings.launchConfetti) {
            launchConfetti()
          }

          // Popup display
          if (settings.displayPopup !== false) {
            setTimeout(() => {
              setShowWinner(true)
            }, 600)
          }
        }
      }
    }

    animationFrameRef.current = requestAnimationFrame(animate)
  }, [isSpinning, activePool, settings, activeColors])

  // Keyboard shortcut Ctrl+Enter to spin
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
        e.preventDefault()
        if (!isSpinningRef.current && !isSpinning && !showWinner && activePool.length > 0) {
          spinWheel()
        }
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isSpinning, showWinner, activePool, spinWheel])

  const handleWheelClick = () => {
    if (!isSpinningRef.current && !isSpinning && !showWinner && activePool.length > 0) {
      spinWheel()
    }
  }

  const handleRemoveWinner = () => {
    if (winner) {
      const idxToRemove = names.indexOf(winner.name)
      if (idxToRemove !== -1) {
        removeName(idxToRemove, winner.name)
      }
      setWinner(null)
      setShowWinner(false)
    }
  }

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().then(() => {
        setIsFullscreen(true)
      }).catch(err => {
        console.error('Error attempting to enable fullscreen:', err)
      })
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen().then(() => {
          setIsFullscreen(false)
        }).catch(err => {
          console.error('Error attempting to exit fullscreen:', err)
        })
      }
    }
  }

  const handleOpenCustomize = (tab = 'during-spin') => {
    setCustomizeTab(tab)
    setShowCustomize(true)
  }

  // Dynamic page background styling based on appearance settings
  const dynamicPageStyle = {}
  if (settings.pageBackgroundColor) {
    const bg = settings.pageBgColor || '#18181b'
    if (settings.displayColorGradient) {
      dynamicPageStyle.background = `radial-gradient(circle at 40% 50%, ${bg} 0%, #050811 100%)`
      dynamicPageStyle.backgroundColor = bg
    } else {
      dynamicPageStyle.background = bg
      dynamicPageStyle.backgroundColor = bg
    }
  } else {
    if (settings.displayColorGradient) {
      dynamicPageStyle.background = 'radial-gradient(circle at 40% 50%, #1e1b4b 0%, #0f172a 50%, #020617 100%)'
      dynamicPageStyle.backgroundColor = '#0b1120'
    } else {
      dynamicPageStyle.background = '#121212'
      dynamicPageStyle.backgroundColor = '#121212'
    }
  }

  return (
    <div 
      className="app"
      style={dynamicPageStyle}
    >
      <Header 
        onOpenCustomize={() => handleOpenCustomize('during-spin')}
        onCustomizeClick={() => handleOpenCustomize('during-spin')}
        onToggleFullscreen={toggleFullscreen}
        onFullscreenClick={toggleFullscreen}
        onNew={handleNew}
        onImportExcel={handleImportExcel}
        onSave={handleSave}
      />

      <div className="main-content">
        <Wheel 
          names={activePool}
          colors={activeColors}
          rotation={rotation}
          isSpinning={isSpinning}
          showWinner={showWinner}
          winner={winner}
          onWheelClick={handleWheelClick}
          wheelRef={wheelRef}
          settings={settings}
        />

        <Sidebar 
          names={names}
          setNames={setNames}
          results={results}
          setResults={setResults}
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          newName={newName}
          setNewName={setNewName}
          showAdvanced={showAdvanced}
          setShowAdvanced={setShowAdvanced}
          isSidebarHidden={isSidebarHidden}
          setIsSidebarHidden={setIsSidebarHidden}
          onAddName={addName}
          addName={addName}
          onRemoveName={removeName}
          removeName={removeName}
          onShuffleNames={shuffleNames}
          shuffleNames={shuffleNames}
          onSortNames={sortNames}
          sortNames={sortNames}
          onSortResults={sortResults}
          onClearResults={clearResults}
          onKeyPress={handleKeyPress}
          handleKeyPress={handleKeyPress}
          onCustomizeClick={() => handleOpenCustomize('during-spin')}
        />
      </div>

      <WinnerModal 
        winner={winner}
        showWinner={showWinner}
        onClose={() => {
          setShowWinner(false)
          setWinner(null)
        }}
        onRemove={handleRemoveWinner}
        popupMessage={settings.popupMessage}
        displayRemoveButton={settings.displayRemoveButton}
        autoRemoveWinner={settings.autoRemoveWinner}
      />

      <CustomizeModal 
        showCustomize={showCustomize}
        setShowCustomize={setShowCustomize}
        settings={settings}
        setSettings={setSettings}
        customizeTab={customizeTab}
        setCustomizeTab={setCustomizeTab}
        onClose={() => setShowCustomize(false)}
      />

      {isSidebarHidden && (
        <button 
          className="fullscreen-exit-btn"
          onClick={() => setIsSidebarHidden(false)}
          title="Exit Fullscreen"
        >
          <FiMaximize />
        </button>
      )}
    </div>
  )
}

export default App
