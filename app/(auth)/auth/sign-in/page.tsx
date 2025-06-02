"use client"

import { RegisterLink, LoginLink } from "@kinde-oss/kinde-auth-nextjs/components"
import { FaGoogle } from "react-icons/fa"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import EmailInput from "@/app/components/EmailInput"
import { motion } from "framer-motion"
import { LogIn } from "lucide-react"

export default function SignIn() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#0f0f0f] via-[#121212] to-[#0f0f0f] px-4 py-10 relative overflow-hidden">
      {/* Ambient animated circles */}
      <div className="absolute inset-0 -z-10">
        {[...Array(4)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute rounded-full bg-primary/10 blur-3xl"
            style={{
              width: Math.random() * 300 + 150,
              height: Math.random() * 300 + 150,
              top: `${Math.random() * 90}%`,
              left: `${Math.random() * 90}%`,
            }}
            animate={{
              x: [0, Math.random() * 50 - 25],
              y: [0, Math.random() * 50 - 25],
              opacity: [0.2, 0.1, 0.2],
            }}
            transition={{
              repeat: Infinity,
              duration: 10 + i * 2,
              ease: "easeInOut",
              repeatType: "mirror",
            }}
          />
        ))}
      </div>

      {/* Auth Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="w-full max-w-md z-10"
      >
        <Card className="bg-black/60 backdrop-blur-xl border border-white/10 shadow-2xl rounded-2xl relative overflow-hidden">
          {/* Glow ring effect */}
          <div className="absolute -inset-[1px] bg-gradient-to-br from-primary/20 to-accent/20 rounded-2xl blur-xl opacity-50 pointer-events-none z-0" />

          {/* Header */}
          <CardHeader className="relative z-10 flex flex-col items-center gap-4 pt-6">
            <motion.div
              className="rounded-full bg-primary/10 p-3"
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.2 }}
            >
              <Image src="/tlogo.png" alt="Smart Cards" width={80} height={80} className="invert" />
            </motion.div>
            <CardTitle className="text-2xl text-white text-center font-semibold">
              Sign In to <span className="text-primary">Smart Cards</span>
            </CardTitle>
            <CardDescription className="text-muted-foreground text-center">
              Enter your credentials to access your account
            </CardDescription>
          </CardHeader>

          {/* Content */}
          <CardContent className="relative z-10 space-y-6 px-6">
            {/* Google login */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
            >
              <LoginLink
                className="w-full"
                authUrlParams={{
                  connection_id: process.env.NEXT_PUBLIC_KINDE_CONNECTION_GOOGLE || "",
                }}
              >
                <Button
                  variant="outline"
                  className="w-full border border-primary/30 hover:bg-primary/10 text-white transition-all"
                >
                  <FaGoogle className="mr-2" />
                  Sign in with Google
                </Button>
              </LoginLink>
            </motion.div>

            {/* Divider */}
            <motion.div
              className="relative"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
            >
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t border-white/10" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-black/80 px-2 text-muted-foreground">or continue with email</span>
              </div>
            </motion.div>

            {/* EmailInput */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
            >
              <EmailInput />
            </motion.div>
          </CardContent>

          {/* Footer */}
          <CardFooter className="relative z-10 flex justify-center pb-6 px-6">
            <motion.p
              className="text-sm text-muted-foreground text-center"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6 }}
            >
              Don&apos;t have an account?{" "}
              <RegisterLink
                className="text-primary hover:underline"
                authUrlParams={{
                  connection_id: process.env.NEXT_PUBLIC_KINDE_CONNECTION_GOOGLE || "",
                }}
              >
                Create account
              </RegisterLink>
            </motion.p>
          </CardFooter>
        </Card>

        {/* Floating Icon */}
        <motion.div
          className="absolute bottom-6 right-6 text-primary/50"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
        >
          <LogIn className="h-10 w-10 animate-float" />
        </motion.div>
      </motion.div>
    </div>
  )
}
