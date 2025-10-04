import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { answers, skillScores } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');

    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY is not configured');
    }

    // Prepare prompt for AI
    const prompt = `Based on the following career assessment results, recommend 3-5 suitable career paths.

Skill Scores: ${JSON.stringify(skillScores, null, 2)}
User Answers: ${JSON.stringify(answers, null, 2)}

For each recommended career, provide:
1. Career name
2. Why it's a good match (2-3 sentences)
3. Key skills required
4. Average salary range
5. Education requirements

Format the response as a JSON array of career recommendations.`;

    console.log('Calling AI with prompt:', prompt);

    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          {
            role: 'system',
            content: 'You are an expert career counselor. Provide thoughtful, personalized career recommendations based on student assessments.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('AI gateway error:', response.status, errorText);
      
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: 'Rate limit exceeded. Please try again later.' }),
          { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: 'AI service requires additional credits.' }),
          { status: 402, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      
      throw new Error(`AI gateway error: ${response.status}`);
    }

    const data = await response.json();
    const aiResponse = data.choices[0].message.content;

    console.log('AI response:', aiResponse);

    // Parse AI response and extract recommendations
    let recommendations;
    try {
      // Try to extract JSON from the response
      const jsonMatch = aiResponse.match(/\[[\s\S]*\]/);
      if (jsonMatch) {
        recommendations = JSON.parse(jsonMatch[0]);
      } else {
        // Fallback: create structured recommendations from text
        recommendations = [{
          name: "Data Analyst",
          match_reason: "Based on your analytical skills and problem-solving abilities.",
          required_skills: ["Data Analysis", "Statistics", "SQL"],
          salary_range: "$60,000 - $90,000",
          education: "Bachelor's degree in related field"
        }];
      }
    } catch (e) {
      console.error('Failed to parse AI response:', e);
      recommendations = [{
        name: "General Career Guidance",
        match_reason: "We recommend exploring various career options based on your skills.",
        required_skills: ["Communication", "Problem Solving"],
        salary_range: "Varies by field",
        education: "Varies by career"
      }];
    }

    return new Response(
      JSON.stringify({ recommendations }),
      { 
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );

  } catch (error) {
    console.error('Error in career-recommendations:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Internal server error' }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});
