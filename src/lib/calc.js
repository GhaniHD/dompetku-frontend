const SUFFIX = { rb: 1e3, ribu: 1e3, k: 1e3, jt: 1e6, juta: 1e6 }
const OPS = { '+': [1, (a, b) => a + b], '-': [1, (a, b) => a - b], '*': [2, (a, b) => a * b], '/': [2, (a, b) => a / b] }

// Angka gaya Indonesia: titik pemisah ribuan, koma desimal. "15.000" = 15000,
// "12,5rb" = 12500, "1.5jt" = 1500000.
function toNumber(raw, suffix) {
  let s = raw
  if (/^\d{1,3}(\.\d{3})+(,\d+)?$/.test(s)) s = s.replace(/\./g, '').replace(',', '.')
  else if (!suffix && /^\d{1,3}(,\d{3})+$/.test(s)) s = s.replace(/,/g, '')
  else s = s.replace(',', '.')
  if (!/^\d+(\.\d+)?$/.test(s)) return NaN
  return Number(s) * (suffix ? SUFFIX[suffix] : 1)
}

function tokenize(input) {
  const src = input.toLowerCase().replace(/[x×]/g, '*').replace(/[÷:]/g, '/').replace(/−/g, '-')
  const tokens = []
  const re = /\s*(?:(\d[\d.,]*)\s*(ribu|rb|juta|jt|k)?|([-+*/()]))/y
  let m
  while (re.lastIndex < src.length) {
    const start = re.lastIndex
    m = re.exec(src)
    if (!m || re.lastIndex === start) {
      if (/^\s*$/.test(src.slice(start))) break
      return null
    }
    if (m[1] !== undefined) tokens.push({ n: toNumber(m[1].replace(/[.,]$/, ''), m[2]) })
    else tokens.push({ op: m[3] })
  }
  return tokens
}

export function evaluate(input) {
  const tokens = tokenize(String(input ?? ''))
  if (!tokens || tokens.length === 0) return NaN
  const out = []
  const ops = []
  let expectValue = true
  const apply = () => {
    const op = ops.pop()
    if (op === 'neg') {
      if (!out.length) throw new Error()
      out.push(-out.pop())
      return
    }
    const b = out.pop()
    const a = out.pop()
    if (a === undefined || b === undefined) throw new Error()
    out.push(OPS[op][1](a, b))
  }
  try {
    for (const t of tokens) {
      if (t.n !== undefined) {
        if (!expectValue || Number.isNaN(t.n)) return NaN
        out.push(t.n)
        expectValue = false
      } else if (t.op === '(') {
        if (!expectValue) return NaN
        ops.push('(')
      } else if (t.op === ')') {
        if (expectValue) return NaN
        while (ops.length && ops[ops.length - 1] !== '(') apply()
        if (!ops.length) return NaN
        ops.pop()
      } else if (expectValue && (t.op === '-' || t.op === '+')) {
        if (t.op === '-') ops.push('neg')
      } else {
        if (expectValue) return NaN
        while (ops.length && ops[ops.length - 1] !== '(' && (ops[ops.length - 1] === 'neg' || OPS[ops[ops.length - 1]][0] >= OPS[t.op][0])) apply()
        ops.push(t.op)
        expectValue = true
      }
    }
    if (expectValue) return NaN
    while (ops.length) {
      if (ops[ops.length - 1] === '(') return NaN
      apply()
    }
  } catch {
    return NaN
  }
  return out.length === 1 && Number.isFinite(out[0]) ? Math.round(out[0]) : NaN
}

export const isExpression = (s) => /[-+*/x×÷:()]|rb|ribu|jt|juta|k/i.test(String(s ?? '').replace(/^-/, ''))
