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

    const client = {
      baseURL: 'https://api.studio.nebius.ai/v1/',
      apiKey: Deno.env.get('NEBIUS_API_KEY'),
    };

    const response = await fetch(`${client.baseURL}/chat/completions`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${client.apiKey}`,
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

    const data = await response.json();
    console.log('AI Response:', data);

    let questions;
    try {
      // Try to parse the AI response as JSON
      questions = JSON.parse(data.choices[0].message.content);
    } catch (e) {
      // If parsing fails, try to extract JSON-like content and parse it
      const content = data.choices[0].message.content;
      const jsonContent = content.substring(
        content.indexOf('['),
        content.lastIndexOf(']') + 1
      );
      questions = JSON.parse(jsonContent);
    }

    return new Response(JSON.stringify({ questions }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});