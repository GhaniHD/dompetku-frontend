import { Banknote, Building2, CreditCard, PiggyBank, Smartphone } from 'lucide-react'

export const WALLET_TYPES = {
  cash: { label: 'Tunai', icon: Banknote },
  bank: { label: 'Rekening bank', icon: Building2 },
  ewallet: { label: 'Dompet digital', icon: Smartphone },
  credit_card: { label: 'Kartu kredit', icon: CreditCard },
  savings: { label: 'Tabungan', icon: PiggyBank },
}

export const walletType = (type) => WALLET_TYPES[type] || WALLET_TYPES.cash
