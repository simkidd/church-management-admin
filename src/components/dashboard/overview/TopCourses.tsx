"use client"
import Link from "next/link";

interface ITopCourse {
  courseId: string;
  title: string;
  totalEnrollments: number;
}

export function TopCourses({ data }: { data: ITopCourse[] }) {
  if (!data.length) {
    return (
      <p className="text-sm text-muted-foreground">
        No course data yet
      </p>
    );
  }

  return (
    <div className="space-y-4">
      {data.map((course, index) => (
        <div
          key={course.courseId}
          className="flex items-center justify-between"
        >
          {/* LEFT */}
          <div className="flex items-center gap-3">
            <span className="text-sm font-semibold text-muted-foreground">
              #{index + 1}
            </span>

            <Link
              href={`/dashboard/courses/${course.courseId}`}
              className="text-sm font-medium hover:underline"
            >
              {course.title}
            </Link>
          </div>

          {/* RIGHT */}
          <div className="text-sm text-muted-foreground">
            {course.totalEnrollments} enrollments
          </div>
        </div>
      ))}
    </div>
  );
}