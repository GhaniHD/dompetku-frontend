import { useId } from 'react'

export default function Logo({ className }) {
  const id = useId()
  return (
    <svg viewBox="0 0 64 64" className={className} aria-hidden="true">
      <defs>
        <linearGradient id={id} x1="1" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#C38BFF" />
          <stop offset="1" stopColor="#7A3CE6" />
        </linearGradient>
      </defs>
      <rect width="64" height="64" rx="18" fill={`url(#${id})`} />
      <rect x="42.5" y="27" width="8" height="21" rx="4" fill="#fff" fillOpacity=".45" />
      <path d="M15 45V24.5L30.5 40L45.5 25" fill="none" stroke="#fff" strokeWidth="8" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M55 9.5L51.2 26.2L38.3 13.3Z" fill="#fff" stroke="#fff" strokeWidth="2" strokeLinejoin="round" />
    </svg>
  )
}
