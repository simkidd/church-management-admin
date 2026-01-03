import QuizPageComp from "@/components/dashboard/courses/quiz/QuizPageComp";
import React from "react";

const QuizPage = async ({
  params,
}: {
  params: Promise<{ quizId: string }>;
}) => {
  const { quizId } = await params;

  return (
    <div>
      <QuizPageComp quizId={quizId} />
    </div>
  );
};

export default QuizPage;
