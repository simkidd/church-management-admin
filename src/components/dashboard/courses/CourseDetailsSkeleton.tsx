"use client";

import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export const CourseDetailsSkeleton = () => {
  return (
    <div className="min-h-svh w-full">
      <div className="w-full">
        {/* Header with Actions Skeleton */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <Skeleton className="h-4 w-32" />
            <div className="flex items-center gap-3">
              <Skeleton className="h-9 w-28" />
              <Skeleton className="h-9 w-9" />
            </div>
          </div>

          <div className="flex items-start justify-between">
            <div>
              <Skeleton className="h-8 w-64 mb-2" />
            </div>
          </div>
        </div>

        {/* Main Content Skeleton */}
        <div className="grid lg:grid-cols-4 gap-6">
          {/* Sidebar Stats Skeleton */}
          <div className="lg:col-span-1 space-y-6">
            <Card>
              <CardHeader className="pb-3">
                <Skeleton className="h-4 w-32" />
              </CardHeader>
              <CardContent className="space-y-4">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="flex items-center justify-between">
                    <Skeleton className="h-4 w-20" />
                    <Skeleton className="h-5 w-16" />
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <Skeleton className="h-4 w-20" />
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-3">
                  <Skeleton className="w-10 h-10 rounded-full" />
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-24" />
                    <Skeleton className="h-3 w-32" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Main Content Area Skeleton */}
          <div className="lg:col-span-3">
            <Tabs defaultValue="overview" className="w-full">
              <TabsList className="grid w-full grid-cols-4">
                {["overview", "lessons", "students", "analytics"].map((tab) => (
                  <TabsTrigger key={tab} value={tab} disabled>
                    <Skeleton className="h-4 w-16" />
                  </TabsTrigger>
                ))}
              </TabsList>

              {/* Overview Tab Skeleton */}
              <TabsContent value="overview" className="mt-6">
                <div className="space-y-6">
                  <Card>
                    <CardHeader>
                      <Skeleton className="h-6 w-32" />
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div>
                        <Skeleton className="h-5 w-24 mb-2" />
                        <Skeleton className="h-4 w-full" />
                        <Skeleton className="h-4 w-3/4 mt-1" />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        {[...Array(4)].map((_, i) => (
                          <div key={i}>
                            <Skeleton className="h-4 w-20" />
                            <Skeleton className="h-4 w-16 mt-1" />
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between">
                      <Skeleton className="h-6 w-32" />
                      <Skeleton className="h-8 w-20" />
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        {[...Array(2)].map((_, i) => (
                          <div
                            key={i}
                            className="flex items-center justify-between p-3 bg-muted/50 rounded-lg"
                          >
                            <div className="flex items-center gap-3">
                              <Skeleton className="w-4 h-4 rounded" />
                              <div className="space-y-2">
                                <Skeleton className="h-4 w-32" />
                                <Skeleton className="h-3 w-20" />
                              </div>
                            </div>
                            <Skeleton className="h-5 w-16" />
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>

              {/* Lessons Tab Skeleton */}
              <TabsContent value="lessons" className="mt-6">
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between">
                    <Skeleton className="h-6 w-32" />
                    <Skeleton className="h-9 w-28" />
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {[...Array(3)].map((_, i) => (
                        <div
                          key={i}
                          className="flex items-center justify-between p-4 border rounded-lg"
                        >
                          <div className="flex items-center gap-4 flex-1">
                            <Skeleton className="w-10 h-10 rounded-lg" />
                            <div className="flex-1 space-y-2">
                              <Skeleton className="h-5 w-48" />
                              <div className="flex items-center gap-4">
                                <Skeleton className="h-4 w-20" />
                                <Skeleton className="h-4 w-16" />
                                <Skeleton className="h-5 w-12" />
                              </div>
                            </div>
                          </div>
                          <Skeleton className="h-8 w-8" />
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Students Tab Skeleton */}
              <TabsContent value="students" className="mt-6">
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between">
                    <Skeleton className="h-6 w-40" />
                    <Skeleton className="h-9 w-28" />
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {[...Array(3)].map((_, i) => (
                        <div
                          key={i}
                          className="flex items-center justify-between p-4 border rounded-lg"
                        >
                          <div className="flex items-center gap-4">
                            <Skeleton className="w-10 h-10 rounded-full" />
                            <div className="space-y-2">
                              <Skeleton className="h-4 w-32" />
                              <Skeleton className="h-3 w-40" />
                            </div>
                          </div>
                          <div className="flex items-center gap-3">
                            <Skeleton className="h-5 w-12" />
                            <Skeleton className="h-8 w-20" />
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Analytics Tab Skeleton */}
              <TabsContent value="analytics" className="mt-6">
                <Card>
                  <CardHeader>
                    <Skeleton className="h-6 w-40" />
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
                      {[...Array(4)].map((_, i) => (
                        <div key={i} className="space-y-2">
                          <Skeleton className="h-8 w-12 mx-auto" />
                          <Skeleton className="h-4 w-20 mx-auto" />
                        </div>
                      ))}
                    </div>
                    <div className="mt-6 p-4 bg-muted/50 rounded-lg text-center">
                      <Skeleton className="h-8 w-8 mx-auto mb-2" />
                      <Skeleton className="h-4 w-48 mx-auto" />
                      <Skeleton className="h-9 w-32 mx-auto mt-2" />
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
    </div>
  );
};
