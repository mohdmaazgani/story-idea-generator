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
    const { genre, theme, characterType, characterName, characterDetails, customPrompt, mode, keywords } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    
    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY is not configured');
    }

    // Mode: 'prompt' for generating prompts, 'story' for generating stories
    if (mode === 'prompt') {
      console.log('Generating story prompt from keywords:', keywords);
      
      const systemPrompt = `You are a creative writing assistant specializing in generating compelling story prompts. Create detailed, inspiring story prompts that spark imagination. Each prompt should be vivid, specific, and give clear direction while leaving room for creativity.

CRITICAL FORMATTING RULES:
- NEVER use asterisks (*) for any formatting
- Use HTML tags for text formatting: <b></b> for bold, <i></i> for italic, <u></u> for underline
- Apply rich formatting for emphasis and style`;
      
      const userPrompt = `Generate an impressive, detailed story writing prompt based on these keywords: "${keywords}"

Create a compelling prompt that includes:
- An intriguing premise or situation
- Potential character dynamics
- Atmospheric setting suggestions
- A hook or conflict to explore

Make it inspiring and specific enough to guide the writer, but open enough for creative interpretation. Keep it between 100-150 words.`;

      const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${LOVABLE_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'google/gemini-2.5-flash',
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: userPrompt }
          ],
        }),
      });

      if (!response.ok) {
        if (response.status === 429) {
          return new Response(
            JSON.stringify({ error: 'Rate limit exceeded. Please try again in a moment.' }), 
            {
              status: 429,
              headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            }
          );
        }
        if (response.status === 402) {
          return new Response(
            JSON.stringify({ error: 'Payment required. Please add credits to continue.' }), 
            {
              status: 402,
              headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            }
          );
        }
        const errorText = await response.text();
        console.error('AI gateway error:', response.status, errorText);
        throw new Error(`AI gateway error: ${response.status}`);
      }

      const data = await response.json();
      const prompt = data.choices[0].message.content;

      console.log('Successfully generated story prompt');

      return new Response(
        JSON.stringify({ prompt }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    // Story generation mode
    console.log('Generating story with:', { genre, theme, characterType, characterName, characterDetails, customPrompt });

    const systemPrompt = `You are a creative storyteller. Write complete, original stories with a beginning, middle, and end. Each story should:
1. Have unique, well-developed characters
2. Include vivid descriptions and settings
3. Build tension and conflict naturally
4. Conclude with a satisfying ending
5. Be engaging and imaginative

Write stories between 400-600 words. 

CRITICAL FORMATTING RULES:
- NEVER use asterisks (*) for any formatting whatsoever
- Use HTML tags for text formatting: <b></b> for bold, <i></i> for italic, <u></u> for underline
- Apply rich formatting throughout the story for emphasis and style
- Make every story completely unique and original`;

    let userPrompt = `Write a complete, original story with these parameters:
Genre: ${genre}
Theme: ${theme}
Character Type: ${characterType}`;

    if (characterName) {
      userPrompt += `\nCharacter Name: ${characterName}`;
    }

    if (characterDetails) {
      userPrompt += `\nCharacter Details: ${characterDetails}`;
    }

    if (customPrompt) {
      userPrompt += `\n\nAdditional Story Direction: ${customPrompt}`;
    }

    userPrompt += `\n\nCreate a fully developed story with unique characters, an engaging plot, and a conclusive ending. Make it vivid and compelling.`;

    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ],
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: 'Rate limit exceeded. Please try again in a moment.' }), 
          {
            status: 429,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: 'Payment required. Please add credits to continue.' }), 
          {
            status: 402,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          }
        );
      }
      const errorText = await response.text();
      console.error('AI gateway error:', response.status, errorText);
      throw new Error(`AI gateway error: ${response.status}`);
    }

    const data = await response.json();
    const storyIdea = data.choices[0].message.content;

    console.log('Successfully generated story idea');

    return new Response(
      JSON.stringify({ storyIdea }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  } catch (error) {
    console.error('Error in generate-story function:', error);
    const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred';
    return new Response(
      JSON.stringify({ error: errorMessage }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});