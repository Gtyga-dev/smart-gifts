'use client'
import { useEffect, useRef, useState, FormEvent } from 'react'
import { BsSendArrowUp } from 'react-icons/bs'
import { FaRobot } from 'react-icons/fa'
import { MdClose } from 'react-icons/md'
import ReactMarkdown from 'react-markdown'
import { SyncLoader } from 'react-spinners'

interface ChatMessage {
    sender: 'user' | 'bot'
    text: string
}

const ChatBot = () => {
    const [botVisible, setBotVisible] = useState(false)
    const [message, setMessage] = useState('')
    const [conversation, setConversation] = useState<ChatMessage[]>([])
    const [loading, setLoading] = useState(false)
    const chatEndRef = useRef<HTMLDivElement>(null)

    const toggleBot = () => setBotVisible(prev => !prev)

    const handleMessage = (e: React.ChangeEvent<HTMLInputElement>) => {
        setMessage(e.target.value)
    }

    const handleText = async (e: FormEvent) => {
        e.preventDefault()
        if (!message.trim()) return

        const userMessage: ChatMessage = { sender: 'user', text: message }
        setConversation(prev => [...prev, userMessage])
        setMessage('')
        setLoading(true)

        try {
            const response = await fetch("https://bot-ri9k.onrender.com/chat", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ message }),
            })

            if (!response.ok) throw new Error('Server response error')

            const data = await response.json()
            const botResponse: ChatMessage = {
                sender: 'bot',
                text: data.response || "Sorry, I didn't get that"
            }

            setConversation(prev => [...prev, botResponse])
        } catch (error) {
            console.error("Fetch error:", error)
            const errorMessage: ChatMessage = {
                sender: 'bot',
                text: "Sorry, something went wrong. Please try again later."
            }
            setConversation(prev => [...prev, errorMessage])
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        chatEndRef.current?.scrollIntoView({ behavior: "smooth" })
    }, [conversation, loading])

    return (
        <div className="fixed bottom-4 right-4 z-50">
            {botVisible ? (
                <div className="relative flex flex-col w-96 h-[70vh] bg-gray-900 rounded-xl shadow-2xl border border-gray-700 transform transition-all duration-300">
                    <div className="flex items-center justify-between p-4 border-b border-gray-700">
                        <div className="flex items-center gap-3">
                            <FaRobot className="w-6 h-6 text-blue-400" />
                            <h2 className="text-white font-semibold">AI Assistant</h2>
                        </div>
                        <button
                            onClick={toggleBot}
                            className="p-1.5 rounded-lg hover:bg-gray-800 transition-colors text-gray-400 hover:text-white"
                        >
                            <MdClose className="w-6 h-6" />
                        </button>
                    </div>

                    <div className="flex-1 p-4 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-700 scrollbar-track-gray-900">
                        {conversation.map((msg, index) => (
                            <div
                                key={index}
                                className={`mb-4 max-w-[85%] p-3 rounded-xl ${msg.sender === 'user'
                                    ? 'ml-auto bg-blue-800 text-white rounded-br-none'
                                    : 'bg-gray-800 text-gray-100 rounded-bl-none'
                                    }`}
                            >
                                {msg.sender === 'bot' ? (
                                    <div className="prose prose-invert">
                                        <ReactMarkdown>{msg.text}</ReactMarkdown>
                                    </div>
                                ) : (
                                    <span className="text-sm">{msg.text}</span>
                                )}
                            </div>
                        ))}
                        {loading && (
                            <div className="mb-4 max-w-[85%] p-3 bg-gray-800 rounded-xl">
                                <SyncLoader size={8} color="#60a5fa" />
                            </div>
                        )}
                        <div ref={chatEndRef} />
                    </div>

                    <form
                        onSubmit={handleText}
                        className="flex gap-2 p-4 border-t border-gray-700"
                    >
                        <input
                            type="text"
                            placeholder="Type your message..."
                            value={message}
                            onChange={handleMessage}
                            disabled={loading}
                            className="flex-1 px-4 py-2 bg-gray-800 border border-gray-600 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500 text-white placeholder-gray-400 disabled:opacity-50"
                        />
                        <button
                            type="submit"
                            disabled={loading}
                            className="p-2 text-white bg-blue-600 rounded-full hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        >
                            <BsSendArrowUp className="w-5 h-5" />
                        </button>
                    </form>
                </div>
            ) : (
                <button
                    onClick={toggleBot}
                    className="flex items-center justify-center w-14 h-14 rounded-full bg-gradient-to-br from-blue-600 to-purple-600 shadow-lg hover:from-blue-700 hover:to-purple-700 transition-all transform hover:scale-105 animate-bounce"
                >
                    <FaRobot className="w-8 h-8 text-white" />
                </button>
            )}
        </div>
    )
}

export default ChatBot