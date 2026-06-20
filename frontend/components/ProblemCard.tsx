'use client'

import { useState } from 'react'
import Image from 'next/image'
import type { ReactNode } from 'react'

interface Props {
  icon: ReactNode
  title: string
  desc: string
  /** Photo of the problem. Drop the file in /public/problems/. */
  img?: string
}

/**
 * Problem card with a visual at the top so the customer recognizes the issue.
 * If the photo isn't available yet, it falls back to the brand icon on a soft
 * gradient (never a broken image) — drop the real file in /public/problems/.
 */
export default function ProblemCard({ icon, title, desc, img }: Props) {
  const [failed, setFailed] = useState(false)
  const showImg = !!img && !failed

  return (
    <div className="bg-white rounded-2xl border border-veluna-petal overflow-hidden hover:shadow-veluna-sm transition-shadow">
      {/* Visual */}
      <div className="relative bg-gradient-to-br from-veluna-blush to-veluna-lavender/30" style={{ aspectRatio: '4/3' }}>
        {showImg ? (
          <>
            <Image
              src={img!}
              alt={title}
              fill
              className="object-cover"
              sizes="(max-width: 768px) 50vw, 25vw"
              onError={() => setFailed(true)}
            />
            {/* small icon badge over the photo */}
            <span className="absolute bottom-2 start-2 w-9 h-9 rounded-xl bg-veluna-plum text-white flex items-center justify-center shadow-md">
              {icon}
            </span>
          </>
        ) : (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-14 h-14 rounded-2xl bg-veluna-plum text-white flex items-center justify-center">
              {icon}
            </div>
          </div>
        )}
      </div>

      {/* Text */}
      <div className="p-4 text-center">
        <p className="font-bold text-veluna-dark text-sm leading-tight mb-1.5">{title}</p>
        <p className="text-xs text-veluna-muted leading-relaxed">{desc}</p>
      </div>
    </div>
  )
}