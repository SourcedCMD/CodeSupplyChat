import { NextRequest, NextResponse } from 'next/server'
import OpenAI from 'openai'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

export async function POST(req: NextRequest) {
  try {
    const { messages, model = 'gpt-4' } = await req.json()

    if (!process.env.OPENAI_API_KEY) {
      return NextResponse.json(
        { error: 'OpenAI API key is not configured' },
        { status: 500 }
      )
    }

    if (!messages || !Array.isArray(messages)) {
      return NextResponse.json(
        { error: 'Messages array is required' },
        { status: 400 }
      )
    }

    // Format messages for OpenAI API
    const formattedMessages = messages.map((msg: { role: string; content: string }) => ({
      role: msg.role === 'assistant' ? 'assistant' : 'user',
      content: msg.content,
    }))

    // Map model selection to OpenAI model names
    const modelMap: Record<string, string> = {
      'gpt-4': 'gpt-4',
      'gemini-2.5-pro': 'gpt-4-turbo-preview', // Fallback for Gemini (not implemented)
      'claude-3': 'gpt-4-turbo-preview', // Fallback for Claude (not implemented)
    }
    
    const openaiModel = modelMap[model] || 'gpt-4'

    const completion = await openai.chat.completions.create({
      model: openaiModel,
      messages: formattedMessages,
      temperature: 0.7,
      max_tokens: 2000,
    })

    const assistantMessage = completion.choices[0]?.message?.content

    if (!assistantMessage) {
      return NextResponse.json(
        { error: 'No response from OpenAI' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      message: assistantMessage,
    })
  } catch (error: any) {
    console.error('OpenAI API error:', error)
    return NextResponse.json(
      { 
        error: error.message || 'Failed to get response from OpenAI',
        details: error.response?.data || null
      },
      { status: 500 }
    )
  }
}
