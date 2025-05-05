import { createClient } from "@supabase/supabase-js"

const INTASEND_API_URL = "https://sandbox.intasend.com/api/v1"
const INTASEND_API_KEY = process.env.INTASEND_API_KEY || ""
const INTASEND_PUBLISHABLE_KEY = process.env.INTASEND_PUBLISHABLE_KEY || ""

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ""
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ""
const supabase = createClient(supabaseUrl, supabaseKey)

export interface PaymentRequest {
  amount: number
  currency: "KES" | "USD"
  email: string
  firstName?: string
  lastName?: string
  phone?: string
  description?: string
  metadata?: Record<string, any>
}

export interface PaymentResponse {
  success: boolean
  message: string
  transactionId?: string
  checkoutUrl?: string
  status?: string
  paymentDetails?: any
}

export interface PaymentMethod {
  id: string
  name: string
  icon: string
  description: string
}

export const PAYMENT_METHODS: PaymentMethod[] = [
  {
    id: "mpesa",
    name: "M-Pesa",
    icon: "phone",
    description: "Pay using M-Pesa mobile money",
  },
  {
    id: "card",
    name: "Credit/Debit Card",
    icon: "credit-card",
    description: "Pay using Visa, Mastercard, or other cards",
  },
  {
    id: "bank",
    name: "Bank Transfer",
    icon: "building-bank",
    description: "Pay via direct bank transfer",
  },
]

/**
 * Create a checkout session with IntaSend
 */
export async function createCheckout(paymentRequest: PaymentRequest): Promise<PaymentResponse> {
  try {
    const response = await fetch(`${INTASEND_API_URL}/checkout`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${INTASEND_API_KEY}`,
      },
      body: JSON.stringify({
        public_key: INTASEND_PUBLISHABLE_KEY,
        amount: paymentRequest.amount,
        currency: paymentRequest.currency,
        email: paymentRequest.email,
        first_name: paymentRequest.firstName,
        last_name: paymentRequest.lastName,
        phone_number: paymentRequest.phone,
        comment: paymentRequest.description,
        metadata: paymentRequest.metadata,
      }),
    })

    if (!response.ok) {
      throw new Error(`IntaSend API error: ${response.status} ${response.statusText}`)
    }

    const data = await response.json()

    return {
      success: true,
      message: "Checkout created successfully",
      transactionId: data.invoice.invoice_id,
      checkoutUrl: data.checkout_url,
      status: data.invoice.state,
      paymentDetails: data,
    }
  } catch (error: any) {
    console.error("Error creating IntaSend checkout:", error)
    return {
      success: false,
      message: error.message || "Failed to create checkout",
    }
  }
}

/**
 * Process M-Pesa payment directly
 */
export async function processMpesaPayment(
  phone: string,
  amount: number,
  currency: "KES" | "USD" = "KES",
  description = "Payment",
): Promise<PaymentResponse> {
  try {
    // Format phone number (remove leading 0 and add country code if needed)
    let formattedPhone = phone.replace(/^0/, "254").replace(/\s+/g, "")
    if (!formattedPhone.startsWith("254")) {
      formattedPhone = `254${formattedPhone}`
    }

    const response = await fetch(`${INTASEND_API_URL}/payment/mpesa-stk-push`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${INTASEND_API_KEY}`,
      },
      body: JSON.stringify({
        public_key: INTASEND_PUBLISHABLE_KEY,
        amount: amount,
        currency: currency,
        phone_number: formattedPhone,
        narrative: description,
      }),
    })

    if (!response.ok) {
      throw new Error(`IntaSend API error: ${response.status} ${response.statusText}`)
    }

    const data = await response.json()

    return {
      success: true,
      message: "M-Pesa payment initiated",
      transactionId: data.invoice_id || data.id,
      status: data.status || "PENDING",
      paymentDetails: data,
    }
  } catch (error: any) {
    console.error("Error processing M-Pesa payment:", error)
    return {
      success: false,
      message: error.message || "Failed to process M-Pesa payment",
    }
  }
}

/**
 * Verify payment status
 */
export async function verifyPayment(transactionId: string): Promise<PaymentResponse> {
  try {
    const response = await fetch(`${INTASEND_API_URL}/payment/status/${transactionId}`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${INTASEND_API_KEY}`,
      },
    })

    if (!response.ok) {
      throw new Error(`IntaSend API error: ${response.status} ${response.statusText}`)
    }

    const data = await response.json()

    return {
      success: true,
      message: "Payment status retrieved",
      transactionId: transactionId,
      status: data.invoice.state,
      paymentDetails: data,
    }
  } catch (error: any) {
    console.error("Error verifying payment:", error)
    return {
      success: false,
      message: error.message || "Failed to verify payment",
    }
  }
}

/**
 * Record payment in database
 */
export async function recordPayment(
  userId: string,
  amount: number,
  currency: string,
  paymentMethod: string,
  transactionId: string,
  status: string,
  details: any,
): Promise<boolean> {
  try {
    // Insert payment record
    const { data: paymentData, error: paymentError } = await supabase
      .from("payments")
      .insert({
        user_id: userId,
        amount: amount,
        currency: currency,
        payment_method: paymentMethod,
        payment_status: status === "COMPLETE" ? "completed" : status === "FAILED" ? "failed" : "pending",
        transaction_id: transactionId,
        payment_provider: "intasend",
        payment_details: details,
      })
      .select()

    if (paymentError) throw paymentError

    // Log activity
    await supabase.from("activity_logs").insert({
      user_id: userId,
      activity_type: "payment",
      activity_details: {
        amount: amount,
        currency: currency,
        payment_method: paymentMethod,
        transaction_id: transactionId,
        status: status,
      },
    })

    return true
  } catch (error) {
    console.error("Error recording payment:", error)
    return false
  }
}
