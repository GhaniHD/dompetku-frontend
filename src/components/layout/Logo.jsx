export default function Logo({ className }) {
  return (
    <svg viewBox="0 0 64 64" className={className} aria-hidden="true">
      <rect width="64" height="64" rx="20" fill="rgb(var(--violet))" />
      <path d="M17 23a6 6 0 0 1 6-6h17a3 3 0 0 1 3 3v3" fill="none" stroke="#fff" strokeWidth="4" strokeLinecap="round" />
      <rect x="15" y="23" width="34" height="24" rx="6" fill="none" stroke="#fff" strokeWidth="4" />
      <circle cx="40" cy="35" r="3" fill="#fff" />
    </svg>
  )
}
