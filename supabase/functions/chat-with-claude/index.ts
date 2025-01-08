import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const ANTHROPIC_API_KEY = Deno.env.get('ANTHROPIC_API_KEY')

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    if (!ANTHROPIC_API_KEY) {
      throw new Error('ANTHROPIC_API_KEY is not set')
    }

    const { message, context } = await req.json()
    console.log('Received message:', message)
    console.log('Context:', context)

    const systemPrompt = `You are a helpful assistant guiding users through creating marketplace listings. 
    ${context === 'generate_listing' ? `Based on the user's answers, create a structured listing with:
    - A clear, SEO-friendly title
    - A well-written, detailed description that highlights key features
    - Suggested price range based on minimum and ideal prices provided
    Format the response as JSON with fields: title, description, price, isNegotiable` : 
    `Ask one question at a time about their item in this order:
    1. What are you selling? (Get a basic description)
    2. What's the minimum price you'd accept?
    3. What's your ideal selling price?
    4. Any specific details about condition or features?
    Keep responses friendly and concise.`}`

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'x-api-key': ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01',
        'content-type': 'application/json',
      },
      body: JSON.stringify({
        model: 'claude-3-opus-20240229',
        max_tokens: 1024,
        messages: [{
          role: 'user',
          content: message
        }],
        system: systemPrompt
      }),
    })

    if (!response.ok) {
      const errorData = await response.text()
      console.error('Claude API error:', errorData)
      throw new Error(`Claude API error: ${response.status}`)
    }

    const data = await response.json()
    console.log('Claude response:', data)

    return new Response(
      JSON.stringify({ response: data.content[0].text }), 
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (error) {
    console.error('Error:', error)
    return new Response(
      JSON.stringify({ error: error.message }), 
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    )
  }
})