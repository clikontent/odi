"use client"

import { useEffect, useState } from "react"
import { useAuth } from "@/contexts/auth-context"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { FileText, MessageSquare, Zap, Crown } from "lucide-react"
import { getCurrentUsage, getUserSubscription, PLAN_LIMITS } from "@/lib/subscription"
import type { Subscription, UsageTracking } from "@/lib/types"

export default function UsageTracker() {
  const { user } = useAuth()
  const [subscription, setSubscription] = useState<Subscription | null>(null)
  const [usage, setUsage] = useState<UsageTracking | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (user) {
      fetchUsageData()
    }
  }, [user])

  const fetchUsageData = async () => {
    try {
      const [subData, usageData] = await Promise.all([
        getUserSubscription(user?.id || ""),
        getCurrentUsage(user?.id || ""),
      ])

      setSubscription(subData)
      setUsage(usageData)
    } catch (error) {
      console.error("Error fetching usage data:", error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="animate-pulse space-y-4">
            <div className="h-4 bg-gray-200 rounded w-1/4"></div>
            <div className="h-2 bg-gray-200 rounded"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
          </div>
        </CardContent>
      </Card>
    )
  }

  const planType = subscription?.plan_type || "free"
  const limits = PLAN_LIMITS[planType]

  const usageItems = [
    {
      label: "Cover Letters",
      current: usage?.cover_letters_generated || 0,
      limit: limits.cover_letters,
      icon: <FileText className="h-4 w-4" />,
      color: "blue",
    },
    {
      label: "Resumes",
      current: usage?.resumes_generated || 0,
      limit: limits.resumes,
      icon: <FileText className="h-4 w-4" />,
      color: "green",
    },
    {
      label: "ATS Optimizations",
      current: usage?.ats_optimizations_used || 0,
      limit: limits.ats_optimizations,
      icon: <Zap className="h-4 w-4" />,
      color: "purple",
    },
    {
      label: "Interview Sessions",
      current: usage?.interview_sessions || 0,
      limit: limits.interview_sessions,
      icon: <MessageSquare className="h-4 w-4" />,
      color: "orange",
    },
  ]

  const getPlanBadgeColor = (plan: string) => {
    switch (plan) {
      case "free":
        return "bg-gray-100 text-gray-800"
      case "premium":
        return "bg-blue-100 text-blue-800"
      case "professional":
        return "bg-purple-100 text-purple-800"
      case "corporate":
        return "bg-gold-100 text-gold-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const getProgressColor = (percentage: number) => {
    if (percentage >= 90) return "bg-red-500"
    if (percentage >= 75) return "bg-yellow-500"
    return "bg-green-500"
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center">
              <Crown className="mr-2 h-5 w-5" />
              Current Plan & Usage
            </CardTitle>
            <CardDescription>Track your monthly usage and plan limits</CardDescription>
          </div>
          <Badge className={getPlanBadgeColor(planType)}>{planType.toUpperCase()}</Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {usageItems.map((item) => {
            const isUnlimited = item.limit === -1
            const percentage = isUnlimited ? 0 : (item.current / item.limit) * 100
            const isNearLimit = percentage >= 80

            return (
              <div key={item.label} className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    {item.icon}
                    <span className="font-medium">{item.label}</span>
                  </div>
                  <div className="text-sm text-gray-600">
                    {item.current} / {isUnlimited ? "∞" : item.limit}
                  </div>
                </div>

                {!isUnlimited && (
                  <div className="space-y-1">
                    <Progress value={percentage} className="h-2" />
                    {isNearLimit && (
                      <p className="text-xs text-orange-600">
                        You're approaching your monthly limit. Consider upgrading your plan.
                      </p>
                    )}
                  </div>
                )}

                {isUnlimited && (
                  <div className="text-xs text-green-600 flex items-center">
                    <Crown className="h-3 w-3 mr-1" />
                    Unlimited usage
                  </div>
                )}
              </div>
            )
          })}

          {planType === "free" && (
            <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
              <h4 className="font-medium text-blue-900 mb-2">Upgrade for More Features</h4>
              <p className="text-sm text-blue-700 mb-3">
                Get more AI-generated content, advanced features, and unlimited access with our premium plans.
              </p>
              <Button size="sm" className="w-full">
                View Plans
              </Button>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
