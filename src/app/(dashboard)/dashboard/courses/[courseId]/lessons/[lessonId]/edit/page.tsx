import EditLessonComp from "@/components/dashboard/courses/EditLessonComp";
import React from "react";

const EditLessonPage = async ({
  params,
}: {
  params: Promise<{ courseId: string; lessonId: string }>;
}) => {
  const { courseId, lessonId } = await params;

  return (
    <div>
      <EditLessonComp courseId={courseId} lessonId={lessonId} />
    </div>
  );
};

export default EditLessonPage;