import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import "https://deno.land/x/xhr@0.1.0/mod.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { jobRole, experienceLevel, industry, questionType, numberOfQuestions } = await req.json();

    const systemPrompt = `You are an expert interviewer. Generate ${numberOfQuestions} unique ${questionType} interview questions for a ${experienceLevel} ${jobRole} position in the ${industry} industry. 

Important: Your response must be a valid JSON array where each question object has these exact fields:
- category: string (Easy/Medium/Hard)
- question: string
- answer: string

Example format:
[
  {
    "category": "Medium",
    "question": "What is...",
    "answer": "A good answer would be..."
  }
]`;

    console.log('Making request to Nebius AI Studio with prompt:', systemPrompt);

    const response = await fetch('https://api.studio.nebius.ai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${Deno.env.get('NEBIUS_API_KEY')}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: "meta-llama/Meta-Llama-3.1-8B-Instruct",
        max_tokens: 2048,
        temperature: 0.7,
        top_p: 0.9,
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: "Generate the interview questions now in the specified JSON format." }
        ],
        extra_body: {
          top_k: 50
        }
      }),
    });

    if (!response.ok) {
      const errorData = await response.text();
      console.error('Nebius API Error:', errorData);
      throw new Error(`Nebius API error: ${response.status} ${errorData}`);
    }

    const data = await response.json();
    console.log('Raw Nebius API Response:', JSON.stringify(data, null, 2));

    let questions;
    try {
      const content = data.choices[0].message.content;
      console.log('AI Response Content:', content);

      // Try to extract JSON from the content
      const jsonMatch = content.match(/\[\s*\{[\s\S]*\}\s*\]/);
      if (!jsonMatch) {
        throw new Error('No JSON array found in response');
      }

      questions = JSON.parse(jsonMatch[0]);

      // Validate the questions format
      if (!Array.isArray(questions)) {
        throw new Error('Response is not an array');
      }

      // Validate and normalize each question
      questions = questions.map((q, index) => {
        if (!q.question || !q.answer) {
          throw new Error(`Question ${index + 1} is missing required fields`);
        }
        return {
          category: q.category || 'Medium',
          question: q.question,
          answer: q.answer
        };
      });

    } catch (error) {
      console.error('Error parsing AI response:', error);
      console.error('Raw content:', data.choices[0].message.content);
      throw new Error(`Failed to parse AI response: ${error.message}`);
    }

    return new Response(JSON.stringify({ questions }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error in generate-questions function:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});