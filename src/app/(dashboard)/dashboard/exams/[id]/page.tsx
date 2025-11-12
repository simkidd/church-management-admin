import ExamDetails from "@/components/dashboard/exams/ExamDetails";

const ExamDetailsPage = async ({
  params,
}: {
  params: Promise<{ id: string }>;
}) => {
  const { id } = await params;

  return (
    <div className="w-full">
      <ExamDetails id={id} />
    </div>
  );
};

export default ExamDetailsPage;
