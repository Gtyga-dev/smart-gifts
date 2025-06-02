"use client"

import { useEffect, useRef } from "react"

interface PlaceholderImageProps {
    width: number
    height: number
    text?: string
    className?: string
}

export function PlaceholderImage({ width, height, text, className = "" }: PlaceholderImageProps) {
    const canvasRef = useRef<HTMLCanvasElement>(null)

    useEffect(() => {
        const canvas = canvasRef.current
        if (!canvas) return

        const ctx = canvas.getContext("2d")
        if (!ctx) return

        // Set canvas dimensions
        canvas.width = width
        canvas.height = height

        // Draw background
        ctx.fillStyle = "#f3f4f6" // Light gray background
        ctx.fillRect(0, 0, width, height)

        // Draw border
        ctx.strokeStyle = "#d1d5db" // Border color
        ctx.lineWidth = 1
        ctx.strokeRect(0, 0, width, height)

        // Draw text
        const displayText = text || `${width}×${height}`
        ctx.fillStyle = "#6b7280" // Text color
        ctx.font = `${Math.max(12, Math.min(width / 10, 24))}px sans-serif`
        ctx.textAlign = "center"
        ctx.textBaseline = "middle"
        ctx.fillText(displayText, width / 2, height / 2)

        // Optional: Draw a placeholder icon
        const iconSize = Math.min(width, height) * 0.3
        if (iconSize > 20) {
            ctx.strokeStyle = "#9ca3af"
            ctx.lineWidth = 2
            ctx.beginPath()
            ctx.moveTo(width / 2 - iconSize / 2, height / 2 - iconSize / 4)
            ctx.lineTo(width / 2 + iconSize / 2, height / 2 - iconSize / 4)
            ctx.moveTo(width / 2, height / 2 - iconSize / 2)
            ctx.lineTo(width / 2, height / 2 + iconSize / 2)
            ctx.stroke()
        }
    }, [width, height, text])

    return <canvas ref={canvasRef} className={className} />
}
