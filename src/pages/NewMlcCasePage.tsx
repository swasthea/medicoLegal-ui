import { useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { useForm, useFieldArray } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import toast from 'react-hot-toast'
import { ArrowLeft, Plus, Trash2, UserRound } from 'lucide-react'
import { Badge, Button, Card, CardContent, CardHeader, CardTitle, Input, Select, Textarea } from '@/components/ui'
import { useCreateMlc } from '@/entities/mlc'
import { formatStatus, getErrorMessage } from './mlcUtils'

const schema = z.object({
  intakeSource: z.string().min(1, 'Choose an intake source'),
  natureOfIncident: z.string().min(1, 'Choose the incident nature'),
  incidentSummary: z.string().min(10, 'Provide at least 10 characters'),
  incidentDateTime: z.string().optional(),
  incidentLocation: z.string().optional(),
  deceasedUnidentified: z.boolean(),
  episodes: z.array(z.object({
    episodeId: z.string().min(1),
    patientUhid: z.string().optional(),
    patientId: z.string().optional(),
    episodeType: z.string().min(1),
    encounterId: z.string().optional(),
    intakeAt: z.string().optional(),
    ward: z.string().optional(),
    bed: z.string().optional(),
    treatingDoctorId: z.string().optional(),
    treatingDoctorName: z.string().optional(),
    clinicalSummary: z.string().optional(),
  })).default([]),
})

type FormValues = z.input<typeof schema>

const intakeSources = ['EMERGENCY_WARD', 'INPATIENT_WARD', 'BROUGHT_DEAD', 'OUTPATIENT', 'FOLLOW_UP', 'DEATH_REGISTRATION']
const incidentNatures = ['ROAD_TRAFFIC_ACCIDENT', 'FALL', 'ASSAULT', 'BURN', 'POISONING', 'DROWNING', 'HANGING', 'ELECTRIC_SHOCK', 'INDUSTRIAL', 'OTHER']
const episodeTypes = ['EMERGENCY', 'INPATIENT', 'OUTPATIENT', 'DEATH_REGISTRATION']

function nowInput() { return new Date().toISOString().slice(0, 16) }

export function NewMlcCasePage() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const create = useCreateMlc()
  const [step, setStep] = useState(0)
  const { register, control, handleSubmit, watch, formState: { errors } } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { intakeSource: searchParams.get('intakeSource') ?? 'EMERGENCY_WARD', natureOfIncident: 'ROAD_TRAFFIC_ACCIDENT', incidentDateTime: nowInput(), deceasedUnidentified: false, episodes: [] },
  })
  const episodes = useFieldArray({ control, name: 'episodes' })
  const intake = watch('intakeSource')
  const unidentified = watch('deceasedUnidentified')

  function onSubmit(values: FormValues) {
    create.mutate({ ...values, incidentDateTime: values.incidentDateTime ? new Date(values.incidentDateTime).toISOString() : undefined, episodes: values.episodes?.map((episode) => ({ ...episode, intakeAt: episode.intakeAt ? new Date(episode.intakeAt).toISOString() : undefined })) }, {
      onSuccess: (item) => { toast.success('MLC case identified'); navigate(`/medico-legal/cases/${item.id}`) },
      onError: (error) => toast.error(getErrorMessage(error, 'Could not create the MLC case')),
    })
  }

  return <div className="min-h-screen bg-background">
    <header className="border-b border-border bg-card px-4 py-5 sm:px-6"><div className="mx-auto flex max-w-4xl items-center gap-3"><Button variant="ghost" size="sm" onClick={() => navigate('/medico-legal/cases')}><ArrowLeft className="h-4 w-4" /> Back</Button><div><p className="text-xs font-semibold uppercase tracking-widest text-primary">New case</p><h1 className="text-xl font-semibold tracking-tight">Identify and register an MLC</h1><p className="text-xs text-muted-foreground">Capture the incident first; legal gates and registration status are handled by the backend workflow.</p></div></div></header>
    <form onSubmit={handleSubmit(onSubmit)} className="mx-auto max-w-4xl space-y-5 p-4 pb-24 sm:p-6">
      <div className="flex flex-wrap gap-2" aria-label="Form steps">{['Incident', 'Patient episodes', 'Review'].map((label, index) => <button key={label} type="button" onClick={() => setStep(index)} className={`rounded-full px-3 py-1.5 text-xs font-medium ${step === index ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'}`}>{index + 1}. {label}</button>)}</div>
      {step === 0 && <Card><CardHeader><CardTitle>Incident and intake</CardTitle></CardHeader><CardContent className="grid grid-cols-1 gap-4 sm:grid-cols-2"><Select label="Intake source" required options={intakeSources.map((value) => ({ label: formatStatus(value), value }))} {...register('intakeSource')} error={errors.intakeSource?.message} /><Select label="Nature of incident" required options={incidentNatures.map((value) => ({ label: formatStatus(value), value }))} {...register('natureOfIncident')} error={errors.natureOfIncident?.message} /><Input label="Incident date and time" type="datetime-local" {...register('incidentDateTime')} /><Input label="Incident location" placeholder="Where did the incident occur?" {...register('incidentLocation')} /><div className="sm:col-span-2"><Textarea label="Incident summary" required rows={5} placeholder="Describe the event, presenting circumstances and known facts…" {...register('incidentSummary')} error={errors.incidentSummary?.message} /></div><label className="flex items-start gap-3 rounded-lg border border-border p-3 sm:col-span-2"><input type="checkbox" className="mt-1" {...register('deceasedUnidentified')} /><span><span className="block text-sm font-medium">Deceased is currently unidentified</span><span className="block text-xs text-muted-foreground">Allowed for brought-in-dead or emergency intake; identity can be confirmed later.</span></span></label>{intake === 'BROUGHT_DEAD' && <div className="rounded-lg border border-warning/30 bg-warning/10 p-3 text-sm sm:col-span-2"><strong>Brought-in-dead gate:</strong> record the police case number in the legal checklist before moving the case to registered.</div>}{unidentified && <div className="text-xs text-muted-foreground sm:col-span-2">Identification confirmation will remain an MLR issuance gate until it is satisfied.</div>}</CardContent></Card>}
      {step === 1 && <Card><CardHeader className="flex-row items-center justify-between"><div><CardTitle>Patient assessment and treatment episodes</CardTitle><p className="mt-1 text-xs text-muted-foreground">Add ED, inpatient, outpatient and death-registration episodes as the case progresses.</p></div><Button type="button" variant="outline" size="sm" onClick={() => episodes.append({ episodeId: crypto.randomUUID(), episodeType: 'EMERGENCY', intakeAt: nowInput() })}><Plus className="h-4 w-4" /> Add episode</Button></CardHeader><CardContent className="space-y-4">{episodes.fields.length === 0 ? <div className="rounded-lg border border-dashed border-border p-6 text-center text-sm text-muted-foreground"><UserRound className="mx-auto mb-2 h-6 w-6" />No patient episode yet. This is valid for an unidentified brought-in-dead case.</div> : episodes.fields.map((field, index) => <div key={field.id} className="rounded-lg border border-border p-4"><div className="mb-3 flex items-center justify-between"><Badge variant="info">Episode {index + 1}</Badge><Button type="button" variant="ghost" size="sm" onClick={() => episodes.remove(index)}><Trash2 className="h-4 w-4" /> Remove</Button></div><input type="hidden" {...register(`episodes.${index}.episodeId`)} /><div className="grid grid-cols-1 gap-3 sm:grid-cols-2"><Select label="Episode type" options={episodeTypes.map((value) => ({ label: formatStatus(value), value }))} {...register(`episodes.${index}.episodeType`)} /><Input label="Patient UHID" placeholder="Known UHID" {...register(`episodes.${index}.patientUhid`)} /><Input label="Patient ID" {...register(`episodes.${index}.patientId`)} /><Input label="Encounter ID" {...register(`episodes.${index}.encounterId`)} /><Input label="Intake time" type="datetime-local" {...register(`episodes.${index}.intakeAt`)} /><Input label="Ward" {...register(`episodes.${index}.ward`)} /><Input label="Bed" {...register(`episodes.${index}.bed`)} /><Input label="Treating doctor" {...register(`episodes.${index}.treatingDoctorName`)} /><div className="sm:col-span-2"><Textarea label="Assessment and treatment summary" rows={4} placeholder="Clinical findings, interventions and response…" {...register(`episodes.${index}.clinicalSummary`)} /></div></div></div>)}</CardContent></Card>}
      {step === 2 && <Card><CardHeader><CardTitle>Review before identification</CardTitle></CardHeader><CardContent className="space-y-4"><ReviewRow label="Intake source" value={formatStatus(watch('intakeSource'))} /><ReviewRow label="Nature" value={formatStatus(watch('natureOfIncident'))} /><ReviewRow label="Incident" value={watch('incidentSummary')} /><ReviewRow label="Location" value={watch('incidentLocation')} /><ReviewRow label="Identification" value={unidentified ? 'Unidentified at intake' : 'Identified'} /><ReviewRow label="Episodes" value={`${episodes.fields.length} patient episode(s) tracked`} /><p className="rounded-lg bg-muted p-3 text-xs text-muted-foreground">The backend creates the case in <strong>IDENTIFIED</strong> state and seeds the police, FIR, next-of-kin and identity checklist items. Registration, conversion and MLR issuance remain explicit workflow actions.</p></CardContent></Card>}
      <div className="flex flex-wrap justify-between gap-2"><Button type="button" variant="outline" onClick={() => step === 0 ? navigate('/medico-legal/cases') : setStep((current) => current - 1)}>{step === 0 ? 'Cancel' : 'Previous'}</Button><div className="flex gap-2">{step < 2 ? <Button type="button" onClick={() => setStep((current) => current + 1)}>Continue</Button> : <Button type="submit" loading={create.isPending}>Identify MLC case</Button>}</div></div>
    </form>
  </div>
}

function ReviewRow({ label, value }: { label: string; value?: string | number | null }) { return <div className="grid grid-cols-[9rem_1fr] gap-3 border-b border-border pb-3 last:border-0"><dt className="text-xs font-medium text-muted-foreground">{label}</dt><dd className="text-sm">{value || '—'}</dd></div> }
export default NewMlcCasePage
