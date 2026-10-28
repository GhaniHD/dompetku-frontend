import { Link } from 'react-router-dom'
import { ChevronRight, Smartphone } from 'lucide-react'
import { showAppDownload } from '../lib/platform'

// AppDownloadBanner hanya tampil di browser Android yang belum membuka versi aplikasi.
export default function AppDownloadBanner() {
  if (!showAppDownload()) return null
  return (
    <Link to="/unduh" className="flex items-center gap-3 rounded-2xl border border-line bg-surface px-4 py-3 text-sm hover:bg-sunken">
      <span className="grid size-10 shrink-0 place-items-center rounded-2xl bg-violet-soft text-violet-ink">
        <Smartphone className="size-5" />
      </span>
      <span className="min-w-0 flex-1">
        <span className="block font-semibold">Pakai aplikasi Android</span>
        <span className="block text-[13px] text-muted">Lebih cepat, layar penuh. Gratis.</span>
      </span>
      <ChevronRight className="size-4 text-faint" />
    </Link>
  )
}
