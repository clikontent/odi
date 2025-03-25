"use client"

import Image from "next/image"
import { Card, CardContent } from "@/components/ui/card"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"

interface TemplateSelectorProps {
  selectedTemplate: string
  onSelectTemplate: (template: string) => void
}

export function TemplateSelector({ selectedTemplate, onSelectTemplate }: TemplateSelectorProps) {
  const templates = [
    {
      id: "professional",
      name: "Professional",
      description: "A classic template suitable for most industries",
      image: "/placeholder.svg?height=200&width=150",
    },
    {
      id: "modern",
      name: "Modern",
      description: "A contemporary design with a clean layout",
      image: "/placeholder.svg?height=200&width=150",
    },
    {
      id: "minimalist",
      name: "Minimalist",
      description: "A simple and elegant design with minimal elements",
      image: "/placeholder.svg?height=200&width=150",
    },
    {
      id: "creative",
      name: "Creative",
      description: "A bold design for creative professionals",
      image: "/placeholder.svg?height=200&width=150",
    },
  ]

  return (
    <RadioGroup value={selectedTemplate} onValueChange={onSelectTemplate} className="grid grid-cols-2 gap-4">
      {templates.map((template) => (
        <div key={template.id} className="relative">
          <RadioGroupItem value={template.id} id={template.id} className="sr-only" />
          <Label htmlFor={template.id} className="cursor-pointer">
            <Card
              className={`overflow-hidden transition-all ${
                selectedTemplate === template.id ? "ring-2 ring-primary" : "hover:border-muted-foreground/50"
              }`}
            >
              <CardContent className="p-0">
                <div className="relative aspect-[3/4] w-full">
                  <Image src={template.image || "/placeholder.svg"} alt={template.name} fill className="object-cover" />
                </div>
                <div className="p-3">
                  <h3 className="font-medium">{template.name}</h3>
                  <p className="text-xs text-muted-foreground">{template.description}</p>
                </div>
              </CardContent>
            </Card>
          </Label>
        </div>
      ))}
    </RadioGroup>
  )
}

