"use client"

import type React from "react"

import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { useState } from "react"
import { useToast } from "@/hooks/use-toast"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card } from "@/components/ui/card"
import { motion } from "framer-motion"
import { Search, Send, HelpCircle } from "lucide-react"

interface FaqItem {
  question: string
  answer: string
}

const faqData: FaqItem[] = [
  {
    question: "What is an online gift card?",
    answer:
      "An online gift card is a digital version of a physical gift card. It can be sent via email, text message, or through a retailer's app, and can be used for online purchases at the associated retailer or platform.",
  },
  {
    question: "How do I use an online gift card?",
    answer:
      "To use an online gift card, you typically enter the card number and PIN during the checkout process on the retailer's website. Some online gift cards can also be linked to your account for easier future use.",
  },
  {
    question: "Can I buy an online gift card without a physical card?",
    answer:
      "Yes, online gift cards are digital and do not require a physical card. You can purchase them through a retailer's website or third-party services.",
  },
  {
    question: "Can I send an online gift card as a gift?",
    answer:
      "Yes, most online gift cards allow you to send them directly to someone else via email or text message, and you can even personalize the message.",
  },
  {
    question: "How do I check the balance of my online gift card?",
    answer: "You can check the balance by visiting the retailer's website, app, or by calling customer service.",
  },
  {
    question: "Do online gift cards expire?",
    answer:
      "It depends on the retailer, but many online gift cards do not have expiration dates. Always check the terms and conditions.",
  },
  {
    question: "Can I use an online gift card to buy items from a physical store?",
    answer:
      "Some online gift cards can be used in-store, especially if linked to your account. Verify with the retailer for in-store use.",
  },
  {
    question: "Can I use an online gift card for subscriptions or digital content?",
    answer: "Yes, many online gift cards can be used for subscriptions like Netflix, Spotify, and gaming platforms.",
  },
  {
    question: "How do I redeem an online gift card?",
    answer:
      "To redeem, enter the card number and PIN at checkout or link it to your account on the retailer's website.",
  },
  {
    question: "Can I use an online gift card for international purchases?",
    answer: "It depends on the retailer. Some cards are region-specific, so check the terms for international use.",
  },
  {
    question: "Can I reload my online gift card?",
    answer: "Most online gift cards are not reloadable. You would need to purchase a new card.",
  },
  {
    question: "What happens if I lose my online gift card or forget the details?",
    answer: "Contact the retailer with your receipt or proof of purchase to recover the card details.",
  },
  {
    question: "Can I use multiple online gift cards for a single purchase?",
    answer:
      "Yes, many retailers allow multiple gift cards per purchase, but there may be limits. Check with the retailer.",
  },
  {
    question: "Can I exchange or return an online gift card for cash?",
    answer:
      "Online gift cards are typically non-refundable. However, some jurisdictions may allow redemption for cash if the balance is low.",
  },
  {
    question: "How do I send an online gift card to someone else?",
    answer: "You can send an online gift card via email or text by entering the recipient's details during purchase.",
  },
  {
    question: "Can I use an online gift card on a mobile app?",
    answer: "Yes, many retailers allow you to use online gift cards on their mobile apps.",
  },
  {
    question: "Can I cancel an online gift card after purchasing it?",
    answer: "In most cases, gift cards are non-cancellable once purchased, as they are often delivered instantly.",
  },
  {
    question: "What are e-gift cards?",
    answer:
      "E-gift cards are electronic gift cards sent via email, text, or app, functioning the same as physical gift cards.",
  },
  {
    question: "How do I transfer funds from an online gift card to my bank account?",
    answer:
      "Generally, you can't transfer funds from a gift card to a bank account, but you can use the card for purchases you'd normally make with your bank card.",
  },
  {
    question: "Can I use my online gift card for a different retailer or website?",
    answer: "No, most gift cards are retailer-specific and cannot be used on different platforms.",
  },
]

const FaqPage = () => {
  const [searchTerm, setSearchTerm] = useState<string>("")
  const [newQuestion, setNewQuestion] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const { toast } = useToast()

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value)
  }

  const filteredFaqData = faqData.filter((item) => item.question.toLowerCase().includes(searchTerm.toLowerCase()))

  const handleSubmitQuestion = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newQuestion.trim()) return

    setIsSubmitting(true)
    try {
      const response = await fetch("/api/faq", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ question: newQuestion }),
      })

      const data = await response.json()

      if (data.success) {
        toast({
          title: "Question Submitted Successfully",
          description: "Thank you! We'll review your question and get back to you soon.",
        })
        setNewQuestion("")
      } else {
        toast({
          title: "Error",
          description: data.error || "Failed to submit your question. Please try again later.",
          variant: "destructive",
        })
      }
    } catch (err) {
      console.error("Error submitting question:", err)
      toast({
        title: "Error",
        description: "Failed to submit your question. Please try again later.",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 cyber-grid">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="mb-8 text-center"
      >
        <div className="flex justify-center mb-2">
          <HelpCircle className="h-8 w-8 text-primary animate-pulse" />
        </div>
        <h1 className="text-3xl font-bold mb-4 text-center neon-text">
          Frequently Asked <span className="gradient-text">Questions</span>
        </h1>
        <p className="text-muted-foreground">Find answers to common questions or submit your own</p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
      >
        <Card className="p-6 mb-8 bg-gradient-to-br from-card to-card/50 border border-primary/20 shadow-lg">
          <div className="flex flex-col gap-4">
            <Label htmlFor="search" className="flex items-center gap-2">
              <Search className="h-4 w-4 text-primary" />
              Search FAQ
            </Label>
            <Input
              id="search"
              value={searchTerm}
              onChange={handleSearch}
              placeholder="Type to search questions..."
              className="w-full border-primary/20 bg-card/80 focus:ring-2 focus:ring-primary/20 focus:border-primary"
            />
          </div>
        </Card>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        className="mb-8"
      >
        <Accordion type="multiple" className="space-y-2">
          {filteredFaqData.map((faq, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.1 + index * 0.05 }}
            >
              <AccordionItem
                value={`item-${index}`}
                className="border border-primary/20 rounded-lg mb-2 hover:bg-primary/5 bg-card/80 shadow-sm transition-all duration-200"
              >
                <AccordionTrigger className="px-4 text-primary-foreground hover:text-primary">
                  {faq.question}
                </AccordionTrigger>
                <AccordionContent className="px-4 text-muted-foreground">
                  <p>{faq.answer}</p>
                </AccordionContent>
              </AccordionItem>
            </motion.div>
          ))}
        </Accordion>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.3 }}
      >
        <Card className="p-6 bg-gradient-to-br from-primary/10 to-primary/5 border border-primary/20 shadow-lg relative">
          <div className="absolute -inset-0.5 bg-gradient-to-r from-primary/20 to-accent/20 rounded-xl blur opacity-30"></div>
          <form onSubmit={handleSubmitQuestion} className="space-y-4 relative">
            <div className="space-y-2">
              <Label htmlFor="question" className="flex items-center gap-2">

                Have a question? Ask us!
              </Label>
              <Textarea
                id="question"
                value={newQuestion}
                onChange={(e) => setNewQuestion(e.target.value)}
                placeholder="Type your question here..."
                className="min-h-[100px] border-primary/20 bg-card/80 focus:ring-2 focus:ring-primary/20 focus:border-primary"
                disabled={isSubmitting}
              />
            </div>
            <Button
              type="submit"
              className="w-full sm:w-auto bg-primary hover:bg-primary/90 text-white border border-primary/50 animate-pulse-border"
              disabled={isSubmitting}
            >
              <div className="flex items-center gap-2">
                <Send className="h-4 w-4" />
                {isSubmitting ? "Submitting..." : "Submit Question"}
              </div>
            </Button>
          </form>
        </Card>
      </motion.div>
    </div>
  )
}

export default FaqPage
