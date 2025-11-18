import ExamPreview from "@/components/dashboard/exams/ExamPreview";

const ExamPreviewPage = async ({
  params,
}: {
  params: Promise<{ id: string }>;
}) => {
  const { id } = await params;

  return <ExamPreview examId={id} />;
};

export default ExamPreviewPage;
