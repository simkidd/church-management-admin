import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { IExam } from "@/interfaces/exam.interface";
import React from "react";

const ExamQuestionsList = ({ exam }: { exam: IExam }) => {
  return (
    <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
      {exam.questions?.map((question, index) => (
        <Card key={question._id} className="overflow-hidden">
          <CardContent>
            <div className="flex justify-between items-start mb-3">
              <div className="flex items-center gap-3">
                <span className="font-medium text-base">Q{index + 1}</span>
                <Badge variant="outline" className="capitalize">
                  {question.type.replace("-", " ")}
                </Badge>
                <Badge variant="secondary">{question.points} pts</Badge>
              </div>
            </div>

            <p className="mb-4 font-medium text-sm leading-relaxed">
              {question.questionText}
            </p>

            {question.type === "mcq" &&
              question.options &&
              question.options.length > 0 && (
                <div className="space-y-3">
                  <label className="text-sm font-medium text-muted-foreground">
                    Options:
                  </label>
                  <div className="space-y-2 mt-2">
                    {question.options.map((option, optIndex) => (
                      <div
                        key={optIndex}
                        className={`p-3 border rounded-md text-sm transition-colors ${
                          option === question.correctAnswer
                            ? "bg-green-50 border-green-300 text-green-900 dark:bg-green-900/20 dark:border-green-700 dark:text-green-100"
                            : "bg-gray-50 text-gray-700 border-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:border-gray-600"
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span className="wrap-break-word pr-2">{option}</span>
                          {option === question.correctAnswer && (
                            <Badge className="bg-green-100 text-green-800 hover:bg-green-100 dark:bg-green-800 dark:text-green-100 dark:hover:bg-green-800 shrink-0">
                              ✓ Correct
                            </Badge>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

            {question.type === "true-false" && (
              <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-md dark:bg-gray-800">
                <label className="text-sm font-medium text-muted-foreground">
                  Correct Answer:
                </label>
                <Badge
                  variant={
                    question.correctAnswer === "true" ? "default" : "secondary"
                  }
                  className="capitalize text-sm"
                >
                  {question.correctAnswer}
                </Badge>
              </div>
            )}

            {question.type === "short-answer" &&
              question.keywords &&
              question.keywords.length > 0 && (
                <div className="space-y-3">
                  <label className="text-sm font-medium text-muted-foreground">
                    Keywords for auto-grading:
                  </label>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {question.keywords.map((keyword, kwIndex) => (
                      <Badge
                        key={kwIndex}
                        variant="outline"
                        className="bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-900/20 dark:text-blue-300 dark:border-blue-700 text-xs py-1"
                      >
                        {keyword}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

            {question.type === "short-answer" &&
              (!question.keywords || question.keywords.length === 0) && (
                <div className="text-sm text-muted-foreground italic bg-yellow-50 p-3 rounded-md border border-yellow-200 dark:bg-yellow-900/20 dark:border-yellow-700 dark:text-yellow-300">
                  ⚠️ This question requires manual grading (no keywords
                  provided)
                </div>
              )}
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default ExamQuestionsList;
