'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import Image from 'next/image'

interface Props {
  /** Optional images. When absent, premium styled placeholders are shown. */
  beforeSrc?: string
  afterSrc?: string
  beforeLabel?: string
  afterLabel?: string
  caption?: string
}

export default function BeforeAfterSlider({
  beforeSrc,
  afterSrc,
  beforeLabel = 'قبل',
  afterLabel = 'بعد',
  caption,
}: Props) {
  const [pos, setPos] = useState(50)
  const [hint, setHint] = useState(true)
  const containerRef = useRef<HTMLDivElement>(null)
  const dragging = useRef(false)

  // Intro sweep — gives the "drag me" hint once on mount
  useEffect(() => {
    const frames = [
      { p: 68, t: 500 },
      { p: 34, t: 1100 },
      { p: 50, t: 1700 },
    ]
    const timers = frames.map(({ p, t }) => setTimeout(() => setPos(p), t))
    const done = setTimeout(() => setHint(false), 2400)
    return () => { timers.forEach(clearTimeout); clearTimeout(done) }
  }, [])

  const setFromClientX = useCallback((clientX: number) => {
    const el = containerRef.current
    if (!el) return
    const rect = el.getBoundingClientRect()
    const p = ((clientX - rect.left) / rect.width) * 100
    setPos(Math.max(2, Math.min(98, p)))
  }, [])

  const startDrag = (clientX: number) => {
    dragging.current = true
    setHint(false)
    setFromClientX(clientX)
  }

  useEffect(() => {
    const move = (e: PointerEvent) => { if (dragging.current) setFromClientX(e.clientX) }
    const up = () => { dragging.current = false }
    window.addEventListener('pointermove', move)
    window.addEventListener('pointerup', up)
    return () => {
      window.removeEventListener('pointermove', move)
      window.removeEventListener('pointerup', up)
    }
  }, [setFromClientX])

  return (
    <div className="max-w-2xl mx-auto">
      <div
        ref={containerRef}
        onPointerDown={(e) => startDrag(e.clientX)}
        className="relative rounded-2xl overflow-hidden shadow-veluna-md select-none cursor-ew-resize touch-none"
        style={{ aspectRatio: '4/3' }}
        role="slider"
        aria-label="مقارنة قبل وبعد"
        aria-valuenow={Math.round(pos)}
        aria-valuemin={0}
        aria-valuemax={100}
      >
        {/* AFTER (base layer, right side) */}
        <Panel src={afterSrc} kind="after" />

        {/* BEFORE (clipped to the left portion) */}
        <div
          className="absolute inset-0"
          style={{ clipPath: `inset(0 ${100 - pos}% 0 0)`, transition: dragging.current ? 'none' : 'clip-path 0.5s cubic-bezier(0.22,1,0.36,1)' }}
        >
          <Panel src={beforeSrc} kind="before" />
        </div>

        {/* Labels */}
        <span className="absolute top-3 left-3 z-20 bg-white/85 backdrop-blur-sm text-veluna-dark text-[11px] font-bold px-3 py-1 rounded-full shadow-sm pointer-events-none">
          {beforeLabel}
        </span>
        <span className="absolute top-3 right-3 z-20 bg-veluna-plum text-white text-[11px] font-bold px-3 py-1 rounded-full shadow-sm pointer-events-none">
          {afterLabel}
        </span>

        {/* Divider + handle */}
        <div
          className="absolute top-0 bottom-0 z-30 pointer-events-none"
          style={{ left: `${pos}%`, transform: 'translateX(-50%)', transition: dragging.current ? 'none' : 'left 0.5s cubic-bezier(0.22,1,0.36,1)' }}
        >
          <div className="absolute top-0 bottom-0 left-1/2 -translate-x-1/2 w-0.5 bg-white/90 shadow-[0_0_8px_rgba(0,0,0,0.25)]" />
          <div className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-11 h-11 rounded-full bg-white shadow-veluna-md flex items-center justify-center ${hint ? 'animate-pulse' : ''}`}>
            <svg className="w-5 h-5 text-veluna-plum" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round">
              <polyline points="15 18 9 12 15 6" />
              <polyline points="9 18 15 12 9 6" transform="translate(6 0)" />
            </svg>
          </div>
        </div>
      </div>

      {caption && <p className="text-xs text-veluna-muted text-center mt-3 italic">{caption}</p>}
    </div>
  )
}

/* One side of the comparison — image if provided, else a premium placeholder */
function Panel({ src, kind }: { src?: string; kind: 'before' | 'after' }) {
  if (src) {
    return (
      <Image
        src={src}
        alt={kind === 'before' ? 'قبل الاستعمال' : 'بعد الاستعمال'}
        fill
        className="object-cover"
        sizes="(max-width: 768px) 100vw, 672px"
        draggable={false}
        priority={false}
      />
    )
  }
  // Placeholder — clearly marks where the real photo goes
  const isAfter = kind === 'after'
  return (
    <div
      className={`absolute inset-0 flex flex-col items-center justify-center gap-2 ${
        isAfter
          ? 'bg-gradient-to-br from-veluna-blush via-[#F3E8F2] to-veluna-lavender/40'
          : 'bg-gradient-to-br from-[#E9E0E6] via-[#EFE6EC] to-[#E4D8E0]'
      }`}
    >
      <svg className={`w-10 h-10 ${isAfter ? 'text-veluna-plum' : 'text-veluna-mauve'}`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.6} strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="3" width="18" height="18" rx="2.5" />
        <circle cx="8.5" cy="8.5" r="1.6" />
        <path d="M21 15l-5-5L5 21" />
      </svg>
      <span className={`text-xs font-semibold ${isAfter ? 'text-veluna-plum' : 'text-veluna-mauve'}`}>
        {isAfter ? 'صورة بعد' : 'صورة قبل'}
      </span>
    </div>
  )
}
