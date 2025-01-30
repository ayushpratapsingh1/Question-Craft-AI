import { useState } from "react";
import { InterviewForm, InterviewFormData } from "@/components/InterviewForm";
import { QuestionCard, Question } from "@/components/QuestionCard";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";

export default function Index() {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleFormSubmit = async (data: InterviewFormData) => {
    setIsLoading(true);
    try {
      const { data: response, error } = await supabase.functions.invoke('generate-questions', {
        body: data,
      });

      if (error) throw error;

      setQuestions(response.questions);
    } catch (error) {
      console.error('Error generating questions:', error);
      toast({
        title: "Error",
        description: "Failed to generate questions. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
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
          <InterviewForm onSubmit={handleFormSubmit} isLoading={isLoading} />
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