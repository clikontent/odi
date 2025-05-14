"use client"

import type { ReactNode } from "react"
import { useUser } from "@/contexts/user-context"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Lock, Crown } from "lucide-react"

interface PremiumFeatureGateProps {
  children: ReactNode
  featureType: "coverLetter" | "resumeDownload" | "atsOptimization" | "interviewPrep" | "jobBoard"
  title?: string
  description?: string
}

export function PremiumFeatureGate({
  children,
  featureType,
  title = "Premium Feature",
  description = "This feature is available to premium users only.",
}: PremiumFeatureGateProps) {
  const { canUseFeature, isPremium, isProfessional, isCorporate, handleUpgradeClick } = useUser()

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
          description: "Upgrade to premium to generate AI-powered cover letters tailored to specific job descriptions.",
        }
      case "resumeDownload":
        return {
          title: "Resume Downloads",
          description: "Upgrade to premium to download professionally formatted resumes.",
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
      case "jobBoard":
        return {
          title: "Full Job Board Access",
          description:
            "Upgrade to premium to access all job listings, including private opportunities not available to free users.",
        }
      default:
        return {
          title,
          description,
        }
    }
  }

  const featureDetails = getFeatureDetails()

  // Determine which plan to recommend
  const recommendedPlan = isPremium ? "professional" : "premium"
  const planLabel = isPremium ? "Professional" : "Premium"

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
          <Button onClick={() => handleUpgradeClick(recommendedPlan as any)}>
            {isPremium ? "Upgrade to Professional" : "Upgrade to Premium"}
          </Button>
        </div>
      </CardContent>
      <CardFooter className="flex justify-center border-t pt-4">
        <p className="text-xs text-muted-foreground">
          {isPremium
            ? "Professional plan includes unlimited access to all features."
            : `${planLabel} plans start at just $${recommendedPlan === "premium" ? "15" : "25"} per month.`}
        </p>
      </CardFooter>
    </Card>
  )
}
