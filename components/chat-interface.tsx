"use client"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Brain, Link, Folder, Mic, Send, X, FileText, ExternalLink, Loader2 } from "lucide-react"
import { LiquidMetal, PulsingBorder } from "@paper-design/shaders-react"
import { motion } from "framer-motion"
import { useState, useRef, useEffect } from "react"

interface Message {
  id: string
  content: string
  role: "user" | "assistant"
  timestamp: Date
  attachments?: Attachment[]
}

interface Attachment {
  type: "file" | "url"
  name?: string
  content?: string
  url?: string
}

export function ChatInterface() {
  const [isFocused, setIsFocused] = useState(false)
  const [input, setInput] = useState("")
  const [messages, setMessages] = useState<Message[]>([])
  const [selectedModel, setSelectedModel] = useState("gemini-2.5-pro")
  const [isLoading, setIsLoading] = useState(false)
  const [showAIDialog, setShowAIDialog] = useState(false)
  const [attachments, setAttachments] = useState<Attachment[]>([])
  const [isFetchingURL, setIsFetchingURL] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const handleSend = async () => {
    if ((!input.trim() && attachments.length === 0) || isLoading) return

    const userMessage: Message = {
      id: Date.now().toString(),
      content: input.trim(),
      role: "user",
      timestamp: new Date(),
      attachments: attachments.length > 0 ? [...attachments] : undefined,
    }

    const currentInput = input.trim()
    const currentAttachments = [...attachments]
    const updatedMessages = [...messages, userMessage]
    setMessages(updatedMessages)
    setInput("")
    setAttachments([])
    setIsLoading(true)

    // Auto-resize textarea
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto"
    }

    try {
      // Prepare messages for API with attachments
      const apiMessages = updatedMessages.map((msg) => ({
        role: msg.role,
        content: msg.content,
        attachments: msg.attachments,
      }))

      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messages: apiMessages,
          model: selectedModel,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to get response from API')
      }

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: data.message,
        role: "assistant",
        timestamp: new Date(),
      }
      setMessages((prev) => [...prev, assistantMessage])
    } catch (error: any) {
      console.error("Error sending message:", error)
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: error.message || "Sorry, there was an error processing your message. Please make sure your API keys are configured correctly.",
        role: "assistant",
        timestamp: new Date(),
      }
      setMessages((prev) => [...prev, errorMessage])
    } finally {
      setIsLoading(false)
    }
  }

  const handleFileUpload = async (file: File) => {
    if (file.size > 10 * 1024 * 1024) {
      alert('File size must be less than 10MB')
      return
    }

    const formData = new FormData()
    formData.append('file', file)

    try {
      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to process file')
      }

      setAttachments((prev) => [
        ...prev,
        {
          type: 'file',
          name: file.name,
          content: data.content,
        },
      ])
    } catch (error: any) {
      alert(`Error processing file: ${error.message}`)
    }
  }

  const handleURLFetch = async (url: string) => {
    if (!url || (!url.startsWith('http://') && !url.startsWith('https://'))) {
      alert('Please enter a valid URL starting with http:// or https://')
      return
    }

    setIsFetchingURL(true)
    try {
      const response = await fetch('/api/fetch-url', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ url }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch URL content')
      }

      setAttachments((prev) => [
        ...prev,
        {
          type: 'url',
          url: url,
          content: data.content,
        },
      ])
    } catch (error: any) {
      alert(`Error fetching URL: ${error.message}`)
    } finally {
      setIsFetchingURL(false)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto"
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`
    }
  }, [input])

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4">
      <div className="w-full max-w-4xl relative flex flex-col">
        <div className="flex flex-row items-center mb-2">
          {/* Shader Circle - only show when no messages */}
          {messages.length === 0 && (
            <motion.div
              id="circle-ball"
              className="relative flex items-center justify-center z-10"
              animate={{
                y: isFocused ? 50 : 0,
                opacity: isFocused ? 0 : 100,
                filter: isFocused ? "blur(4px)" : "blur(0px)",
                rotation: isFocused ? 180 : 0,
              }}
              transition={{
                duration: 0.5,
                type: "spring",
                stiffness: 200,
                damping: 20,
              }}
            >
              <div className="z-10 absolute bg-white/5 h-11 w-11 rounded-full backdrop-blur-[3px]">
                <div className="h-[2px] w-[2px] bg-white rounded-full absolute top-4 left-4  blur-[1px]" />
                <div className="h-[2px] w-[2px] bg-white rounded-full absolute top-3 left-7  blur-[0.8px]" />
                <div className="h-[2px] w-[2px] bg-white rounded-full absolute top-8 left-2  blur-[1px]" />
                <div className="h-[2px] w-[2px] bg-white rounded-full absolute top-5 left-9 blur-[0.8px]" />
                <div className="h-[2px] w-[2px] bg-white rounded-full absolute top-7 left-7  blur-[1px]" />
              </div>
              <LiquidMetal
                style={{ height: 80, width: 80, filter: "blur(14px)", position: "absolute" }}
                colorBack="hsl(0, 0%, 0%, 0)"
                colorTint="hsl(29, 77%, 49%)"
                repetition={4}
                softness={0.5}
                shiftRed={0.3}
                shiftBlue={0.3}
                distortion={0.1}
                contour={1}
                shape="circle"
                offsetX={0}
                offsetY={0}
                scale={0.58}
                rotation={50}
                speed={5}
              />
              <LiquidMetal
                style={{ height: 80, width: 80 }}
                colorBack="hsl(0, 0%, 0%, 0)"
                colorTint="hsl(29, 77%, 49%)"
                repetition={4}
                softness={0.5}
                shiftRed={0.3}
                shiftBlue={0.3}
                distortion={0.1}
                contour={1}
                shape="circle"
                offsetX={0}
                offsetY={0}
                scale={0.58}
                rotation={50}
                speed={5}
              />
            </motion.div>
          )}

          {/* Greeting Text - only show when no messages */}
          {messages.length === 0 && (
            <motion.p
              className="text-white/40 text-sm font-light z-10"
              animate={{
                y: isFocused ? 50 : 0,
                opacity: isFocused ? 0 : 100,
                filter: isFocused ? "blur(4px)" : "blur(0px)",
              }}
              transition={{
                duration: 0.5,
                type: "spring",
                stiffness: 200,
                damping: 20,
              }}
            >
              Hey there! I'm here to help with anything you need
            </motion.p>
          )}
        </div>

        {/* Messages Display */}
        {messages.length > 0 && (
          <div className="mb-4 space-y-4 max-h-[60vh] overflow-y-auto overflow-x-hidden pb-4" style={{ scrollBehavior: "smooth" }}>
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${message.role === "user" ? "justify-end" : "justify-start"} animate-in fade-in slide-in-from-bottom-2`}
              >
                <div
                  className={`max-w-[80%] rounded-lg px-4 py-3 ${
                    message.role === "user"
                      ? "bg-zinc-800 text-white"
                      : "bg-zinc-900 text-white border border-zinc-800"
                  }`}
                >
                  {message.attachments && message.attachments.length > 0 && (
                    <div className="mb-2 space-y-2">
                      {message.attachments.map((attachment, idx) => (
                        <div key={idx} className="flex items-center gap-2 text-xs text-zinc-400 bg-zinc-900/50 rounded px-2 py-1">
                          {attachment.type === 'file' ? (
                            <>
                              <FileText className="h-3 w-3" />
                              <span>{attachment.name}</span>
                            </>
                          ) : (
                            <>
                              <ExternalLink className="h-3 w-3" />
                              <a href={attachment.url} target="_blank" rel="noopener noreferrer" className="hover:underline truncate max-w-[200px]">
                                {attachment.url}
                              </a>
                            </>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                  <p className="text-sm whitespace-pre-wrap break-words">{message.content}</p>
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="flex justify-start animate-in fade-in">
                <div className="bg-zinc-900 text-white border border-zinc-800 rounded-lg px-4 py-3">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-white rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                    <div className="w-2 h-2 bg-white rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                    <div className="w-2 h-2 bg-white rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
        )}

        <div className="relative">
          <motion.div
            className="absolute w-full h-full z-0 flex items-center justify-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: isFocused ? 1 : 0 }}
            transition={{
              duration: 0.8, 
            }}
          >
            <PulsingBorder
              style={{ height: "146.5%", minWidth: "143%" }}
              colorBack="hsl(0, 0%, 0%)"
              roundness={0.18}
              thickness={0}
              softness={0}
              intensity={0.3}
              bloom={2}
              spots={2}
              spotSize={0.25}
              pulse={0}
              smoke={0.35}
              smokeSize={0.4}
              scale={0.7}
              rotation={0}
              offsetX={0}
              offsetY={0}
              speed={1}
              colors={[
                "hsl(29, 70%, 37%)",
                "hsl(32, 100%, 83%)",
                "hsl(4, 32%, 30%)",
                "hsl(25, 60%, 50%)",
                "hsl(0, 100%, 10%)",
              ]}
            />
          </motion.div>

          <motion.div
            className="relative bg-[#040404] rounded-2xl p-4 z-10"
            animate={{
              borderColor: isFocused ? "#BA9465" : "#3D3D3D",
            }}
            transition={{
              duration: 0.6,
              delay: 0.1,
            }}
            style={{
              borderWidth: "1px",
              borderStyle: "solid",
            }}
          >
            {/* Message Input */}
            <div className="relative mb-6">
              {attachments.length > 0 && (
                <div className="mb-2 flex flex-wrap gap-2">
                  {attachments.map((attachment, idx) => (
                    <div key={idx} className="flex items-center gap-2 bg-zinc-800 rounded-lg px-3 py-1.5 text-xs text-zinc-300">
                      {attachment.type === 'file' ? (
                        <>
                          <FileText className="h-3 w-3" />
                          <span className="max-w-[150px] truncate">{attachment.name}</span>
                        </>
                      ) : (
                        <>
                          <ExternalLink className="h-3 w-3" />
                          <span className="max-w-[150px] truncate">{attachment.url}</span>
                        </>
                      )}
                      <button
                        onClick={() => setAttachments((prev) => prev.filter((_, i) => i !== idx))}
                        className="hover:text-white ml-1"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
              <Textarea
                ref={textareaRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Type your message..."
                className="min-h-[80px] resize-none bg-transparent border-none text-white text-base placeholder:text-zinc-500 focus:ring-0 focus:outline-none focus-visible:ring-0 focus-visible:outline-none [&:focus]:ring-0 [&:focus]:outline-none [&:focus-visible]:ring-0 [&:focus-visible]:outline-none"
                onFocus={() => setIsFocused(true)}
                onBlur={() => setIsFocused(false)}
                disabled={isLoading}
              />
              <input
                ref={fileInputRef}
                type="file"
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0]
                  if (file) {
                    handleFileUpload(file)
                  }
                  // Reset input
                  if (fileInputRef.current) {
                    fileInputRef.current.value = ''
                  }
                }}
                accept=".txt,.pdf,.md,.doc,.docx,.json,.csv"
              />
            </div>

            <div className="flex items-center justify-between">
              {/* Left side icons */}
              <div className="flex items-center gap-3">
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-9 w-9 rounded-full bg-zinc-800 hover:bg-zinc-700 text-zinc-100 hover:text-white p-0"
                  disabled={isLoading}
                  onClick={() => setShowAIDialog(true)}
                >
                  <Brain className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-9 w-9 rounded-full bg-zinc-800 hover:bg-zinc-700 text-zinc-300 hover:text-white p-0"
                  disabled={isLoading || isFetchingURL}
                  onClick={async () => {
                    try {
                      const text = await navigator.clipboard.readText()
                      if (text && (text.startsWith('http://') || text.startsWith('https://'))) {
                        await handleURLFetch(text)
                      } else {
                        const url = prompt('Enter a URL to fetch content from:')
                        if (url) {
                          await handleURLFetch(url)
                        }
                      }
                    } catch (err) {
                      const url = prompt('Enter a URL to fetch content from:')
                      if (url) {
                        await handleURLFetch(url)
                      }
                    }
                  }}
                >
                  {isFetchingURL ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Link className="h-4 w-4" />
                  )}
                </Button>
                {/* Center model selector */}
                <div className="flex items-center">
                  <Select value={selectedModel} onValueChange={setSelectedModel} disabled={isLoading}>
                    <SelectTrigger className="bg-zinc-900 border-[#3D3D3D] text-white hover:bg-zinc-700 text-xs rounded-full px-2 h-8 min-w-[150px]">
                      <div className="flex items-center gap-2">
                        <span className="text-xs">⚡</span>
                        <SelectValue />
                      </div>
                    </SelectTrigger>
                    <SelectContent className="bg-zinc-900 z-30 border-[#3D3D3D] rounded-xl z-30">
                      <SelectItem value="gemini-2.5-pro" className="text-white hover:bg-zinc-700 rounded-lg">
                        Gemini 2.0 Flash
                      </SelectItem>
                      <SelectItem value="claude-3" className="text-white hover:bg-zinc-700 rounded-lg">
                        Claude 3
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Right side icons */}
              <div className="flex items-center gap-3">
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-10 w-10 rounded-full bg-zinc-800 hover:bg-zinc-700 text-zinc-300 hover:text-white p-0"
                  disabled={isLoading}
                  onClick={() => fileInputRef.current?.click()}
                >
                  <Folder className="h-5 w-5" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleSend}
                  disabled={(!input.trim() && attachments.length === 0) || isLoading}
                  className="h-10 w-10 rounded-full bg-orange-500 hover:bg-orange-600 text-white p-0 disabled:bg-zinc-800 disabled:text-zinc-500"
                >
                  <Send className="h-5 w-5" />
                </Button>
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* AI Capabilities Dialog */}
      <Dialog open={showAIDialog} onOpenChange={setShowAIDialog}>
        <DialogContent className="bg-zinc-900 border-zinc-800 text-white max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-white flex items-center gap-2">
              <Brain className="h-5 w-5" />
              AI Model Capabilities & Settings
            </DialogTitle>
            <DialogDescription className="text-zinc-400">
              Information about the current AI model and its capabilities
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 mt-4">
            <div>
              <h3 className="text-lg font-semibold text-white mb-2">Current Model</h3>
              <div className="bg-zinc-800 rounded-lg p-3">
                <p className="text-sm text-zinc-300">
                  {selectedModel === 'gemini-2.5-pro' ? 'Gemini 2.0 Flash (Experimental)' : selectedModel === 'claude-3' ? 'Claude 3 (via OpenAI)' : selectedModel}
                </p>
              </div>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-white mb-2">Model Capabilities</h3>
              <div className="bg-zinc-800 rounded-lg p-4 space-y-2">
                {selectedModel === 'gemini-2.5-pro' ? (
                  <>
                    <div className="flex items-start gap-2">
                      <span className="text-green-400 mt-1">✓</span>
                      <div>
                        <p className="text-sm font-medium text-white">Fast Response Times</p>
                        <p className="text-xs text-zinc-400">Optimized for quick interactions</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-2">
                      <span className="text-green-400 mt-1">✓</span>
                      <div>
                        <p className="text-sm font-medium text-white">Multimodal Support</p>
                        <p className="text-xs text-zinc-400">Can process text, images, and documents</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-2">
                      <span className="text-green-400 mt-1">✓</span>
                      <div>
                        <p className="text-sm font-medium text-white">Large Context Window</p>
                        <p className="text-xs text-zinc-400">Can handle long conversations and documents</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-2">
                      <span className="text-green-400 mt-1">✓</span>
                      <div>
                        <p className="text-sm font-medium text-white">Web Search Integration</p>
                        <p className="text-xs text-zinc-400">Can fetch and analyze web content via URL attachments</p>
                      </div>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="flex items-start gap-2">
                      <span className="text-green-400 mt-1">✓</span>
                      <div>
                        <p className="text-sm font-medium text-white">Advanced Reasoning</p>
                        <p className="text-xs text-zinc-400">Sophisticated problem-solving capabilities</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-2">
                      <span className="text-green-400 mt-1">✓</span>
                      <div>
                        <p className="text-sm font-medium text-white">Long Context</p>
                        <p className="text-xs text-zinc-400">Excellent memory and context retention</p>
                      </div>
                    </div>
                  </>
                )}
              </div>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-white mb-2">Supported Features</h3>
              <div className="bg-zinc-800 rounded-lg p-4 space-y-2">
                <div className="flex items-center gap-2">
                  <FileText className="h-4 w-4 text-blue-400" />
                  <span className="text-sm text-zinc-300">File Upload (PDF, TXT, MD, DOC, DOCX, JSON, CSV)</span>
                </div>
                <div className="flex items-center gap-2">
                  <ExternalLink className="h-4 w-4 text-green-400" />
                  <span className="text-sm text-zinc-300">URL Content Fetching</span>
                </div>
                <div className="flex items-center gap-2">
                  <Brain className="h-4 w-4 text-purple-400" />
                  <span className="text-sm text-zinc-300">Multi-turn Conversations</span>
                </div>
              </div>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-white mb-2">Usage Tips</h3>
              <div className="bg-zinc-800 rounded-lg p-4 space-y-2 text-sm text-zinc-300">
                <p>• Attach files using the folder icon to have the AI analyze document content</p>
                <p>• Use the link icon to fetch and analyze web page content</p>
                <p>• Switch between models to find the one that best suits your needs</p>
                <p>• The AI can reference attached files and URLs in its responses</p>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
