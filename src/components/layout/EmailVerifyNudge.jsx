import { useState } from 'react'
import { MailWarning } from 'lucide-react'
import { useProfile } from '../../hooks/queries'
import { dateLabel } from '../../lib/format'
import { VerifyEmailDialog } from '../EmailSettings'
import { Button, Modal } from '../ui'

const SEEN_KEY = 'verify_nudge_seen'

function seenThisSession() {
  try {
    return sessionStorage.getItem(SEEN_KEY) === '1'
  } catch {
    return false
  }
}

function markSeen() {
  try {
    sessionStorage.setItem(SEEN_KEY, '1')
  } catch {
    /* penyimpanan diblokir: popup cukup ditutup untuk tampilan ini */
  }
}

// EmailVerifyNudge: banner dan popup sekali per sesi untuk akun yang emailnya
// belum diverifikasi.
export default function EmailVerifyNudge() {
  const { data } = useProfile()
  const [popup, setPopup] = useState(() => !seenThisSession())
  const [verifying, setVerifying] = useState(false)
  const st = data?.email_status
  if (!st?.required) return null

  const target = st.pending_email || data.email
  const overdue = st.due_at && new Date(st.due_at) <= new Date()
  const message = overdue
    ? 'Emailmu belum diverifikasi. Kamu akan diminta kode dari email setiap kali masuk sampai email terverifikasi.'
    : st.due_at
      ? `Verifikasi emailmu sebelum ${dateLabel(st.due_at)}. Setelah itu kamu wajib memasukkan kode dari email saat masuk.`
      : 'Verifikasi emailmu supaya bisa menerima ringkasan, pengingat, dan link atur ulang password.'

  const start = () => {
    markSeen()
    setPopup(false)
    setVerifying(true)
  }
  const later = () => {
    markSeen()
    setPopup(false)
  }

  return (
    <>
      <div role="status" className="mb-4 flex flex-wrap items-center gap-3 rounded-2xl bg-caution-soft px-4 py-3 text-sm text-ink">
        <MailWarning className="size-4 shrink-0 text-caution" />
        <p className="min-w-0 flex-1">{message}</p>
        <Button size="sm" onClick={start}>Verifikasi sekarang</Button>
      </div>
      {popup && data.income_setup_done && !verifying && (
        <Modal
          open
          onClose={later}
          title="Verifikasi emailmu"
          description={`Kami akan mengirim kode 6 digit ke ${target}.`}
          footer={
            <>
              <Button variant="ghost" onClick={later}>Nanti saja</Button>
              <Button onClick={start}>Kirim kode</Button>
            </>
          }
        >
          <p className="text-sm text-muted">{message}</p>
        </Modal>
      )}
      {verifying && <VerifyEmailDialog email={target} onClose={() => setVerifying(false)} />}
    </>
  )
}
