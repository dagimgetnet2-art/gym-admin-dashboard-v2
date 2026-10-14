import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Pencil, Plus } from 'lucide-react';
import MapPicker from '../../components/common/MapPicker';
import { gymsApi } from '../../api/gyms.api';
import { useAdminGym } from '../../contexts/AdminGymContext';
import { useSubmit } from '../../hooks/useSubmit';
import { PageHeader } from '../../components/common/Layout';
import { EmptyState, ErrorState, SkeletonGrid } from '../../components/common/states';
import { GymPhoto } from '../../components/common/GymParts';
import Modal from '../../components/common/Modal';
import Button from '../../components/common/Button';
import StatusBadge from '../../components/common/StatusBadge';
import { TextArea, TextField } from '../../components/common/Field';
import { collect, isUrl, numberInRange, required } from '../../utils/validators';
import { splitCsv } from '../../utils/format';

const TIME = /^([01]\d|2[0-3]):[0-5]\d$/;

function GymForm({ gym, onClose, onSaved }) {
  const editing = Boolean(gym);
  const [v, setV] = useState({
    name: gym?.name || '', address: gym?.address || '', latitude: gym?.latitude ?? '', longitude: gym?.longitude ?? '',
    openingTime: gym?.openingTime || '06:00', closingTime: gym?.closingTime || '22:00', capacity: gym?.capacity ?? '',
    photos: (gym?.photos || []).join('\n'), amenities: (gym?.amenities || []).join(', '),
  });
  const [errors, setErrors] = useState({});
  const { run, pending, error, fieldErrors } = useSubmit();
  const set = (k) => (e) => setV((x) => ({ ...x, [k]: e.target.value }));
  const err = (k) => errors[k] || fieldErrors[k];

  const submit = async (e) => {
    e.preventDefault();
    const photos = v.photos.split('\n').map((s) => s.trim()).filter(Boolean);
    const found = collect({
      name: () => required(v.name, 'Name'),
      address: () => required(v.address, 'Address'),
      latitude: () => numberInRange(v.latitude, { min: -90, max: 90, label: 'Latitude' }),
      longitude: () => numberInRange(v.longitude, { min: -180, max: 180, label: 'Longitude' }),
      openingTime: () => (TIME.test(v.openingTime) ? null : 'Use HH:mm.'),
      closingTime: () => (!TIME.test(v.closingTime) ? 'Use HH:mm.' : v.closingTime <= v.openingTime ? 'Closing must be after opening.' : null),
      capacity: () => numberInRange(v.capacity, { min: 1, integer: true, label: 'Capacity' }),
      photos: () => (photos.every(isUrl) ? null : 'Every photo must be a full http(s) link, one per line.'),
    });
    setErrors(found);
    if (Object.keys(found).length) return;
    const body = {
      name: v.name.trim(), address: v.address.trim(), latitude: Number(v.latitude), longitude: Number(v.longitude),
      openingTime: v.openingTime, closingTime: v.closingTime, capacity: Number(v.capacity), photos, amenities: splitCsv(v.amenities),
    };
    const ok = await run(() => (editing ? gymsApi.update(gym.id, body) : gymsApi.create(body)), { success: editing ? 'Gym updated' : 'Gym created' });
    if (ok) { onSaved(); onClose(); }
  };
  const pick = async (lat, lng) => {
  setV((x) => ({ ...x, latitude: String(lat), longitude: String(lng) }));
  if (v.address.trim()) return;
  try {
    const r = await fetch(`https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${lat}&lon=${lng}`);
    const j = await r.json();
    if (j.display_name) setV((x) => (x.address.trim() ? x : { ...x, address: j.display_name }));
  } catch { /* the address can be typed by hand */ }
};

  return (
    <Modal open onClose={onClose} title={editing ? `Edit ${gym.name}` : 'New gym'} size="lg" locked={pending} footer={<><Button variant="secondary" onClick={onClose} disabled={pending}>Cancel</Button><Button onClick={submit} loading={pending}>{editing ? 'Save changes' : 'Create gym'}</Button></>}>
      <form onSubmit={submit} noValidate className="grid gap-4 sm:grid-cols-2">
        <TextField className="sm:col-span-2" label="Gym name" value={v.name} onChange={set('name')} error={err('name')} required />
        <TextField className="sm:col-span-2" label="Address" value={v.address} onChange={set('address')} error={err('address')} required />
        <div className="sm:col-span-2"><MapPicker lat={v.latitude} lng={v.longitude} onPick={pick} /></div>
        <TextField label="Latitude" type="number" step="any" value={v.latitude} onChange={set('latitude')} error={err('latitude')} required />
        <TextField label="Longitude" type="number" step="any" value={v.longitude} onChange={set('longitude')} error={err('longitude')} required />
        <TextField label="Opens" type="time" value={v.openingTime} onChange={set('openingTime')} error={err('openingTime')} required />
        <TextField label="Closes" type="time" value={v.closingTime} onChange={set('closingTime')} error={err('closingTime')} required />
        <TextField label="Capacity" type="number" min="1" value={v.capacity} onChange={set('capacity')} error={err('capacity')} hint="People allowed at the same time." required />
        <TextField label="Amenities" value={v.amenities} onChange={set('amenities')} hint="Comma separated, e.g. Showers, Parking." />
        <TextArea className="sm:col-span-2" label="Photo links" rows={3} value={v.photos} onChange={set('photos')} error={err('photos')} hint="One image link per line. Uploads are not supported." />
        {error && <p role="alert" className="text-sm text-red-600 sm:col-span-2">{error.message}</p>}
      </form>
    </Modal>
  );
}

export default function AdminGyms() {
  const { gyms, loading, error, reload, gym: active, selectGym } = useAdminGym();
  const [form, setForm] = useState(null); // null | 'new' | gym

  return (
    <>
      <PageHeader title="Gyms" subtitle="Gyms you own. Use the switcher in the top bar to choose which one the other pages show." actions={<Button icon={Plus} onClick={() => setForm('new')}>New gym</Button>} />
      {loading && !gyms.length ? <SkeletonGrid count={3} /> : error && !gyms.length ? <ErrorState error={error} onRetry={reload} /> : gyms.length === 0 ? (
        <EmptyState title="No gyms yet" message="Create your first gym to start adding packages and accepting bookings." action={<Button icon={Plus} onClick={() => setForm('new')}>Create a gym</Button>} />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {gyms.map((g) => (
            <article key={g.id} className={`card overflow-hidden ${active?.id === g.id ? 'ring-2 ring-brand/30' : ''}`}>
              <GymPhoto photos={g.photos} name={g.name} />
              <div className="p-4">
                <div className="flex items-start justify-between gap-2"><h2 className="text-xl">{g.name}</h2><StatusBadge status={g.isActive ? 'active' : 'inactive'} /></div>
                <p className="text-sm text-ink-500">{g.address}</p>
                <p className="mt-1 text-sm text-ink-600">{g.openingTime} - {g.closingTime} · capacity {g.capacity} · {g._count?.bookings ?? 0} bookings</p>
                <div className="mt-4 flex flex-wrap gap-2">
                  <Button size="sm" variant="secondary" icon={Pencil} onClick={() => setForm(g)}>Edit</Button>
                  {active?.id !== g.id && <Button size="sm" variant="ghost" onClick={() => selectGym(g.id)}>Work on this gym</Button>}
                  <Button as={Link} to="/admin/packages" size="sm" variant="ghost" onClick={() => selectGym(g.id)}>Packages</Button>
                </div>
              </div>
            </article>
          ))}
        </div>
      )}
      {form && <GymForm gym={form === 'new' ? null : form} onClose={() => setForm(null)} onSaved={reload} />}
    </>
  );
}
