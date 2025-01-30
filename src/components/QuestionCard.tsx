import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export interface Question {
  category: "Easy" | "Medium" | "Hard";
  question: string;
  answer: string;
}

interface QuestionCardProps {
  question: Question;
}

export function QuestionCard({ question }: QuestionCardProps) {
  const [showAnswer, setShowAnswer] = useState(false);

  const getDifficultyColor = (category: Question["category"]) => {
    switch (category) {
      case "Easy":
        return "bg-green-500 hover:bg-green-600";
      case "Medium":
        return "bg-yellow-500 hover:bg-yellow-600";
      case "Hard":
        return "bg-red-500 hover:bg-red-600";
      default:
        return "bg-gray-500 hover:bg-gray-600";
    }
  };

  return (
    <Card className="w-full transition-all duration-300 hover:shadow-lg">
      <CardHeader className="flex flex-row items-center justify-between">
        <Badge className={`${getDifficultyColor(question.category)} text-white`}>
          {question.category}
        </Badge>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-lg font-medium">{question.question}</p>
        <div className="space-y-2">
          <Button
            variant="outline"
            onClick={() => setShowAnswer(!showAnswer)}
            className="w-full"
          >
            {showAnswer ? "Hide Answer" : "Show Answer"}
          </Button>
          {showAnswer && (
            <div className="p-4 bg-muted rounded-md">
              <p className="text-sm">{question.answer}</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}