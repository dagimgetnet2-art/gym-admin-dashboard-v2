import { gymsApi } from '../../api/gyms.api';
import { useAsync } from '../../hooks/useAsync';
import { useAuth } from '../../contexts/AuthContext';
import { Card, InfoRow, PageHeader } from '../../components/common/Layout';
import { EmptyState, ErrorState, SkeletonList } from '../../components/common/states';
import { ClipboardList } from 'lucide-react';
import { GymPhoto } from '../../components/common/GymParts';

export default function StaffDashboard() {
  const { user } = useAuth();
  const gym = useAsync(() => gymsApi.get(user.gymId), [user.gymId], { enabled: Boolean(user.gymId) });
  return (
    <>
      <PageHeader title={`Welcome, ${user.name?.split(' ')[0]}`} subtitle="Your staff account and gym." />
      <div className="grid gap-6 lg:grid-cols-2">
        <Card title="Your account">
          <dl className="divide-y divide-ink-100">
            <InfoRow label="Name">{user.name}</InfoRow>
            <InfoRow label="Email">{user.email}</InfoRow>
            <InfoRow label="Phone">{user.phone}</InfoRow>
          </dl>
        </Card>
        <Card title="Your gym" padded={false}>
          <div className="p-5">
            {!user.gymId ? <p className="text-ink-500">No gym is linked to this account.</p> : gym.loading && !gym.data ? <SkeletonList rows={1} /> : gym.error ? <ErrorState error={gym.error} onRetry={gym.reload} title="Gym details are not available to staff accounts" /> : (
              <div className="overflow-hidden rounded-md">
                <GymPhoto photos={gym.data.photos} name={gym.data.name} className="h-32" />
                <p className="mt-3 text-xl font-medium">{gym.data.name}</p>
                <p className="text-sm text-ink-500">{gym.data.address}</p>
                <p className="text-sm text-ink-600">Open {gym.data.openingTime} - {gym.data.closingTime}</p>
              </div>
            )}
          </div>
        </Card>
      </div>
      <div className="mt-6">
        <EmptyState icon={ClipboardList} title="Attendance tools are not enabled for staff yet" message="The backend only lets gym admins view bookings and mark attendance. When staff permissions are added to the API, those pages can be built here." />
      </div>
    </>
  );
}
