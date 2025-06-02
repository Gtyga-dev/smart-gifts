"use client"
import { LoginLink, RegisterLink } from "@kinde-oss/kinde-auth-nextjs/components"
import EmailInput from "@/app/components/EmailInput"
import { FaGoogle } from "react-icons/fa"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { motion } from "framer-motion"
import { UserPlus} from "lucide-react"

export default function SignUp() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-primary/5 to-background p-4 relative overflow-hidden cyber-grid">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-full">
          {[...Array(5)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute rounded-full bg-primary/10"
              style={{
                width: Math.random() * 300 + 50,
                height: Math.random() * 300 + 50,
                top: `${Math.random() * 100}%`,
                left: `${Math.random() * 100}%`,
              }}
              initial={{ opacity: 0.1, scale: 0 }}
              animate={{
                opacity: [0.1, 0.2, 0.1],
                scale: [0, 1],
                x: [0, Math.random() * 100 - 50],
                y: [0, Math.random() * 100 - 50],
              }}
              transition={{
                duration: 10 + i * 2,
                repeat: Number.POSITIVE_INFINITY,
                repeatType: "reverse",
                ease: "easeInOut",
              }}
            />
          ))}
        </div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md z-10"
      >
        <Card className="bg-gradient-to-br from-card to-card/50 shadow-xl border border-primary/30 backdrop-blur-sm relative">
          <div className="absolute -inset-0.5 bg-gradient-to-r from-primary/20 to-accent/20 rounded-xl blur opacity-50"></div>
          <CardHeader className="space-y-1 flex flex-col items-center relative">
            <motion.div
              className="rounded-full overflow-hidden mb-4 p-2 bg-primary/10 animate-glow"
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              <div className="relative">
                <Image src="/tlogo.png" alt="Smart Cards Logo" width={80} height={80} className="brightness-0 filter invert" />
              </div>
            </motion.div>
            <CardTitle className="text-3xl font-bold text-center text-yellow-50">Join Smart Cards</CardTitle>
            <CardDescription className="text-muted-foreground text-center">
              Create an account to start shopping
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6 relative">
            {/* Google Sign-up */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.3 }}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <RegisterLink
                className="w-full"
                authUrlParams={{
                  connection_id: process.env.NEXT_PUBLIC_KINDE_CONNECTION_GOOGLE || "",
                }}
              >
                <Button
                  variant="outline"
                  className="w-full border-primary/30 hover:bg-primary/10 text-primary-foreground transition-all duration-300"
                >
                  <FaGoogle className="mr-2 h-4 w-4" />
                  Sign up with Google
                </Button>
              </RegisterLink>
            </motion.div>

            {/* Divider */}
            <motion.div
              className="relative"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.3, delay: 0.4 }}
            >
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t border-primary/30" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-card px-2 text-muted-foreground">Or continue with email</span>
              </div>
            </motion.div>

            {/* Email Input for Sign-up */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.5 }}
            >
              <EmailInput isSignUp />
            </motion.div>
          </CardContent>
          <CardFooter className="relative">
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.3, delay: 0.6 }}
              className="text-sm text-center w-full text-muted-foreground"
            >
              Already have an account?{" "}
              <LoginLink
                className="text-primary hover:text-primary/80 transition-colors duration-200"
                authUrlParams={{
                  connection_id: process.env.NEXT_PUBLIC_KINDE_CONNECTION_GOOGLE || "",
                }}
              >
                Sign in
              </LoginLink>
            </motion.p>
          </CardFooter>
        </Card>

        {/* Floating icon */}
        <motion.div
          className="absolute bottom-6 right-6 text-primary/50 animate-float"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8, duration: 0.5 }}
        >
          <UserPlus className="h-12 w-12" />
        </motion.div>
      </motion.div>
    </div>
  )
}
