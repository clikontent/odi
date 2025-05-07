"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Loader2, MessageSquare, FileText, Save, Copy, AlertCircle, Mic, MicOff } from "lucide-react"
import { toast } from "@/components/ui/use-toast"
import { supabase } from "@/lib/supabaseClient"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import type { InterviewQuestion } from "@/types/ai-tools"

interface InterviewPrepToolProps {
  userId: string
}

export function InterviewPrepTool({ userId }: InterviewPrepToolProps) {
  const [jobTitle, setJobTitle] = useState("")
  const [jobDescription, setJobDescription] = useState("")
  const [resumeText, setResumeText] = useState("")
  const [coverLetterText, setCoverLetterText] = useState("")
  const [isGenerating, setIsGenerating] = useState(false)
  const [questions, setQuestions] = useState<InterviewQuestion[]>([])
  const [activeTab, setActiveTab] = useState("input")
  const [activeQuestionIndex, setActiveQuestionIndex] = useState<number | null>(null)
  const [userAnswer, setUserAnswer] = useState("")
  const [isRecording, setIsRecording] = useState(false)
  const [mediaRecorder, setMediaRecorder] = useState<MediaRecorder | null>(null)
  const [audioChunks, setAudioChunks] = useState<Blob[]>([])
  const [audioUrl, setAudioUrl] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  const handleGenerateQuestions = async () => {
    if (!jobTitle || !jobDescription) {
      setError("Please provide at least the job title and description")
      return
    }

    setError(null)
    setIsGenerating(true)
    setQuestions([])

    try {
      const response = await fetch("/api/generate-interview-questions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          jobTitle,
          jobDescription,
          resumeText,
          coverLetterText,
        }),
      })

      if (!response.ok) {
        throw new Error("Failed to generate interview questions")
      }

      const data = await response.json()

      if (data.questions) {
        setQuestions(data.questions)
        setActiveTab("questions")

        // Log activity
        await supabase.from("activity_logs").insert({
          user_id: userId,
          entity_type: "interview_prep",
          action: "generate",
          details: { job_title: jobTitle },
        })

        toast({
          title: "Questions Generated",
          description: `Generated ${data.questions.length} interview questions for you to practice with.`,
        })
      }
    } catch (error) {
      console.error("Error generating questions:", error)
      setError("Failed to generate interview questions. Please try again.")
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to generate interview questions. Please try again.",
      })
    } finally {
      setIsGenerating(false)
    }
  }

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      const recorder = new MediaRecorder(stream)
      const chunks: Blob[] = []

      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          chunks.push(e.data)
        }
      }

      recorder.onstop = () => {
        const blob = new Blob(chunks, { type: "audio/webm" })
        const url = URL.createObjectURL(blob)
        setAudioUrl(url)
        setAudioChunks(chunks)
      }

      setMediaRecorder(recorder)
      recorder.start()
      setIsRecording(true)

      toast({
        title: "Recording Started",
        description: "Speak clearly into your microphone. Click stop when you're done.",
      })
    } catch (error) {
      console.error("Error accessing microphone:", error)
      toast({
        variant: "destructive",
        title: "Microphone Error",
        description: "Could not access your microphone. Please check permissions.",
      })
    }
  }

  const stopRecording = () => {
    if (mediaRecorder && isRecording) {
      mediaRecorder.stop()
      setIsRecording(false)

      // Stop all audio tracks
      mediaRecorder.stream.getTracks().forEach((track) => track.stop())

      toast({
        title: "Recording Stopped",
        description: "Your answer has been recorded.",
      })
    }
  }

  const saveAnswer = async () => {
    if (activeQuestionIndex === null) return

    try {
      // Save the answer to the database
      const { error } = await supabase.from("interview_answers").insert({
        user_id: userId,
        question: questions[activeQuestionIndex].question,
        answer: userAnswer,
        job_title: jobTitle,
      })

      if (error) throw error

      toast({
        title: "Answer Saved",
        description: "Your answer has been saved successfully.",
      })
    } catch (error) {
      console.error("Error saving answer:", error)
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to save your answer. Please try again.",
      })
    }
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    toast({
      title: "Copied",
      description: "Text copied to clipboard",
    })
  }

  const handleSelectQuestion = (index: number) => {
    setActiveQuestionIndex(index)
    setUserAnswer("")
    setAudioUrl(null)
    setAudioChunks([])
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="text-2xl">AI Interview Preparation</CardTitle>
        <CardDescription>
          Generate personalized interview questions based on job descriptions and practice your answers
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="input">Job Details</TabsTrigger>
            <TabsTrigger value="questions" disabled={questions.length === 0}>
              Practice Questions {questions.length > 0 && `(${questions.length})`}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="input" className="space-y-4 mt-4">
            {error && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Error</AlertTitle>
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <div className="space-y-2">
              <Label htmlFor="jobTitle">Job Title</Label>
              <Input
                id="jobTitle"
                placeholder="e.g. Frontend Developer"
                value={jobTitle}
                onChange={(e) => setJobTitle(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="jobDescription">Job Description</Label>
              <Textarea
                id="jobDescription"
                placeholder="Paste the job description here..."
                className="min-h-[150px]"
                value={jobDescription}
                onChange={(e) => setJobDescription(e.target.value)}
              />
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="resumeText">Your Resume (Optional)</Label>
                <Textarea
                  id="resumeText"
                  placeholder="Paste your resume text here..."
                  className="min-h-[150px]"
                  value={resumeText}
                  onChange={(e) => setResumeText(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="coverLetterText">Your Cover Letter (Optional)</Label>
                <Textarea
                  id="coverLetterText"
                  placeholder="Paste your cover letter text here..."
                  className="min-h-[150px]"
                  value={coverLetterText}
                  onChange={(e) => setCoverLetterText(e.target.value)}
                />
              </div>
            </div>

            <Button
              onClick={handleGenerateQuestions}
              disabled={isGenerating || !jobTitle || !jobDescription}
              className="w-full"
            >
              {isGenerating ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Generating Questions...
                </>
              ) : (
                <>
                  <MessageSquare className="mr-2 h-4 w-4" />
                  Generate Interview Questions
                </>
              )}
            </Button>
          </TabsContent>

          <TabsContent value="questions" className="mt-4">
            {questions.length > 0 ? (
              <div className="grid gap-6 md:grid-cols-3">
                <div className="space-y-4">
                  <h3 className="font-medium">Questions</h3>
                  <div className="space-y-2">
                    {questions.map((question, index) => (
                      <div
                        key={index}
                        className={`p-3 rounded-lg border cursor-pointer hover:bg-muted/50 transition-colors ${
                          activeQuestionIndex === index ? "border-primary bg-primary/5" : ""
                        }`}
                        onClick={() => handleSelectQuestion(index)}
                      >
                        <p className="font-medium truncate">{question.question}</p>
                        {question.difficulty && (
                          <Badge
                            variant="outline"
                            className={`mt-2 ${
                              question.difficulty === "hard"
                                ? "bg-red-50 text-red-700 dark:bg-red-900/20 dark:text-red-400"
                                : question.difficulty === "medium"
                                  ? "bg-yellow-50 text-yellow-700 dark:bg-yellow-900/20 dark:text-yellow-400"
                                  : "bg-green-50 text-green-700 dark:bg-green-900/20 dark:text-green-400"
                            }`}
                          >
                            {question.difficulty}
                          </Badge>
                        )}
                        {question.category && (
                          <Badge variant="secondary" className="ml-2 mt-2">
                            {question.category}
                          </Badge>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                <div className="md:col-span-2 space-y-4">
                  {activeQuestionIndex !== null ? (
                    <>
                      <div className="space-y-4">
                        <div className="p-4 rounded-lg border bg-card">
                          <h3 className="font-medium text-lg">{questions[activeQuestionIndex].question}</h3>
                          {questions[activeQuestionIndex].context && (
                            <p className="text-sm text-muted-foreground mt-2">
                              {questions[activeQuestionIndex].context}
                            </p>
                          )}
                          <div className="flex justify-end">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => copyToClipboard(questions[activeQuestionIndex].question)}
                            >
                              <Copy className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>

                        {questions[activeQuestionIndex].suggestedAnswer && (
                          <div className="p-4 rounded-lg border bg-muted/30">
                            <h4 className="font-medium">Suggested Answer Points:</h4>
                            <p className="text-sm mt-2">{questions[activeQuestionIndex].suggestedAnswer}</p>
                          </div>
                        )}

                        <div className="space-y-2">
                          <Label htmlFor="answer">Your Answer</Label>
                          <Textarea
                            id="answer"
                            placeholder="Practice your answer here..."
                            className="min-h-[150px]"
                            value={userAnswer}
                            onChange={(e) => setUserAnswer(e.target.value)}
                          />
                        </div>

                        <div className="flex flex-wrap gap-2">
                          <Button
                            variant={isRecording ? "destructive" : "secondary"}
                            onClick={isRecording ? stopRecording : startRecording}
                          >
                            {isRecording ? (
                              <>
                                <MicOff className="mr-2 h-4 w-4" />
                                Stop Recording
                              </>
                            ) : (
                              <>
                                <Mic className="mr-2 h-4 w-4" />
                                Record Answer
                              </>
                            )}
                          </Button>
                          <Button variant="outline" onClick={saveAnswer} disabled={!userAnswer.trim()}>
                            <Save className="mr-2 h-4 w-4" />
                            Save Answer
                          </Button>
                        </div>

                        {audioUrl && (
                          <div className="p-4 rounded-lg border">
                            <h4 className="font-medium mb-2">Your Recorded Answer:</h4>
                            <audio src={audioUrl} controls className="w-full" />
                          </div>
                        )}
                      </div>
                    </>
                  ) : (
                    <div className="flex items-center justify-center h-64 border rounded-lg">
                      <p className="text-muted-foreground">Select a question to practice</p>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-12">
                <FileText className="h-16 w-16 text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium">No questions generated yet</h3>
                <p className="text-muted-foreground">
                  Fill in the job details and generate questions to start practicing
                </p>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
      <CardFooter className="flex justify-between border-t pt-6">
        <p className="text-sm text-muted-foreground">Powered by Gemini 2.0 Flash</p>
      </CardFooter>
    </Card>
  )
}
