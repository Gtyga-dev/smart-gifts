"use client"

import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { motion } from "framer-motion"
import { Shield, Users, Gift, Layers, Headphones } from "lucide-react"

export const dynamic = 'force-dynamic';


const features = [
  {
    title: "User-Centric Design",
    description:
      "Our platform is designed with you in mind, offering an intuitive and user-friendly interface that simplifies gift card management.",
    icon: <Users className="h-8 w-8 text-primary" />,
  },
  {
    title: "Flexible Payments",
    description:
      "With our wide range of payment methods, including mobile money and Visa, you have flexibility and convenience at your fingertips.",
    icon: <Shield className="h-8 w-8 text-primary" />,
  },
  {
    title: "24/7 Customer Support",
    description:
      "We are here whenever you need us. Our dedicated support team is available around the clock to help with any inquiries or issues.",
    icon: <Headphones className="h-8 w-8 text-primary" />,
  },
  {
    title: "Tailored Gifting Solutions",
    description:
      "We offer personalized gifting options to cater to any occasion, making it easy to give the perfect gift every time.",
    icon: <Gift className="h-8 w-8 text-primary" />,
  },
  {
    title: "Seamless Integration",
    description:
      "Our platform integrates with a variety of services, ensuring smooth and secure transactions across different devices and networks.",
    icon: <Layers className="h-8 w-8 text-primary" />,
  },
]

export default function About() {
  return (
    <div className="max-w-7xl mx-auto py-16 px-4 sm:px-6 lg:px-8 cyber-grid">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
        <h1 className="text-4xl font-extrabold neon-text">
          About <span className="gradient-text">Us</span>
        </h1>
        <p className="mt-6 text-lg text-muted-foreground">
          At Smart Cards, we make buying and managing gift cards simple, secure, and convenient. Whether for personal use
          or gifting, our platform offers a seamless experience with multiple payment options, including mobile
          payments, Visa cards, and bank transfers.
        </p>
        <p className="mt-4 text-lg text-muted-foreground">
          Powered by Trickal Holdings, we aim to redefine the gifting experience by delivering innovative and
          user-friendly solutions. Let Smart Cards be your trusted gifting partner!
        </p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        className="mt-12"
      >
        <div className="flex items-center gap-2 mb-4">

          <h2 className="text-3xl font-bold neon-text">
            Why Choose <span className="gradient-text">Us</span>
          </h2>
        </div>

        <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
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
                    <div className="p-2 rounded-full bg-background/50 animate-glow">{feature.icon}</div>
                    <h2 className="text-2xl font-semibold neon-text">{feature.title}</h2>
                  </div>
                </CardHeader>
                <CardContent className="p-4">
                  <p className="text-muted-foreground">{feature.description}</p>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.4 }}
        className="mt-12"
      >
        <div className="flex items-center gap-2 mb-4">

          <h2 className="text-3xl font-bold neon-text">
            Contact <span className="gradient-text">Us</span>
          </h2>
        </div>
        <Card className="p-6 bg-card/80 border border-primary/20 shadow-lg">
          <CardContent className="space-y-4">
            <p className="text-lg">Office Address: Development House, Blantyre, Third Floor, Office 307</p>
            <p className="text-lg">
              Email:{" "}
              <a
                href="mailto:contact@SmartCards.store"
                className="text-primary hover:text-primary/80 transition-colors duration-200"
              >
                contact@SmartCards.store
              </a>
            </p>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  )
}
