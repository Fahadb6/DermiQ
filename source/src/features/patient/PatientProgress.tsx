import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { ImagePlus, Trash2 } from 'lucide-react';
import type { ProgressPhoto } from '@/types';
import { useI18n } from '@/services/i18n';
import { useDb } from '@/services/db';
import { photosOf, photoUrl } from '@/services/selectors';
import { fromInputs, toDateInput } from '@/utils/dates';
import { fmtDate, photosCount } from '@/utils/format';
import { Badge, Empty, Field, Notice, Segmented } from '@/components/ui/Bits';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { Confirm } from '@/components/ui/Confirm';
import { useNotify } from '@/components/ui/Toast';
import { PhotoCompare, PhotoThumb } from '@/components/domain/Photo';
import { PageTitle, usePatient } from './ui';

const SAMPLE = 'demo/scalp-sample-upload.webp';
const TYPES = ['image/jpeg', 'image/png', 'image/webp'];

/** Downscale in the browser so a phone photo fits comfortably in LocalStorage. */
function downscale(file: File, max = 900): Promise<string> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      const k = Math.min(1, max / Math.max(img.naturalWidth, img.naturalHeight));
      const c = document.createElement('canvas');
      c.width = Math.round(img.naturalWidth * k);
      c.height = Math.round(img.naturalHeight * k);
      const ctx = c.getContext('2d');
      URL.revokeObjectURL(url);
      if (!ctx) return reject(new Error('canvas'));
      ctx.drawImage(img, 0, 0, c.width, c.height);
      resolve(c.toDataURL('image/jpeg', 0.8));
    };
    img.onerror = () => { URL.revokeObjectURL(url); reject(new Error('decode')); };
    img.src = url;
  });
}

export function PatientProgress() {
  const patient = usePatient();
  const { t, L, lang } = useI18n();
  const p = t.pt.progress;
  const db = useDb((s) => s.db);
  const addPhoto = useDb((s) => s.addPhoto);
  const deletePhoto = useDb((s) => s.deletePhoto);
  const notify = useNotify();
  const photos = photosOf(db, patient.id).slice().sort((a, b) => b.takenAt.localeCompare(a.takenAt));
  const [tab, setTab] = useState<'timeline' | 'compare'>('timeline');
  const [adding, setAdding] = useState(false);
  const [viewing, setViewing] = useState<ProgressPhoto | null>(null);
  const [removing, setRemoving] = useState<ProgressPhoto | null>(null);
  const [src, setSrc] = useState('');
  const [date, setDate] = useState(toDateInput(new Date()));
  const [note, setNote] = useState('');
  const [err, setErr] = useState<{ file?: string; date?: string }>({});
  const [busy, setBusy] = useState(false);
  const input = useRef<HTMLInputElement>(null);
  const today = toDateInput(new Date());

  useEffect(() => { if (adding) { setSrc(''); setDate(toDateInput(new Date())); setNote(''); setErr({}); } }, [adding]);

  const pick = async (file: File | undefined) => {
    if (!file) return;
    if (!TYPES.includes(file.type)) { setErr((e) => ({ ...e, file: p.v.type })); return; }
    setBusy(true);
    try { setSrc(await downscale(file)); setErr((e) => ({ ...e, file: undefined })); }
    catch { setErr((e) => ({ ...e, file: p.v.read })); }
    finally { setBusy(false); if (input.current) input.current.value = ''; }
  };
  const save = () => {
    const e: { file?: string; date?: string } = {};
    if (!src) e.file = p.v.file;
    if (!date || date > today) e.date = p.v.date;
    setErr(e);
    if (e.file || e.date) return;
    const r = addPhoto(patient.id, { src, takenAt: fromInputs(date, '12:00').toISOString(), note: note.trim() });
    if (notify.result(r, p.saved)) setAdding(false);
  };
  const canDelete = (x: ProgressPhoto) => x.origin === 'upload' && x.review === 'pending';

  return (
    <>
      <PageTitle title={p.title} lead={p.lead} action={<Button onClick={() => setAdding(true)} icon={<ImagePlus size={18} aria-hidden="true" />} data-testid="add-photo">{p.add}</Button>} />
      <div className="flex flex-wrap items-center justify-between gap-3">
        <Segmented label={p.title} value={tab} onChange={setTab} options={[{ value: 'timeline', label: p.timeline, count: photos.length }, { value: 'compare', label: p.compare }]} />
        <p className="text-[0.8rem] text-stone-700">{photosCount(photos.length, lang)}</p>
      </div>

      {photos.length === 0 ? (
        <Empty title={p.empty} body={p.emptyBody} action={<Button size="sm" onClick={() => setAdding(true)}>{p.add}</Button>} />
      ) : tab === 'compare' ? (
        <div className="mt-5 rounded-2xl bg-white p-4 ring-1 ring-ink/10 sm:p-6"><PhotoCompare photos={photos} /></div>
      ) : (
        <ul className="mt-5 grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-3" data-testid="photo-grid">
          {photos.map((x) => (
            <li key={x.id} className="flex flex-col rounded-2xl bg-white p-2.5 ring-1 ring-ink/10" data-testid={`photo-${x.id}`}>
              <button type="button" onClick={() => setViewing(x)} className="block rounded-xl" aria-label={`${t.a.view} — ${fmtDate(x.takenAt, lang, 'long')}`}><PhotoThumb photo={x} /></button>
              <div className="flex flex-1 flex-col px-1.5 pb-1.5 pt-3">
                <p className="num text-[0.9rem] font-bold">{fmtDate(x.takenAt, lang, 'medium')}</p>
                <Badge tone={x.review === 'reviewed' ? 'ok' : 'warn'} dot className="mt-1.5 self-start">{t.photoReview[x.review]}</Badge>
                {L(x.patientNote) && <p className="mt-2 line-clamp-2 text-[0.8rem] text-stone-700">{L(x.patientNote)}</p>}
              </div>
            </li>
          ))}
        </ul>
      )}

      <Notice className="mt-8">{t.note.photos} {p.privacy}</Notice>
      <p className="mt-5 text-center text-[0.86rem]">
        <Link to="/patient/education/consistent-progress-photos" className="font-semibold text-brand underline-offset-4 hover:underline">{p.tips}</Link>
      </p>

      {/* Photo detail */}
      <Modal open={!!viewing} onClose={() => setViewing(null)} title={viewing ? fmtDate(viewing.takenAt, lang, 'long') : ''} size="lg"
        footer={viewing && canDelete(viewing) ? <Button variant="danger" size="sm" icon={<Trash2 size={16} aria-hidden="true" />} onClick={() => { setRemoving(viewing); setViewing(null); }} data-testid="delete-photo">{p.remove}</Button> : undefined}>
        {viewing && (
          <div className="grid gap-5 sm:grid-cols-2">
            <PhotoThumb photo={viewing} />
            <div className="grid content-start gap-5">
              <Badge tone={viewing.review === 'reviewed' ? 'ok' : 'warn'} dot className="justify-self-start">{t.photoReview[viewing.review]}</Badge>
              <div><h3 className="eyebrow text-stone-700">{p.yourNote}</h3><p className="mt-2 text-[0.95rem]">{L(viewing.patientNote) || t.terms.noNote}</p></div>
              <div className="border-s-2 border-brand ps-4"><h3 className="eyebrow text-brand">{p.physicianNote}</h3><p className="mt-2 text-[0.95rem]">{L(viewing.physicianNote) || p.noPhysicianNote}</p></div>
              {viewing.origin === 'demo' && <p className="text-[0.78rem] text-stone-700">{t.note.synthetic}</p>}
            </div>
          </div>
        )}
      </Modal>

      {/* Add photo */}
      <Modal open={adding} onClose={() => setAdding(false)} title={p.addTitle}
        footer={<><Button variant="ghost" onClick={() => setAdding(false)}>{t.a.cancel}</Button><Button onClick={save} disabled={busy} data-testid="save-photo">{p.save}</Button></>}>
        <div className="grid gap-5">
          <div>
            <div className="flex items-center gap-4">
              <span className="flex h-24 w-24 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-porcelain ring-1 ring-inset ring-ink/10">
                {src ? <img src={photoUrl(src)} alt="" className="h-full w-full object-cover" /> : <ImagePlus size={24} className="text-stone-500" aria-hidden="true" />}
              </span>
              <div className="grid gap-2">
                <input ref={input} type="file" accept={TYPES.join(',')} className="sr-only" id="photo-file" onChange={(e) => pick(e.target.files?.[0])} data-testid="photo-file" />
                <Button variant="outline" size="sm" onClick={() => input.current?.click()} disabled={busy}>{src ? p.change : p.choose}</Button>
                <button type="button" onClick={() => { setSrc(SAMPLE); setErr((e) => ({ ...e, file: undefined })); }} className="text-start text-[0.84rem] font-semibold text-brand underline-offset-4 hover:underline" data-testid="use-sample">{p.sample}</button>
              </div>
            </div>
            <p className="mt-2 text-[0.78rem] text-stone-700">{p.sampleNote}</p>
            <p role="alert" className="min-h-[1.2rem] text-[0.82rem] font-semibold text-bad">{err.file ?? ''}</p>
          </div>
          <Field label={p.date} error={err.date}>
            {(f) => <input id={f.id} type="date" max={today} className="field h-12" value={date} onChange={(e) => setDate(e.target.value)} aria-invalid={f.invalid} aria-describedby={f.describedBy} data-testid="photo-date" />}
          </Field>
          <Field label={p.note} optional>
            {(f) => <textarea id={f.id} rows={3} maxLength={300} className="field py-3" placeholder={p.notePh} value={note} onChange={(e) => setNote(e.target.value)} data-testid="photo-note" />}
          </Field>
          <Notice tone="warn">{p.privacy}</Notice>
        </div>
      </Modal>

      <Confirm open={!!removing} onClose={() => setRemoving(null)} title={p.removeConfirm} body={p.removeBody} confirmLabel={p.remove} danger
        onConfirm={() => { if (removing && notify.result(deletePhoto(removing.id), p.removed)) setRemoving(null); }} />
    </>
  );
}
