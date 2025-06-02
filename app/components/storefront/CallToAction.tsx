"use client"

import { Button } from "@/components/ui/button"
import Link from "next/link"
import { ArrowRight } from "lucide-react"
import { motion } from "framer-motion"

export function CallToAction() {
  return (
    <section className="py-16 bg-gradient-to-br from-blue-900/30 to-background">
      <div className="container mx-auto px-4">
        <div className="max-w-3xl mx-auto text-center">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: true }}
            className="text-3xl font-bold tracking-tight bg-gradient-to-r from-blue-400 to-blue-600 bg-clip-text text-transparent mb-4"
          >
            Ready to Get Started?
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            viewport={{ once: true }}
            className="text-muted-foreground mb-8"
          >
            Join thousands of satisfied customers who trust Smart Cards for their gift card needs. Create an account today
            and start enjoying instant digital deliveries.
          </motion.p>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            viewport={{ once: true }}
            className="flex flex-col sm:flex-row gap-4 justify-center"
          >
            <Button
              asChild
              className="bg-blue-600 hover:bg-blue-700 text-white transition-all duration-300 rounded-md px-6 py-6 text-base"
            >
              <Link href="/auth/sign-up">
                Create Account
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
            <Button
              asChild
              variant="outline"
              className="border-blue-500/30 hover:bg-blue-600 hover:text-white transition-all duration-300 rounded-md px-6 py-6 text-base"
            >
              <Link href="/products/all">Browse Gift Cards</Link>
            </Button>
          </motion.div>
        </div>
      </div>
    </section>
  )
}

