import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"
import { NextResponse } from "next/server"

export async function POST(request: Request) {
  const supabase = createRouteHandlerClient({ cookies })

  try {
    // Get the current user
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 })
    }

    // Get the request body
    const { title, data, templateId } = await request.json()

    if (!title || !data || !templateId) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    // Save to the resumes table
    const { data: resume, error } = await supabase
      .from("resumes")
      .insert({
        user_id: user.id,
        title,
        content: data,
        template_id: templateId,
        html_content: data.html,
        is_public: false,
      })
      .select()

    if (error) {
      console.error("Error saving resume:", error)
      return NextResponse.json({ error: "Failed to save resume" }, { status: 500 })
    }

    return NextResponse.json({ success: true, resume })
  } catch (error) {
    console.error("Error in POST /api/resumes:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function PUT(request: Request) {
  const supabase = createRouteHandlerClient({ cookies })

  try {
    // Get the current user
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 })
    }

    // Get the request body
    const { id, title, data, templateId } = await request.json()

    if (!id || !title || !data || !templateId) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    // Update the resume
    const { data: resume, error } = await supabase
      .from("resumes")
      .update({
        title,
        content: data,
        template_id: templateId,
        html_content: data.html,
        updated_at: new Date().toISOString(),
      })
      .eq("id", id)
      .eq("user_id", user.id)
      .select()

    if (error) {
      console.error("Error updating resume:", error)
      return NextResponse.json({ error: "Failed to update resume" }, { status: 500 })
    }

    return NextResponse.json({ success: true, resume })
  } catch (error) {
    console.error("Error in PUT /api/resumes:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
