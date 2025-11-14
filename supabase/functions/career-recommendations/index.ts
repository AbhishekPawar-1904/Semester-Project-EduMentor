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
    const { answers, skillScores, streamScores } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');

    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY is not configured');
    }
    
    // Prepare detailed prompt for AI with stream information
    const topStreams = Object.entries(streamScores || {})
      .sort(([, a], [, b]) => (b as number) - (a as number))
      .slice(0, 3)
      .map(([stream]) => stream);
    
    const topSkills = Object.entries(skillScores || {})
      .sort(([, a], [, b]) => (b as number) - (a as number))
      .slice(0, 6)
      .map(([skill]) => skill);

    const prompt = `You are an expert career counselor for Indian students. Based on the assessment results below, recommend 3-5 career paths suitable for government degree college students.

TOP RECOMMENDED STREAMS: ${topStreams.join(', ')}
TOP SKILLS: ${topSkills.join(', ')}

STREAM SCORES (out of 100): ${JSON.stringify(streamScores, null, 2)}
SKILL SCORES (out of 100): ${JSON.stringify(skillScores, null, 2)}

For each career recommendation, provide ONLY a valid JSON array with this exact structure:
[
  {
    "name": "Career Name",
    "match_reason": "2-3 sentences explaining why this career matches their skills and interests",
    "required_skills": ["skill1", "skill2", "skill3"],
    "salary_range": "₹X,XX,XXX - ₹XX,XX,XXX per year",
    "education": "Specific degree requirements (e.g., B.Sc. in Computer Science, B.Com, B.A. in Psychology)"
  }
]

IMPORTANT:
- Focus on careers accessible through government colleges in India
- Match careers to their top streams (${topStreams.join(', ')})
- Consider both traditional and emerging career options
- Provide realistic salary ranges in Indian Rupees
- Mention specific government exams or certifications if relevant
- Return ONLY the JSON array, no additional text`;

    console.log('Calling AI with prompt for streams:', topStreams);

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
            content: 'You are an expert Indian career counselor specializing in government college education pathways. Provide career recommendations in valid JSON format only, with no additional text or markdown.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.7,
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

    console.log('AI response received:', aiResponse.substring(0, 200) + '...');

    // Parse AI response and extract recommendations
    let recommendations;
    try {
      // Remove markdown code blocks if present
      let cleanResponse = aiResponse.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
      
      // Try to extract JSON array from the response
      const jsonMatch = cleanResponse.match(/\[[\s\S]*\]/);
      if (jsonMatch) {
        recommendations = JSON.parse(jsonMatch[0]);
        console.log('Successfully parsed', recommendations.length, 'career recommendations');
      } else {
        throw new Error('No JSON array found in response');
      }
      
      // Validate recommendations structure
      if (!Array.isArray(recommendations) || recommendations.length === 0) {
        throw new Error('Invalid recommendations format');
      }
      
      // Ensure each recommendation has required fields
      recommendations = recommendations.map(rec => ({
        name: rec.name || 'Career Option',
        match_reason: rec.match_reason || 'Matches your profile',
        required_skills: Array.isArray(rec.required_skills) ? rec.required_skills : ['General Skills'],
        salary_range: rec.salary_range || 'Varies',
        education: rec.education || 'Bachelor\'s degree'
      }));
      
    } catch (e) {
      console.error('Failed to parse AI response:', e);
      console.error('Raw response:', aiResponse);
      
      // Fallback: create stream-based recommendations
      const streamBased: any = {
        science: {
          name: "Software Developer / Engineer",
          match_reason: "Your analytical and technical skills align perfectly with software development. This career offers growth in emerging technologies.",
          required_skills: ["Programming", "Problem Solving", "Logical Thinking"],
          salary_range: "₹3,00,000 - ₹12,00,000 per year",
          education: "B.Sc. in Computer Science or B.Tech"
        },
        commerce: {
          name: "Chartered Accountant / Financial Analyst",
          match_reason: "Your business acumen and financial skills make you suitable for accounting and finance careers with excellent growth prospects.",
          required_skills: ["Accounting", "Financial Analysis", "Attention to Detail"],
          salary_range: "₹4,00,000 - ₹15,00,000 per year",
          education: "B.Com with CA or CMA certification"
        },
        arts: {
          name: "Content Writer / Digital Marketing Specialist",
          match_reason: "Your creative and communication skills are valuable in modern digital industries with diverse opportunities.",
          required_skills: ["Writing", "Communication", "Creativity"],
          salary_range: "₹2,50,000 - ₹8,00,000 per year",
          education: "B.A. in English, Mass Communication, or related field"
        }
      };
      
      recommendations = Object.keys(streamScores || {})
        .sort((a, b) => (streamScores[b] || 0) - (streamScores[a] || 0))
        .slice(0, 3)
        .map(stream => streamBased[stream] || streamBased.science);
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
