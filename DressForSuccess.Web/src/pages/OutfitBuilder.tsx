import React, { useEffect, useRef, useState, useCallback } from 'react'

/* ── Clothing database ─────────────────────────────────────────────────── */
const BASE = '/outfit-builder/resources/images'

interface ClothingItem { name: string; img: string }

const db: Record<string, ClothingItem[]> = {
  tops: [
    { name: 'None', img: '' },
    { name: 'Romy Structured Blazer', img: `${BASE}/tops/GHOST-RomyStructuredBlazerWithHardware-Herringbone1.png` },
    { name: 'White Blazer', img: `${BASE}/tops/whiteBlazer_aligned.png` },
    { name: 'Romy Structured Blazer (Charcoal)', img: `${BASE}/tops/GHOST-RomyStructuredBlazerWithHardware-Herringbone1_charcoal_aligned.png` },
  ],
  bottoms: [
    { name: 'None', img: '' },
    { name: 'Brown Pants', img: `${BASE}/bottoms/BrownPants.png` },
  ],
  shoes: [
    { name: 'None', img: '' },
    { name: 'Derby Shoes', img: `${BASE}/shoes/front-view-mens-fashion-shoes-260nw-1090942778.png` },
    { name: 'Oxford Shoes', img: `${BASE}/shoes/shoes2.png` },
  ],
  topbottom: [{ name: 'None', img: '' }],
}

const CATEGORIES = Object.keys(db)

const CATEGORY_META: Record<string, { label: string }> = {
  tops: { label: 'Tops' },
  bottoms: { label: 'Bottoms' },
  shoes: { label: 'Shoes' },
  topbottom: { label: 'Dresses' },
}

/* ── SVG icons per category ────────────────────────────────────────────── */
const catIcons: Record<string, React.ReactNode> = {
  tops: (
    <svg className="ob-cat-icon" viewBox="0 0 24 24">
      <path d="M9 4 6 6 4 8l3 2 1-1v12h8V9l1 1 3-2-2-2-3-2-1 2H10L9 4Z" fill="none" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
    </svg>
  ),
  bottoms: (
    <svg className="ob-cat-icon" viewBox="0 0 24 24">
      <path d="M8 4h8l1 16h-4l-1-6-1 6H7L8 4Z" fill="none" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
    </svg>
  ),
  shoes: (
    <svg className="ob-cat-icon" viewBox="0 0 24 24">
      <path d="M3 17c4 0 6-1.5 8-4l3 2c2 1.5 4 2 7 2v3H3v-3Z" fill="none" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
    </svg>
  ),
  topbottom: (
    <svg className="ob-cat-icon" viewBox="0 0 24 24">
      <path d="M12 4 9 8l2 2-3 10h8l-3-10 2-2-3-4Z" fill="none" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
    </svg>
  ),
}

/* ── Colour helpers ────────────────────────────────────────────────────── */
interface ColorTint { hue: number; sat: number; bri: number }

function buildFilterString(hue: number, sat: number, bri: number) {
  const briMul = (bri / 100).toFixed(2)
  const hueShift = Math.round(((hue - 36) + 360) % 360)
  const satPct = Math.round(sat * 500)
  return `brightness(${briMul}) sepia(1) saturate(${satPct}%) hue-rotate(${hueShift}deg)`
}

function hslToRgb(h: number, s: number, l: number): [number, number, number] {
  const c = (1 - Math.abs(2 * l - 1)) * s
  const x = c * (1 - Math.abs((h / 60) % 2 - 1))
  const m = l - c / 2
  let r = 0, g = 0, b = 0
  if (h < 60) { r = c; g = x }
  else if (h < 120) { r = x; g = c }
  else if (h < 180) { g = c; b = x }
  else if (h < 240) { g = x; b = c }
  else if (h < 300) { r = x; b = c }
  else { r = c; b = x }
  return [Math.round((r + m) * 255), Math.round((g + m) * 255), Math.round((b + m) * 255)]
}

/* ── Component ─────────────────────────────────────────────────────────── */
const OutfitBuilder: React.FC = () => {
  const [activeCategory, setActiveCategory] = useState('tops')
  const [selections, setSelections] = useState<Record<string, number>>(() => {
    const s: Record<string, number> = {}
    for (const cat of CATEGORIES) s[cat] = 0
    return s
  })
  const [colorTints, setColorTints] = useState<Record<string, ColorTint | null>>(() => {
    const c: Record<string, ColorTint | null> = {}
    for (const cat of CATEGORIES) c[cat] = null
    return c
  })

  /* colour-picker modal state */
  const [colorModalOpen, setColorModalOpen] = useState(false)
  const [colorModalCat, setColorModalCat] = useState('')
  const [pickedHue, setPickedHue] = useState(0)
  const [pickedSat, setPickedSat] = useState(1)
  const [pickedBri, setPickedBri] = useState(100)
  const wheelRef = useRef<HTMLCanvasElement>(null)
  const wheelDragging = useRef(false)

  /* share menu */
  const [shareOpen, setShareOpen] = useState(false)

  /* ── Mutual exclusion ─────────────────────────────────────────────────── */
  const selectItem = useCallback((category: string, index: number) => {
    setSelections(prev => {
      const next = { ...prev, [category]: index }
      if (category === 'topbottom' && index !== 0) {
        next.tops = 0
        next.bottoms = 0
      }
      if ((category === 'tops' || category === 'bottoms') && index !== 0) {
        next.topbottom = 0
      }
      return next
    })
  }, [])

  /* ── Colour wheel drawing ─────────────────────────────────────────────── */
  const drawWheel = useCallback(() => {
    const canvas = wheelRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return
    const size = canvas.width
    const cx = size / 2
    const cy = size / 2
    const radius = size / 2 - 1
    const imageData = ctx.createImageData(size, size)
    const data = imageData.data
    for (let y = 0; y < size; y++) {
      for (let x = 0; x < size; x++) {
        const dx = x - cx, dy = y - cy
        const dist = Math.sqrt(dx * dx + dy * dy)
        if (dist <= radius) {
          const hue = ((Math.atan2(dy, dx) * 180 / Math.PI) + 360) % 360
          const sat = dist / radius
          const [r, g, b] = hslToRgb(hue, sat, 0.5)
          const i = (y * size + x) * 4
          data[i] = r; data[i + 1] = g; data[i + 2] = b; data[i + 3] = 255
        }
      }
    }
    ctx.putImageData(imageData, 0, 0)
  }, [])

  useEffect(() => {
    if (colorModalOpen) drawWheel()
  }, [colorModalOpen, drawWheel])

  const pickFromWheel = useCallback((clientX: number, clientY: number) => {
    const canvas = wheelRef.current
    if (!canvas) return
    const rect = canvas.getBoundingClientRect()
    const scale = canvas.width / rect.width
    const cx = canvas.width / 2, cy = canvas.height / 2
    const radius = cx - 1
    const x = (clientX - rect.left) * scale
    const y = (clientY - rect.top) * scale
    const dx = x - cx, dy = y - cy
    setPickedHue(((Math.atan2(dy, dx) * 180 / Math.PI) + 360) % 360)
    setPickedSat(Math.min(1, Math.sqrt(dx * dx + dy * dy) / radius))
  }, [])

  /* ── Colour picker open/apply/reset ───────────────────────────────────── */
  const openColorPicker = (cat: string) => {
    setColorModalCat(cat)
    const cs = colorTints[cat]
    if (cs) { setPickedHue(cs.hue); setPickedSat(cs.sat); setPickedBri(cs.bri) }
    else { setPickedHue(0); setPickedSat(1); setPickedBri(100) }
    setColorModalOpen(true)
  }

  const applyColor = () => {
    setColorTints(prev => ({ ...prev, [colorModalCat]: { hue: pickedHue, sat: pickedSat, bri: pickedBri } }))
    setColorModalOpen(false)
  }

  const resetColor = () => {
    setColorTints(prev => ({ ...prev, [colorModalCat]: null }))
    setColorModalOpen(false)
  }

  /* ── Outfit summary helpers ───────────────────────────────────────────── */
  const getSelectedItems = () =>
    CATEGORIES.map(cat => ({ category: cat, name: db[cat][selections[cat]]?.name || 'None' })).filter(x => x.name !== 'None')

  const getOutfitSummaryText = () => {
    const selected = getSelectedItems()
    if (!selected.length) return 'Outfit Builder design (no items selected yet).'
    return selected.map(x => `${x.category}: ${x.name}`).join('\n')
  }

  const sendToStylist = async () => {
    const subject = 'Outfit Builder design'
    const bodyLines = ['Hi!', '', 'Here is my outfit design:', getOutfitSummaryText(), '', `Link: ${location.href}`]
    try { await navigator.clipboard?.writeText(bodyLines.join('\n')) } catch { /* ignore */ }
    window.location.href = `mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(bodyLines.join('\n'))}`
  }

  /* ── Wheel cursor position ────────────────────────────────────────────── */
  const wheelCursorStyle = (): React.CSSProperties => {
    const size = 200
    const cx = size / 2, cy = size / 2, radius = size / 2 - 1
    const rad = pickedHue * Math.PI / 180
    const x = cx + pickedSat * radius * Math.cos(rad)
    const y = cy + pickedSat * radius * Math.sin(rad)
    const l = Math.max(15, Math.min(80, pickedBri * 0.48))
    return {
      left: x - 7, top: y - 7,
      background: `hsl(${pickedHue}, ${pickedSat * 100}%, ${l}%)`,
    }
  }

  const previewColor = (): string => {
    const l = Math.max(15, Math.min(80, pickedBri * 0.48))
    return `hsl(${pickedHue}, ${pickedSat * 100}%, ${l}%)`
  }

  /* ── Layer style helpers ──────────────────────────────────────────────── */
  const layerStyle = (cat: string): React.CSSProperties => {
    const item = db[cat][selections[cat]]
    const base: React.CSSProperties = {}
    if (!item?.img) base.display = 'none'
    const tint = colorTints[cat]
    if (tint) base.filter = buildFilterString(tint.hue, tint.sat, tint.bri)
    return base
  }

  const activeItems = db[activeCategory] || []
  const selectedName = db[activeCategory]?.[selections[activeCategory]]?.name

  /* ── Render ──────────────────────────────────────────────────────────── */
  return (
    <div className="ob-root">
      <h1 className="ob-title">Dress to Impress</h1>
      <p className="ob-subtitle">Pick a category, then tap an item to try it on.</p>

      {/* Category bar */}
      <div className="ob-category-bar">
        {CATEGORIES.map(cat => (
          <button
            key={cat}
            className={`ob-cat-btn${activeCategory === cat ? ' active' : ''}`}
            onClick={() => setActiveCategory(cat)}
          >
            {catIcons[cat]}
            <span>{CATEGORY_META[cat]?.label ?? cat}</span>
          </button>
        ))}
      </div>

      {/* Colour control for active category */}
      <div className="ob-color-controls">
        <button className={`ob-palette-btn${colorTints[activeCategory] ? ' active-color' : ''}`} onClick={() => openColorPicker(activeCategory)}>
          {CATEGORY_META[activeCategory]?.label} colour
        </button>
      </div>

      {/* Main area */}
      <div className="ob-main-area">
        {/* Builder / Mannequin */}
        <div className="ob-builder">
          <div className="ob-mannequin-container">
            <img className="ob-mannequin-base" src={`${BASE}/Adobe Express - file.png`} alt="Mannequin" />
            <img className="ob-clothing-layer ob-layer-bottoms" src={db.bottoms[selections.bottoms]?.img || ''} alt="" style={layerStyle('bottoms')} />
            <img className="ob-clothing-layer ob-layer-tops" src={db.tops[selections.tops]?.img || ''} alt="" style={layerStyle('tops')} />
            <img className="ob-clothing-layer ob-layer-topbottom" src={db.topbottom[selections.topbottom]?.img || ''} alt="" style={layerStyle('topbottom')} />
            <img className="ob-clothing-layer ob-layer-shoes" src={db.shoes[selections.shoes]?.img || ''} alt="" style={layerStyle('shoes')} />
          </div>
        </div>

        {/* Catalog */}
        <div className="ob-catalog">
          <div className="ob-catalog-title">
            <span>{CATEGORY_META[activeCategory]?.label}</span>
            {selectedName && selectedName !== 'None' && <span className="ob-catalog-selected">— {selectedName}</span>}
          </div>
          <div className="ob-catalog-grid">
            {activeItems.map((item, i) => (
              <button
                key={`${activeCategory}-${i}`}
                className={`ob-catalog-item${selections[activeCategory] === i ? ' selected' : ''}`}
                onClick={() => selectItem(activeCategory, i)}
              >
                {item.img
                  ? <img className="ob-catalog-thumb" src={item.img} alt={item.name} />
                  : <div className="ob-catalog-thumb none">None</div>
                }
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="ob-actions">
        <button className="ob-action-btn primary" onClick={sendToStylist}>Send to stylist</button>
        <div className="ob-share-menu" style={{ position: 'relative' }}>
          <button className="ob-action-btn" onClick={() => setShareOpen(o => !o)}>
            <svg width="20" height="20" viewBox="0 0 24 24"><path fill="currentColor" d="M18 16a2.99 2.99 0 0 0-2.41 1.22L8.91 13.7a3.18 3.18 0 0 0 0-3.4l6.68-3.52A2.99 2.99 0 1 0 15 5a3 3 0 0 0 .06.6L8.38 9.12a3 3 0 1 0 0 5.76l6.68 3.52A3 3 0 1 0 18 16Z" /></svg>
            Share
          </button>
          {shareOpen && (
            <div className="ob-share-dropdown">
              <a className="ob-share-item" href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(location.href)}`} target="_blank" rel="noopener noreferrer">Facebook</a>
              <a className="ob-share-item" href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(getOutfitSummaryText())}&url=${encodeURIComponent(location.href)}`} target="_blank" rel="noopener noreferrer">Twitter</a>
              <a className="ob-share-item" href="https://www.instagram.com/" target="_blank" rel="noopener noreferrer">Instagram</a>
              <a className="ob-share-item" href={`mailto:?subject=${encodeURIComponent('Outfit Builder design')}&body=${encodeURIComponent(getOutfitSummaryText())}`}>Email</a>
              <button className="ob-share-item" onClick={async () => { try { await navigator.clipboard.writeText(location.href) } catch {} setShareOpen(false) }}>Copy link</button>
            </div>
          )}
        </div>
      </div>

      {/* Colour picker modal */}
      {colorModalOpen && (
        <div className="ob-color-modal" onClick={e => { if (e.target === e.currentTarget) setColorModalOpen(false) }}>
          <div className="ob-color-modal-card">
            <h3 className="ob-color-modal-title">{CATEGORY_META[colorModalCat]?.label} colour</h3>
            <div className="ob-wheel-container">
              <canvas
                ref={wheelRef}
                width={200}
                height={200}
                style={{ borderRadius: '50%', cursor: 'crosshair' }}
                onMouseDown={e => { wheelDragging.current = true; pickFromWheel(e.clientX, e.clientY) }}
                onMouseMove={e => { if (wheelDragging.current) pickFromWheel(e.clientX, e.clientY) }}
                onMouseUp={() => { wheelDragging.current = false }}
                onMouseLeave={() => { wheelDragging.current = false }}
                onTouchStart={e => { e.preventDefault(); pickFromWheel(e.touches[0].clientX, e.touches[0].clientY) }}
                onTouchMove={e => { e.preventDefault(); pickFromWheel(e.touches[0].clientX, e.touches[0].clientY) }}
              />
              <div className="ob-wheel-cursor" style={wheelCursorStyle()} />
            </div>
            <div className="ob-slider-group">
              <label>Brightness</label>
              <input type="range" min={40} max={160} value={pickedBri} onChange={e => setPickedBri(Number(e.target.value))} />
            </div>
            <div className="ob-color-preview-row">
              <span>Preview:</span>
              <div className="ob-color-preview-box" style={{ background: previewColor() }} />
            </div>
            <div className="ob-modal-actions">
              <button className="ob-modal-btn apply" onClick={applyColor}>Apply</button>
              <button className="ob-modal-btn reset" onClick={resetColor}>Reset</button>
              <button className="ob-modal-btn cancel" onClick={() => setColorModalOpen(false)}>Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default OutfitBuilder
