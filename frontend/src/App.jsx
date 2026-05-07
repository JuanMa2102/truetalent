import { useState, useEffect } from 'react'
import axios from 'axios'

const API = 'https://truetalent.onrender.com'

const STATUS_CONFIG = {
  pending: {
    label: 'Pending',
    dot: 'bg-amber-400',
    badge: 'bg-amber-500/10 text-amber-400 ring-1 ring-amber-500/20',
    card: 'border-amber-500/20 bg-amber-500/5',
    cardActive: 'border-amber-400/50 bg-amber-500/10',
    count: 'text-amber-400',
  },
  processing: {
    label: 'Processing',
    dot: 'bg-blue-400',
    badge: 'bg-blue-500/10 text-blue-400 ring-1 ring-blue-500/20',
    card: 'border-blue-500/20 bg-blue-500/5',
    cardActive: 'border-blue-400/50 bg-blue-500/10',
    count: 'text-blue-400',
  },
  completed: {
    label: 'Completed',
    dot: 'bg-emerald-400',
    badge: 'bg-emerald-500/10 text-emerald-400 ring-1 ring-emerald-500/20',
    card: 'border-emerald-500/20 bg-emerald-500/5',
    cardActive: 'border-emerald-400/50 bg-emerald-500/10',
    count: 'text-emerald-400',
  },
  failed: {
    label: 'Failed',
    dot: 'bg-red-400',
    badge: 'bg-red-500/10 text-red-400 ring-1 ring-red-500/20',
    card: 'border-red-500/20 bg-red-500/5',
    cardActive: 'border-red-400/50 bg-red-500/10',
    count: 'text-red-400',
  },
}

function StatusBadge({ status }) {
  const cfg = STATUS_CONFIG[status] ?? {
    label: status,
    dot: 'bg-neutral-400',
    badge: 'bg-neutral-500/10 text-neutral-400 ring-1 ring-neutral-500/20',
  }
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium ${cfg.badge}`}>
      <span className={`h-1.5 w-1.5 rounded-full ${cfg.dot}`} />
      {cfg.label.toUpperCase()}
    </span>
  )
}

function StatCard({ statusKey, count, active, onClick }) {
  const cfg = STATUS_CONFIG[statusKey]
  return (
    <button
      onClick={onClick}
      className={`flex-1 rounded-xl border px-4 py-4 text-left transition-all active:scale-95 cursor-pointer
        ${active ? cfg.cardActive : cfg.card}
        hover:brightness-125`}
    >
      <p className="text-xs font-medium text-neutral-500 uppercase tracking-wider mb-1">{cfg.label}</p>
      <p className={`text-2xl font-semibold ${cfg.count}`}>{count}</p>
    </button>
  )
}

const generateKey = () => crypto.randomUUID()

function App() {
  const [transactions, setTransactions] = useState([])
  const [formData, setFormData] = useState({ user_id: '', amount: '', tipo: 'pago' })
  const [idempotencyKey, setIdempotencyKey] = useState(generateKey)
  const [loading, setLoading] = useState(false)
  const [processing, setProcessing] = useState(false)
  const [activeFilter, setActiveFilter] = useState(null)

  useEffect(() => { fetchTransactions() }, [])

  useEffect(() => {
    const ws = new WebSocket('wss://truetalent.onrender.com/transactions/stream')
    ws.onmessage = (event) => {
      const data = JSON.parse(event.data)
      setTransactions((prev) =>
        prev.map((t) => (t.id == data.id ? { ...t, status: data.status } : t))
      )
    }
    return () => { if (ws.readyState === 1) ws.close() }
  }, [])

  const fetchTransactions = async () => {
    const res = await axios.get(`${API}/transactions/`)
    setTransactions(res.data)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    await axios.post(`${API}/transactions/create/`, {
      ...formData,
      idempotency_key: idempotencyKey,
    })
    setFormData({ user_id: '', amount: '', tipo: 'pago' })
    setIdempotencyKey(generateKey()) // rotate key for next request
    await fetchTransactions()
    setLoading(false)
  }

  const processTransactions = async () => {
    setProcessing(true)
    await axios.get(`${API}/transactions/async-process/`)
    await fetchTransactions()
    setProcessing(false)
  }

  const counts = {
    pending: transactions.filter((t) => t.status === 'pending').length,
    processing: transactions.filter((t) => t.status === 'processing').length,
    completed: transactions.filter((t) => t.status === 'completed').length,
    failed: transactions.filter((t) => t.status === 'failed').length,
  }

  const displayed = activeFilter
    ? transactions.filter((t) => t.status === activeFilter)
    : transactions

  const toggleFilter = (key) => setActiveFilter((prev) => (prev === key ? null : key))

  return (
    <div className="min-h-screen bg-[#0d0d0d] text-white px-6 py-10">
      <div className="max-w-2xl mx-auto space-y-8">

        {/* Header */}
        <div>
          <p className="text-xs font-medium tracking-widest text-neutral-500 uppercase mb-1">TrueTalent</p>
          <h1 className="text-2xl font-semibold text-white">Dashboard Transaccional</h1>
          <p className="text-sm text-neutral-500 mt-1">Gestión de pagos y retiros en tiempo real</p>
        </div>

        {/* Stat cards / filters */}
        <div className="flex gap-3">
          {Object.keys(STATUS_CONFIG).map((key) => (
            <StatCard
              key={key}
              statusKey={key}
              count={counts[key] ?? 0}
              active={activeFilter === key}
              onClick={() => toggleFilter(key)}
            />
          ))}
        </div>

        {/* Form */}
        <div className="rounded-xl border border-white/[0.06] bg-white/[0.03] p-6 space-y-4">
          <h2 className="text-sm font-medium text-neutral-400">Nueva transacción</h2>
          <form onSubmit={handleSubmit} className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <input
                id="user_id"
                type="number"
                placeholder="User ID"
                value={formData.user_id}
                onChange={(e) => setFormData({ ...formData, user_id: e.target.value })}
                required
                className="bg-white/[0.05] border border-white/[0.08] rounded-lg px-3 py-2 text-sm text-white placeholder-neutral-600 focus:outline-none focus:ring-1 focus:ring-white/20 transition"
              />
              <input
                id="amount"
                type="number"
                placeholder="Monto"
                value={formData.amount}
                onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                required
                className="bg-white/[0.05] border border-white/[0.08] rounded-lg px-3 py-2 text-sm text-white placeholder-neutral-600 focus:outline-none focus:ring-1 focus:ring-white/20 transition"
              />
            </div>
            <select
              id="tipo"
              value={formData.tipo}
              onChange={(e) => setFormData({ ...formData, tipo: e.target.value })}
              className="w-full bg-white/[0.05] border border-white/[0.08] rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:ring-1 focus:ring-white/20 transition appearance-none"
            >
              <option value="pago" className="bg-neutral-900">Pago</option>
              <option value="retiro" className="bg-neutral-900">Retiro</option>
            </select>
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-white text-black text-sm font-medium rounded-lg py-2 hover:bg-neutral-200 active:scale-95 transition disabled:opacity-40 disabled:cursor-not-allowed"
            >
              {loading ? 'Enviando…' : 'Enviar transacción'}
            </button>
          </form>
        </div>

        {/* List header */}
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-medium text-neutral-400">
            {activeFilter
              ? <>{STATUS_CONFIG[activeFilter].label} <span className="text-neutral-600">({displayed.length})</span></>
              : <>Todas <span className="text-neutral-600">({transactions.length})</span></>
            }
          </h2>
          <div className="flex items-center gap-2">
            {activeFilter && (
              <button
                onClick={() => setActiveFilter(null)}
                className="text-xs text-neutral-500 hover:text-white transition px-2 py-1 rounded-md hover:bg-white/5"
              >
                Limpiar filtro ×
              </button>
            )}
            <button
              onClick={processTransactions}
              disabled={processing}
              className="text-xs font-medium px-3 py-1.5 rounded-lg border border-white/10 text-neutral-400 hover:text-white hover:border-white/20 active:scale-95 transition disabled:opacity-40"
            >
              {processing ? 'Procesando…' : 'Procesar pendientes'}
            </button>
          </div>
        </div>

        {/* Transaction list */}
        <div className="space-y-2">
          {displayed.length === 0 && (
            <p className="text-sm text-neutral-600 text-center py-10">
              {activeFilter ? `No hay transacciones en estado "${STATUS_CONFIG[activeFilter]?.label}".` : 'No hay transacciones aún.'}
            </p>
          )}
          {displayed.map((t) => (
            <div
              key={t.id}
              className="flex items-center justify-between rounded-xl border border-white/[0.06] bg-white/[0.03] px-4 py-3 hover:bg-white/[0.05] transition"
            >
              <div className="space-y-0.5">
                <div className="flex items-center gap-2">
                  <span className="text-xs text-neutral-600 font-mono">#{t.id}</span>
                  <span className="text-sm font-medium text-white">
                    ${parseFloat(t.amount).toLocaleString()}
                  </span>
                  <span className="text-xs text-neutral-500 capitalize">{t.tipo}</span>
                </div>
                <p className="text-xs text-neutral-600">Usuario {t.user_id}</p>
              </div>
              <StatusBadge status={t.status} />
            </div>
          ))}
        </div>

      </div>
    </div>
  )
}

export default App