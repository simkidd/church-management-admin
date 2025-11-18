import ExamForm from "@/components/dashboard/exams/ExamForm";

const CreateExamPage = async ({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) => {
  const searchParamsObj = await searchParams;

  return <ExamForm searchParams={searchParamsObj} />;
};

export default CreateExamPage;
