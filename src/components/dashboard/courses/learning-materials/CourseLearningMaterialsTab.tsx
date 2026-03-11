"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { EmptyState } from "@/components/shared/EmptyState";
import { ICourse } from "@/interfaces/course.interface";
import { IModuleWithState } from "@/interfaces/module.interface";
import { Files, FileText, Video, Headphones } from "lucide-react";

interface CourseLearningMaterialsTabProps {
  course: ICourse;
  modules: IModuleWithState[];
  loading?: boolean;
}

const CourseLearningMaterialsTab = ({
  modules,
  loading,
}: CourseLearningMaterialsTabProps) => {
  const lessons = modules.flatMap((module) => module.lessons || []);

  const articleLessons = lessons.filter((lesson) => lesson.type === "article");
  const audioLessons = lessons.filter((lesson) => lesson.type === "audio");
  const videoLessons = lessons.filter((lesson) => lesson.type === "video");

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6 text-sm text-muted-foreground">
          Loading learning materials...
        </CardContent>
      </Card>
    );
  }

  if (!lessons.length) {
    return (
      <EmptyState
        icon={Files}
        title="No learning materials yet"
        description="Add modules and lessons to start organizing your course materials."
      />
    );
  }

  return (
    <div className="grid gap-6 md:grid-cols-3">
      <Card className="border-border/60">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Video className="h-4 w-4" />
            Video Lessons
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-3xl font-bold">{videoLessons.length}</p>
          <p className="text-sm text-muted-foreground mt-1">
            Teaching videos available in this course
          </p>
        </CardContent>
      </Card>

      <Card className="border-border/60">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Headphones className="h-4 w-4" />
            Audio Lessons
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-3xl font-bold">{audioLessons.length}</p>
          <p className="text-sm text-muted-foreground mt-1">
            Audio-based materials available
          </p>
        </CardContent>
      </Card>

      <Card className="border-border/60">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <FileText className="h-4 w-4" />
            Reading Materials
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-3xl font-bold">{articleLessons.length}</p>
          <p className="text-sm text-muted-foreground mt-1">
            Article and text study materials
          </p>
        </CardContent>
      </Card>

      <Card className="md:col-span-3 border-border/60">
        <CardHeader>
          <CardTitle className="text-base">Materials by Module</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {modules.map((module) => {
            const moduleLessons = module.lessons || [];
            const videos = moduleLessons.filter(
              (lesson) => lesson.type === "video",
            ).length;
            const audios = moduleLessons.filter(
              (lesson) => lesson.type === "audio",
            ).length;
            const articles = moduleLessons.filter(
              (lesson) => lesson.type === "article",
            ).length;

            return (
              <div
                key={module._id}
                className="rounded-lg border p-4 flex flex-col gap-2 md:flex-row md:items-center md:justify-between"
              >
                <div>
                  <p className="font-medium">{module.title}</p>
                  <p className="text-sm text-muted-foreground">
                    {moduleLessons.length} lesson
                    {moduleLessons.length === 1 ? "" : "s"}
                  </p>
                </div>

                <div className="flex flex-wrap gap-2 text-xs text-muted-foreground">
                  <span className="rounded-md bg-muted px-2 py-1">
                    {videos} video
                  </span>
                  <span className="rounded-md bg-muted px-2 py-1">
                    {audios} audio
                  </span>
                  <span className="rounded-md bg-muted px-2 py-1">
                    {articles} article
                  </span>
                </div>
              </div>
            );
          })}
        </CardContent>
      </Card>
    </div>
  );
};

export default CourseLearningMaterialsTab;
