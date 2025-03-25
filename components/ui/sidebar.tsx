"use client"

import * as React from "react"
import { PanelLeft } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

// Simple sidebar component with local state
export function Sidebar({ children }: { children: React.ReactNode }) {
  const [isOpen, setIsOpen] = React.useState(true)

  // Check if mobile on mount and window resize
  React.useEffect(() => {
    const checkIfMobile = () => {
      if (window.innerWidth < 768) {
        setIsOpen(false)
      }
    }

    // Initial check
    checkIfMobile()

    // Add event listener
    window.addEventListener("resize", checkIfMobile)

    // Cleanup
    return () => window.removeEventListener("resize", checkIfMobile)
  }, [])

  return (
    <>
      <Button
        variant="ghost"
        size="icon"
        onClick={() => setIsOpen(!isOpen)}
        aria-label="Toggle sidebar"
        className="fixed top-4 left-4 z-30 md:hidden"
      >
        <PanelLeft className="h-5 w-5" />
      </Button>

      <div
        className={`fixed inset-y-0 left-0 z-20 w-64 transform bg-background border-r transition-transform duration-200 ease-in-out ${
          isOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
        } md:relative`}
      >
        <div className="h-full overflow-y-auto p-4 pt-16 md:pt-0">{children}</div>
      </div>
    </>
  )
}

export const SidebarContent = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div
      className={cn("flex h-full w-full flex-col justify-between rounded-[inherit]", className)}
      ref={ref}
      {...props}
    />
  ),
)
SidebarContent.displayName = "SidebarContent"

export const SidebarFooter = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div className={cn("mt-auto hidden border-t py-4 md:block", className)} ref={ref} {...props} />
  ),
)
SidebarFooter.displayName = "SidebarFooter"

export const SidebarGroup = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => <div className={cn("space-y-1", className)} ref={ref} {...props} />,
)
SidebarGroup.displayName = "SidebarGroup"

export const SidebarGroupAction = React.forwardRef<HTMLButtonElement, React.ButtonHTMLAttributes<HTMLButtonElement>>(
  ({ className, ...props }, ref) => (
    <Button variant="ghost" size="sm" className={cn("justify-start rounded-md px-2", className)} ref={ref} {...props} />
  ),
)
SidebarGroupAction.displayName = "SidebarGroupAction"

export const SidebarGroupContent = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => <div className={cn("mt-2 space-y-2", className)} ref={ref} {...props} />,
)
SidebarGroupContent.displayName = "SidebarGroupContent"

export const SidebarGroupLabel = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => <div className={cn("px-3 text-sm font-medium", className)} ref={ref} {...props} />,
)
SidebarGroupLabel.displayName = "SidebarGroupLabel"

export const SidebarHeader = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div className={cn("flex items-center justify-between px-3 py-2", className)} ref={ref} {...props} />
  ),
)
SidebarHeader.displayName = "SidebarHeader"

export const SidebarInput = React.forwardRef<HTMLInputElement, React.InputHTMLAttributes<HTMLInputElement>>(
  ({ className, ...props }, ref) => (
    <input
      className={cn(
        "flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
        className,
      )}
      ref={ref}
      {...props}
    />
  ),
)
SidebarInput.displayName = "SidebarInput"

export const SidebarInset = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => <div className={cn("px-3", className)} ref={ref} {...props} />,
)
SidebarInset.displayName = "SidebarInset"

export const SidebarMenu = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => <div className={cn("grid gap-1", className)} ref={ref} {...props} />,
)
SidebarMenu.displayName = "SidebarMenu"

export const SidebarMenuAction = React.forwardRef<HTMLButtonElement, React.ButtonHTMLAttributes<HTMLButtonElement>>(
  ({ className, ...props }, ref) => (
    <Button variant="ghost" size="sm" className={cn("justify-start rounded-md px-2", className)} ref={ref} {...props} />
  ),
)
SidebarMenuAction.displayName = "SidebarMenuAction"

export const SidebarMenuBadge = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div
      className={cn(
        "ml-auto rounded-sm px-1.5 text-xs font-semibold ring-offset-background transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
        className,
      )}
      ref={ref}
      {...props}
    />
  ),
)
SidebarMenuBadge.displayName = "SidebarMenuBadge"

export const SidebarMenuButton = React.forwardRef<HTMLButtonElement, React.ButtonHTMLAttributes<HTMLButtonElement>>(
  ({ className, ...props }, ref) => (
    <Button variant="ghost" size="sm" className={cn("justify-start rounded-md px-2", className)} ref={ref} {...props} />
  ),
)
SidebarMenuButton.displayName = "SidebarMenuButton"

export const SidebarMenuItem = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => <div className={cn("text-sm font-medium", className)} ref={ref} {...props} />,
)
SidebarMenuItem.displayName = "SidebarMenuItem"

export const SidebarMenuSkeleton = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div className={cn("h-8 w-[80%] rounded-md bg-secondary", className)} ref={ref} {...props} />
  ),
)
SidebarMenuSkeleton.displayName = "SidebarMenuSkeleton"

export const SidebarMenuSub = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => <div className={cn("mt-2 space-y-2", className)} ref={ref} {...props} />,
)
SidebarMenuSub.displayName = "SidebarMenuSub"

export const SidebarMenuSubButton = React.forwardRef<HTMLButtonElement, React.ButtonHTMLAttributes<HTMLButtonElement>>(
  ({ className, ...props }, ref) => (
    <Button variant="ghost" size="sm" className={cn("justify-start rounded-md px-2", className)} ref={ref} {...props} />
  ),
)
SidebarMenuSubButton.displayName = "SidebarMenuSubButton"

export const SidebarMenuSubItem = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => <div className={cn("text-sm font-medium", className)} ref={ref} {...props} />,
)
SidebarMenuSubItem.displayName = "SidebarMenuSubItem"

export const SidebarProvider = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => <div className={cn(className)} ref={ref} {...props} />,
)
SidebarProvider.displayName = "SidebarProvider"

export const SidebarRail = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div className={cn("hidden flex-col gap-2 px-3 py-2 md:flex", className)} ref={ref} {...props} />
  ),
)
SidebarRail.displayName = "SidebarRail"

export const SidebarSeparator = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => <div className={cn("h-px w-full bg-border", className)} ref={ref} {...props} />,
)
SidebarSeparator.displayName = "SidebarSeparator"

export const SidebarTrigger = React.forwardRef<HTMLButtonElement, React.ButtonHTMLAttributes<HTMLButtonElement>>(
  ({ className, ...props }, ref) => (
    <Button variant="ghost" size="sm" className={cn("justify-start rounded-md px-2", className)} ref={ref} {...props} />
  ),
)
SidebarTrigger.displayName = "SidebarTrigger"

