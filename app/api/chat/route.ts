import { NextRequest, NextResponse } from 'next/server'
import OpenAI from 'openai'
import { GoogleGenerativeAI } from '@google/generative-ai'

// Force Node.js runtime for OpenAI SDK compatibility
export const runtime = 'nodejs'

const openai = process.env.OPENAI_API_KEY
  ? new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    })
  : null

const genAI = process.env.GOOGLE_AI_API_KEY 
  ? new GoogleGenerativeAI(process.env.GOOGLE_AI_API_KEY)
  : null

export async function POST(req: NextRequest) {
  let selectedModel = 'gemini-2.5-pro'
  try {
    const { messages, model = 'gemini-2.5-pro' } = await req.json()
    selectedModel = model

    if (!messages || !Array.isArray(messages)) {
      return NextResponse.json(
        { error: 'Messages array is required' },
        { status: 400 }
      )
    }

    // Handle Gemini models
    if (model === 'gemini-2.5-pro' || model === 'gemini-1.5-pro') {
      if (!genAI || !process.env.GOOGLE_AI_API_KEY) {
        return NextResponse.json(
          { error: 'Google AI API key is not configured. Please set GOOGLE_AI_API_KEY in your environment variables.' },
          { status: 500 }
        )
      }

      // Gemini uses a different model name format
      // Using gemini-2.0-flash-exp for 2.0 Flash, or gemini-1.5-pro for the other option
      const geminiModelName = model === 'gemini-2.5-pro' ? 'gemini-2.0-flash-exp' : 'gemini-1.5-pro'
      const geminiModel = genAI.getGenerativeModel({ model: geminiModelName })

      // Helper function to build message content with attachments
      const buildMessageContent = (msg: any) => {
        let content = msg.content || ''
        
        if (msg.attachments && Array.isArray(msg.attachments)) {
          const attachmentTexts = msg.attachments.map((att: any) => {
            if (att.type === 'file' && att.content) {
              return `[File: ${att.name || 'untitled'}]\n${att.content}`
            } else if (att.type === 'url' && att.content) {
              return `[URL: ${att.url}]\n${att.content}`
            }
            return ''
          }).filter(Boolean)
          
          if (attachmentTexts.length > 0) {
            content = content 
              ? `${content}\n\n${attachmentTexts.join('\n\n---\n\n')}`
              : attachmentTexts.join('\n\n---\n\n')
          }
        }
        
        return content
      }

      // Convert messages to Gemini format (Gemini uses alternating user/model messages)
      // For chat, we need to format as history
      const chatHistory = messages.slice(0, -1).map((msg: any) => ({
        role: msg.role === 'assistant' ? 'model' : 'user',
        parts: [{ text: buildMessageContent(msg) }],
      }))

      const lastMessage = messages[messages.length - 1]
      const lastMessageContent = buildMessageContent(lastMessage)
      
      // Start a chat session with history
      const chat = geminiModel.startChat({
        history: chatHistory as any,
      })

      const result = await chat.sendMessage(lastMessageContent)
      const response = await result.response
      const assistantMessage = response.text()

      if (!assistantMessage) {
        return NextResponse.json(
          { error: 'No response from Gemini' },
          { status: 500 }
        )
      }

      return NextResponse.json({
        message: assistantMessage,
      })
    }

    // Handle OpenAI models (GPT-4, etc.)
    if (!openai || !process.env.OPENAI_API_KEY) {
      return NextResponse.json(
        { error: 'OpenAI API key is not configured. Please configure OPENAI_API_KEY to use OpenAI models.' },
        { status: 500 }
      )
    }

    // Helper function to build message content with attachments
    const buildMessageContent = (msg: any) => {
      let content = msg.content || ''
      
      if (msg.attachments && Array.isArray(msg.attachments)) {
        const attachmentTexts = msg.attachments.map((att: any) => {
          if (att.type === 'file' && att.content) {
            return `[File: ${att.name || 'untitled'}]\n${att.content}`
          } else if (att.type === 'url' && att.content) {
            return `[URL: ${att.url}]\n${att.content}`
          }
          return ''
        }).filter(Boolean)
        
        if (attachmentTexts.length > 0) {
          content = content 
            ? `${content}\n\n${attachmentTexts.join('\n\n---\n\n')}`
            : attachmentTexts.join('\n\n---\n\n')
        }
      }
      
      return content
    }

    // Format messages for OpenAI API
    const formattedMessages = messages.map((msg: any) => ({
      role: msg.role === 'assistant' ? 'assistant' : 'user',
      content: buildMessageContent(msg),
    }))

    // Map model selection to OpenAI model names
    const modelMap: Record<string, string> = {
      'gpt-4': 'gpt-4',
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
    console.error('API error:', error)
    const provider = selectedModel?.includes('gemini') ? 'Gemini' : 'OpenAI'
    return NextResponse.json(
      { 
        error: error.message || `Failed to get response from ${provider}`,
        details: error.response?.data || null
      },
      { status: 500 }
    )
  }
}
