import { useMemo, useState } from 'react';
import { Check, UserCheck, XCircle } from 'lucide-react';
import { bookingsApi } from '../../api/bookings.api';
import { useAsync } from '../../hooks/useAsync';
import { useSubmit } from '../../hooks/useSubmit';
import { useToast } from '../../contexts/ToastContext';
import GymGate from '../../components/common/GymGate';
import { PageHeader } from '../../components/common/Layout';
import { EmptyState, ErrorState, SkeletonList } from '../../components/common/states';
import DataTable from '../../components/common/DataTable';
import SearchBar from '../../components/common/SearchBar';
import StatusBadge from '../../components/common/StatusBadge';
import Button from '../../components/common/Button';
import { ConfirmDialog } from '../../components/common/Modal';
import { SelectField } from '../../components/common/Field';
import { formatRange } from '../../utils/format';

const STATUSES = ['pending', 'confirmed', 'checked_in', 'cancelled', 'expired', 'payment_failed'].map((s) => ({ value: s, label: s === 'checked_in' ? 'Attended' : s.replace('_', ' ').replace(/^\w/, (c) => c.toUpperCase()) }));

function Content({ gym }) {
  const toast = useToast();
  const state = useAsync(() => bookingsApi.forGym(gym.id), [gym.id]);
  const [q, setQ] = useState('');
  const [status, setStatus] = useState('');
  const [busy, setBusy] = useState(null);
  const [cancelling, setCancelling] = useState(null);
  const { run } = useSubmit();

  const rows = useMemo(() => {
    const term = q.trim().toLowerCase();
    return (state.data || []).filter((b) => (!status || b.status === status) && (!term || `${b.user?.name} ${b.user?.email} ${b.id}`.toLowerCase().includes(term)));
  }, [state.data, q, status]);

  const act = async (b, fn, success) => {
    setBusy(b.id);
    const ok = await run(fn, { success });
    setBusy(null);
    if (ok) state.reload();
    return ok;
  };

  // Mark attended: prefers the V2 endpoint (feeds streaks/badges); falls back to the documented check-in.
  const attend = (b) => act(b, async () => {
    try {
      await bookingsApi.attend(b.id);
    } catch (e) {
      if (!e.unavailable) throw e;
      await bookingsApi.checkIn(b.id);
      toast.info('Checked in with the basic endpoint. This server does not update streaks yet.');
    }
  }, 'Marked as attended');

  const columns = [
    { key: 'user', header: 'Member', primary: true, sortValue: (b) => b.user?.name || '', render: (b) => <span><span className="font-medium">{b.user?.name || 'Member'}</span><span className="block text-sm text-ink-500">{b.user?.email}</span></span> },
    { key: 'slotStart', header: 'When', sortValue: (b) => b.slotStart, render: (b) => formatRange(b.slotStart, b.slotEnd) },
    { key: 'package', header: 'Package', render: (b) => <span>{b.package?.name || '-'}{b.bookingType === 'GROUP' ? <span className="block text-sm text-ink-500">Group of {b.headcount}</span> : null}</span> },
    { key: 'status', header: 'Status', sortValue: (b) => b.status, render: (b) => <StatusBadge status={b.status} label={b.status === 'checked_in' ? 'attended' : undefined} /> },
    { key: 'payment', header: 'Payment', render: (b) => (b.payment?.status ? <StatusBadge status={b.payment.status} /> : '-') },
    { key: 'actions', header: '', className: 'text-right', render: (b) => (
      <span className="inline-flex flex-wrap justify-end gap-1">
        {b.status === 'pending' && <Button size="sm" variant="ghost" icon={Check} loading={busy === b.id} onClick={() => act(b, () => bookingsApi.confirm(b.id), 'Booking confirmed')}>Confirm</Button>}
      </span>
    ) },
  ];

  return (
    <>
      <PageHeader title="Bookings" subtitle={`Everything booked at ${gym.name}. Attendance feeds member streaks and badges.`} />
      <div className="mb-4 grid gap-3 sm:grid-cols-[1fr_12rem]">
        <SearchBar label="Search bookings" value={q} onChange={setQ} placeholder="Search by member name, email or booking number" />
        <SelectField label="Status" value={status} onChange={(e) => setStatus(e.target.value)} placeholder="All statuses" options={STATUSES} className="[&>label]:sr-only" />
      </div>
      {state.loading && !state.data ? <SkeletonList /> : state.error && !state.data ? <ErrorState error={state.error} onRetry={state.reload} /> : rows.length === 0 ? <EmptyState title="No bookings match" message={state.data?.length ? 'Clear the search or status filter.' : 'Bookings appear here once members book this gym.'} /> : (
        <DataTable columns={columns} rows={rows} caption="Bookings" />
      )}
      <ConfirmDialog open={Boolean(cancelling)} title="Cancel this booking?" message={`This cancels ${cancelling?.user?.name || 'the member'}'s booking and releases the slot. It cannot be undone.`} confirmLabel="Cancel booking" danger loading={busy === cancelling?.id} onClose={() => setCancelling(null)} onConfirm={async () => { if (await act(cancelling, () => bookingsApi.adminCancel(cancelling.id), 'Booking cancelled')) setCancelling(null); }} />
    </>
  );
}

export default function AdminBookings() {
  return <GymGate>{(gym) => <Content gym={gym} />}</GymGate>;
}
