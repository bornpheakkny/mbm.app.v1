/** Progress bar: share of a budget used (red when over) */
export function UsageBar({ used, budget }: { used: number; budget: number }) {
  const pct = budget > 0 ? Math.min(used / budget, 1) : used > 0 ? 1 : 0;
  const over = budget > 0 ? used > budget : used > 0;
  return (
    <div className="usage" title={budget > 0 ? `${Math.round((used / budget) * 100)}% used` : 'No budget'}>
      <div className={`usage__fill ${over ? 'usage__fill--over' : ''}`} style={{ width: `${pct * 100}%` }} />
    </div>
  );
}
