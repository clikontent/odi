import { type NextRequest, NextResponse } from "next/server"
import { aiService } from "@/services/ai-service"

export async function POST(request: NextRequest) {
  try {
    const { amount, currency, description, paymentMethod, phoneNumber, cardDetails, firstName, lastName, email } =
      await request.json()

    if (!amount || !description || !firstName || !lastName || !email) {
      return NextResponse.json({ error: "Missing required payment information" }, { status: 400 })
    }

    // Create checkout session with Intasend
    const checkout = await aiService.intasend.createCheckout({
      amount,
      currency: currency || "KES",
      description,
      firstName,
      lastName,
      email,
      phone: phoneNumber,
    })

    return NextResponse.json({ checkout })
  } catch (error: any) {
    console.error("Error processing payment:", error)
    return NextResponse.json({ error: error.message || "Failed to process payment" }, { status: 500 })
  }
}

