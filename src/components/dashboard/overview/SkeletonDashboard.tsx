export function SkeletonDashboard() {
  return (
    <div className="space-y-6 animate-pulse">
      <div className="grid grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="h-24 rounded-xl bg-muted" />
        ))}
      </div>

      <div className="grid grid-cols-2 gap-6">
        <div className="h-72 bg-muted rounded-xl" />
        <div className="h-72 bg-muted rounded-xl" />
      </div>
    </div>
  );
}