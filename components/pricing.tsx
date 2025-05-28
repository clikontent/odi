"use client"

import type React from "react"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Check, Star, Zap, Crown, Building } from "lucide-react"

interface PricingTier {
  id: string
  name: string
  price: string
  period: string
  description: string
  features: string[]
  icon: React.ReactNode
  popular?: boolean
  buttonText: string
  buttonVariant: "default" | "outline"
}

const pricingTiers: PricingTier[] = [
  {
    id: "free",
    name: "Free Plan",
    price: "Free",
    period: "",
    description: "Try our core AI tools",
    features: [
      "5 Free AI-Generated Cover Letters monthly",
      "Build Resume (AI Generation/Download $5 per resume)",
      "Basic ATS Keyword Suggestions",
      "Job Board (Public Jobs Only)",
      "Interview Prep (Upgrade to Professional)",
    ],
    icon: <Star className="h-6 w-6" />,
    buttonText: "Select Free Plan",
    buttonVariant: "outline",
  },
  {
    id: "premium",
    name: "Premium Plan",
    price: "$9.99",
    period: "/month",
    description: "Essential tools to accelerate your job search",
    features: [
      "25 AI-Generated Cover Letters/month",
      "5 AI-Generated Resumes/month",
      "Full AI ATS Optimization",
      "Job Board (Public + Private/Exclusive Jobs)",
      "Interview Prep (Upgrade to Professional)",
    ],
    icon: <Zap className="h-6 w-6" />,
    popular: true,
    buttonText: "Select Premium Plan",
    buttonVariant: "default",
  },
  {
    id: "professional",
    name: "Professional Plan",
    price: "$19.99",
    period: "/month",
    description: "Unlimited power for career professionals",
    features: [
      "Unlimited AI-Generated Cover Letters",
      "20 AI-Generated Resumes/month",
      "Advanced AI ATS Optimization",
      "Premium AI Interview Coach",
      "Full Job Board Access",
      "Priority Support",
    ],
    icon: <Crown className="h-6 w-6" />,
    buttonText: "Select Professional Plan",
    buttonVariant: "default",
  },
  {
    id: "corporate",
    name: "Corporate Plan",
    price: "$150",
    period: "/month",
    description: "AI-driven solutions for recruiting",
    features: [
      "AI Candidate Sourcing & Matching",
      "Bulk Applicant Resume Screening",
      "Company Profile & Featured Job Posts",
      "Team Access (up to 3 users)",
      "Recruitment Analytics Dashboard",
      "Dedicated Account Manager",
    ],
    icon: <Building className="h-6 w-6" />,
    buttonText: "Contact Sales",
    buttonVariant: "outline",
  },
]

interface PricingProps {
  onSelectPlan?: (planId: string) => void
}

export default function Pricing({ onSelectPlan }: PricingProps) {
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null)

  const handleSelectPlan = (planId: string) => {
    setSelectedPlan(planId)
    onSelectPlan?.(planId)
  }

  return (
    <div className="py-12">
      <div className="text-center mb-12">
        <h2 className="text-3xl font-bold text-gray-900 mb-4">Choose Your Plan</h2>
        <p className="text-xl text-gray-600 max-w-2xl mx-auto">
          Select the perfect plan to accelerate your job search with AI-powered tools
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-7xl mx-auto px-4">
        {pricingTiers.map((tier) => (
          <Card
            key={tier.id}
            className={`relative ${tier.popular ? "border-2 border-blue-500 shadow-lg" : "border"} ${
              selectedPlan === tier.id ? "ring-2 ring-blue-500" : ""
            }`}
          >
            {tier.popular && (
              <Badge className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-blue-500 text-white">
                MOST POPULAR
              </Badge>
            )}

            <CardHeader className="text-center">
              <div className="w-12 h-12 mx-auto mb-4 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center text-white">
                {tier.icon}
              </div>
              <CardTitle className="text-xl">{tier.name}</CardTitle>
              <CardDescription className="text-sm">{tier.description}</CardDescription>
              <div className="mt-4">
                <span className="text-3xl font-bold text-gray-900">{tier.price}</span>
                <span className="text-gray-600">{tier.period}</span>
              </div>
            </CardHeader>

            <CardContent>
              <ul className="space-y-3 mb-6">
                {tier.features.map((feature, index) => (
                  <li key={index} className="flex items-start">
                    <Check className="h-4 w-4 text-green-500 mt-0.5 mr-3 flex-shrink-0" />
                    <span className="text-sm text-gray-600">{feature}</span>
                  </li>
                ))}
              </ul>

              <Button
                variant={tier.buttonVariant}
                className="w-full"
                onClick={() => handleSelectPlan(tier.id)}
                disabled={selectedPlan === tier.id}
              >
                {selectedPlan === tier.id ? "Selected" : tier.buttonText}
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="text-center mt-8">
        <p className="text-sm text-gray-600">
          All plans include 14-day free trial. No credit card required for Free plan.
        </p>
      </div>
    </div>
  )
}
