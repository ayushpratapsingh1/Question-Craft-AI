import { useState } from "react";
import { InterviewForm, InterviewFormData } from "@/components/InterviewForm";
import { QuestionCard, Question } from "@/components/QuestionCard";

const generateMockQuestions = (data: InterviewFormData): Question[] => {
  // This is a mock implementation - replace with actual API call
  return Array.from({ length: data.numberOfQuestions }, (_, i) => ({
    category: ["Easy", "Medium", "Hard"][i % 3] as Question["category"],
    question: `Sample ${data.questionType} question ${i + 1} for a ${
      data.experienceLevel
    } ${data.jobRole} in ${data.industry}?`,
    answer: "This is a sample answer that would be replaced with actual content from an API call.",
  }));
};

export default function Index() {
  const [questions, setQuestions] = useState<Question[]>([]);

  const handleFormSubmit = (data: InterviewFormData) => {
    const generatedQuestions = generateMockQuestions(data);
    setQuestions(generatedQuestions);
  };

  return (
    <div className="min-h-screen bg-background py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-foreground mb-2">
            Interview Question Generator
          </h1>
          <p className="text-muted-foreground">
            Generate tailored interview questions based on your requirements
          </p>
        </div>

        <div className="mb-8">
          <InterviewForm onSubmit={handleFormSubmit} />
        </div>

        {questions.length > 0 && (
          <div className="space-y-6">
            <h2 className="text-2xl font-semibold text-center mb-6">
              Generated Questions
            </h2>
            {questions.map((question, index) => (
              <QuestionCard key={index} question={question} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}