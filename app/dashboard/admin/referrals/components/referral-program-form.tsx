"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { saveReferralProgram } from "@/app/actions/referral"
import { toast } from "sonner"
import { AlertCircle, HelpCircle } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"

// Define proper types for the ReferralProgram
interface ReferralProgram {
  id: string
  name: string
  description: string
  isActive: boolean
  rewardAmount?: number
  referrerReward: number
  refereeReward: number
  minimumPurchase?: number | null
  maxRewardsPerUser?: number | null
  createdAt?: Date
  updatedAt?: Date
}

interface ReferralProgramFormProps {
  program?: ReferralProgram
}

interface FormErrors {
  name?: string
  referrerReward?: string
  refereeReward?: string
  minimumPurchase?: string
  maxRewardsPerUser?: string
}

export function ReferralProgramForm({ program }: ReferralProgramFormProps) {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [formError, setFormError] = useState<string | null>(null)
  const [formErrors, setFormErrors] = useState<FormErrors>({})
  const [formData, setFormData] = useState({
    name: program?.name || "",
    description: program?.description || "",
    isActive: program?.isActive ?? true,
    referrerReward: program ? (program.referrerReward / 100).toFixed(2) : "5.00",
    refereeReward: program ? (program.refereeReward / 100).toFixed(2) : "5.00",
    minimumPurchase: program?.minimumPurchase ? (program.minimumPurchase / 100).toFixed(2) : "",
    maxRewardsPerUser: program?.maxRewardsPerUser?.toString() || "",
  })

  // Validate form data
  const validateForm = () => {
    const errors: FormErrors = {}

    if (!formData.name.trim()) {
      errors.name = "Program name is required"
    }

    const referrerReward = Number.parseFloat(formData.referrerReward)
    if (isNaN(referrerReward) || referrerReward < 0) {
      errors.referrerReward = "Referrer reward must be a positive number"
    }

    const refereeReward = Number.parseFloat(formData.refereeReward)
    if (isNaN(refereeReward) || refereeReward < 0) {
      errors.refereeReward = "Friend reward must be a positive number"
    }

    if (formData.minimumPurchase) {
      const minPurchase = Number.parseFloat(formData.minimumPurchase)
      if (isNaN(minPurchase) || minPurchase < 0) {
        errors.minimumPurchase = "Minimum purchase must be a positive number"
      }
    }

    if (formData.maxRewardsPerUser) {
      const maxRewards = Number.parseInt(formData.maxRewardsPerUser)
      if (isNaN(maxRewards) || maxRewards < 0 || !Number.isInteger(maxRewards)) {
        errors.maxRewardsPerUser = "Maximum rewards must be a positive whole number"
      }
    }

    setFormErrors(errors)
    return Object.keys(errors).length === 0
  }

  // Handle input changes
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  // Handle switch change
  const handleSwitchChange = (checked: boolean) => {
    setFormData((prev) => ({ ...prev, isActive: checked }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) {
      return
    }

    setIsSubmitting(true)
    setFormError(null)

    const formDataToSubmit = new FormData()
    if (program?.id) {
      formDataToSubmit.append("id", program.id)
    }

    formDataToSubmit.append("name", formData.name)
    formDataToSubmit.append("description", formData.description)
    formDataToSubmit.append("isActive", formData.isActive.toString())
    formDataToSubmit.append("referrerReward", formData.referrerReward)
    formDataToSubmit.append("refereeReward", formData.refereeReward)

    if (formData.minimumPurchase) {
      formDataToSubmit.append("minimumPurchase", formData.minimumPurchase)
    }

    if (formData.maxRewardsPerUser) {
      formDataToSubmit.append("maxRewardsPerUser", formData.maxRewardsPerUser)
    }

    try {
      const result = await saveReferralProgram(formDataToSubmit)

      if (result.success) {
        toast(result.message || "Program saved successfully")

        // Use Next.js 15's router.refresh() to update the UI
        router.refresh()

        if (!program) {
          // Reset form if creating new program
          setFormData({
            name: "",
            description: "",
            isActive: true,
            referrerReward: "5.00",
            refereeReward: "5.00",
            minimumPurchase: "",
            maxRewardsPerUser: "",
          })
        } else {
          // Navigate back to the programs list
          router.push("/dashboard/admin/referrals?tab=programs")
        }
      } else {
        setFormError(result.message || "Failed to save program")
        toast.error(result.message || "Failed to save program")

        if (result.error) {
          console.error("Detailed error:", result.error)
        }
      }
    } catch (error) {
      console.error("Form submission error:", error)
      setFormError("An error occurred while saving the referral program")
      toast.error("An error occurred while saving the referral program")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Card className="bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 shadow-lg">
      <CardHeader>
        <CardTitle>{program ? "Edit Referral Program" : "Create New Referral Program"}</CardTitle>
        <CardDescription>Configure the referral program settings for your store</CardDescription>
      </CardHeader>
      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-6">
          {formError && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{formError}</AlertDescription>
            </Alert>
          )}

          <div className="space-y-2">
            <Label htmlFor="name">
              Program Name
              <span className="text-red-500">*</span>
            </Label>
            <Input
              id="name"
              name="name"
              placeholder="e.g., Spring Referral Program"
              value={formData.name}
              onChange={handleInputChange}
              className={formErrors.name ? "border-red-500" : ""}
              required
            />
            {formErrors.name && <p className="text-xs text-red-500 mt-1">{formErrors.name}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              name="description"
              placeholder="Describe the referral program"
              value={formData.description}
              onChange={handleInputChange}
              rows={3}
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="isActive">Active Status</Label>
              <p className="text-sm text-muted-foreground">Enable or disable this referral program</p>
            </div>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <div className="flex items-center">
                    <Switch id="isActive" checked={formData.isActive} onCheckedChange={handleSwitchChange} />
                    <HelpCircle className="h-4 w-4 ml-2 text-muted-foreground" />
                  </div>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Only one program can be active at a time. Activating this program will deactivate all others.</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="referrerReward">
                Referrer Reward ($)
                <span className="text-red-500">*</span>
              </Label>
              <Input
                id="referrerReward"
                name="referrerReward"
                type="number"
                min="0"
                step="0.01"
                placeholder="5.00"
                value={formData.referrerReward}
                onChange={handleInputChange}
                className={formErrors.referrerReward ? "border-red-500" : ""}
                required
              />
              {formErrors.referrerReward ? (
                <p className="text-xs text-red-500 mt-1">{formErrors.referrerReward}</p>
              ) : (
                <p className="text-xs text-muted-foreground">
                  Amount the referrer receives when a friend makes a qualifying purchase
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="refereeReward">
                Friend Reward ($)
                <span className="text-red-500">*</span>
              </Label>
              <Input
                id="refereeReward"
                name="refereeReward"
                type="number"
                min="0"
                step="0.01"
                placeholder="5.00"
                value={formData.refereeReward}
                onChange={handleInputChange}
                className={formErrors.refereeReward ? "border-red-500" : ""}
                required
              />
              {formErrors.refereeReward ? (
                <p className="text-xs text-red-500 mt-1">{formErrors.refereeReward}</p>
              ) : (
                <p className="text-xs text-muted-foreground">
                  Amount the referred friend receives on their first purchase
                </p>
              )}
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="minimumPurchase">Minimum Purchase ($)</Label>
              <Input
                id="minimumPurchase"
                name="minimumPurchase"
                type="number"
                min="0"
                step="0.01"
                placeholder="Optional"
                value={formData.minimumPurchase}
                onChange={handleInputChange}
                className={formErrors.minimumPurchase ? "border-red-500" : ""}
              />
              {formErrors.minimumPurchase ? (
                <p className="text-xs text-red-500 mt-1">{formErrors.minimumPurchase}</p>
              ) : (
                <p className="text-xs text-muted-foreground">Minimum purchase amount required to qualify (optional)</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="maxRewardsPerUser">Max Rewards Per User</Label>
              <Input
                id="maxRewardsPerUser"
                name="maxRewardsPerUser"
                type="number"
                min="0"
                step="1"
                placeholder="Optional"
                value={formData.maxRewardsPerUser}
                onChange={handleInputChange}
                className={formErrors.maxRewardsPerUser ? "border-red-500" : ""}
              />
              {formErrors.maxRewardsPerUser ? (
                <p className="text-xs text-red-500 mt-1">{formErrors.maxRewardsPerUser}</p>
              ) : (
                <p className="text-xs text-muted-foreground">Maximum number of rewards a user can earn (optional)</p>
              )}
            </div>
          </div>
        </CardContent>
        <CardFooter className="flex justify-between">
          <Button
            variant="outline"
            type="button"
            onClick={() => router.push("/dashboard/admin/referrals?tab=programs")}
          >
            Cancel
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Saving..." : program ? "Update Program" : "Create Program"}
          </Button>
        </CardFooter>
      </form>
    </Card>
  )
}

