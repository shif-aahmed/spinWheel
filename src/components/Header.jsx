import React, { useRef } from 'react'
import { FiSettings, FiFile, FiFolder, FiSave, FiMaximize } from 'react-icons/fi'
import './Header.css'

function Header({
  onOpenCustomize,
  onCustomizeClick,
  onNew,
  onToggleFullscreen,
  onFullscreenClick,
  onImportExcel,
  onSave,
  onExportPdf
}) {
  const fileInputRef = useRef(null)
  const handleCustomize = onOpenCustomize || onCustomizeClick
  const handleFullscreen = onToggleFullscreen || onFullscreenClick
  const handleSave = onSave || onExportPdf

  const handleOpenClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
      fileInputRef.current.click()
    }
  }

  const handleFileChange = (e) => {
    const file = e.target.files?.[0]
    if (file && onImportExcel) {
      onImportExcel(file)
    }
  }

  return (
    <header className="header">
      <div className="header-right">
        <button className="header-btn" title="Customize" onClick={handleCustomize}>
          <FiSettings className="icon" />
          <span>Customize</span>
        </button>
        <button className="header-btn" title="New" onClick={onNew}>
          <FiFile className="icon" />
          <span>New</span>
        </button>
        <button className="header-btn" title="Open" onClick={handleOpenClick}>
          <FiFolder className="icon" />
          <span>Open</span>
        </button>
        <input
          type="file"
          ref={fileInputRef}
          style={{ display: 'none' }}
          accept=".xlsx, .xls, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet, application/vnd.ms-excel"
          onChange={handleFileChange}
        />
        <button className="header-btn" title="Save" onClick={handleSave}>
          <FiSave className="icon" />
          <span>Save</span>
        </button>


        <button className="header-btn" title="Fullscreen" onClick={handleFullscreen}>
          <FiMaximize className="icon" />
        </button>

      </div>
    </header>
  )
}

export default Header
