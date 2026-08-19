import { AlertTriangle, ClipboardList, Plus, RotateCcw, Search } from 'lucide-react'
import { useMemo, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { Badge, Button, Card, CardContent, CardHeader, CardTitle, EmptyState, Input, Pagination, Select, Spinner, Table, TBody, TD, TH, THead, TR } from '@/components/ui'
import { useMlcList } from '@/entities/mlc'
import { MLC_STATUSES } from '@shared/types'
import { formatDateTime, formatStatus, getErrorMessage, matchesSearch, PAGE_SIZE, statusVariant, toOptional } from './mlcUtils'

const INTAKE_OPTIONS = ['', 'DEATH_REGISTRATION', 'EMERGENCY_WARD', 'INPATIENT_WARD', 'BROUGHT_DEAD', 'OUTPATIENT', 'FOLLOW_UP']

export function MlcListPage() {
  const navigate = useNavigate()
  const [params, setParams] = useSearchParams()
  const [status, setStatus] = useState(params.get('status') ?? '')
  const [intakeSource, setIntakeSource] = useState(params.get('intakeSource') ?? '')
  const [firNumber, setFirNumber] = useState(params.get('firNumber') ?? '')
  const [query, setQuery] = useState(params.get('q') ?? '')
  const [page, setPage] = useState(Number(params.get('page') ?? '0'))

  const list = useMlcList({ status: toOptional(status), intakeSource: toOptional(intakeSource), firNumber: toOptional(firNumber), page, size: PAGE_SIZE })
  const rows = useMemo(() => (list.data?.content ?? []).filter((item) => matchesSearch([item.id, item.mlcNumber, item.incidentSummary, item.incidentLocation, item.firNumber, item.policeStation, ...(item.episodes ?? []).flatMap((episode) => [episode.patientUhid, episode.patientId, episode.encounterId])], query)), [list.data?.content, query])
  const hasFilters = Boolean(status || intakeSource || firNumber || query)

  function clearFilters() { setStatus(''); setIntakeSource(''); setFirNumber(''); setQuery(''); setPage(0); setParams({}) }
  function changeFilter(key: 'status' | 'intakeSource' | 'firNumber', value: string) { if (key === 'status') setStatus(value); if (key === 'intakeSource') setIntakeSource(value); if (key === 'firNumber') setFirNumber(value); setPage(0); setParams((current) => { const next = new URLSearchParams(current); if (value) next.set(key, value); else next.delete(key); next.delete('page'); return next }) }

  return <div className="min-h-screen bg-background">
    <header className="border-b border-border bg-card px-4 py-5 sm:px-6"><div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-3"><div className="flex items-center gap-3"><span className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10"><ClipboardList className="h-5 w-5 text-primary" /></span><div><h1 className="text-xl font-semibold tracking-tight">MLC cases</h1><p className="text-xs text-muted-foreground">{list.data?.totalElements ?? 0} cases in the current tenant</p></div></div><div className="flex gap-2"><Button variant="outline" onClick={() => navigate('/medico-legal')}>Dashboard</Button><Button onClick={() => navigate('/medico-legal/cases/new')}><Plus className="h-4 w-4" /> Identify case</Button></div></div></header>
    <main className="mx-auto max-w-7xl space-y-4 p-4 sm:p-6">
      <Card><CardHeader className="flex flex-col gap-3 pb-3 sm:flex-row sm:items-center sm:justify-between"><div><CardTitle className="text-base">Search and filters</CardTitle><p className="mt-1 text-xs text-muted-foreground">Search by MLC number, FIR, incident or patient episode.</p></div>{hasFilters && <Button variant="ghost" size="sm" onClick={clearFilters}><RotateCcw className="h-4 w-4" /> Clear filters</Button>}</CardHeader><CardContent className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4"><Input label="Search cases" placeholder="MLC #, patient, incident…" value={query} onChange={(event) => setQuery(event.target.value)} /><Select label="Status" value={status} onChange={(event) => changeFilter('status', event.target.value)} options={[{ label: 'All statuses', value: '' }, ...MLC_STATUSES.map((value) => ({ label: formatStatus(value), value }))]} /><Select label="Intake source" value={intakeSource} onChange={(event) => changeFilter('intakeSource', event.target.value)} options={INTAKE_OPTIONS.map((value) => ({ label: value ? formatStatus(value) : 'All intake sources', value }))} /><Input label="FIR number" placeholder="Exact FIR number" value={firNumber} onChange={(event) => changeFilter('firNumber', event.target.value)} /></CardContent></Card>
      <Card className="overflow-hidden">{list.isLoading ? <div className="flex min-h-64 items-center justify-center"><Spinner className="h-6 w-6 text-primary" /></div> : list.isError ? <EmptyState title="Unable to load MLC cases" description={getErrorMessage(list.error, 'The MLC service could not be reached.')} action={<Button variant="outline" onClick={() => list.refetch()}>Try again</Button>} icon={<AlertTriangle className="h-10 w-10" />} /> : rows.length === 0 ? <EmptyState title={hasFilters ? 'No matching MLC cases' : 'No MLC cases yet'} description={hasFilters ? 'Try another search or clear the filters.' : 'Identify the first medico-legal case to begin tracking.'} action={hasFilters ? <Button variant="outline" onClick={clearFilters}>Clear filters</Button> : <Button onClick={() => navigate('/medico-legal/cases/new')}>Identify case</Button>} icon={<Search className="h-10 w-10" />} /> : <><Table><THead><TR><TH>MLC number</TH><TH>Patient / episode</TH><TH>Incident</TH><TH>Intake</TH><TH>Status</TH><TH>Updated</TH><TH /></TR></THead><TBody>{rows.map((item) => <TR key={item.id} className="cursor-pointer" onClick={() => navigate(`/medico-legal/cases/${item.id}`)}><TD className="font-mono text-xs font-medium">{item.mlcNumber ?? 'Number assigned on registration'}</TD><TD><div className="font-medium">{item.episodes?.[0]?.patientUhid ?? item.episodes?.[0]?.patientId ?? (item.deceasedUnidentified ? 'Unidentified deceased' : 'Patient not linked')}</div><div className="text-xs text-muted-foreground">{item.episodes?.length ?? 0} tracked episode(s)</div></TD><TD><div className="max-w-xs truncate">{formatStatus(item.natureOfIncident)}</div><div className="max-w-xs truncate text-xs text-muted-foreground">{item.incidentSummary}</div></TD><TD>{formatStatus(item.intakeSource)}</TD><TD><Badge variant={statusVariant(item.status)}>{formatStatus(item.status)}</Badge></TD><TD className="text-xs">{formatDateTime(item.updatedAt ?? item.createdAt)}</TD><TD className="text-right"><Button variant="ghost" size="sm" onClick={(event) => { event.stopPropagation(); navigate(`/medico-legal/cases/${item.id}`) }}>Open</Button></TD></TR>)}</TBody></Table><div className="flex items-center justify-between px-4"><span className="py-3 text-xs text-muted-foreground">Showing {rows.length} of {list.data?.totalElements ?? 0}</span><Pagination currentPage={list.data?.currentPage ?? page} totalPages={list.data?.totalPages ?? 1} onPageChange={(next) => { setPage(next); setParams((current) => { const value = new URLSearchParams(current); value.set('page', String(next)); return value }) }} /></div></>}</Card>
    </main>
  </div>
}

export default MlcListPage
