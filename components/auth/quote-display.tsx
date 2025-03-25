import Image from "next/image"

export function QuoteDisplay() {
  return (
    <div className="relative hidden h-full flex-col bg-muted p-10 text-white lg:flex lg:w-1/2">
      <div className="absolute inset-0">
        <Image
          src="/placeholder.svg?height=1080&width=1920"
          alt="Kenya landscape"
          fill
          className="object-cover"
          priority
        />
        <div className="absolute inset-0 bg-primary/40" />
      </div>
      <div className="relative z-20 mt-auto">
        <blockquote className="space-y-2">
          <p className="text-lg">
            "CV Chap helped me land my dream job by creating a resume that truly stood out. The AI-powered suggestions
            made all the difference."
          </p>
          <footer className="text-sm">Sofia Achieng, Software Engineer</footer>
        </blockquote>
      </div>
    </div>
  )
}

