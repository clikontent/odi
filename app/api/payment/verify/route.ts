import { type NextRequest, NextResponse } from "next/server"
import { aiService } from "@/services/ai-service"

export async function GET(request: NextRequest) {
  try {
    const checkoutId = request.nextUrl.searchParams.get("id")

    if (!checkoutId) {
      return NextResponse.json({ error: "Checkout ID is required" }, { status: 400 })
    }

    // Verify payment status with Intasend
    const paymentStatus = await aiService.intasend.verifyPayment(checkoutId)

    return NextResponse.json({ paymentStatus })
  } catch (error: any) {
    console.error("Error verifying payment:", error)
    return NextResponse.json({ error: error.message || "Failed to verify payment" }, { status: 500 })
  }
}

