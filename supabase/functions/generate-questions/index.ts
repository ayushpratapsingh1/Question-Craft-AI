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

    const systemPrompt = `You are an expert interviewer. Generate ${numberOfQuestions} unique ${questionType} interview questions for a ${experienceLevel} ${jobRole} position in the ${industry} industry. For each question, provide:
    1. A difficulty level (Easy/Medium/Hard)
    2. The question itself
    3. A detailed model answer
    Format each question as a JSON object with "category", "question", and "answer" fields.`;

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
          { role: "user", content: "Generate the interview questions now." }
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
    console.log('Nebius API Response:', data);

    let questions;
    try {
      const content = data.choices[0].message.content;
      // Try to parse the content directly first
      try {
        questions = JSON.parse(content);
      } catch {
        // If direct parsing fails, try to extract JSON array
        const jsonMatch = content.match(/\[[\s\S]*\]/);
        if (jsonMatch) {
          questions = JSON.parse(jsonMatch[0]);
        } else {
          throw new Error('Could not extract JSON from response');
        }
      }

      // Validate the questions format
      if (!Array.isArray(questions)) {
        throw new Error('Response is not an array');
      }

      questions = questions.map(q => ({
        category: q.category || 'Medium',
        question: q.question,
        answer: q.answer
      }));

    } catch (error) {
      console.error('Error parsing AI response:', error);
      throw new Error('Failed to parse AI response into proper format');
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