import { useEffect, useMemo, useState } from 'react'
import { useNavigate, useParams, useSearchParams } from 'react-router-dom'
import toast from 'react-hot-toast'
import { AlertTriangle, ArrowLeft, FileText, Link2, Plus, Save, Trash2 } from 'lucide-react'
import { Badge, Button, Card, CardContent, CardHeader, CardTitle, EmptyState, Input, Modal, Select, Spinner, Textarea } from '@/components/ui'
import { useAmendMlr, useApproveMlr, useDiscardMlc, useGenerateMlr, useIssueMlr, useLinkDeathRegistration, useMlc, useMlrByMlc, useRejectMlr, useReissueMlr, useSubmitMlr, useTransitionMlc, useUpdateMlc } from '@/entities/mlc'
import type { LegalChecklistItem, MlrDocument, PatientEpisode } from '@shared/types'
import { activeAlerts, checklistProgress, formatDateTime, formatStatus, getErrorMessage, KNOWN_CHECKLIST_GATES, statusVariant } from './mlcUtils'

const NEXT_STATES: Record<string, string[]> = {
  IDENTIFIED: ['REGISTERED', 'ESCALATED', 'CANCELLED'],
  REGISTERED: ['UNDER_INVESTIGATION', 'ESCALATED', 'CANCELLED'],
  UNDER_INVESTIGATION: ['POST_MORTEM_PENDING', 'ESCALATED', 'CANCELLED'],
  POST_MORTEM_PENDING: ['POST_MORTEM_COMPLETED', 'ESCALATED', 'CANCELLED'],
  POST_MORTEM_COMPLETED: ['MLR_DRAFTED', 'ESCALATED', 'CANCELLED'],
  MLR_DRAFTED: ['MLR_ISSUED', 'CANCELLED'],
  MLR_ISSUED: ['CLOSED'],
  ESCALATED: ['UNDER_INVESTIGATION', 'CANCELLED'],
}
const TERMINAL_STATUSES = ['CLOSED', 'CANCELLED']

export function MlcCaseDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const query = useMlc(id)
  const mlrQuery = useMlrByMlc(id)
  const update = useUpdateMlc()
  const transition = useTransitionMlc()
  const linkDeath = useLinkDeathRegistration()
  const generate = useGenerateMlr()
  const discard = useDiscardMlc()
  const [tab, setTab] = useState<'overview' | 'checklist' | 'episodes' | 'mlr'>(searchParams.get('tab') === 'mlr' ? 'mlr' : 'overview')
  const [edit, setEdit] = useState(false)
  const [deathRegistrationId, setDeathRegistrationId] = useState('')
  const [linkOpen, setLinkOpen] = useState(false)
  const [transitionOpen, setTransitionOpen] = useState(false)
  const [targetStatus, setTargetStatus] = useState('')
  const [reason, setReason] = useState('')
  const [checklist, setChecklist] = useState<LegalChecklistItem[]>([])
  const [episodes, setEpisodes] = useState<PatientEpisode[]>([])
  const [incidentSummary, setIncidentSummary] = useState('')
  const [incidentLocation, setIncidentLocation] = useState('')
  const [policeStation, setPoliceStation] = useState('')
  const [firNumber, setFirNumber] = useState('')
  const [inquestReportNumber, setInquestReportNumber] = useState('')
  const [mlrComments, setMlrComments] = useState<Record<string, string>>({})
  // Separate dirty-tracking for checklist so the save button appears only when changes exist
  const [checklistDirty, setChecklistDirty] = useState(false)
  const [checklistSaving, setChecklistSaving] = useState(false)

  const record = query.data
  const progress = useMemo(() => checklistProgress(record?.legalChecklist), [record?.legalChecklist])
  const alerts = activeAlerts(record?.alerts)
  const isTerminal = TERMINAL_STATUSES.includes(record?.status ?? '')
  const checklistEditable = !isTerminal && record?.status !== 'MLR_ISSUED'

  // Sync local checklist state when record changes (e.g. after save/transition)
  useEffect(() => {
    if (record?.legalChecklist) {
      setChecklist(record.legalChecklist)
      setChecklistDirty(false)
    }
  }, [record?.legalChecklist, record?.updatedAt])

  function beginEdit() {
    if (!record) return
    setIncidentSummary(record.incidentSummary ?? '')
    setIncidentLocation(record.incidentLocation ?? '')
    setPoliceStation(record.policeStation ?? '')
    setFirNumber(record.firNumber ?? '')
    setInquestReportNumber(record.inquestReportNumber ?? '')
    setEpisodes(record.episodes ?? [])
    setEdit(true)
  }

  function saveChanges() {
    if (!record) return
    update.mutate({ id: record.id, request: { version: record.version, incidentSummary, incidentLocation, policeStation, firNumber, inquestReportNumber, legalChecklist: checklist, episodes } }, {
      onSuccess: () => { toast.success('MLC case updated'); setEdit(false); setChecklistDirty(false) },
      onError: (error) => toast.error(getErrorMessage(error, 'Could not save MLC changes')),
    })
  }

  function saveChecklist() {
    if (!record) return
    setChecklistSaving(true)
    update.mutate({ id: record.id, request: { version: record.version, legalChecklist: checklist } }, {
      onSuccess: () => { toast.success('Checklist saved'); setChecklistDirty(false) },
      onError: (error) => toast.error(getErrorMessage(error, 'Could not save checklist')),
      onSettled: () => setChecklistSaving(false),
    })
  }

  function onChecklistChange(next: LegalChecklistItem[]) {
    setChecklist(next)
    setChecklistDirty(true)
  }

  function doTransition() {
    if (!record || !targetStatus) return
    transition.mutate({ id: record.id, targetStatus, reason: reason.trim() || undefined }, {
      onSuccess: () => { toast.success(`Case moved to ${formatStatus(targetStatus)}`); setTransitionOpen(false); setReason('') },
      onError: (error) => toast.error(getErrorMessage(error, 'Transition blocked by the backend workflow')),
    })
  }

  function doLinkDeath() {
    if (!record || !deathRegistrationId.trim()) return
    linkDeath.mutate({ id: record.id, deathRegistrationId: deathRegistrationId.trim() }, {
      onSuccess: () => { toast.success('Death registration linked'); setLinkOpen(false); setDeathRegistrationId('') },
      onError: (error) => toast.error(getErrorMessage(error, 'Could not link the death registration')),
    })
  }

  function doDiscard() {
    if (!record) return
    if (!confirm('Discard this MLC case? This action is irreversible.')) return
    discard.mutate(record.id, {
      onSuccess: () => { toast.success('MLC case discarded'); navigate('/medico-legal/cases') },
      onError: (error) => toast.error(getErrorMessage(error, 'Could not discard MLC case')),
    })
  }

  function doGenerate() {
    if (!record?.version && record?.version !== 0) { toast.error('MLC version is missing; reload the record'); return }
    generate.mutate({ mlcCaseId: record.id, request: { expectedMlcVersion: record.version } }, {
      onSuccess: (document) => { toast.success(`MLR ${document.mlrNumber ?? 'draft'} generated`); setTab('mlr') },
      onError: (error) => toast.error(getErrorMessage(error, 'MLR generation was rejected')),
    })
  }

  function getComment(documentId: string): string { return mlrComments[documentId] ?? '' }
  function setComment(documentId: string, value: string) { setMlrComments((prev) => ({ ...prev, [documentId]: value })) }

  if (query.isLoading) return <div className="flex min-h-screen items-center justify-center"><Spinner className="h-8 w-8 text-primary" /></div>
  if (query.isError || !record) return <div className="mx-auto max-w-2xl p-6"><EmptyState title="MLC case not found" description={getErrorMessage(query.error, 'The case could not be loaded.')} action={<Button onClick={() => navigate('/medico-legal/cases')}>Back to cases</Button>} /></div>

  const transitionOptions = NEXT_STATES[record.status] ?? []

  return <div className="min-h-screen bg-background">
    <header className="border-b border-border bg-card px-4 py-5 sm:px-6">
      <div className="mx-auto flex max-w-7xl flex-wrap items-start justify-between gap-3">
        <div className="flex items-start gap-3">
          <Button variant="ghost" size="sm" onClick={() => navigate('/medico-legal/cases')}><ArrowLeft className="h-4 w-4" /> Cases</Button>
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest text-primary">MLC case</p>
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="font-mono text-xl font-semibold">{record.mlcNumber ?? 'Number pending'}</h1>
              <Badge variant={statusVariant(record.status)}>{formatStatus(record.status)}</Badge>
            </div>
            <p className="text-xs text-muted-foreground">ID {record.id} · version {record.version ?? '—'} · updated {formatDateTime(record.updatedAt)}</p>
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          {record.deathRegistrationId ? <Badge variant="success"><Link2 className="mr-1 h-3 w-3" /> Death registration linked</Badge> : <Button variant="outline" size="sm" onClick={() => setLinkOpen(true)}><Link2 className="h-4 w-4" /> Link death registration</Button>}
          {transitionOptions.length > 0 && <Button size="sm" onClick={() => { setTargetStatus(transitionOptions[0]); setTransitionOpen(true) }}>Move case</Button>}
          {['POST_MORTEM_COMPLETED', 'MLR_DRAFTED', 'MLR_ISSUED'].includes(record.status) && <Button size="sm" onClick={doGenerate} loading={generate.isPending}><FileText className="h-4 w-4" /> Generate MLR</Button>}
          {!edit && !isTerminal && record.status !== 'MLR_ISSUED' && <Button variant="outline" size="sm" onClick={beginEdit}><Save className="h-4 w-4" /> Edit case</Button>}
          {edit && <><Button variant="outline" size="sm" onClick={() => setEdit(false)}>Cancel</Button><Button size="sm" onClick={saveChanges} loading={update.isPending}><Save className="h-4 w-4" /> Save changes</Button></>}
          {!isTerminal && record.status !== 'MLR_ISSUED' && <Button variant="ghost" size="sm" onClick={doDiscard} loading={discard.isPending}>Discard</Button>}
        </div>
      </div>
    </header>
    <main className="mx-auto max-w-7xl space-y-5 p-4 sm:p-6">
      {alerts.length > 0 && <section className="space-y-2" aria-label="Active alerts">{alerts.map((alert) => <div key={alert.code} className={`flex items-start gap-3 rounded-lg border px-4 py-3 ${alert.severity === 'CRITICAL' ? 'border-destructive/40 bg-destructive/10' : 'border-warning/40 bg-warning/10'}`}><AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" /><div><p className="text-sm font-medium">{alert.message ?? formatStatus(alert.code)}</p><p className="text-xs text-muted-foreground">{alert.sourceRule ?? alert.code} · raised {formatDateTime(alert.raisedAt)}</p></div></div>)}</section>}
      <nav className="flex gap-1 overflow-x-auto rounded-lg border border-border bg-card p-1" aria-label="Case sections">{(['overview', 'checklist', 'episodes', 'mlr'] as const).map((key) => <button type="button" key={key} onClick={() => setTab(key)} className={`rounded-md px-3 py-2 text-xs font-medium ${tab === key ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:bg-muted'}`}>{key === 'checklist' ? `Legal checklist (${progress.satisfied}/${progress.total})` : key === 'episodes' ? `Episodes (${record.episodes?.length ?? 0})` : key === 'mlr' ? `MLR (${mlrQuery.data?.length ?? 0})` : 'Overview'}</button>)}</nav>
      {tab === 'overview' && <div className="grid grid-cols-1 gap-5 lg:grid-cols-3"><Card className="lg:col-span-2"><CardHeader><CardTitle>Incident details</CardTitle></CardHeader><CardContent>{edit ? <div className="grid grid-cols-1 gap-4 sm:grid-cols-2"><Input label="Incident location" value={incidentLocation} onChange={(event) => setIncidentLocation(event.target.value)} /><Input label="Police station" value={policeStation} onChange={(event) => setPoliceStation(event.target.value)} /><Input label="FIR number" value={firNumber} onChange={(event) => setFirNumber(event.target.value)} /><Input label="Inquest report number" value={inquestReportNumber} onChange={(event) => setInquestReportNumber(event.target.value)} /><div className="sm:col-span-2"><Textarea label="Incident summary" rows={5} value={incidentSummary} onChange={(event) => setIncidentSummary(event.target.value)} /></div></div> : <dl className="grid grid-cols-1 gap-4 sm:grid-cols-2"><Info label="Intake source" value={formatStatus(record.intakeSource)} /><Info label="Nature of incident" value={formatStatus(record.natureOfIncident)} /><Info label="Incident date" value={formatDateTime(record.incidentDateTime)} /><Info label="Location" value={record.incidentLocation} /><Info label="Police station" value={record.policeStation} /><Info label="FIR number" value={record.firNumber} mono /><Info label="Investigating officer" value={record.investigatingOfficer} /><Info label="Inquest report" value={record.inquestReportNumber} mono /><div className="sm:col-span-2"><Info label="Summary" value={record.incidentSummary} /></div></dl>}</CardContent></Card><Card><CardHeader><CardTitle>Legal readiness</CardTitle></CardHeader><CardContent><div className="mb-3 flex items-center justify-between text-sm"><span>Checklist completion</span><strong>{progress.satisfied}/{progress.total}</strong></div><div className="h-2 overflow-hidden rounded-full bg-muted"><div className="h-full rounded-full bg-primary transition-all" style={{ width: `${progress.total ? (progress.satisfied / progress.total) * 100 : 0}%` }} /></div><p className="mt-3 text-xs text-muted-foreground">Required gates are validated by the backend before every transition.</p><Button variant="outline" className="mt-4 w-full" onClick={() => setTab('checklist')}>Review checklist</Button></CardContent></Card></div>}
      {tab === 'checklist' && <ChecklistPanel items={checklist} editable={checklistEditable} onChange={onChecklistChange} dirty={checklistDirty} saving={checklistSaving} onSave={saveChecklist} />}
      {tab === 'episodes' && <EpisodesPanel episodes={edit ? episodes : (record.episodes ?? [])} editable={edit} onChange={setEpisodes} />}
      {tab === 'mlr' && <MlrPanel mlrQuery={mlrQuery} caseVersion={record.version} documents={mlrQuery.data ?? []} onGenerate={doGenerate} generating={generate.isPending} comments={mlrComments} getComment={getComment} setComment={setComment} />}
    </main>
    <Modal open={linkOpen} onClose={() => setLinkOpen(false)} title="Link death registration" description="This enables later conversion from the MLC case into the death-registration workflow." footer={<><Button variant="outline" onClick={() => setLinkOpen(false)}>Cancel</Button><Button onClick={doLinkDeath} loading={linkDeath.isPending}>Link record</Button></>}><Input label="Death registration ID" required placeholder="Paste the death registration id" value={deathRegistrationId} onChange={(event) => setDeathRegistrationId(event.target.value)} /></Modal>
    <Modal open={transitionOpen} onClose={() => setTransitionOpen(false)} title="Move MLC case" description="The backend will enforce the state transition and checklist gates." footer={<><Button variant="outline" onClick={() => setTransitionOpen(false)}>Cancel</Button><Button onClick={doTransition} loading={transition.isPending}>Move case</Button></>}><div className="space-y-4"><Select label="Target status" value={targetStatus} onChange={(event) => setTargetStatus(event.target.value)} options={transitionOptions.map((value) => ({ label: formatStatus(value), value }))} /><Textarea label="Reason (optional)" rows={3} value={reason} onChange={(event) => setReason(event.target.value)} /></div></Modal>
  </div>
}

function Info({ label, value, mono }: { label: string; value?: string | number | null; mono?: boolean }) { return <div><dt className="text-xs font-medium text-muted-foreground">{label}</dt><dd className={`mt-1 text-sm ${mono ? 'font-mono text-xs' : ''}`}>{value || '—'}</dd></div> }

function ChecklistPanel({ items, editable, onChange, dirty, saving, onSave }: {
  items: LegalChecklistItem[]
  editable: boolean
  onChange: (items: LegalChecklistItem[]) => void
  dirty: boolean
  saving: boolean
  onSave: () => void
}) {
  const progress = checklistProgress(items)
  const [newGateCode, setNewGateCode] = useState('')
  const missingGates = KNOWN_CHECKLIST_GATES.filter((gate) => !items.some((item) => item.code === gate.code))

  function addGate() {
    const gate = missingGates.find((candidate) => candidate.code === newGateCode)
    if (!gate) return
    onChange([...items, { code: gate.code, description: gate.description, requiredAtStage: gate.requiredAtStage, mandatory: true, satisfied: false }])
    setNewGateCode('')
  }

  return <Card>
    <CardHeader className="flex-row items-center justify-between">
      <div>
        <CardTitle>Legal checklist and alerts</CardTitle>
        <p className="mt-1 text-xs text-muted-foreground">
          {editable ? 'Check items as evidence is confirmed. Already-satisfied items stay locked.' : 'This case is in a terminal state; checklist is read-only.'}
        </p>
      </div>
      <div className="flex items-center gap-3">
        <Badge variant={progress.complete ? 'success' : 'warning'}>{progress.satisfied}/{progress.total} satisfied</Badge>
        {editable && <Button size="sm" onClick={onSave} disabled={!dirty} loading={saving}><Save className="h-3 w-3" /> Save checklist</Button>}
      </div>
    </CardHeader>
    <CardContent className="space-y-2">
      {editable && missingGates.length > 0 && <div className="mb-3 flex flex-wrap items-end gap-2 rounded-lg border border-dashed border-border p-3">
        <div className="min-w-56 flex-1">
          <Select label="Add a gate not yet on this case" value={newGateCode} onChange={(event) => setNewGateCode(event.target.value)}
            options={[{ label: 'Select a gate…', value: '' }, ...missingGates.map((gate) => ({ label: `${gate.description}${gate.requiredAtStage ? ` — required for ${formatStatus(gate.requiredAtStage)}` : ''}`, value: gate.code }))]} />
        </div>
        <Button variant="outline" size="sm" disabled={!newGateCode} onClick={addGate}><Plus className="h-4 w-4" /> Add gate</Button>
      </div>}
      {items.length === 0 ? <EmptyState title="Checklist not returned" description="Reload the case to retrieve its legal gates." /> : items.map((item, index) => {
        const locked = Boolean(item.satisfied) // already-satisfied items stay read-only
        const checkable = editable && !locked
        return <div key={item.code} className="flex items-start gap-3 rounded-lg border border-border p-3">
          <input
            type="checkbox"
            className="mt-1"
            checked={Boolean(item.satisfied)}
            disabled={!checkable}
            onChange={(event) => onChange(items.map((current, currentIndex) => currentIndex === index ? { ...current, satisfied: event.target.checked } : current))}
          />
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-sm font-medium">{item.description ?? item.code}</span>
              {item.mandatory && <Badge variant="warning">Mandatory</Badge>}
              <Badge variant="secondary">{formatStatus(item.requiredAtStage)}</Badge>
              {locked && <Badge variant="success">Done</Badge>}
            </div>
            <p className="mt-1 font-mono text-[11px] text-muted-foreground">{item.code}</p>
            {item.satisfied && <p className="mt-1 text-xs text-success">Satisfied by {item.satisfiedBy ?? 'operator'} · {formatDateTime(item.satisfiedAt)}</p>}
          </div>
          {editable && <Input className="w-44" placeholder="Evidence ref" value={item.evidenceRef ?? ''} onChange={(event) => onChange(items.map((current, currentIndex) => currentIndex === index ? { ...current, evidenceRef: event.target.value } : current))} />}
        </div>
      })}
    </CardContent>
  </Card>
}

function EpisodesPanel({ episodes, editable, onChange }: { episodes: PatientEpisode[]; editable: boolean; onChange: (episodes: PatientEpisode[]) => void }) {
  return <Card><CardHeader className="flex-row items-center justify-between"><div><CardTitle>Patient assessment and treatment timeline</CardTitle><p className="mt-1 text-xs text-muted-foreground">One MLC can span emergency, inpatient, outpatient and death-registration episodes.</p></div>{editable && <Button variant="outline" size="sm" onClick={() => onChange([...episodes, { episodeId: crypto.randomUUID(), episodeType: 'EMERGENCY', intakeAt: new Date().toISOString() }])}><Plus className="h-4 w-4" /> Add episode</Button>}</CardHeader><CardContent className="space-y-3">{episodes.length === 0 ? <EmptyState title="No episodes linked" description="Add a patient episode when the patient is identified or an encounter is available." /> : episodes.map((episode, index) => <div key={episode.episodeId ?? index} className="rounded-lg border border-border p-4"><div className="mb-3 flex items-center justify-between"><div><Badge variant="info">{formatStatus(episode.episodeType)}</Badge><span className="ml-2 text-xs text-muted-foreground">{episode.episodeId}</span></div>{editable && <Button variant="ghost" size="sm" onClick={() => onChange(episodes.filter((_, currentIndex) => currentIndex !== index))}><Trash2 className="h-4 w-4" /> Remove</Button>}</div>{editable ? <div className="grid grid-cols-1 gap-3 sm:grid-cols-2"><Input label="Patient UHID" value={episode.patientUhid ?? ''} onChange={(event) => onChange(episodes.map((current, currentIndex) => currentIndex === index ? { ...current, patientUhid: event.target.value } : current))} /><Input label="Encounter ID" value={episode.encounterId ?? ''} onChange={(event) => onChange(episodes.map((current, currentIndex) => currentIndex === index ? { ...current, encounterId: event.target.value } : current))} /><Input label="Ward" value={episode.ward ?? ''} onChange={(event) => onChange(episodes.map((current, currentIndex) => currentIndex === index ? { ...current, ward: event.target.value } : current))} /><Input label="Treating doctor" value={episode.treatingDoctorName ?? ''} onChange={(event) => onChange(episodes.map((current, currentIndex) => currentIndex === index ? { ...current, treatingDoctorName: event.target.value } : current))} /><div className="sm:col-span-2"><Textarea label="Assessment / treatment" value={episode.clinicalSummary ?? ''} rows={4} onChange={(event) => onChange(episodes.map((current, currentIndex) => currentIndex === index ? { ...current, clinicalSummary: event.target.value } : current))} /></div></div> : <dl className="grid grid-cols-1 gap-4 sm:grid-cols-4"><Info label="Patient UHID" value={episode.patientUhid} mono /><Info label="Encounter" value={episode.encounterId} mono /><Info label="Ward / bed" value={`${episode.ward ?? '—'}${episode.bed ? ` / ${episode.bed}` : ''}`} /><Info label="Treating doctor" value={episode.treatingDoctorName ?? episode.treatingDoctorId} /><div className="sm:col-span-4"><Info label="Assessment / treatment" value={episode.clinicalSummary} /></div></dl>}</div>)}</CardContent></Card>
}

function MlrPanel({ mlrQuery, caseVersion, documents, onGenerate, generating, comments, getComment, setComment }: {
  mlrQuery: { isError: boolean; error: unknown; refetch: () => void }
  caseVersion?: number
  documents: MlrDocument[]
  onGenerate: () => void
  generating: boolean
  comments: Record<string, string>
  getComment: (documentId: string) => string
  setComment: (documentId: string, value: string) => void
}) {
  if (mlrQuery.isError) {
    return <Card><CardContent><EmptyState title="Unable to load MLR documents" description={getErrorMessage(mlrQuery.error, 'The MLR service could not be reached.')} action={<Button variant="outline" onClick={() => mlrQuery.refetch()}>Try again</Button>} /></CardContent></Card>
  }
  return <Card><CardHeader className="flex-row items-center justify-between"><div><CardTitle>Medico-legal reports</CardTitle><p className="mt-1 text-xs text-muted-foreground">Generate the canonical report from the current case version, then submit it through approval and issue.</p></div><Button onClick={onGenerate} loading={generating} disabled={caseVersion === undefined}><FileText className="h-4 w-4" /> Generate MLR</Button></CardHeader><CardContent className="space-y-4">{documents.length === 0 ? <EmptyState title="No MLR generated" description="Generate a draft when the case reaches post-mortem completed or a later MLC state." /> : documents.map((document) => <div key={document.id} className="rounded-lg border border-border p-4"><div className="flex flex-wrap items-start justify-between gap-3"><div><p className="font-mono text-sm font-semibold">{document.mlrNumber ?? document.id}</p><p className="text-xs text-muted-foreground">Prepared {formatDateTime(document.preparedAt)} by {document.preparedBy ?? '—'}</p></div><Badge variant={statusVariant(document.status)}>{formatStatus(document.status)}</Badge></div><pre className="mt-4 max-h-72 overflow-auto whitespace-pre-wrap rounded-md bg-muted p-3 text-xs leading-relaxed">{document.body ?? 'Report body not returned.'}</pre>{document.rejectionReason && <p className="mt-3 rounded-md bg-destructive/10 p-3 text-sm text-destructive">Rejected: {document.rejectionReason}</p>}<div className="mt-3"><Textarea label="Action comment" rows={2} placeholder="Required for submit, approve, issue, reject, amend and reissue actions" value={getComment(document.id)} onChange={(event) => setComment(document.id, event.target.value)} /></div><MlrActions document={document} comment={getComment(document.id)} clearComment={() => setComment(document.id, '')} /></div>)}</CardContent></Card>
}

function MlrActions({ document, comment, clearComment }: { document: MlrDocument; comment: string; clearComment: () => void }) {
  const submit = useSubmitMlr()
  const approve = useApproveMlr()
  const issue = useIssueMlr()
  const reject = useRejectMlr()
  const amend = useAmendMlr()
  const reissue = useReissueMlr()
  const action = (mutation: { isPending: boolean; mutate: (variables: { id: string; request: { comment: string } }, options: { onSuccess: () => void; onError: (error: unknown) => void }) => void }, label: string) => <Button size="sm" loading={mutation.isPending} onClick={() => {
    if (!comment.trim()) { toast.error('Comment is required'); return }
    mutation.mutate({ id: document.id, request: { comment: comment.trim() } }, {
      onSuccess: () => { toast.success(`MLR ${label.toLowerCase()}`); clearComment() },
      onError: (error) => toast.error(getErrorMessage(error, `Could not ${label.toLowerCase()} MLR`)),
    })
  }}>{label}</Button>
  return <div className="mt-3 flex flex-wrap gap-2">{document.status === 'DRAFT' && action(submit, 'Submit for approval')}{document.status === 'PENDING_APPROVAL' && <>{action(approve, 'Approve')} {action(reject, 'Reject')}</>}{document.status === 'APPROVED' && action(issue, 'Issue')}{document.status === 'REJECTED' && action(amend, 'Amend')}{document.status === 'ISSUED' && action(reissue, 'Reissue')}</div>
}

export default MlcCaseDetailPage
