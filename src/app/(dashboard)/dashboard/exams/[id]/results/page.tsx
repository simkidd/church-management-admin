import ExamResults from "@/components/dashboard/exams/ExamResults";

const ExamResultsPage = async ({
  params,
}: {
  params: Promise<{ id: string }>;
}) => {
  const { id } = await params;

  return <ExamResults examId={id} />;
};

export default ExamResultsPage;
