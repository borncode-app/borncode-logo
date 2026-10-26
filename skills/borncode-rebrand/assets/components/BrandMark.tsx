'use client'

import { useId } from 'react'

// BornCode layered-triangle mark, drawn from the vertex table in the brand DESIGN.md.
// Layers are listed in draw order (bottom-most first) so later layers overlap earlier ones.

const LAYERS = [
  { id: 4, color: '#314BA3', points: '164.5,248 416.25,229.38 405.5,224.5 418.5,225.5 425.75,245 243.75,279 135.75,275.5' },
  { id: 5, color: '#2B3681', points: '234.5,280 425.75,245 442,259.75 372.5,281.25 259.75,291.25 226,282' },
  { id: 6, color: '#24265D', points: '372.5,281.25 442,259.75 437.62,256.25 443.38,252.5 464.88,284 373.75,285.5' },
  { id: 3, color: '#4067BA', points: '206.75,187.5 218.2,188.75 210.5,197 395.9,209.25 416.25,229.38 164.5,248' },
  { id: 2, color: '#4F87CE', points: '247.88,152 370.6,179.4 395.9,209.25 210.5,197' },
  { id: 1, color: '#62A5DF', points: '292.5,92.25 297.75,93 370.6,179.4 247.88,152' },
]

// Stack order for the loader: the base lands first, the apex last.
const BUILD_ORDER = [5, 6, 4, 3, 2, 1]

interface BrandMarkProps {
  className?: string
  /** Drop each layer in one after another (used by the loading screen). */
  animated?: boolean
  title?: string
}

export default function BrandMark({ className = '', animated = false, title = 'BornCode' }: BrandMarkProps) {
  // Per-instance gradient ids: a hidden copy (e.g. the desktop sidebar on mobile) would otherwise own the shared ids and grey out every other mark
  const uid = 'bc' + useId().replace(/[^a-zA-Z0-9_-]/g, '')
  return (
    <svg
      viewBox="128 84 345 216"
      className={className}
      role="img"
      aria-label={title}
    >
      <defs>
        {LAYERS.map((layer) => (
          <linearGradient key={layer.id} id={`${uid}-layer-${layer.id}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor={layer.color} stopOpacity="0.72" />
            <stop offset="0.7" stopColor={layer.color} stopOpacity="0.95" />
            <stop offset="1" stopColor={layer.color} stopOpacity="0.85" />
          </linearGradient>
        ))}
        <linearGradient id={`${uid}-sheen`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#fff" stopOpacity="0.5" />
          <stop offset="0.42" stopColor="#fff" stopOpacity="0.06" />
          <stop offset="0.43" stopColor="#fff" stopOpacity="0" />
        </linearGradient>
        <filter id={`${uid}-shadow`} x="-20%" y="-20%" width="140%" height="160%">
          <feGaussianBlur stdDeviation="4.5" />
        </filter>
      </defs>

      <g transform="translate(0 5)" opacity="0.32" className={animated ? 'brand-shadow' : undefined} filter={`url(#${uid}-shadow)`}>
        {LAYERS.map((layer) => (
          <polygon key={layer.id} points={layer.points} fill="#2D4799" />
        ))}
      </g>

      {LAYERS.map((layer) => (
        <g
          key={layer.id}
          className={animated ? 'brand-layer' : undefined}
          style={animated ? { animationDelay: `${BUILD_ORDER.indexOf(layer.id) * 120}ms, ${1400 + BUILD_ORDER.indexOf(layer.id) * 160}ms` } : undefined}
        >
          <polygon
            points={layer.points}
            fill={`url(#${uid}-layer-${layer.id})`}
            stroke="#fff"
            strokeOpacity="0.75"
            strokeWidth="1.6"
            strokeLinejoin="round"
          />
          <polygon points={layer.points} fill={`url(#${uid}-sheen)`} strokeLinejoin="round" />
        </g>
      ))}
    </svg>
  )
}
