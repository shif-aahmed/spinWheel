import React, { useState, useEffect } from 'react'
import { 
  FiPlay, 
  FiSquare, 
  FiHelpCircle, 
  FiChevronDown, 
  FiImage, 
  FiDroplet,
  FiCheck
} from 'react-icons/fi'
import { startSoundPreview, stopSoundPreview } from '../utils/audio'
import './CustomizeModal.css'

export const PALETTE_COLORS = [
  '#ffd900', // Yellow
  '#00b100', // Green
  '#00c3ff', // Blue
  '#ff4040', // Red
  '#ff8c00', // Orange
  '#a855f7', // Purple
  '#ec4899', // Pink
  '#14b8a6'  // Teal
]

export const THEMES = [
  { name: 'Default', colors: ['#ffd900', '#00b100', '#00c3ff', '#ff4040'] },
  { name: 'Neon', colors: ['#00f0ff', '#ff007f', '#7928ca', '#00ff66', '#ffe600'] },
  { name: 'Sunset', colors: ['#f97316', '#ec4899', '#e11d48', '#fbbf24', '#8b5cf6'] },
  { name: 'Forest', colors: ['#22c55e', '#16a34a', '#15803d', '#84cc16', '#059669'] },
  { name: 'Ocean', colors: ['#0284c7', '#0ea5e9', '#38bdf8', '#06b6d4', '#6366f1'] },
  { name: 'Rainbow', colors: ['#ef4444', '#f97316', '#eab308', '#22c55e', '#06b6d4', '#3b82f6', '#a855f7'] }
]

export const CENTER_IMAGES = [
  { label: 'None', value: '' },
  { label: 'Trophy', value: '🏆' },
  { label: 'Star', value: '⭐' },
  { label: 'Crown', value: '👑' },
  { label: 'Cookie', value: '🍪' },
  { label: 'Heart', value: '💖' },
  { label: 'Target', value: '🎯' },
  { label: 'Rocket', value: '🚀' }
]

export const BACKGROUND_IMAGES = [
  { label: 'Cookie Pattern', value: 'cookie' },
  { label: 'Stars & Galaxy', value: 'stars' },
  { label: 'Polka Dots', value: 'dots' }
]

function CustomizeModal({
  showCustomize,
  setShowCustomize,
  onClose,
  settings,
  setSettings,
  customizeTab,
  setCustomizeTab
}) {
  const [draftSettings, setDraftSettings] = useState(null)
  const [showThemeMenu, setShowThemeMenu] = useState(false)
  const [showCenterImageMenu, setShowCenterImageMenu] = useState(false)
  const [showBgImageMenu, setShowBgImageMenu] = useState(false)

  useEffect(() => {
    if (showCustomize) {
      setDraftSettings(JSON.parse(JSON.stringify(settings)))
      setShowThemeMenu(false)
      setShowCenterImageMenu(false)
      setShowBgImageMenu(false)
    } else {
      stopSoundPreview()
    }
  }, [showCustomize])

  if (!showCustomize) return null

  const handleCancel = () => {
    stopSoundPreview()
    if (draftSettings) {
      setSettings(draftSettings)
    }
    if (onClose) onClose()
    else if (setShowCustomize) setShowCustomize(false)
  }

  const handleOk = () => {
    stopSoundPreview()
    if (onClose) onClose()
    else if (setShowCustomize) setShowCustomize(false)
  }

  const currentCustomColors = settings.customColors || PALETTE_COLORS

  return (
    <div className="customize-overlay" onClick={handleCancel}>
      <div className="customize-popup" onClick={(e) => e.stopPropagation()}>
        {/* Tabs */}
        <div className="customize-tabs">
          <button 
            className={`customize-tab ${customizeTab === 'during-spin' ? 'active' : ''}`}
            onClick={() => setCustomizeTab('during-spin')}
          >
            During spin
          </button>
          <button 
            className={`customize-tab ${customizeTab === 'after-spin' ? 'active' : ''}`}
            onClick={() => setCustomizeTab('after-spin')}
          >
            After spin
          </button>
          <button 
            className={`customize-tab ${customizeTab === 'appearance' ? 'active' : ''}`}
            onClick={() => setCustomizeTab('appearance')}
          >
            Appearance
          </button>
        </div>

        <div className="customize-content">
          {/* TAB 1: DURING SPIN */}
          {customizeTab === 'during-spin' && (
            <div className="customize-section">
              <div className="customize-field">
                <label className="customize-label">Sound</label>
                <div className="customize-sound-controls">
                  <select 
                    className="customize-select"
                    value={settings.sound}
                    onChange={(e) => setSettings({...settings, sound: e.target.value})}
                  >
                    <option value="Ticking sound">Ticking sound</option>
                    <option value="Read out the name">Read out the name</option>
                    <option value="None">None</option>
                  </select>
                  <button 
                    className="customize-icon-btn" 
                    title="Play"
                    onClick={() => startSoundPreview(settings.sound, settings.volume)}
                  >
                    <FiPlay />
                  </button>
                  <button 
                    className="customize-icon-btn" 
                    title="Stop"
                    onClick={stopSoundPreview}
                  >
                    <FiSquare />
                  </button>
                </div>
              </div>

              <div className="customize-field">
                <label className="customize-label">Volume ({settings.volume}%)</label>
                <div className="customize-slider-container" style={{'--slider-progress': `${settings.volume}%`}}>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={settings.volume}
                    onChange={(e) => setSettings({...settings, volume: parseInt(e.target.value)})}
                    className="customize-slider"
                  />
                  <div className="customize-slider-labels">
                    <span>0%</span>
                    <span>25%</span>
                    <span>50%</span>
                    <span>75%</span>
                    <span>100%</span>
                  </div>
                </div>
              </div>

              <div className="customize-checkboxes">
                <label className="customize-checkbox-label">
                  <input
                    type="checkbox"
                    checked={settings.displayDuplicates}
                    onChange={(e) => setSettings({...settings, displayDuplicates: e.target.checked})}
                  />
                  <span>Display duplicates</span>
                  <FiHelpCircle className="customize-help-icon" title="When unchecked, only unique names appear on the wheel" />
                </label>
                <label className="customize-checkbox-label">
                  <input
                    type="checkbox"
                    checked={settings.spinSlowly}
                    onChange={(e) => setSettings({...settings, spinSlowly: e.target.checked})}
                  />
                  <span>Spin slowly</span>
                </label>
                <label className="customize-checkbox-label">
                  <input
                    type="checkbox"
                    checked={settings.showTitle}
                    onChange={(e) => setSettings({...settings, showTitle: e.target.checked})}
                  />
                  <span>Show title</span>
                </label>
              </div>

              <div className="customize-field">
                <label className="customize-label">Spin time ({settings.spinTime}s)</label>
                <div className="customize-slider-container" style={{'--slider-progress': `${((settings.spinTime - 1) / 59) * 100}%`}}>
                  <input
                    type="range"
                    min="1"
                    max="60"
                    value={settings.spinTime}
                    onChange={(e) => setSettings({...settings, spinTime: parseInt(e.target.value)})}
                    className="customize-slider"
                  />
                  <div className="customize-slider-labels">
                    <span>1</span>
                    <span>10</span>
                    <span>20</span>
                    <span>30</span>
                    <span>40</span>
                    <span>50</span>
                    <span>60</span>
                  </div>
                </div>
              </div>

              <div className="customize-field">
                <label className="customize-label-bold">Max number of names visible on the wheel ({settings.maxNamesVisible})</label>
                <p className="customize-description">All names in the text-box have the same chance of winning, regardless of this value.</p>
                <div className="customize-slider-container" style={{'--slider-progress': `${((settings.maxNamesVisible - 4) / 996) * 100}%`}}>
                  <input
                    type="range"
                    min="4"
                    max="1000"
                    value={settings.maxNamesVisible}
                    onChange={(e) => setSettings({...settings, maxNamesVisible: parseInt(e.target.value)})}
                    className="customize-slider"
                  />
                  <div className="customize-slider-labels">
                    <span>4</span>
                    <span>100</span>
                    <span>200</span>
                    <span>300</span>
                    <span>400</span>
                    <span>500</span>
                    <span>600</span>
                    <span>700</span>
                    <span>800</span>
                    <span>900</span>
                    <span>1000</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: AFTER SPIN */}
          {customizeTab === 'after-spin' && (
            <div className="customize-section">
              <div className="customize-field">
                <label className="customize-label">Sound</label>
                <div className="customize-sound-controls">
                  <select 
                    className="customize-select"
                    value={settings.afterSpinSound}
                    onChange={(e) => setSettings({...settings, afterSpinSound: e.target.value})}
                  >
                    <option value="Subdued applause">Subdued applause</option>
                    <option value="Cheering">Cheering</option>
                    <option value="Fanfare">Fanfare</option>
                    <option value="None">None</option>
                  </select>
                  <button 
                    className="customize-icon-btn" 
                    title="Play"
                    onClick={() => startSoundPreview(settings.afterSpinSound, settings.afterSpinVolume)}
                  >
                    <FiPlay />
                  </button>
                  <button 
                    className="customize-icon-btn" 
                    title="Stop"
                    onClick={stopSoundPreview}
                  >
                    <FiSquare />
                  </button>
                </div>
              </div>

              <div className="customize-field">
                <label className="customize-label">Volume ({settings.afterSpinVolume}%)</label>
                <div className="customize-slider-container" style={{'--slider-progress': `${settings.afterSpinVolume}%`}}>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={settings.afterSpinVolume}
                    onChange={(e) => setSettings({...settings, afterSpinVolume: parseInt(e.target.value)})}
                    className="customize-slider"
                  />
                  <div className="customize-slider-labels">
                    <span>0%</span>
                    <span>25%</span>
                    <span>50%</span>
                    <span>75%</span>
                    <span>100%</span>
                  </div>
                </div>
              </div>

              <div className="customize-checkboxes">
                <label className="customize-checkbox-label">
                  <input
                    type="checkbox"
                    checked={settings.animateWinningEntry}
                    onChange={(e) => setSettings({...settings, animateWinningEntry: e.target.checked})}
                  />
                  <span>Animate winning entry</span>
                </label>
                <label className="customize-checkbox-label">
                  <input
                    type="checkbox"
                    checked={settings.launchConfetti}
                    onChange={(e) => setSettings({...settings, launchConfetti: e.target.checked})}
                  />
                  <span>Launch confetti</span>
                </label>
                <label className="customize-checkbox-label">
                  <input
                    type="checkbox"
                    checked={settings.autoRemoveWinner}
                    onChange={(e) => setSettings({...settings, autoRemoveWinner: e.target.checked})}
                  />
                  <span>Auto-remove winner after 5 seconds</span>
                </label>
              </div>

              <div className="customize-field">
                <label className="customize-checkbox-label">
                  <input
                    type="checkbox"
                    checked={settings.displayPopup}
                    onChange={(e) => setSettings({...settings, displayPopup: e.target.checked})}
                  />
                  <span>Display popup with message:</span>
                </label>
                <input
                  type="text"
                  className="customize-text-input"
                  value={settings.popupMessage}
                  onChange={(e) => setSettings({...settings, popupMessage: e.target.value})}
                  disabled={!settings.displayPopup}
                />
                <div className="customize-indented-checkbox">
                  <label className="customize-checkbox-label">
                    <input
                      type="checkbox"
                      checked={settings.displayRemoveButton}
                      onChange={(e) => setSettings({...settings, displayRemoveButton: e.target.checked})}
                      disabled={!settings.displayPopup}
                    />
                    <span>Display the "Remove" button</span>
                  </label>
                </div>
              </div>

              <div className="customize-field">
                <label className="customize-checkbox-label">
                  <input
                    type="checkbox"
                    checked={settings.playClickSoundOnRemove}
                    onChange={(e) => setSettings({...settings, playClickSoundOnRemove: e.target.checked})}
                  />
                  <span>Play a click sound when the winner is removed</span>
                </label>
              </div>
            </div>
          )}

          {/* TAB 3: APPEARANCE */}
          {customizeTab === 'appearance' && (
            <div className="customize-section">
              {/* 1. Wheel Section Style Toggle */}
              <div className="customize-field">
                <div className="customize-toggle-container">
                  <div 
                    className={`customize-toggle-option ${!settings.wheelBackgroundImage ? 'active' : ''}`}
                    onClick={() => setSettings({...settings, wheelBackgroundImage: false, oneColorPerSection: true})}
                    style={{ cursor: 'pointer' }}
                  >
                    <div className="customize-option-icon customize-wheel-icon">
                      <div className="wheel-icon-slice" style={{backgroundColor: 'rgb(255, 64, 64)'}}></div>
                      <div className="wheel-icon-slice" style={{backgroundColor: 'rgb(0, 177, 0)'}}></div>
                      <div className="wheel-icon-slice" style={{backgroundColor: 'rgb(0, 195, 255)'}}></div>
                      <div className="wheel-icon-slice" style={{backgroundColor: 'rgb(255, 217, 0)'}}></div>
                      <div className="wheel-icon-slice" style={{backgroundColor: 'rgb(0, 195, 255)'}}></div>
                      <div className="wheel-icon-slice" style={{backgroundColor: 'rgb(255, 165, 0)'}}></div>
                    </div>
                    <span className="customize-option-text">One color per section</span>
                  </div>
                  <label className="customize-toggle">
                    <input
                      type="checkbox"
                      checked={!!settings.wheelBackgroundImage}
                      onChange={(e) => setSettings({
                        ...settings, 
                        wheelBackgroundImage: e.target.checked ? (settings.wheelBackgroundPattern || 'cookie') : false,
                        oneColorPerSection: !e.target.checked
                      })}
                    />
                    <span className="customize-toggle-slider"></span>
                  </label>
                  <div 
                    className={`customize-toggle-option ${settings.wheelBackgroundImage ? 'active' : ''}`}
                    onClick={() => setSettings({
                      ...settings, 
                      wheelBackgroundImage: settings.wheelBackgroundPattern || 'cookie',
                      oneColorPerSection: false
                    })}
                    style={{ cursor: 'pointer' }}
                  >
                    <div className="customize-option-icon">
                      <div className="cookie-icon">🍪</div>
                    </div>
                    <span className="customize-option-text">Wheel background image</span>
                  </div>
                </div>
              </div>

              {/* 2. Wheel Background Pattern Dropdown */}
              {settings.wheelBackgroundImage && (
                <div className="customize-field" style={{ position: 'relative' }}>
                  <label className="customize-label">Wheel background pattern</label>
                  <button 
                    className="customize-image-btn"
                    onClick={() => setShowBgImageMenu(!showBgImageMenu)}
                  >
                    <div className="cookie-icon">
                      {settings.wheelBackgroundImage === 'cookie' ? '🍪' : settings.wheelBackgroundImage === 'stars' ? '⭐' : '✨'}
                    </div>
                    <span>
                      {BACKGROUND_IMAGES.find(b => b.value === settings.wheelBackgroundImage)?.label || 'Cookie Pattern'}
                    </span>
                    <FiChevronDown />
                  </button>
                  {showBgImageMenu && (
                    <div className="customize-dropdown-menu">
                      {BACKGROUND_IMAGES.map((bg) => (
                        <div 
                          key={bg.value} 
                          className="customize-dropdown-item"
                          onClick={() => {
                            setSettings({
                              ...settings, 
                              wheelBackgroundImage: bg.value,
                              wheelBackgroundPattern: bg.value
                            })
                            setShowBgImageMenu(false)
                          }}
                        >
                          <span>{bg.label}</span>
                          {settings.wheelBackgroundImage === bg.value && <FiCheck />}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* 3. Apply a Theme Dropdown */}
              <div className="customize-field" style={{ position: 'relative' }}>
                <button 
                  className="customize-theme-btn"
                  onClick={() => setShowThemeMenu(!showThemeMenu)}
                >
                  <span>Apply a theme: {settings.selectedTheme || 'Default'}</span>
                  <FiChevronDown />
                </button>
                {showThemeMenu && (
                  <div className="customize-dropdown-menu">
                    {THEMES.map((theme) => (
                      <div 
                        key={theme.name}
                        className="customize-dropdown-item"
                        onClick={() => {
                          const newColors = [...currentCustomColors]
                          const newPalettes = [false, false, false, false, false, false, false, false]
                          theme.colors.forEach((c, idx) => {
                            if (idx < 8) {
                              newColors[idx] = c
                              newPalettes[idx] = true
                            }
                          })
                          setSettings({
                            ...settings, 
                            selectedTheme: theme.name,
                            customColors: newColors,
                            colorPalettes: newPalettes
                          })
                          setShowThemeMenu(false)
                        }}
                      >
                        <div style={{ display: 'flex', gap: '4px', alignItems: 'center' }}>
                          {theme.colors.slice(0, 4).map((c, i) => (
                            <span key={i} style={{ width: '12px', height: '12px', borderRadius: '50%', backgroundColor: c }} />
                          ))}
                          <span style={{ marginLeft: '6px' }}>{theme.name}</span>
                        </div>
                        {settings.selectedTheme === theme.name && <FiCheck />}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* 4. Customize Colors Palette (Swatches with Color Selector + Checkboxes) */}
              <div className="customize-field">
                <div className="customize-colors-header">
                  <label className="customize-label-bold">Customize colors</label>
                  <FiHelpCircle className="customize-help-icon" title="Click any droplet icon to change its color with the color picker. Use checkboxes to include/exclude colors." />
                </div>
                <div className="customize-color-palettes">
                  {currentCustomColors.map((color, index) => (
                    <div 
                      key={index} 
                      className="customize-color-palette-item"
                      style={{ border: settings.colorPalettes[index] ? '2px solid #2563eb' : '1px solid #3a3a3a' }}
                    >
                      <div 
                        className="customize-color-palette-icon"
                        style={{ 
                          backgroundColor: color, 
                          color: '#fff', 
                          borderRadius: '4px', 
                          width: '26px', 
                          height: '26px', 
                          display: 'flex', 
                          alignItems: 'center', 
                          justifyContent: 'center',
                          position: 'relative',
                          cursor: 'pointer'
                        }}
                        title="Click to pick a custom color"
                      >
                        <FiDroplet style={{ filter: 'drop-shadow(0 1px 1px rgba(0,0,0,0.6))', pointerEvents: 'none' }} />
                        <input
                          type="color"
                          value={color.startsWith('#') ? color : '#ffd900'}
                          onChange={(e) => {
                            const newColors = [...currentCustomColors]
                            newColors[index] = e.target.value
                            const newPalettes = [...settings.colorPalettes]
                            newPalettes[index] = true
                            setSettings({
                              ...settings,
                              customColors: newColors,
                              colorPalettes: newPalettes,
                              selectedTheme: 'Custom'
                            })
                          }}
                          style={{
                            position: 'absolute',
                            top: 0,
                            left: 0,
                            width: '100%',
                            height: '100%',
                            opacity: 0,
                            cursor: 'pointer'
                          }}
                        />
                      </div>
                      <label className="customize-checkbox-label">
                        <input
                          type="checkbox"
                          checked={!!settings.colorPalettes[index]}
                          onChange={(e) => {
                            const newPalettes = [...settings.colorPalettes]
                            newPalettes[index] = e.target.checked
                            // Prevent unchecking all
                            if (!newPalettes.some(Boolean)) {
                              newPalettes[index] = true
                            }
                            setSettings({
                              ...settings, 
                              colorPalettes: newPalettes,
                              selectedTheme: 'Custom'
                            })
                          }}
                        />
                      </label>
                    </div>
                  ))}
                </div>
              </div>

              {/* 5. Center Image Dropdown */}
              <div className="customize-field" style={{ position: 'relative' }}>
                <button 
                  className="customize-image-btn"
                  onClick={() => setShowCenterImageMenu(!showCenterImageMenu)}
                >
                  <FiImage />
                  <span>
                    Image at the center of the wheel: {CENTER_IMAGES.find(c => c.value === settings.centerImage)?.label || 'None'}
                  </span>
                  <FiChevronDown />
                </button>
                {showCenterImageMenu && (
                  <div className="customize-dropdown-menu">
                    {CENTER_IMAGES.map((img) => (
                      <div 
                        key={img.label}
                        className="customize-dropdown-item"
                        onClick={() => {
                          setSettings({...settings, centerImage: img.value})
                          setShowCenterImageMenu(false)
                        }}
                      >
                        <span>{img.value} {img.label}</span>
                        {settings.centerImage === img.value && <FiCheck />}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* 6. Image Size Selector */}
              <div className="customize-field">
                <label className="customize-label">Image size</label>
                <select 
                  className="customize-select"
                  value={settings.imageSize}
                  onChange={(e) => setSettings({...settings, imageSize: e.target.value})}
                >
                  <option value="S">S (Small)</option>
                  <option value="M">M (Medium)</option>
                  <option value="L">L (Large)</option>
                </select>
              </div>

              {/* 7. Appearance Checkboxes Grid */}
              <div className="customize-checkboxes-grid">
                <label className="customize-checkbox-label">
                  <div 
                    style={{
                      position: 'relative',
                      display: 'inline-flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      width: '20px',
                      height: '20px',
                      borderRadius: '4px',
                      backgroundColor: settings.pageBgColor || '#18181b',
                      border: '1px solid #666',
                      marginRight: '6px',
                      cursor: 'pointer'
                    }}
                    title="Click droplet to choose page background color"
                  >
                    <FiDroplet style={{ color: '#fff', fontSize: '11px', pointerEvents: 'none' }} />
                    <input
                      type="color"
                      value={settings.pageBgColor || '#18181b'}
                      onChange={(e) => setSettings({
                        ...settings, 
                        pageBgColor: e.target.value,
                        pageBackgroundColor: true
                      })}
                      style={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        width: '100%',
                        height: '100%',
                        opacity: 0,
                        cursor: 'pointer'
                      }}
                    />
                  </div>
                  <input
                    type="checkbox"
                    checked={settings.pageBackgroundColor}
                    onChange={(e) => setSettings({...settings, pageBackgroundColor: e.target.checked})}
                  />
                  <span>Page background color</span>
                </label>

                <label className="customize-checkbox-label">
                  <input
                    type="checkbox"
                    checked={settings.contours}
                    onChange={(e) => setSettings({...settings, contours: e.target.checked})}
                  />
                  <span>Contours</span>
                </label>

                <label className="customize-checkbox-label">
                  <input
                    type="checkbox"
                    checked={settings.displayColorGradient}
                    onChange={(e) => setSettings({...settings, displayColorGradient: e.target.checked})}
                  />
                  <span>Display a color gradient on the page</span>
                </label>

                <label className="customize-checkbox-label">
                  <input
                    type="checkbox"
                    checked={settings.wheelShadow}
                    onChange={(e) => setSettings({...settings, wheelShadow: e.target.checked})}
                  />
                  <span>Wheel shadow</span>
                </label>

                <label className="customize-checkbox-label">
                  <input
                    type="checkbox"
                    checked={settings.pointerChangesColor}
                    onChange={(e) => setSettings({...settings, pointerChangesColor: e.target.checked})}
                  />
                  <span>Pointer changes color</span>
                </label>
              </div>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="customize-buttons">
          <button className="customize-btn cancel-btn" onClick={handleCancel}>
            Cancel
          </button>
          <button className="customize-btn ok-btn" onClick={handleOk}>
            OK
          </button>
        </div>
      </div>
    </div>
  )
}

export default CustomizeModal
