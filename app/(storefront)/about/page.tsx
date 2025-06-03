"use client"

import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { motion } from "framer-motion"
import { Sparkles, ShieldCheck, PhoneCall, Gift, Plug, Users2 } from "lucide-react"

export const dynamic = 'force-dynamic'

const highlights = [
  {
    title: "Intuitive Experience",
    description:
      "We prioritize ease. Our interface is sleek, modern, and crafted for anyone—whether you're gifting for a birthday or managing bulk rewards for your business.",
    icon: <Sparkles className="h-8 w-8 text-primary" />,
  },
  {
    title: "Multi-Payment Freedom",
    description:
      "Mobile Money, Visa, bank transfer? You choose. We built Smart Cards to fit your financial lifestyle, not the other way around.",
    icon: <ShieldCheck className="h-8 w-8 text-primary" />,
  },
  {
    title: "Real People. Real Support.",
    description:
      "Our friendly team is just a message away—24/7. No bots, no waiting games—just genuine help, when you need it most.",
    icon: <PhoneCall className="h-8 w-8 text-primary" />,
  },
  {
    title: "Meaningful Gifting",
    description:
      "From birthdays to business bonuses, our curated cards let you gift with meaning. Every card is an opportunity to create joy.",
    icon: <Gift className="h-8 w-8 text-primary" />,
  },
  {
    title: "Smooth Integration",
    description:
      "Whether you're on mobile, desktop, or switching devices—our platform keeps your gifting experience seamless and synced.",
    icon: <Plug className="h-8 w-8 text-primary" />,
  },
  {
    title: "Built for Everyone",
    description:
      "From solo users to enterprise teams, Smart Cards is scalable, adaptable, and secure for every use case.",
    icon: <Users2 className="h-8 w-8 text-primary" />,
  },
]

export default function About() {
  return (
    <div className="max-w-7xl mx-auto py-16 px-4 sm:px-6 lg:px-8 cyber-grid">
      {/* Hero Section */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
        <h1 className="text-4xl font-extrabold neon-text">
          Meet <span className="gradient-text">Smart Cards</span>
        </h1>
        <p className="mt-6 text-lg text-muted-foreground">
          We&apos;re reimagining the way you send and manage gift cards. At Smart Cards, we believe gifting should be joyful,
          seamless, and secure—whether you&apos;re celebrating milestones or building business loyalty.
        </p>
       
      </motion.div>

      {/* Features Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        className="mt-12"
      >
        <div className="flex items-center gap-2 mb-4">
          <h2 className="text-3xl font-bold neon-text">
            Why People <span className="gradient-text">Love Us</span>
          </h2>
        </div>

        <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {highlights.map((item, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 + index * 0.1 }}
              whileHover={{ y: -5, transition: { duration: 0.2 } }}
            >
              <Card className="shadow-xl rounded-lg overflow-hidden border border-primary/20 bg-card/80 transition-all duration-300 hover:shadow-primary/20 hover:border-primary/40 relative group">
                <div className="absolute -inset-0.5 bg-gradient-to-r from-primary/20 to-accent/20 rounded-xl blur opacity-0 group-hover:opacity-100 transition-opacity duration-300 -z-10"></div>
                <CardHeader className="p-4 bg-gradient-to-r from-primary/20 to-primary/5">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-full bg-background/50 animate-glow">{item.icon}</div>
                    <h2 className="text-2xl font-semibold neon-text">{item.title}</h2>
                  </div>
                </CardHeader>
                <CardContent className="p-4">
                  <p className="text-muted-foreground">{item.description}</p>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* Contact CTA */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.4 }}
        className="mt-16"
      >
        <div className="flex items-center gap-2 mb-4">
          <h2 className="text-3xl font-bold neon-text">
            Let’s <span className="gradient-text">Talk</span>
          </h2>
        </div>
        <p className="text-lg text-muted-foreground">
          Whether you’re a curious customer, a potential partner, or just want to say hi—we’re always open to
          conversation.
        </p>
      </motion.div>
    </div>
  )
}
