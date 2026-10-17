import { useMemo, useState } from 'react';
import { adminApi } from '../../api/admin.api';
import { useAsync } from '../../hooks/useAsync';
import { PageHeader } from '../../components/common/Layout';
import { EmptyState, ErrorState, SkeletonList } from '../../components/common/states';
import DataTable from '../../components/common/DataTable';
import SearchBar from '../../components/common/SearchBar';
import { formatDate } from '../../utils/format';

export default function AdminMembers() {
  const state = useAsync(() => adminApi.users(), []);
  const [q, setQ] = useState('');

  const rows = useMemo(() => {
    const t = q.trim().toLowerCase();
    return (state.data || []).filter((u) => !t || `${u.name} ${u.email} ${u.phone || ''}`.toLowerCase().includes(t));
  }, [state.data, q]);



  const columns = [
    { key: 'name', header: 'Member', primary: true, sortValue: (u) => u.name, render: (u) => <span><span className="font-medium">{u.name}</span><span className="block text-sm text-ink-500">{u.email}</span></span> },
    { key: 'phone', header: 'Phone', render: (u) => u.phone || '-' },
    { key: 'createdAt', header: 'Joined', sortValue: (u) => u.createdAt, render: (u) => formatDate(u.createdAt) },
    { key: 'bookings', header: 'Bookings', sortValue: (u) => u._count?.bookings ?? 0, render: (u) => u._count?.bookings ?? '-' },
  ];

  return (
    <>
      <PageHeader title="Members" subtitle=" members." />
      <SearchBar label="Search members" value={q} onChange={setQ} placeholder="Search by name, email or phone" className="mb-4 max-w-md" />
      {state.loading && !state.data ? <SkeletonList /> : state.error && !state.data ? <ErrorState error={state.error} onRetry={state.reload} /> : rows.length === 0 ? <EmptyState title="No members found" /> : <DataTable columns={columns} rows={rows} caption="Members" />}
    </>
  );
}
