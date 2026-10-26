import { test } from 'node:test'
import assert from 'node:assert/strict'
import { evaluate, isExpression } from './calc.js'

test('menghitung ekspresi nominal gaya Indonesia', () => {
  const cases = [
    ['15000+15000', 30000], ['15.000 + 15.000', 30000], ['15rb+12,5rb', 27500], ['1,5jt', 1500000], ['1.5jt', 1500000],
    ['2x15rb', 30000], ['3 × 12.500', 37500], ['100rb/4', 25000], ['(10rb+5rb)*2', 30000], ['-1.500.000', -1500000],
    ['1.250.000', 1250000], ['15,000', 15000], ['10rb-2rb-500', 7500], ['20k', 20000], ['5 ribu + 1 juta', 1005000],
    ['2*-3rb', -6000], ['15.000.', 15000],
  ]
  for (const [input, want] of cases) assert.equal(evaluate(input), want, input)
})

test('ekspresi tidak lengkap atau asing menghasilkan NaN', () => {
  for (const input of ['15000+', 'abc', '', '(1+2', '1 2', '15rb jt']) assert.ok(Number.isNaN(evaluate(input)), input)
})

test('membedakan angka biasa dan ekspresi', () => {
  assert.equal(isExpression('15000'), false)
  assert.equal(isExpression('15.000'), false)
  assert.equal(isExpression('-1500'), false)
  assert.equal(isExpression('15rb'), true)
  assert.equal(isExpression('1+2'), true)
})
