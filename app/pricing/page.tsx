"use client"
import { useRouter } from "next/navigation"
import { useAuth } from "@/contexts/auth-context"
import Pricing from "@/components/pricing"

export default function PricingPage() {
  const { user } = useAuth()
  const router = useRouter()

  const handleSelectPlan = (planId: string) => {
    if (!user) {
      router.push("/auth")
      return
    }

    // Handle plan selection logic here
    console.log("Selected plan:", planId)

    if (planId === "corporate") {
      // Redirect to contact sales
      window.open("mailto:sales@cvchapchap.com?subject=Corporate Plan Inquiry", "_blank")
    } else {
      // Redirect to payment processing
      // This would integrate with Stripe or your payment processor
      alert(`Redirecting to payment for ${planId} plan...`)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <Pricing onSelectPlan={handleSelectPlan} />

        {/* FAQ Section */}
        <div className="mt-16">
          <h2 className="text-2xl font-bold text-center text-gray-900 mb-8">Frequently Asked Questions</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
            <div className="bg-white p-6 rounded-lg shadow-sm">
              <h3 className="font-semibold text-gray-900 mb-2">Can I change my plan anytime?</h3>
              <p className="text-gray-600 text-sm">
                Yes, you can upgrade or downgrade your plan at any time. Changes take effect immediately.
              </p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-sm">
              <h3 className="font-semibold text-gray-900 mb-2">What happens to my data if I cancel?</h3>
              <p className="text-gray-600 text-sm">
                Your data remains accessible for 30 days after cancellation, giving you time to export if needed.
              </p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-sm">
              <h3 className="font-semibold text-gray-900 mb-2">Do you offer refunds?</h3>
              <p className="text-gray-600 text-sm">
                We offer a 14-day money-back guarantee for all paid plans. No questions asked.
              </p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-sm">
              <h3 className="font-semibold text-gray-900 mb-2">Is my data secure?</h3>
              <p className="text-gray-600 text-sm">
                Yes, we use enterprise-grade security and encryption to protect your personal information.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
