import { AlertTriangle, FileText, RotateCcw, Search } from 'lucide-react'
import { useMemo, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { Badge, Button, Card, CardContent, CardHeader, CardTitle, EmptyState, Input, Pagination, Select, Spinner, Table, TBody, TD, TH, THead, TR } from '@/components/ui'
import { useMlrList } from '@/entities/mlc'
import { MLR_STATUSES } from '@shared/types'
import { formatDateTime, formatStatus, getErrorMessage, matchesSearch, PAGE_SIZE, statusVariant, toOptional } from './mlcUtils'

export function MlrListPage() {
  const navigate = useNavigate()
  const [params, setParams] = useSearchParams()
  const [status, setStatus] = useState(params.get('status') ?? '')
  const [query, setQuery] = useState(params.get('q') ?? '')
  const [page, setPage] = useState(Number(params.get('page') ?? '0'))
  const list = useMlrList({ status: toOptional(status), page, size: PAGE_SIZE })
  const rows = useMemo(() => (list.data?.content ?? []).filter((document) => matchesSearch([document.id, document.mlrNumber, document.mlcCaseId, document.body, document.preparedBy, document.approvedBy], query)), [list.data?.content, query])
  const filtered = Boolean(status || query)

  function clear() {
    setStatus('')
    setQuery('')
    setPage(0)
    setParams({})
  }

  return <div className="min-h-screen bg-background">
    <header className="border-b border-border bg-card px-4 py-5 sm:px-6"><div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-3"><div className="flex items-center gap-3"><span className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10"><FileText className="h-5 w-5 text-primary" /></span><div><h1 className="text-xl font-semibold tracking-tight">MLR queue</h1><p className="text-xs text-muted-foreground">Generated medico-legal reports and their approval lifecycle.</p></div></div><Button variant="outline" onClick={() => navigate('/medico-legal/cases')}>Browse MLC cases</Button></div></header>
    <main className="mx-auto max-w-7xl space-y-4 p-4 sm:p-6">
      <Card><CardHeader className="flex-row items-center justify-between"><div><CardTitle className="text-base">Search reports</CardTitle><p className="mt-1 text-xs text-muted-foreground">The report body is generated from the linked MLC snapshot.</p></div>{filtered && <Button variant="ghost" size="sm" onClick={clear}><RotateCcw className="h-4 w-4" /> Clear</Button>}</CardHeader><CardContent className="grid grid-cols-1 gap-3 sm:grid-cols-2"><Input label="Search" placeholder="MLR #, MLC case id, author…" value={query} onChange={(event) => setQuery(event.target.value)} /><Select label="Status" value={status} onChange={(event) => { const value = event.target.value; setStatus(value); setPage(0); setParams(value ? { status: value } : {}) }} options={[{ label: 'All statuses', value: '' }, ...MLR_STATUSES.map((value) => ({ label: formatStatus(value), value }))]} /></CardContent></Card>
      <Card className="overflow-hidden">{list.isLoading ? <div className="flex min-h-64 items-center justify-center"><Spinner className="h-6 w-6 text-primary" /></div> : list.isError ? <EmptyState title="Unable to load MLR documents" description={getErrorMessage(list.error, 'The MLR service could not be reached.')} action={<Button variant="outline" onClick={() => list.refetch()}>Try again</Button>} icon={<AlertTriangle className="h-10 w-10" />} /> : rows.length === 0 ? <EmptyState title={filtered ? 'No matching reports' : 'No MLR documents yet'} description={filtered ? 'Try another search or clear the filter.' : 'Generate an MLR from an eligible MLC case.'} icon={<Search className="h-10 w-10" />} /> : <><Table><THead><TR><TH>MLR number</TH><TH>MLC case</TH><TH>Status</TH><TH>Prepared</TH><TH>Issued</TH><TH /></TR></THead><TBody>{rows.map((document) => <TR key={document.id}><TD className="font-mono text-xs font-medium">{document.mlrNumber ?? document.id}</TD><TD className="font-mono text-xs">{document.mlcCaseId}</TD><TD><Badge variant={statusVariant(document.status)}>{formatStatus(document.status)}</Badge></TD><TD className="text-xs">{formatDateTime(document.preparedAt)}</TD><TD className="text-xs">{formatDateTime(document.issuedAt)}</TD><TD className="text-right"><Button variant="ghost" size="sm" onClick={() => navigate(`/medico-legal/cases/${document.mlcCaseId}?tab=mlr`)}>Open case</Button></TD></TR>)}</TBody></Table><div className="flex items-center justify-between px-4"><span className="py-3 text-xs text-muted-foreground">Showing {rows.length} of {list.data?.totalElements ?? 0}</span><Pagination currentPage={list.data?.currentPage ?? page} totalPages={list.data?.totalPages ?? 1} onPageChange={(next) => { setPage(next); setParams((current) => { const value = new URLSearchParams(current); value.set('page', String(next)); return value }) }} /></div></>}</Card>
    </main>
  </div>
}

export default MlrListPage
