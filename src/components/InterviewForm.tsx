import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export type InterviewFormData = {
  jobRole: string;
  experienceLevel: string;
  industry: string;
  questionType: string;
  numberOfQuestions: number;
};

interface InterviewFormProps {
  onSubmit: (data: InterviewFormData) => void;
}

export function InterviewForm({ onSubmit }: InterviewFormProps) {
  const [formData, setFormData] = useState<InterviewFormData>({
    jobRole: "",
    experienceLevel: "intermediate",
    industry: "",
    questionType: "mixed",
    numberOfQuestions: 5,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-md mx-auto">
      <div className="space-y-2">
        <Label htmlFor="jobRole">Job Role</Label>
        <Input
          id="jobRole"
          placeholder="e.g. Software Engineer"
          value={formData.jobRole}
          onChange={(e) =>
            setFormData({ ...formData, jobRole: e.target.value })
          }
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="experienceLevel">Experience Level</Label>
        <Select
          value={formData.experienceLevel}
          onValueChange={(value) =>
            setFormData({ ...formData, experienceLevel: value })
          }
        >
          <SelectTrigger>
            <SelectValue placeholder="Select experience level" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="beginner">Beginner</SelectItem>
            <SelectItem value="intermediate">Intermediate</SelectItem>
            <SelectItem value="advanced">Advanced</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="industry">Industry</Label>
        <Input
          id="industry"
          placeholder="e.g. Technology"
          value={formData.industry}
          onChange={(e) =>
            setFormData({ ...formData, industry: e.target.value })
          }
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="questionType">Question Type</Label>
        <Select
          value={formData.questionType}
          onValueChange={(value) =>
            setFormData({ ...formData, questionType: value })
          }
        >
          <SelectTrigger>
            <SelectValue placeholder="Select question type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="technical">Technical</SelectItem>
            <SelectItem value="behavioral">Behavioral</SelectItem>
            <SelectItem value="mixed">Mixed</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="numberOfQuestions">Number of Questions</Label>
        <Input
          id="numberOfQuestions"
          type="number"
          min="1"
          max="10"
          value={formData.numberOfQuestions}
          onChange={(e) =>
            setFormData({
              ...formData,
              numberOfQuestions: parseInt(e.target.value),
            })
          }
          required
        />
      </div>

      <Button type="submit" className="w-full">
        Generate Questions
      </Button>
    </form>
  );
}