
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export const CourseDetailsSkeleton = () => {
  return (
    <div className="w-full space-y-6">
      {/* Top action row */}
      <div className="flex items-center justify-between gap-4">
        <Skeleton className="h-4 w-32" />

        <div className="flex items-center gap-2">
          <Skeleton className="h-10 w-28" />
          <Skeleton className="h-10 w-10" />
        </div>
      </div>

      {/* Header summary */}
      <div className="space-y-3">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-4 w-80 max-w-full" />
      </div>

      {/* Stats row */}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: 4 }).map((_, index) => (
          <Card key={index} className="border-border/60 py-0">
            <CardContent className="p-4 flex items-center gap-3">
              <Skeleton className="h-10 w-10 rounded-lg shrink-0" />
              <div className="space-y-2">
                <Skeleton className="h-3 w-16" />
                <Skeleton className="h-5 w-20" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Tabs */}
      <div className="space-y-6">
        <div className="flex flex-wrap gap-2">
          <Skeleton className="h-10 w-28 rounded-md" />
          <Skeleton className="h-10 w-36 rounded-md" />
          <Skeleton className="h-10 w-40 rounded-md" />
        </div>

        {/* Overview content skeleton */}
        <div className="space-y-6">
          {/* About + instructor */}
          <div className="grid gap-6 xl:grid-cols-[1.35fr_0.95fr]">
            <Card className="border-border/60 overflow-hidden py-0">
              <CardContent className="p-0">
                <div className="border-b bg-muted/30 px-6 py-4 space-y-2">
                  <Skeleton className="h-5 w-36" />
                  <Skeleton className="h-4 w-56" />
                </div>

                <div className="p-6 space-y-3">
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-[92%]" />
                  <Skeleton className="h-4 w-[84%]" />

                  <div className="flex gap-2 pt-2">
                    <Skeleton className="h-6 w-20 rounded-full" />
                    <Skeleton className="h-6 w-20 rounded-full" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-border/60 overflow-hidden py-0">
              <CardContent className="p-0">
                <div className="border-b bg-muted/30 px-6 py-4 space-y-2">
                  <Skeleton className="h-5 w-24" />
                  <Skeleton className="h-4 w-40" />
                </div>

                <div className="p-6">
                  <div className="flex items-start gap-4">
                    <Skeleton className="h-12 w-12 rounded-xl shrink-0" />
                    <div className="space-y-2 flex-1">
                      <Skeleton className="h-5 w-36" />
                      <Skeleton className="h-4 w-48" />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Progression + learning objectives */}
          <div className="grid gap-6 xl:grid-cols-[0.95fr_1.35fr]">
            <Card className="border-border/60 overflow-hidden py-0">
              <CardContent className="p-0">
                <div className="border-b bg-muted/30 px-6 py-4 space-y-2">
                  <Skeleton className="h-5 w-40" />
                  <Skeleton className="h-4 w-56" />
                </div>

                <div className="p-6 space-y-4">
                  <div className="rounded-xl border p-4 space-y-2">
                    <Skeleton className="h-5 w-40" />
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-[85%]" />
                  </div>

                  <div className="space-y-3">
                    <div className="flex gap-3">
                      <Skeleton className="h-5 w-5 rounded-full shrink-0 mt-0.5" />
                      <Skeleton className="h-4 w-full" />
                    </div>
                    <div className="flex gap-3">
                      <Skeleton className="h-5 w-5 rounded-full shrink-0 mt-0.5" />
                      <Skeleton className="h-4 w-[90%]" />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-border/60 overflow-hidden py-0">
              <CardContent className="p-0">
                <div className="border-b bg-muted/30 px-6 py-4 space-y-2">
                  <Skeleton className="h-5 w-36" />
                  <Skeleton className="h-4 w-60" />
                </div>

                <div className="p-6">
                  <div className="grid gap-3 md:grid-cols-2">
                    {Array.from({ length: 6 }).map((_, index) => (
                      <div key={index} className="flex items-start gap-3">
                        <Skeleton className="h-6 w-6 rounded-full shrink-0 mt-0.5" />
                        <Skeleton className="h-4 w-full" />
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Media */}
          <Card className="border-border/60 overflow-hidden py-0">
            <CardContent className="p-0">
              <div className="border-b bg-muted/30 px-6 py-4 space-y-2">
                <Skeleton className="h-5 w-28" />
                <Skeleton className="h-4 w-56" />
              </div>

              <div className="p-6 grid gap-6 lg:grid-cols-2">
                <div className="space-y-3">
                  <Skeleton className="h-5 w-24" />
                  <Skeleton className="aspect-video w-full rounded-2xl" />
                  <Skeleton className="h-3 w-52" />
                </div>

                <div className="space-y-3">
                  <Skeleton className="h-5 w-24" />
                  <Skeleton className="aspect-video w-full rounded-2xl" />
                  <Skeleton className="h-3 w-60" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};