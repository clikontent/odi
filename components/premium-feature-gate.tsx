"use client"

import type { ReactNode } from "react"
import { useUser } from "@/contexts/user-context"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Lock, Crown } from "lucide-react"

interface PremiumFeatureGateProps {
  children: ReactNode
  featureType: "coverLetter" | "resumeDownload" | "atsOptimization" | "interviewPrep"
  title?: string
  description?: string
}

export function PremiumFeatureGate({
  children,
  featureType,
  title = "Premium Feature",
  description = "This feature is available to premium users only.",
}: PremiumFeatureGateProps) {
  const { canUseFeature, isPremium, isCorporate, handleUpgradeClick } = useUser()

  const hasAccess = canUseFeature(featureType)

  if (hasAccess) {
    return <>{children}</>
  }

  // Feature-specific messages
  const getFeatureDetails = () => {
    switch (featureType) {
      case "coverLetter":
        return {
          title: "Premium Cover Letters",
          description:
            "Upgrade to premium to generate unlimited AI-powered cover letters tailored to specific job descriptions.",
        }
      case "resumeDownload":
        return {
          title: "Resume Downloads",
          description: "Upgrade to premium to download up to 10 professionally formatted resumes per month.",
        }
      case "atsOptimization":
        return {
          title: "ATS Optimization",
          description:
            "Upgrade to premium to access our advanced ATS optimization tools that help your resume pass through applicant tracking systems.",
        }
      case "interviewPrep":
        return {
          title: "Interview Preparation",
          description:
            "Upgrade to premium to access our AI-powered interview preparation tools with personalized questions and feedback.",
        }
      default:
        return {
          title,
          description,
        }
    }
  }

  const featureDetails = getFeatureDetails()

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex items-center gap-2">
          <Lock className="h-5 w-5 text-primary" />
          <CardTitle>{featureDetails.title}</CardTitle>
        </div>
        <CardDescription>{featureDetails.description}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col items-center justify-center p-6 text-center">
          <Crown className="h-16 w-16 text-primary/20 mb-4" />
          <p className="mb-4 text-muted-foreground">
            {isPremium
              ? "You've reached your usage limit for this feature."
              : "This feature requires a premium subscription."}
          </p>
          <Button onClick={handleUpgradeClick}>{isPremium ? "Upgrade to Corporate" : "Upgrade to Premium"}</Button>
        </div>
      </CardContent>
      <CardFooter className="flex justify-center border-t pt-4">
        <p className="text-xs text-muted-foreground">
          {isPremium
            ? "Corporate plans include unlimited access to all features."
            : "Premium plans start at just KES 2,000 per month."}
        </p>
      </CardFooter>
    </Card>
  )
}
