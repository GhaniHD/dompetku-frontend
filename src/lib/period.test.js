import { test } from 'node:test'
import assert from 'node:assert/strict'
import { periodWords } from './period.js'

test('gaji tetap menyebut tanggal gajian', () => {
  const w = periodWords({ income_type: 'salary', budget_start_day: 25 })
  assert.equal(w.badge, 'Gajian tgl 25')
  assert.equal(w.countdown(6), '5 hari lagi gajian')
  assert.equal(w.countdown(1), 'Gajian besok')
  assert.equal(w.until, 'gajian berikutnya')
})

test('tidak tetap tidak menyebut gajian sama sekali', () => {
  const w = periodWords({ income_type: 'irregular', budget_start_day: 1 })
  for (const text of [w.badge, w.until, w.countdown(6), w.countdown(1), w.basis, w.settingsLink]) {
    assert.ok(!/gaji/i.test(text), text)
  }
  assert.equal(w.countdown(6), '5 hari lagi akhir bulan')
})
