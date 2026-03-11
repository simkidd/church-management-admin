"use client";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { ICourse } from "@/interfaces/course.interface";
import {
  BookOpen,
  CheckCircle2,
  ChevronRight,
  FileImage,
  GraduationCap,
  Lock,
  Unlock,
  Video,
} from "lucide-react";
import Image from "next/image";

interface OverviewTabProps {
  course: ICourse;
}

export const CourseDetailsOverviewTab = ({ course }: OverviewTabProps) => {
  const instructorName = course.instructor
    ? typeof course.instructor === "string"
      ? "Unknown Instructor"
      : `${course.instructor.firstName} ${course.instructor.lastName}`
    : "No Instructor Assigned";

  const instructorEmail =
    course.instructor && typeof course.instructor !== "string"
      ? course.instructor.email
      : null;

  const isSequential = course.progressionMode === "sequential";

  return (
    <div className="space-y-6">
      <div className="grid gap-6 xl:grid-cols-[1.35fr_0.95fr]">
        {/* About Course */}
        <Card className="border-border/60 overflow-hidden py-0">
          <CardContent className="p-0">
            <div className="border-b bg-muted/30 px-6 py-4">
              <div className="flex items-center gap-2">
                <BookOpen className="h-5 w-5 text-primary" />
                <h2 className="text-lg font-semibold">About Course</h2>
              </div>
              <p className="text-sm text-muted-foreground mt-1">
                A short overview of this course for learners and admins.
              </p>
            </div>

            <div className="p-6 space-y-5">
              <p className="text-sm md:text-[15px] leading-7 text-foreground">
                {course.description}
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Instructor */}
        <Card className="border-border/60 overflow-hidden py-0">
          <CardContent className="p-0">
            <div className="border-b bg-muted/30 px-6 py-4">
              <div className="flex items-center gap-2">
                <GraduationCap className="h-5 w-5 text-primary" />
                <h2 className="text-lg font-semibold">Instructor</h2>
              </div>
              <p className="text-sm text-muted-foreground mt-1">
                The assigned course facilitator.
              </p>
            </div>

            <div className="p-6">
              <div className="flex items-start gap-4">
                <div className="h-12 w-12 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
                  <GraduationCap className="h-5 w-5" />
                </div>

                <div className="min-w-0">
                  <p className="font-semibold text-base">{instructorName}</p>
                  {instructorEmail && (
                    <p className="text-sm text-muted-foreground mt-1 break-all">
                      {instructorEmail}
                    </p>
                  )}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 xl:grid-cols-[0.95fr_1.35fr]">
        {/* Progression Mode */}
        <Card className="border-border/60 overflow-hidden py-0">
          <CardContent className="p-0">
            <div className="border-b bg-muted/30 px-6 py-4">
              <div className="flex items-center gap-2">
                {isSequential ? (
                  <Lock className="h-5 w-5 text-primary" />
                ) : (
                  <Unlock className="h-5 w-5 text-primary" />
                )}
                <h2 className="text-lg font-semibold">Progression Mode</h2>
              </div>
              <p className="text-sm text-muted-foreground mt-1">
                Defines how learners move through the course.
              </p>
            </div>

            <div className="p-6 space-y-4">
              <div className="rounded-xl border bg-background p-4">
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <p className="font-semibold">
                      {isSequential ? "Sequential Learning" : "Free Learning"}
                    </p>
                    <p className="text-sm text-muted-foreground mt-1">
                      {isSequential
                        ? "Students complete lessons in order."
                        : "Students can open lessons in any order."}
                    </p>
                  </div>

                  <Badge variant={isSequential ? "secondary" : "default"}>
                    {isSequential ? "Locked Flow" : "Open Flow"}
                  </Badge>
                </div>
              </div>

              <div className="space-y-2">
                <ProgressionPoint
                  active={isSequential}
                  text="Best for structured training and step-by-step learning."
                />
                <ProgressionPoint
                  active={!isSequential}
                  text="Best for flexible study, archives, and self-paced access."
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* What You'll Learn */}
        {course.learningObjectives && course.learningObjectives.length > 0 ? (
          <Card className="border-border/60 overflow-hidden py-0">
            <CardContent className="p-0">
              <div className="border-b bg-muted/30 px-6 py-4">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-5 w-5 text-primary" />
                  <h2 className="text-lg font-semibold">
                    What You&apos;ll Learn
                  </h2>
                </div>
                <p className="text-sm text-muted-foreground mt-1">
                  Key outcomes learners should gain from this course.
                </p>
              </div>

              <div className="p-6">
                <ul className="grid gap-3 md:grid-cols-2">
                  {course.learningObjectives.map((objective, index) => (
                    <li key={index} className="flex items-start gap-3">
                      <div className="mt-0.5 h-6 w-6 rounded-full bg-primary/10 text-primary flex items-center justify-center shrink-0">
                        <CheckCircle2 className="h-3.5 w-3.5" />
                      </div>
                      <span className="text-sm leading-6 text-foreground">
                        {objective}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            </CardContent>
          </Card>
        ) : null}
      </div>

      {/* Media */}
      <Card className="border-border/60 overflow-hidden py-0">
        <CardContent className="p-0">
          <div className="border-b bg-muted/30 px-6 py-4">
            <h2 className="text-lg font-semibold">Media Assets</h2>
            <p className="text-sm text-muted-foreground mt-1">
              Visual assets used on the public course page.
            </p>
          </div>

          <div className="p-6 grid gap-6 lg:grid-cols-2">
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <FileImage className="h-4 w-4 text-primary" />
                <h3 className="font-medium">Thumbnail</h3>
              </div>

              {course.thumbnail?.url ? (
                <div className="rounded-2xl overflow-hidden border bg-muted">
                  <div className="relative aspect-video">
                    <Image
                      src={course.thumbnail.url}
                      alt={`${course.title} thumbnail`}
                      fill
                      className="object-cover"
                      sizes="(max-width: 1024px) 100vw, 50vw"
                    />
                  </div>
                </div>
              ) : (
                <div className="rounded-2xl border border-dashed bg-muted/30 aspect-video flex items-center justify-center text-sm text-muted-foreground">
                  No thumbnail uploaded
                </div>
              )}

              <p className="text-xs text-muted-foreground">
                Used on course listings and course header previews.
              </p>
            </div>

            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Video className="h-4 w-4 text-primary" />
                <h3 className="font-medium">Intro Video</h3>
              </div>

              {course.introVideo?.url ? (
                <div className="rounded-2xl overflow-hidden border bg-black">
                  <video
                    src={course.introVideo.url}
                    controls
                    className="w-full aspect-video"
                  />
                </div>
              ) : (
                <div className="rounded-2xl border border-dashed bg-muted/30 aspect-video flex items-center justify-center text-sm text-muted-foreground">
                  No intro video uploaded
                </div>
              )}

              <p className="text-xs text-muted-foreground">
                Displayed on the course details page before learners begin.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

const ProgressionPoint = ({
  text,
  active,
}: {
  text: string;
  active?: boolean;
}) => {
  return (
    <div className="flex items-start gap-2.5">
      <div
        className={`mt-0.5 h-5 w-5 rounded-full flex items-center justify-center shrink-0 ${
          active
            ? "bg-primary/10 text-primary"
            : "bg-muted text-muted-foreground"
        }`}
      >
        <ChevronRight className="h-3.5 w-3.5" />
      </div>
      <p
        className={`text-sm leading-6 ${
          active ? "text-foreground" : "text-muted-foreground"
        }`}
      >
        {text}
      </p>
    </div>
  );
};
