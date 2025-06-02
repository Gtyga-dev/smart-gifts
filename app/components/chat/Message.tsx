
import { cn } from '@/lib/utils'
import { ReactNode } from 'react'

interface MessageProps {
    content: string
    icon: ReactNode
    variant: 'user' | 'assistant'
    isLoading?: boolean
}

export function Message({ content, icon, variant, isLoading }: MessageProps) {
    return (
        <div
            className={cn(
                'flex gap-3 text-sm',
                variant === 'user' ? 'flex-row-reverse' : 'flex-row'
            )}
        >
            <div className={cn(
                'flex h-8 w-8 shrink-0 select-none items-center justify-center rounded-md border shadow-sm',
                variant === 'assistant' ? 'bg-primary text-primary-foreground' : 'bg-muted'
            )}>
                {icon}
            </div>
            <div
                className={cn(
                    'rounded-lg px-4 py-2 max-w-[85%] shadow-sm',
                    variant === 'assistant'
                        ? 'bg-muted text-muted-foreground'
                        : 'bg-primary text-primary-foreground',
                    isLoading && 'animate-pulse'
                )}
            >
                {content}
            </div>
        </div>
    )
}
