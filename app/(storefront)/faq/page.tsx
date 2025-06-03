/* eslint-disable @typescript-eslint/no-unused-vars */
"use client"

import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { useState } from "react"
import { useToast } from "@/hooks/use-toast"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card } from "@/components/ui/card"
import { motion } from "framer-motion"
import { Search, HelpCircle, Send } from "lucide-react"

const faqs = [
  {
    question: "How do I redeem a gift card?",
    answer: "Go to the checkout page, enter your gift card code, and apply it to your order.",
  },
  {
    question: "Can I send a gift card internationally?",
    answer: "Currently, our gift cards can only be sent and used within supported regions. Check eligibility during purchase.",
  },
  {
    question: "Are gift cards refundable?",
    answer: "Gift cards are non-refundable and cannot be exchanged for cash unless required by law.",
  },
  {
    question: "What happens if I lose my digital gift card?",
    answer: "Contact our support team with your order ID and email, and we’ll help recover your gift card.",
  },
  {
    question: "Can I use multiple gift cards in one order?",
    answer: "Yes, you can apply more than one gift card at checkout as long as the total does not exceed your purchase amount.",
  },
]

export default function FAQPage() {
  const [search, setSearch] = useState("")
  const [question, setQuestion] = useState("")
  const [loading, setLoading] = useState(false)
  const { toast } = useToast()

  const handleSubmit = async (e: { preventDefault: () => void }) => {
    e.preventDefault()
    if (!question.trim()) return

    setLoading(true)
    try {
      const res = await fetch("/api/faq", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question }),
      })
      const data = await res.json()
      toast({
        title: data.success ? "Thanks for your question!" : "Submission failed",
        description: data.success ? "We'll review and respond soon." : data.error,
        variant: data.success ? "default" : "destructive",
      })
      if (data.success) setQuestion("")
    } catch (error) {
      toast({ title: "Error", description: "Something went wrong. Try again later.", variant: "destructive" })
    } finally {
      setLoading(false)
    }
  }

  const filtered = faqs.filter((f) => f.question.toLowerCase().includes(search.toLowerCase()))

  return (
    <div className="max-w-4xl mx-auto px-4 py-10 space-y-8">
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5 }}>
        <div className="text-center space-y-2">
          <HelpCircle className="mx-auto h-10 w-10 text-primary animate-bounce" />
          <h1 className="text-4xl font-bold">FAQs</h1>
          <p className="text-muted-foreground">Answers to our most common questions</p>
        </div>
      </motion.div>

      <Card className="p-6 shadow-md border border-border">
        <div className="space-y-2">
          <Label htmlFor="search" className="flex items-center gap-2">
            <Search className="h-4 w-4 text-muted-foreground" /> Search
          </Label>
          <Input
            id="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search questions..."
          />
        </div>
      </Card>

      <Accordion type="multiple" className="space-y-3">
        {filtered.map((item, i) => (
          <AccordionItem key={i} value={`faq-${i}`} className="rounded-lg border border-border bg-card">
            <AccordionTrigger className="px-4 py-2 text-left font-semibold">
              {item.question}
            </AccordionTrigger>
            <AccordionContent className="px-4 pb-4 text-muted-foreground">
              {item.answer}
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>

      <Card className="p-6 border border-border bg-card/70">
        <form onSubmit={handleSubmit} className="space-y-4">
          <Label htmlFor="ask">Can&apos;t find your answer?</Label>
          <Textarea
            id="ask"
            placeholder="Ask your question here..."
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
          />
          <Button type="submit" disabled={loading}>
            <Send className="w-4 h-4 mr-2" /> Submit
          </Button>
        </form>
      </Card>
    </div>
  )
}