import AddLessonComp from "@/components/dashboard/courses/AddLessonComp";

const AddLessonPage = async ({
  params,
}: {
  params: Promise<{ courseId: string }>;
}) => {
  const { courseId } = await params;

  return (
    <div>
      <AddLessonComp courseId={courseId} />
    </div>
  );
};

export default AddLessonPage;
