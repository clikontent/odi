import { NextResponse } from "next/server"
import { supabase } from "@/lib/supabase"

export async function POST(request: Request) {
  try {
    // Get the request body
    const body = await request.json()

    // Verify the webhook signature (implement this based on IntaSend's documentation)
    // This is a placeholder for actual signature verification
    const isValidSignature = true // Replace with actual verification

    if (!isValidSignature) {
      return NextResponse.json({ success: false, message: "Invalid signature" }, { status: 401 })
    }

    // Process the webhook event
    const { event, data } = body

    if (event === "payment.completed") {
      // Payment was successful
      const { transaction_id, status, metadata } = data

      // Find the payment record in our database
      const { data: paymentData, error: paymentError } = await supabase
        .from("payments")
        .select("*")
        .eq("transaction_id", transaction_id)
        .single()

      if (paymentError) {
        console.error("Error finding payment:", paymentError)
        return NextResponse.json({ success: false, message: "Payment not found" }, { status: 404 })
      }

      // Update the payment status
      const { error: updateError } = await supabase
        .from("payments")
        .update({ payment_status: status.toLowerCase() })
        .eq("id", paymentData.id)

      if (updateError) {
        console.error("Error updating payment:", updateError)
        return NextResponse.json({ success: false, message: "Failed to update payment" }, { status: 500 })
      }

      // If this was a subscription payment, update the subscription status
      if (metadata?.plan && metadata.plan !== "resume_download") {
        // Update the user's subscription status
        const { error: profileError } = await supabase
          .from("profiles")
          .update({ subscription_status: "active" })
          .eq("id", paymentData.user_id)

        if (profileError) {
          console.error("Error updating profile:", profileError)
          return NextResponse.json({ success: false, message: "Failed to update profile" }, { status: 500 })
        }

        // Update the subscription record
        const { error: subscriptionError } = await supabase
          .from("subscriptions")
          .update({ status: "active" })
          .eq("user_id", paymentData.user_id)
          .eq("plan", metadata.plan)

        if (subscriptionError) {
          console.error("Error updating subscription:", subscriptionError)
          return NextResponse.json({ success: false, message: "Failed to update subscription" }, { status: 500 })
        }
      }

      // If this was a resume download payment, update the resume status
      if (metadata?.resumeId) {
        // Update the resume to mark it as paid
        const { error: resumeError } = await supabase
          .from("resumes")
          .update({ payment_status: "paid" })
          .eq("id", metadata.resumeId)

        if (resumeError) {
          console.error("Error updating resume:", resumeError)
          return NextResponse.json({ success: false, message: "Failed to update resume" }, { status: 500 })
        }
      }

      return NextResponse.json({ success: true, message: "Payment processed successfully" })
    } else if (event === "payment.failed") {
      // Payment failed
      const { transaction_id } = data

      // Find the payment record in our database
      const { data: paymentData, error: paymentError } = await supabase
        .from("payments")
        .select("*")
        .eq("transaction_id", transaction_id)
        .single()

      if (paymentError) {
        console.error("Error finding payment:", paymentError)
        return NextResponse.json({ success: false, message: "Payment not found" }, { status: 404 })
      }

      // Update the payment status
      const { error: updateError } = await supabase
        .from("payments")
        .update({ payment_status: "failed" })
        .eq("id", paymentData.id)

      if (updateError) {
        console.error("Error updating payment:", updateError)
        return NextResponse.json({ success: false, message: "Failed to update payment" }, { status: 500 })
      }

      return NextResponse.json({ success: true, message: "Payment failure recorded" })
    }

    // Handle other event types as needed

    return NextResponse.json({ success: true, message: "Webhook received" })
  } catch (error) {
    console.error("Error processing webhook:", error)
    return NextResponse.json({ success: false, message: "Internal server error" }, { status: 500 })
  }
}
