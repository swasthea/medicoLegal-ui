import { AlertTriangle, ClipboardList, FileText, Plus, Scale, ShieldCheck } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { useMlcList, useMlrList } from '@/entities/mlc'
import { Badge, Button, Card, CardContent, CardHeader, CardTitle, Spinner } from '@/components/ui'
import { formatStatus, statusVariant } from './mlcUtils'

const ACTIVE_STATUSES = ['IDENTIFIED', 'REGISTERED', 'UNDER_INVESTIGATION', 'POST_MORTEM_PENDING', 'POST_MORTEM_COMPLETED', 'MLR_DRAFTED', 'ESCALATED']

export function MlcDashboardPage() {
  const navigate = useNavigate()
  const cases = useMlcList({ size: 1 })
  const active = useMlcList({ status: 'UNDER_INVESTIGATION', size: 1 })
  const alerts = useMlcList({ status: 'ESCALATED', size: 1 })
  const mlrs = useMlrList({ status: 'PENDING_APPROVAL', size: 1 })

  const loading = cases.isLoading || active.isLoading || alerts.isLoading || mlrs.isLoading
  const cards = [
    { label: 'Total MLC cases', value: cases.data?.totalElements, icon: <ClipboardList className="h-5 w-5 text-primary" />, href: '/medico-legal/cases' },
    { label: 'Under investigation', value: active.data?.totalElements, icon: <Scale className="h-5 w-5 text-info" />, href: '/medico-legal/cases?status=UNDER_INVESTIGATION' },
    { label: 'Escalated / alerts', value: alerts.data?.totalElements, icon: <AlertTriangle className="h-5 w-5 text-warning" />, href: '/medico-legal/cases?status=ESCALATED' },
    { label: 'MLR pending approval', value: mlrs.data?.totalElements, icon: <FileText className="h-5 w-5 text-success" />, href: '/medico-legal/mlr?status=PENDING_APPROVAL' },
  ]

  return <div className="min-h-screen bg-background">
    <header className="border-b border-border bg-card px-4 py-5 sm:px-6"><div className="mx-auto flex max-w-7xl items-center justify-between gap-4"><div className="flex items-center gap-3"><span className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10"><ShieldCheck className="h-5 w-5 text-primary" /></span><div><p className="text-xs font-semibold uppercase tracking-widest text-primary">Medico legal module</p><h1 className="text-xl font-semibold tracking-tight">MLC / MLR control centre</h1><p className="text-xs text-muted-foreground">Identify cases, track episodes, complete legal gates and issue reports.</p></div></div><div className="flex gap-2"><Button variant="outline" onClick={() => navigate('/medico-legal/cases')}>View cases</Button><Button onClick={() => navigate('/medico-legal/cases/new')}><Plus className="h-4 w-4" /> New MLC case</Button></div></div></header>
    <main className="mx-auto max-w-7xl space-y-6 p-4 sm:p-6">
      <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">{cards.map((card) => <button type="button" key={card.label} className="text-left" onClick={() => navigate(card.href)}><Card className="h-full transition-shadow hover:shadow-md"><CardContent><div className="mb-4 flex items-center justify-between"><span className="flex h-9 w-9 items-center justify-center rounded-lg bg-muted">{card.icon}</span><Badge variant="secondary">Live</Badge></div><div className="text-3xl font-semibold">{loading && card.value === undefined ? <Spinner /> : (card.value ?? 0).toLocaleString()}</div><p className="mt-1 text-sm text-muted-foreground">{card.label}</p><p className="mt-3 text-xs text-primary">Open detail →</p></CardContent></Card></button>)}</section>
      <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
        <Card><CardHeader><CardTitle>Lifecycle at a glance</CardTitle></CardHeader><CardContent><div className="flex flex-wrap items-center gap-2">{ACTIVE_STATUSES.map((status) => <Badge key={status} variant={statusVariant(status)}>{formatStatus(status)}</Badge>)}</div><p className="mt-4 text-sm text-muted-foreground">Transitions are enforced by the backend checklist gates. The UI never skips a legal stage.</p></CardContent></Card>
        <Card><CardHeader><CardTitle>Operator shortcuts</CardTitle></CardHeader><CardContent className="grid grid-cols-1 gap-2 sm:grid-cols-2"><Button variant="outline" className="justify-start" onClick={() => navigate('/medico-legal/cases/new')}><Plus className="h-4 w-4" /> Identify a case</Button><Button variant="outline" className="justify-start" onClick={() => navigate('/medico-legal/cases?intakeSource=BROUGHT_DEAD')}><AlertTriangle className="h-4 w-4" /> Brought-in-dead cases</Button><Button variant="outline" className="justify-start" onClick={() => navigate('/medico-legal/mlr')}><FileText className="h-4 w-4" /> Review MLR queue</Button><Button variant="outline" className="justify-start" onClick={() => navigate('/medico-legal/cases?status=POST_MORTEM_PENDING')}><Scale className="h-4 w-4" /> Post-mortem pending</Button></CardContent></Card>
      </div>
    </main>
  </div>
}

export default MlcDashboardPage
