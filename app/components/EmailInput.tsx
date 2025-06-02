"use client";
import React, { useState } from "react";
import { LoginLink, RegisterLink } from "@kinde-oss/kinde-auth-nextjs/components";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

interface EmailInputProps {
  isSignUp?: boolean;
}

export default function EmailInput({ isSignUp = false }: EmailInputProps) {
  const [email, setEmail] = useState("");

  const handleEmailChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setEmail(event.target.value);
  };

  const LinkComponent = isSignUp ? RegisterLink : LoginLink;

  return (
    <div className="space-y-4 w-full">
      <Input
        type="email"
        placeholder="Email"
        required
        value={email}
        onChange={handleEmailChange}
        className="border-blue-300 focus:ring-blue-500 focus:border-blue-500"
      />
      <LinkComponent
        authUrlParams={{
          connection_id: process.env.NEXT_PUBLIC_KINDE_CONNECTION_EMAIL_PASSWORDLESS || "",
          login_hint: email,
        }}
        className="w-full"
      >
        <Button variant="default" className="w-full bg-blue-600 hover:bg-blue-700 text-white">
          {isSignUp ? "Sign Up" : "Sign In"} with Email
        </Button>
      </LinkComponent>
    </div>
  );
}

