"use client";

import { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Copy,
  Mail,
  Share2,
  Check,
  Facebook,
  Twitter,
  Linkedin,
  Link,
} from "lucide-react";
import { sendReferralInvitation } from "@/app/actions/referral";

import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";

interface ReferralShareProps {
  referralUrl: string;
  referralCode: string;
}

export function ReferralShare({
  referralUrl,
  referralCode,
}: ReferralShareProps) {
  const toast = useToast();
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState(
    `Hey! I thought you might like Smart Cards Gift Cards. Use my referral code ${referralCode} to get a discount on your first purchase!`
  );
  const [isSending, setIsSending] = useState(false);
  const [copied, setCopied] = useState<string | null>(null);
  const [shareCount, setShareCount] = useState(0);

  const copyToClipboard = (text: string, type: string) => {
    navigator.clipboard.writeText(text);
    setCopied(type);
    toast.toast({
      title: "Success",
      description: `Copied to Clipboard!`,
      variant: "default",
    });

    // Reset the copied state after 2 seconds
    setTimeout(() => {
      setCopied(null);
    }, 2000);

    // Track analytics
    trackShareEvent("copy", type);
  };

  const shareReferral = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: "Join Smart Cards Gift Cards",
          text: message,
          url: referralUrl,
        });
        trackShareEvent("native", "share");
      } catch (err) {
        console.error("Error sharing:", err);
      }
    } else {
      copyToClipboard(referralUrl, "url");
    }
  };

  const shareToSocial = (platform: string) => {
    let shareUrl = "";

    switch (platform) {
      case "facebook":
        shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(referralUrl)}`;
        break;
      case "twitter":
        shareUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(message)}&url=${encodeURIComponent(referralUrl)}`;
        break;
      case "linkedin":
        shareUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(referralUrl)}`;
        break;
    }

    if (shareUrl) {
      window.open(shareUrl, "_blank", "width=600,height=400");
      trackShareEvent("social", platform);
    }
  };

  const trackShareEvent = (method: string, platform: string) => {
    // Increment local share count for UI feedback
    setShareCount((prev) => prev + 1);

    // In a real app, you would send this to your analytics service
    console.log(`Referral shared via ${method} on ${platform}`);

    // You could also send this to your server for tracking
    // fetch('/api/track-share', {
    //   method: 'POST',
    //   headers: { 'Content-Type': 'application/json' },
    //   body: JSON.stringify({ method, platform, referralCode })
    // });
  };

  const handleSendInvitation = async (formData: FormData) => {
    setIsSending(true);
    try {
      const result = await sendReferralInvitation(formData);
      if (result.success) {
        toast.toast({
          title: "Success",
          description: "Invitation sent successfully!",
          variant: "default",
        });
        setEmail("");
        trackShareEvent("email", "direct");
      } else {
        toast.toast({
          title: "Error",
          description: result.message || "Failed to send invitation",
          variant: "destructive",
        });
      }
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (error) {
      toast.toast({
        title: "Error",
        description: "An error occurred while sending the invitation",
        variant: "destructive",
      });
    } finally {
      setIsSending(false);
    }
  };

  return (
    <Card className="bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 shadow-lg">
      <CardHeader>
        <CardTitle>Share Your Referral</CardTitle>
        <CardDescription>
          Invite friends to Smart Cards and earn rewards when they make their first
          purchase
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="link">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="link">Share Link</TabsTrigger>
            <TabsTrigger value="email">Email Invitation</TabsTrigger>
            <TabsTrigger value="social">Social Media</TabsTrigger>
          </TabsList>
          <TabsContent value="link" className="space-y-4 pt-4">
            <div className="space-y-2">
              <Label htmlFor="referral-link">Your Referral Link</Label>
              <div className="flex space-x-2">
                <Input
                  id="referral-link"
                  value={referralUrl}
                  readOnly
                  className="font-mono text-sm"
                />
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => copyToClipboard(referralUrl, "url")}
                  title="Copy to clipboard"
                >
                  {copied === "url" ? (
                    <Check className="h-4 w-4 text-green-500" />
                  ) : (
                    <Copy className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="referral-code">Your Referral Code</Label>
              <div className="flex space-x-2">
                <Input
                  id="referral-code"
                  value={referralCode}
                  readOnly
                  className="font-mono text-sm"
                />
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => copyToClipboard(referralCode, "code")}
                  title="Copy to clipboard"
                >
                  {copied === "code" ? (
                    <Check className="h-4 w-4 text-green-500" />
                  ) : (
                    <Copy className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="message">Customize Your Message</Label>
              <Textarea
                id="message"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                rows={3}
              />
            </div>
          </TabsContent>
          <TabsContent value="email" className="pt-4">
            <form action={handleSendInvitation} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Friend&apos;s Email</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="friend@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email-message">
                  Personalized Message (Optional)
                </Label>
                <Textarea
                  id="email-message"
                  name="message"
                  placeholder="Add a personal note to your invitation"
                  rows={3}
                />
              </div>
              <Button type="submit" disabled={isSending} className="w-full">
                {isSending ? "Sending..." : "Send Invitation"}
                <Mail className="ml-2 h-4 w-4" />
              </Button>
            </form>
          </TabsContent>
          <TabsContent value="social" className="pt-4">
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground">
                Share your referral link on your favorite social media platforms
              </p>
              <div className="flex flex-wrap gap-2">
                <Button
                  variant="outline"
                  onClick={() => shareToSocial("facebook")}
                  className="flex-1"
                >
                  <Facebook className="mr-2 h-4 w-4" />
                  Facebook
                </Button>
                <Button
                  variant="outline"
                  onClick={() => shareToSocial("twitter")}
                  className="flex-1"
                >
                  <Twitter className="mr-2 h-4 w-4" />
                  Twitter
                </Button>
                <Button
                  variant="outline"
                  onClick={() => shareToSocial("linkedin")}
                  className="flex-1"
                >
                  <Linkedin className="mr-2 h-4 w-4" />
                  LinkedIn
                </Button>
              </div>
              <div className="mt-4">
                <Button
                  variant="outline"
                  onClick={() => copyToClipboard(message, "message")}
                  className="w-full"
                >
                  <Link className="mr-2 h-4 w-4" />
                  Copy Message
                  {copied === "message" && (
                    <Check className="ml-2 h-4 w-4 text-green-500" />
                  )}
                </Button>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
      <CardFooter className="flex flex-col gap-4">
        <Button variant="default" className="w-full" onClick={shareReferral}>
          <Share2 className="mr-2 h-4 w-4" />
          Share with Friends
        </Button>
        {shareCount > 0 && (
          <p className="text-xs text-center text-muted-foreground">
            You&apos;ve shared your referral {shareCount}{" "}
            {shareCount === 1 ? "time" : "times"}. Keep sharing to earn more
            rewards!
          </p>
        )}
      </CardFooter>
    </Card>
  );
}
