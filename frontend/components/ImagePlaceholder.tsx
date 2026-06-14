interface Props {
  label?: string
  ratio?: string
  className?: string
}

/**
 * Premium styled placeholder marking where a real photo will go.
 * Swap for <Image> once the brand photos are ready.
 */
export default function ImagePlaceholder({ label = 'هنا غادي تكون الصورة', ratio = '16/9', className = '' }: Props) {
  return (
    <div
      className={`relative rounded-2xl overflow-hidden border-2 border-dashed border-veluna-mauve/50
                  bg-gradient-to-br from-veluna-blush via-white to-veluna-blush
                  flex flex-col items-center justify-center gap-3 ${className}`}
      style={{ aspectRatio: ratio }}
    >
      {/* soft decorative blobs */}
      <div className="absolute -top-8 -end-8 w-32 h-32 rounded-full bg-veluna-lavender/25 blur-2xl pointer-events-none" />
      <div className="absolute -bottom-8 -start-8 w-32 h-32 rounded-full bg-veluna-pink/25 blur-2xl pointer-events-none" />

      <span className="w-14 h-14 rounded-2xl bg-white shadow-veluna-sm flex items-center justify-center text-veluna-plum">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" className="w-7 h-7">
          <rect x="3" y="3" width="18" height="18" rx="2.5" />
          <circle cx="8.5" cy="8.5" r="1.8" />
          <path d="M21 15l-5-5L5 21" />
        </svg>
      </span>
      <p className="text-sm font-semibold text-veluna-plum relative">{label}</p>
      <p className="text-[11px] text-veluna-muted relative">صور المنتج الحقيقية غادي تتزاد هنا قريباً</p>
    </div>
  )
}
