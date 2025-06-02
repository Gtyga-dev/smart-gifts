"use client"

import { useState } from 'react'

import { Send } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

interface MessageInputProps {
    onSendMessage: (message: string) => void
    isLoading: boolean
}

export function MessageInput({ onSendMessage, isLoading }: MessageInputProps) {
    const [message, setMessage] = useState('')

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault()
        if (message.trim() && !isLoading) {
            onSendMessage(message)
            setMessage('')
        }
    }

    return (
        <form onSubmit={handleSubmit} className="p-4 border-t bg-card">
            <div className="flex gap-2">
                <Input
                    placeholder="Type a message..."
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    className="focus-visible:ring-1"
                />
                <Button
                    type="submit"
                    size="icon"
                    disabled={isLoading || !message.trim()}
                    className="shrink-0"
                >
                    <Send className="h-4 w-4" />
                </Button>
            </div>
        </form>
    )
}
