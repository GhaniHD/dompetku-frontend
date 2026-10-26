import { Link } from 'react-router-dom'
import Logo from '../../components/layout/Logo'

const DAYS = Array.from({ length: 30 }, (_, i) => i)

function CycleArt() {
  return (
    <div className="relative mt-10 rounded-[24px] bg-white/10 p-6 ring-1 ring-white/15">
      <p className="text-sm text-white/70">Periode gajian 25 Okt – 24 Nov</p>
      <p className="num mt-1 text-4xl font-semibold text-white">Rp4.820.000</p>
      <p className="text-sm text-white/70">sisa untuk 12 hari ke depan</p>
      <div className="mt-6 flex gap-[3px]">
        {DAYS.map((d) => (
          <span key={d} className={`h-8 flex-1 rounded-full ${d < 18 ? 'bg-white' : 'bg-white/20'} ${d === 17 ? 'ring-2 ring-white/50 ring-offset-2 ring-offset-violet' : ''}`} />
        ))}
      </div>
      <div className="mt-6 grid grid-cols-3 gap-3 text-sm">
        {[
          ['Makan', '72%'],
          ['Transport', '41%'],
          ['Tagihan', '100%'],
        ].map(([label, pct]) => (
          <div key={label} className="rounded-2xl bg-white/10 px-3 py-2.5">
            <p className="text-white/70">{label}</p>
            <p className="num text-lg font-semibold text-white">{pct}</p>
          </div>
        ))}
      </div>
    </div>
  )
}

export default function AuthLayout({ title, subtitle, children, footer }) {
  return (
    <div className="grid grid-cols-1 min-h-dvh lg:grid-cols-[1fr_minmax(0,560px)] xl:grid-cols-[1fr_620px]">
      <div className="flex flex-col px-6 py-8 sm:px-12">
        <Link to="/" className="flex items-center gap-2.5">
          <Logo className="size-10" />
          <span className="font-display text-xl font-semibold">DompetKu</span>
        </Link>
        <div className="mx-auto flex w-full max-w-[400px] flex-1 flex-col justify-center py-12">
          <h1 className="text-[34px] font-semibold leading-tight">{title}</h1>
          <p className="mt-2 text-muted">{subtitle}</p>
          <div className="mt-8">{children}</div>
          <p className="mt-8 text-sm text-muted">{footer}</p>
        </div>
      </div>
      <aside className="relative hidden overflow-hidden bg-violet p-12 lg:flex lg:flex-col lg:justify-center">
        <div className="max-w-md">
          <h2 className="text-[40px] font-semibold leading-[1.1] text-white">Anggaran yang ikut ritme pemasukanmu.</h2>
          <p className="mt-4 text-lg text-white/75">
            Catat pemasukan, pengeluaran, dan pindahan antar dompet. Lihat sisa uang per periode gajian, atau per bulan kalau pemasukanmu tidak tetap.
          </p>
          <CycleArt />
        </div>
      </aside>
    </div>
  )
}
