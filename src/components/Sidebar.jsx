import React from 'react'
import { FiShuffle, FiArrowUp, FiArrowDown, FiChevronDown } from 'react-icons/fi'
import './Sidebar.css'

function Sidebar({
  names,
  setNames,
  results,
  setResults,
  activeTab,
  setActiveTab,
  newName,
  setNewName,
  showAdvanced,
  setShowAdvanced,
  isSidebarHidden,
  setIsSidebarHidden,
  onAddName,
  addName,
  onRemoveName,
  removeName,
  onShuffleNames,
  shuffleNames,
  onSortNames,
  sortNames,
  onSortResults,
  onClearResults,
  onKeyPress,
  handleKeyPress
}) {
  const handleAdd = onAddName || addName
  const handleRemove = onRemoveName || removeName
  const handleShuffle = onShuffleNames || shuffleNames
  const handleSort = onSortNames || sortNames
  const handleKey = onKeyPress || handleKeyPress
  const handleSortResults = onSortResults || (() => {
    if (setResults && results) {
      setResults(prev => [...prev].sort((a, b) => a.localeCompare(b)))
    }
  })
  const handleClearResults = onClearResults || (() => {
    if (setResults) setResults([])
  })

  return (
    <div className={`right-sidebar ${isSidebarHidden ? 'sidebar-hidden' : ''}`}>
      {isSidebarHidden ? (
        <div className="sidebar-header-hidden">
          <label className="hide-checkbox">
            <input
              type="checkbox"
              checked={isSidebarHidden}
              onChange={(e) => setIsSidebarHidden(e.target.checked)}
            />
            <span>Hide</span>
          </label>
        </div>
      ) : (
        <>
          <div className="sidebar-header">
            <div className="tabs">
              <button
                className={`tab ${activeTab === 'entries' ? 'active' : ''}`}
                onClick={() => setActiveTab('entries')}
              >
                Entries {names.length}
              </button>
              <button
                className={`tab ${activeTab === 'results' ? 'active' : ''}`}
                onClick={() => setActiveTab('results')}
              >
                Results {results.length}
              </button>
            </div>
            <label className="hide-checkbox">
              <input
                type="checkbox"
                checked={isSidebarHidden}
                onChange={(e) => setIsSidebarHidden(e.target.checked)}
              />
              <span>Hide</span>
            </label>
          </div>

          {activeTab === 'entries' ? (
            <>
              <div className="sidebar-actions">
                <button className="action-btn" onClick={handleShuffle} title="Shuffle">
                  <FiShuffle className="icon" />
                  <span>Shuffle</span>
                </button>
                <button className="action-btn" onClick={handleSort} title="Sort">
                  <span className="icon" style={{ display: 'flex', flexDirection: 'column', lineHeight: '0.5' }}>
                    <FiArrowUp style={{ fontSize: '10px' }} />
                    <FiArrowDown style={{ fontSize: '10px' }} />
                  </span>
                  <span>Sort</span>
                </button>

              </div>

              <div className="entries-list">
                <div className="add-name-input">
                  <input
                    type="text"
                    placeholder="Add name..."
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                    onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); handleAdd(); } }}
                  />
                  <button onClick={handleAdd}>+</button>
                </div>
                <div className="names-container">
                  {names.map((name, index) => (
                    <div key={index} className="name-item">
                      <span>{name}</span>
                      <button
                        className="remove-btn"
                        onClick={() => handleRemove(index, name)}
                        title="Remove"
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </>
          ) : (
            <>
              <div className="sidebar-actions">
                <button className="action-btn" onClick={handleSortResults} title="Sort">
                  <FiArrowUp className="icon" />
                  <span>Sort</span>
                </button>
                <button className="action-btn" onClick={handleClearResults} title="Clear the list">
                  <span className="icon">×</span>
                  <span>Clear the list</span>
                </button>
              </div>

              <div className="entries-list">
                <div className="names-container">
                  {results.length === 0 ? (
                    <div style={{ color: '#888', textAlign: 'center', padding: '20px' }}>
                      No results yet
                    </div>
                  ) : (
                    results.map((name, index) => (
                      <div key={index} className="name-item">
                        <span>{name}</span>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </>
          )}
        </>
      )}
    </div>
  )
}

export default Sidebar
