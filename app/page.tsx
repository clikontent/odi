"use client"

import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Check } from "lucide-react"

export default function Home() {
  const [currency, setCurrency] = useState<"USD" | "KES">("KES")

  const exchangeRate = 130 // 1 USD = 130 KES (approximate)

  const formatPrice = (kesPrice: number) => {
    if (currency === "USD") {
      return `$${Math.round(kesPrice / exchangeRate)}`
    } else {
      return `KSh ${kesPrice.toLocaleString()}`
    }
  }

  return (
    <div className="flex min-h-screen flex-col">
      <main className="flex-1">
        <section className="w-full py-12 md:py-24 lg:py-32 xl:py-48">
          <div className="container px-4 md:px-6">
            <div className="grid gap-6 lg:grid-cols-2 lg:gap-12 xl:grid-cols-2">
              <div className="flex flex-col justify-center space-y-4">
                <div className="space-y-2">
                  <h1 className="text-3xl font-bold tracking-tighter sm:text-5xl xl:text-6xl/none">
                    Build ATS-Optimized Resumes with AI
                  </h1>
                  <p className="max-w-[600px] text-muted-foreground md:text-xl">
                    Create professional resumes, cover letters, and optimize your job applications with our AI-powered
                    platform. Stand out from the competition and land your dream job in Africa.
                  </p>
                </div>
                <div className="flex flex-col gap-2 min-[400px]:flex-row">
                  <Link href="/login">
                    <Button size="lg" className="w-full">
                      Log In
                    </Button>
                  </Link>
                  <Link href="/signup">
                    <Button size="lg" variant="outline" className="w-full">
                      Sign Up
                    </Button>
                  </Link>
                </div>
              </div>
              <div className="flex items-center justify-center">
                <img
                  src="https://jycxwzckasftyaysrwik.supabase.co/storage/v1/object/public/images//pexels-anntarazevich-5598289.jpg"
                  alt="Resume Builder Preview"
                  className="rounded-lg object-cover"
                  width={550}
                  height={550}
                />
              </div>
            </div>
          </div>
        </section>
        <section id="features" className="w-full py-12 md:py-24 lg:py-32 bg-muted">
          <div className="container px-4 md:px-6">
            <div className="flex flex-col items-center justify-center space-y-4 text-center">
              <div className="space-y-2">
                <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">Features</h2>
                <p className="max-w-[900px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                  Everything you need to create professional job application materials tailored for the African job
                  market
                </p>
              </div>
            </div>
            <div className="mx-auto grid max-w-5xl grid-cols-1 gap-6 py-12 md:grid-cols-3">
              <div className="flex flex-col items-center space-y-2 rounded-lg border p-6 shadow-sm">
                <div className="p-2 bg-primary/10 rounded-full">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="h-6 w-6 text-primary"
                  >
                    <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" />
                    <polyline points="14 2 14 8 20 8" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold">Resume Builder</h3>
                <p className="text-sm text-muted-foreground text-center">
                  Create ATS-optimized resumes with our AI-powered builder. Choose from multiple templates and customize
                  to your needs.
                </p>
              </div>
              <div className="flex flex-col items-center space-y-2 rounded-lg border p-6 shadow-sm">
                <div className="p-2 bg-primary/10 rounded-full">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="h-6 w-6 text-primary"
                  >
                    <path d="M18 2H8a4 4 0 0 0-4 4v12a4 4 0 0 0 4 4h12a4 4 0 0 0 4-4v-8" />
                    <path d="M18 2v4h4" />
                    <path d="m9.5 10.5 1 1 3-3" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold">Cover Letters</h3>
                <p className="text-sm text-muted-foreground text-center">
                  Generate tailored cover letters based on job descriptions. Our AI helps you highlight relevant skills
                  and experience.
                </p>
              </div>
              <div className="flex flex-col items-center space-y-2 rounded-lg border p-6 shadow-sm">
                <div className="p-2 bg-primary/10 rounded-full">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="h-6 w-6 text-primary"
                  >
                    <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
                    <polyline points="3.29 7 12 12 20.71 7" />
                    <line x1="12" x2="12" y1="22" y2="12" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold">African Job Board</h3>
                <p className="text-sm text-muted-foreground text-center">
                  Find and apply to jobs across Africa with your optimized application materials. Track applications and
                  get insights on your progress.
                </p>
              </div>
            </div>
          </div>
        </section>

        <section id="how-it-works" className="w-full py-12 md:py-24 lg:py-32">
          <div className="container px-4 md:px-6">
            <div className="flex flex-col items-center justify-center space-y-4 text-center">
              <div className="space-y-2">
                <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">How It Works</h2>
                <p className="max-w-[900px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                  Our platform makes creating professional job application materials simple and effective
                </p>
              </div>
            </div>
            <div className="mx-auto grid max-w-5xl grid-cols-1 gap-8 py-12 md:grid-cols-3">
              <div className="flex flex-col items-center space-y-4">
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 text-primary">
                  <span className="text-2xl font-bold">1</span>
                </div>
                <h3 className="text-xl font-bold">Choose a Template</h3>
                <p className="text-center text-muted-foreground">
                  Select from our library of ATS-optimized resume and cover letter templates
                </p>
              </div>
              <div className="flex flex-col items-center space-y-4">
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 text-primary">
                  <span className="text-2xl font-bold">2</span>
                </div>
                <h3 className="text-xl font-bold">Fill in Your Details</h3>
                <p className="text-center text-muted-foreground">
                  Enter your information or import from LinkedIn. Our AI helps optimize your content
                </p>
              </div>
              <div className="flex flex-col items-center space-y-4">
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 text-primary">
                  <span className="text-2xl font-bold">3</span>
                </div>
                <h3 className="text-xl font-bold">Export and Apply</h3>
                <p className="text-center text-muted-foreground">
                  Download your documents as PDF or Word, or apply directly through our job board
                </p>
              </div>
            </div>
          </div>
        </section>

        <section id="pricing" className="w-full py-12 md:py-24 lg:py-32 bg-muted">
          <div className="container px-4 md:px-6">
            <div className="flex flex-col items-center justify-center space-y-4 text-center">
              <div className="space-y-2">
                <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">Pricing Plans</h2>
                <p className="max-w-[900px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                  Choose the plan that's right for you
                </p>
                <div className="flex justify-center mt-4">
                  <Select value={currency} onValueChange={(value) => setCurrency(value as "USD" | "KES")}>
                    <SelectTrigger className="w-[180px]">
                      <SelectValue placeholder="Select Currency" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="USD">USD ($)</SelectItem>
                      <SelectItem value="KES">KES (KSh)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
            <div className="mx-auto grid max-w-6xl grid-cols-1 gap-6 py-12 md:grid-cols-3">
              {/* Free Plan */}
              <div className="flex flex-col rounded-lg border bg-card text-card-foreground shadow-sm">
                <div className="p-6 pt-8">
                  <h3 className="text-2xl font-bold">Free Plan</h3>
                  <p className="mt-2 text-muted-foreground">Pay-per-use, try before you buy</p>
                  <div className="mt-4 flex items-baseline">
                    <span className="text-3xl font-bold">Free Registration</span>
                  </div>
                  <ul className="mt-6 space-y-3">
                    <li className="flex items-start">
                      <Check className="mr-2 h-5 w-5 text-primary mt-0.5" />
                      <span>5 Free AI-Generated Cover Letters (One-Time)</span>
                    </li>
                    <li className="flex items-start">
                      <Check className="mr-2 h-5 w-5 text-primary mt-0.5" />
                      <span>One-Time Resume/CV Download ({formatPrice(500)})</span>
                    </li>
                    <li className="flex items-start">
                      <Check className="mr-2 h-5 w-5 text-primary mt-0.5" />
                      <span>Basic ATS Score (No Fixes)</span>
                    </li>
                    <li className="flex items-start">
                      <Check className="mr-2 h-5 w-5 text-primary mt-0.5" />
                      <span>Job Board (Read-Only)</span>
                    </li>
                    <li className="flex items-start">
                      <Check className="mr-2 h-5 w-5 text-primary mt-0.5" />
                      <span>Access to all templates</span>
                    </li>
                  </ul>
                </div>
                <div className="flex flex-1 flex-col justify-end p-6 pt-0">
                  <Link href="/signup">
                    <Button className="w-full">Get Started</Button>
                  </Link>
                </div>
              </div>

              {/* Premium Plan */}
              <div className="relative flex flex-col rounded-lg border bg-card text-card-foreground shadow-sm">
                <div className="absolute -top-4 left-0 right-0 mx-auto w-fit rounded-full bg-primary px-3 py-1 text-xs font-medium text-primary-foreground">
                  Most Popular
                </div>
                <div className="p-6 pt-8">
                  <h3 className="text-2xl font-bold">Premium Plan</h3>
                  <p className="mt-2 text-muted-foreground">Maximum value for job seekers</p>
                  <div className="mt-4 flex items-baseline">
                    <span className="text-3xl font-bold">{formatPrice(1000)}</span>
                    <span className="ml-1 text-sm text-muted-foreground">/month</span>
                  </div>
                  <p className="text-sm text-muted-foreground mt-1">or {formatPrice(8000)}/year (save 30%)</p>
                  <ul className="mt-6 space-y-3">
                    <li className="flex items-start">
                      <Check className="mr-2 h-5 w-5 text-primary mt-0.5" />
                      <span>Unlimited AI-Generated Cover Letters</span>
                    </li>
                    <li className="flex items-start">
                      <Check className="mr-2 h-5 w-5 text-primary mt-0.5" />
                      <span>Full ATS Optimization (Not Just Scores)</span>
                    </li>
                    <li className="flex items-start">
                      <Check className="mr-2 h-5 w-5 text-primary mt-0.5" />
                      <span>10 Resume/CV Downloads (All Templates)</span>
                    </li>
                    <li className="flex items-start">
                      <Check className="mr-2 h-5 w-5 text-primary mt-0.5" />
                      <span>Priority Job Board Access</span>
                    </li>
                    <li className="flex items-start">
                      <Check className="mr-2 h-5 w-5 text-primary mt-0.5" />
                      <span>AI Interview Prep Tool</span>
                    </li>
                  </ul>
                </div>
                <div className="flex flex-1 flex-col justify-end p-6 pt-0">
                  <Link href="/signup">
                    <Button className="w-full">Sign Up</Button>
                  </Link>
                </div>
              </div>

              {/* Corporate Plan */}
              <div className="flex flex-col rounded-lg border bg-card text-card-foreground shadow-sm">
                <div className="p-6 pt-8">
                  <h3 className="text-2xl font-bold">Corporate Plan</h3>
                  <p className="mt-2 text-muted-foreground">For employers & recruiters</p>
                  <div className="mt-4 flex items-baseline">
                    <span className="text-3xl font-bold">{formatPrice(15000)}</span>
                    <span className="ml-1 text-sm text-muted-foreground">/month</span>
                  </div>
                  <p className="text-sm text-muted-foreground mt-1">or {formatPrice(120000)}/year (save 30%)</p>
                  <ul className="mt-6 space-y-3">
                    <li className="flex items-start">
                      <Check className="mr-2 h-5 w-5 text-primary mt-0.5" />
                      <span>Bulk Hiring Tools (100+ resumes/month)</span>
                    </li>
                    <li className="flex items-start">
                      <Check className="mr-2 h-5 w-5 text-primary mt-0.5" />
                      <span>AI-powered candidate matching</span>
                    </li>
                    <li className="flex items-start">
                      <Check className="mr-2 h-5 w-5 text-primary mt-0.5" />
                      <span>Featured job posts</span>
                    </li>
                    <li className="flex items-start">
                      <Check className="mr-2 h-5 w-5 text-primary mt-0.5" />
                      <span>Dashboard analytics & reporting</span>
                    </li>
                    <li className="flex items-start">
                      <Check className="mr-2 h-5 w-5 text-primary mt-0.5" />
                      <span>Dedicated account manager</span>
                    </li>
                  </ul>
                </div>
                <div className="flex flex-1 flex-col justify-end p-6 pt-0">
                  <Link href="/signup">
                    <Button className="w-full">Contact Sales</Button>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section id="testimonials" className="w-full py-12 md:py-24 lg:py-32">
          <div className="container px-4 md:px-6">
            <div className="flex flex-col items-center justify-center space-y-4 text-center">
              <div className="space-y-2">
                <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">What Our Users Say</h2>
                <p className="max-w-[900px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                  Don't just take our word for it - hear from some of our satisfied users
                </p>
              </div>
            </div>
            <div className="mx-auto grid max-w-5xl grid-cols-1 gap-6 py-12 md:grid-cols-3">
              <div className="flex flex-col rounded-lg border bg-card p-6 text-card-foreground shadow-sm">
                <div className="flex items-center gap-4">
                  <img
                    src="/placeholder.svg?height=40&width=40"
                    alt="User"
                    className="rounded-full"
                    width={40}
                    height={40}
                  />
                  <div>
                    <h3 className="font-bold">Sarah K.</h3>
                    <p className="text-sm text-muted-foreground">Software Developer, Nairobi</p>
                  </div>
                </div>
                <div className="mt-4">
                  <p className="text-sm text-muted-foreground">
                    "I landed my dream job at a top tech company thanks to CV Chap Chap. The ATS optimization really
                    made my resume stand out."
                  </p>
                </div>
              </div>
              <div className="flex flex-col rounded-lg border bg-card p-6 text-card-foreground shadow-sm">
                <div className="flex items-center gap-4">
                  <img
                    src="/placeholder.svg?height=40&width=40"
                    alt="User"
                    className="rounded-full"
                    width={40}
                    height={40}
                  />
                  <div>
                    <h3 className="font-bold">David M.</h3>
                    <p className="text-sm text-muted-foreground">Marketing Manager, Lagos</p>
                  </div>
                </div>
                <div className="mt-4">
                  <p className="text-sm text-muted-foreground">
                    "The AI suggestions for my cover letter were spot on. It helped me highlight my relevant experience
                    and skills in a way that resonated with employers."
                  </p>
                </div>
              </div>
              <div className="flex flex-col rounded-lg border bg-card p-6 text-card-foreground shadow-sm">
                <div className="flex items-center gap-4">
                  <img
                    src="/placeholder.svg?height=40&width=40"
                    alt="User"
                    className="rounded-full"
                    width={40}
                    height={40}
                  />
                  <div>
                    <h3 className="font-bold">James O.</h3>
                    <p className="text-sm text-muted-foreground">HR Director, Accra</p>
                  </div>
                </div>
                <div className="mt-4">
                  <p className="text-sm text-muted-foreground">
                    "As a corporate user, the job posting and staff onboarding features have streamlined our entire
                    recruitment process. Well worth the investment."
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section id="faq" className="w-full py-12 md:py-24 lg:py-32 bg-muted">
          <div className="container px-4 md:px-6">
            <div className="flex flex-col items-center justify-center space-y-4 text-center">
              <div className="space-y-2">
                <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">
                  Frequently Asked Questions
                </h2>
                <p className="max-w-[900px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                  Find answers to common questions about our platform
                </p>
              </div>
            </div>
            <div className="mx-auto grid max-w-5xl grid-cols-1 gap-6 py-12 md:grid-cols-2">
              <div className="rounded-lg border bg-card p-6">
                <h3 className="text-lg font-bold">Is CV Chap Chap really free to register?</h3>
                <p className="mt-2 text-sm text-muted-foreground">
                  Yes, individual job seekers can register for free. You get 5 free AI-generated cover letters and pay
                  only {formatPrice(500)} per resume download.
                </p>
              </div>
              <div className="rounded-lg border bg-card p-6">
                <h3 className="text-lg font-bold">How does the ATS optimization work?</h3>
                <p className="mt-2 text-sm text-muted-foreground">
                  Our AI analyzes job descriptions and your resume to suggest keywords and formatting that will help
                  your resume pass through Applicant Tracking Systems (ATS) used by employers.
                </p>
              </div>
              <div className="rounded-lg border bg-card p-6">
                <h3 className="text-lg font-bold">Can I cancel my subscription?</h3>
                <p className="mt-2 text-sm text-muted-foreground">
                  Yes, you can cancel your subscription at any time. Your benefits will continue until the end of your
                  billing period.
                </p>
              </div>
              <div className="rounded-lg border bg-card p-6">
                <h3 className="text-lg font-bold">Is my data secure?</h3>
                <p className="mt-2 text-sm text-muted-foreground">
                  Absolutely. We use industry-standard encryption and security practices to protect your personal
                  information and documents.
                </p>
              </div>
            </div>
          </div>
        </section>

        <section className="w-full py-12 md:py-24 lg:py-32">
          <div className="container px-4 md:px-6">
            <div className="flex flex-col items-center justify-center space-y-4 text-center">
              <div className="space-y-2">
                <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">Ready to Get Started?</h2>
                <p className="max-w-[900px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                  Join thousands of job seekers across Africa who have found success with CV Chap Chap
                </p>
              </div>
              <div className="flex flex-col gap-2 min-[400px]:flex-row">
                <Link href="/login">
                  <Button size="lg" className="w-full">
                    Log In
                  </Button>
                </Link>
                <Link href="/signup">
                  <Button size="lg" variant="outline" className="w-full">
                    Sign Up
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </section>
      </main>
      <footer className="flex flex-col gap-2 sm:flex-row py-6 w-full border-t items-center justify-center px-4 md:px-6">
        <p className="text-xs text-muted-foreground">© 2025 CV Chap Chap. All rights reserved.</p>
      </footer>
    </div>
  )
}
