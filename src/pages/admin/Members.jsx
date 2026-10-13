import { useMemo, useState } from 'react';
import { Trash2 } from 'lucide-react';
import { adminApi } from '../../api/admin.api';
import { useAsync } from '../../hooks/useAsync';
import { useSubmit } from '../../hooks/useSubmit';
import { PageHeader } from '../../components/common/Layout';
import { EmptyState, ErrorState, SkeletonList } from '../../components/common/states';
import DataTable from '../../components/common/DataTable';
import SearchBar from '../../components/common/SearchBar';
import Button from '../../components/common/Button';
import { ConfirmDialog } from '../../components/common/Modal';
import { formatDate } from '../../utils/format';

export default function AdminMembers() {
  const state = useAsync(() => adminApi.users(), []);
  const [q, setQ] = useState('');
  const [target, setTarget] = useState(null);
  const del = useSubmit();

  const rows = useMemo(() => {
    const t = q.trim().toLowerCase();
    return (state.data || []).filter((u) => !t || `${u.name} ${u.email} ${u.phone || ''}`.toLowerCase().includes(t));
  }, [state.data, q]);

  const remove = async () => {
    const ok = await del.run(() => adminApi.deleteUser(target.id), { success: 'Member deleted' });
    if (ok) { setTarget(null); state.reload(); }
  };

  const columns = [
    { key: 'name', header: 'Member', primary: true, sortValue: (u) => u.name, render: (u) => <span><span className="font-medium">{u.name}</span><span className="block text-sm text-ink-500">{u.email}</span></span> },
    { key: 'phone', header: 'Phone', render: (u) => u.phone || '-' },
    { key: 'createdAt', header: 'Joined', sortValue: (u) => u.createdAt, render: (u) => formatDate(u.createdAt) },
    { key: 'bookings', header: 'Bookings', sortValue: (u) => u._count?.bookings ?? 0, render: (u) => u._count?.bookings ?? '-' },
    { key: 'actions', header: '', className: 'text-right', render: (u) => <Button size="sm" variant="dangerOutline" icon={Trash2} onClick={() => setTarget(u)}>Delete</Button> },
  ];

  return (
    <>
      <PageHeader title="Members" subtitle="Every registered member on the platform. The API does not limit this list to your gyms." />
      <SearchBar label="Search members" value={q} onChange={setQ} placeholder="Search by name, email or phone" className="mb-4 max-w-md" />
      {state.loading && !state.data ? <SkeletonList /> : state.error && !state.data ? <ErrorState error={state.error} onRetry={state.reload} /> : rows.length === 0 ? <EmptyState title="No members found" /> : <DataTable columns={columns} rows={rows} caption="Members" />}
      <ConfirmDialog open={Boolean(target)} title={`Delete ${target?.name}?`} message="This permanently deletes the member account and cannot be undone. Their booking history may be removed with it." confirmLabel="Delete member" danger loading={del.pending} onConfirm={remove} onClose={() => setTarget(null)} />
    </>
  );
}
