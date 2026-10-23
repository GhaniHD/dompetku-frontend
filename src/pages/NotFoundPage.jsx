import { Link } from 'react-router-dom'

export default function NotFoundPage() {
  return (
    <div className="flex flex-col items-center py-24 text-center">
      <p className="num text-[96px] font-semibold leading-none text-violet">404</p>
      <h1 className="mt-4 text-2xl font-semibold">Halaman tidak ditemukan</h1>
      <p className="mt-2 text-muted">Alamatnya mungkin salah atau halamannya sudah dipindah.</p>
      <Link to="/" className="mt-6 inline-flex h-11 items-center rounded-full bg-violet px-5 text-sm font-semibold text-white hover:bg-violet-deep">
        Kembali ke ringkasan
      </Link>
    </div>
  )
}
