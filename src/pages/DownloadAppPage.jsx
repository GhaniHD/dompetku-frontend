import { Link } from 'react-router-dom'
import { Download, ShieldCheck, Smartphone } from 'lucide-react'
import { useAuth } from '../context/auth'
import { APK_URL, isIOS } from '../lib/platform'
import AuthLayout from './auth/AuthLayout'

const STEPS = [
  ['Unduh file aplikasi', 'Tekan tombol di atas. File myfulus.apk tersimpan di folder Download.'],
  ['Buka file yang sudah diunduh', 'Ketuk notifikasi unduhan, atau buka aplikasi Files lalu folder Download.'],
  ['Izinkan pemasangan', 'Kalau muncul "Instal aplikasi tidak dikenal tidak diizinkan", ketuk Setelan, nyalakan Izinkan dari sumber ini, lalu kembali.'],
  ['Ketuk Instal', 'Kalau Play Protect menanyakan "Pindai aplikasi?", pilih Pindai lalu Instal. Ini wajar untuk aplikasi di luar Play Store.'],
  ['Buka MyFulus', 'Masuk dengan email dan password yang sama. Datamu tetap sama dengan versi web.'],
]

export default function DownloadAppPage() {
  const { user } = useAuth()
  const back = (
    <Link to={user ? '/' : '/masuk'} className="font-semibold text-violet-ink hover:underline">
      {user ? 'Kembali ke MyFulus' : 'Kembali ke halaman masuk'}
    </Link>
  )

  if (isIOS()) {
    return (
      <AuthLayout title="MyFulus di iPhone" subtitle="Aplikasi Android tidak bisa dipasang di iPhone, tapi MyFulus bisa ditambahkan ke layar utama." footer={back}>
        <ol className="list-decimal space-y-2 pl-5 text-sm text-ink">
          <li>Buka myfulus.my.id di <b>Safari</b>.</li>
          <li>Ketuk tombol <b>Bagikan</b> (kotak dengan panah ke atas).</li>
          <li>Pilih <b>Tambahkan ke Layar Utama</b>, lalu <b>Tambah</b>.</li>
        </ol>
      </AuthLayout>
    )
  }

  return (
    <AuthLayout title="Aplikasi MyFulus untuk Android" subtitle="Lebih cepat dibuka, tampil layar penuh, dan link dari email langsung terbuka di aplikasi." footer={back}>
      <a
        href={APK_URL}
        download="myfulus.apk"
        className="flex h-12 w-full items-center justify-center gap-2 rounded-full bg-violet font-semibold text-white hover:bg-violet/90"
      >
        <Download className="size-5" /> Unduh aplikasi Android
      </a>
      <p className="mt-2 flex items-center justify-center gap-1.5 text-[13px] text-muted">
        <ShieldCheck className="size-4 text-income" /> Gratis, resmi dari myfulus.my.id
      </p>

      <ol className="mt-6 space-y-4">
        {STEPS.map(([title, body], i) => (
          <li key={title} className="flex gap-3">
            <span className="grid size-7 shrink-0 place-items-center rounded-full bg-violet-soft text-sm font-semibold text-violet-ink">{i + 1}</span>
            <div className="text-sm">
              <p className="font-semibold">{title}</p>
              <p className="text-muted">{body}</p>
            </div>
          </li>
        ))}
      </ol>

      <div className="mt-6 flex gap-3 rounded-2xl bg-sunken p-4 text-[13px] text-muted">
        <Smartphone className="mt-0.5 size-4 shrink-0" />
        <p>Sudah punya aplikasi versi lama yang diblokir Play Protect? Copot dulu aplikasi lama itu, lalu pasang file dari halaman ini.</p>
      </div>
    </AuthLayout>
  )
}
