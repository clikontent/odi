import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { CheckCircle, Download, FileText, Home } from "lucide-react"

export default function SuccessPage() {
  return (
    <div className="container max-w-md py-12">
      <Card className="text-center">
        <CardHeader>
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
            <CheckCircle className="h-10 w-10 text-primary" />
          </div>
          <CardTitle className="text-2xl">Payment Successful!</CardTitle>
          <CardDescription>Your resume is now ready for download</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="rounded-lg border p-4 flex items-center gap-4">
            <div className="rounded-md bg-primary/10 p-2">
              <FileText className="h-5 w-5 text-primary" />
            </div>
            <div className="text-left">
              <p className="font-medium">Professional Resume</p>
              <p className="text-sm text-muted-foreground">John_Doe_Resume.pdf</p>
            </div>
          </div>

          <p className="text-sm text-muted-foreground">
            Thank you for your purchase! A copy of your receipt has been sent to your email.
          </p>
        </CardContent>
        <CardFooter className="flex flex-col space-y-3">
          <Button className="w-full">
            <Download className="mr-2 h-4 w-4" />
            Download Resume
          </Button>
          <Button variant="outline" asChild>
            <Link href="/dashboard">
              <Home className="mr-2 h-4 w-4" />
              Return to Dashboard
            </Link>
          </Button>
        </CardFooter>
      </Card>
    </div>
  )
}

