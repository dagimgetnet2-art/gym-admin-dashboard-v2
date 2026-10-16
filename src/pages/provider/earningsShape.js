import { asList } from '../../api/client';


export function normalizeEarnings(data) {
  const b = data?.balance || data || {};
  const num = (x) => Number(x ?? 0) || 0;
  return {
    balance: { available: num(b.available), requested: num(b.requested), paid: num(b.paid) },
    ledger: asList(data, 'ledger', 'entries', 'earnings'),
    perGym: asList(data, 'perGym', 'gyms', 'balances').map((g) => ({
      gymId: g.gymId ?? g.gym?.id,
      gymName: g.gymName ?? g.gym?.name ?? `Gym ${g.gymId}`,
      available: num(g.available), requested: num(g.requested), paid: num(g.paid),
    })),
  };
}
