"use client";

import React, { useState } from "react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import axios from "axios";

export const dynamic = "force-dynamic";

const ContactPage = () => {
  const { toast } = useToast();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const resetForm = () => {
    setName("");
    setEmail("");
    setMessage("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim() || !email.trim() || !message.trim()) {
      toast({
        variant: "destructive",
        title: "Missing Fields",
        description: "Please complete all fields before submitting.",
      });
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      toast({
        variant: "destructive",
        title: "Invalid Email",
        description: "Please enter a valid email address.",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await axios.post("/api/contact", {
        name: name.trim(),
        email: email.trim(),
        message: message.trim(),
      });

      if (response.data.success) {
        toast({
          title: "Success",
          description: "Your message has been sent!",
        });
        resetForm();
      } else {
        toast({
          variant: "destructive",
          title: "Failed",
          description: response.data.message || "Failed to send message.",
        });
      }
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Something went wrong. Please try again later.",
      });
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-white via-slate-100 to-slate-200 dark:from-[#0f0f0f] dark:to-[#1e1e1e] flex items-center justify-center px-4 py-16">
      <div className="w-full max-w-4xl grid md:grid-cols-2 gap-8 bg-white dark:bg-[#121212] shadow-2xl rounded-3xl overflow-hidden">
        {/* Left illustration or banner */}
        <div className="bg-gradient-to-tr from-indigo-500 to-purple-600 text-white flex flex-col justify-center items-center p-10">
          <h2 className="text-3xl font-bold">Let’s Talk</h2>
          <p className="text-sm opacity-90 mt-2 text-center">
            Whether you have a question or just want to say hi, we’re happy to hear from you.
          </p>
          <div className="mt-6 w-24 h-24 rounded-full bg-white/20 flex items-center justify-center">
            📬
          </div>
        </div>

        {/* Right form */}
        <form
          onSubmit={handleSubmit}
          className="w-full p-8 md:p-10 space-y-6"
        >
          <div className="space-y-1">
            <label htmlFor="name" className="text-sm font-medium text-gray-700 dark:text-gray-200">
              Name <span className="text-red-500">*</span>
            </label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="John Doe"
              disabled={isSubmitting}
              className="bg-white dark:bg-neutral-900"
              required
            />
          </div>

          <div className="space-y-1">
            <label htmlFor="email" className="text-sm font-medium text-gray-700 dark:text-gray-200">
              Email <span className="text-red-500">*</span>
            </label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              disabled={isSubmitting}
              className="bg-white dark:bg-neutral-900"
              required
            />
          </div>

          <div className="space-y-1">
            <label htmlFor="message" className="text-sm font-medium text-gray-700 dark:text-gray-200">
              Message <span className="text-red-500">*</span>
            </label>
            <Textarea
              id="message"
              rows={5}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Type your message here..."
              disabled={isSubmitting}
              className="bg-white dark:bg-neutral-900"
              required
            />
          </div>

          <Button
            type="submit"
            disabled={isSubmitting}
            className="w-full h-12 text-lg font-semibold transition-all duration-300 ease-in-out"
          >
            {isSubmitting ? (
              <div className="flex items-center space-x-2">
                <span className="loader inline-block h-4 w-4 border-t-2 border-b-2 border-white rounded-full animate-spin"></span>
                <span>Sending...</span>
              </div>
            ) : (
              "Send Message"
            )}
          </Button>
        </form>
      </div>
    </div>
  );
};

export default ContactPage;
