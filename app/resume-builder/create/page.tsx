"use client"

import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { useAuth } from "@/contexts/auth-context"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Separator } from "@/components/ui/separator"
import { Sparkles, Save, Download, Plus, Trash2, Eye, ArrowLeft, CreditCard } from 'lucide-react'
import { supabase } from "@/lib/supabase"
import { getTemplateById, renderResumeHTML } from "@/lib/templates"
import { checkUsageLimit, incrementUsage, getUserSubscription } from "@/lib/subscription"
import { generateResumeContent } from "@/lib/gemini"
import type { ResumeTemplate } from "@/lib/types"
import ResumeBuilderContent from "./resume-builder-content"
import Loading from "./loading"
import { Suspense } from "react"

export default function ResumeBuilderPage() {
  return (
    <Suspense fallback={<Loading />}>
      <ResumeBuilderContent />
    </Suspense>
  )
}
