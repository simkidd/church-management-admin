export const CourseBuilderSkeleton = () => (
  <div className="space-y-3">
    {[1, 2].map((i) => (
      <div key={i} className="rounded-lg border bg-card p-4 space-y-3">
        <div className="flex items-center gap-3">
          <div className="h-5 w-5 bg-muted rounded" />
          <div className="h-5 w-5 bg-muted rounded" />
          <div className="h-5 w-48 bg-muted rounded" />
        </div>
        <div className="pl-10 space-y-2">
          <div className="h-12 w-full bg-muted rounded" />
          <div className="h-12 w-full bg-muted rounded" />
        </div>
      </div>
    ))}
  </div>
);