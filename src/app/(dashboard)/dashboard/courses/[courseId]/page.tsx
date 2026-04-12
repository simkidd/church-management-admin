import CourseDetails from "@/components/dashboard/courses/CourseDetails";

const CourseDetailPage = async ({
  params,
}: {
  params: Promise<{ courseId: string }>;
}) => {
  const { courseId } = await params;

  return (
    <div>
      <CourseDetails courseId={courseId} />
    </div>
  );
};

export default CourseDetailPage;
