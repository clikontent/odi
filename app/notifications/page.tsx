"use client"

import { useState } from "react"
import { useNotifications } from "@/contexts/notification-context"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { formatDistanceToNow } from "date-fns"
import Link from "next/link"
import { Info, CheckCircle, AlertTriangle, AlertCircle, Loader2 } from "lucide-react"

export default function NotificationsPage() {
  const { notifications, markAsRead, markAllAsRead, isLoading, unreadCount } = useNotifications()
  const [activeTab, setActiveTab] = useState("all")

  const filteredNotifications =
    activeTab === "all"
      ? notifications
      : activeTab === "unread"
        ? notifications.filter((n) => !n.is_read)
        : notifications.filter((n) => n.is_read)

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case "info":
        return <Info className="h-5 w-5 text-blue-500" />
      case "success":
        return <CheckCircle className="h-5 w-5 text-green-500" />
      case "warning":
        return <AlertTriangle className="h-5 w-5 text-yellow-500" />
      case "error":
        return <AlertCircle className="h-5 w-5 text-red-500" />
      default:
        return <Info className="h-5 w-5 text-gray-500" />
    }
  }

  return (
    <div className="container mx-auto py-6">
      <div className="flex flex-col space-y-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Notifications</h1>
            <p className="text-muted-foreground">Stay updated with important information</p>
          </div>
          {unreadCount > 0 && (
            <Button onClick={markAllAsRead} variant="outline">
              Mark all as read
            </Button>
          )}
        </div>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle>Your Notifications</CardTitle>
            <CardDescription>
              You have {unreadCount} unread {unreadCount === 1 ? "notification" : "notifications"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="all" value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="mb-4">
                <TabsTrigger value="all">
                  All
                  <Badge variant="secondary" className="ml-2">
                    {notifications.length}
                  </Badge>
                </TabsTrigger>
                <TabsTrigger value="unread">
                  Unread
                  <Badge variant="secondary" className="ml-2">
                    {notifications.filter((n) => !n.is_read).length}
                  </Badge>
                </TabsTrigger>
                <TabsTrigger value="read">
                  Read
                  <Badge variant="secondary" className="ml-2">
                    {notifications.filter((n) => n.is_read).length}
                  </Badge>
                </TabsTrigger>
              </TabsList>

              <TabsContent value={activeTab} className="mt-0">
                {isLoading ? (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                  </div>
                ) : filteredNotifications.length === 0 ? (
                  <div className="text-center py-8">
                    <p className="text-muted-foreground">No notifications found</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {filteredNotifications.map((notification) => (
                      <div key={notification.id}>
                        <div
                          className={`flex items-start p-4 rounded-lg ${!notification.is_read ? "bg-muted/50" : ""}`}
                        >
                          <div className="mr-4 mt-0.5">{getNotificationIcon(notification.type)}</div>
                          <div className="flex-1">
                            <div className="flex items-start justify-between">
                              <h3 className="font-medium">{notification.title}</h3>
                              <div className="flex items-center gap-2">
                                <span className="text-sm text-muted-foreground">
                                  {formatDistanceToNow(new Date(notification.created_at), { addSuffix: true })}
                                </span>
                                {!notification.is_read && (
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    className="h-8 px-2"
                                    onClick={() => markAsRead(notification.id)}
                                  >
                                    Mark as read
                                  </Button>
                                )}
                              </div>
                            </div>
                            <p className="text-muted-foreground mt-1">{notification.message}</p>
                            {notification.link && (
                              <Link
                                href={notification.link}
                                className="text-sm text-primary hover:underline mt-2 inline-block"
                              >
                                View details
                              </Link>
                            )}
                          </div>
                        </div>
                        <Separator className="my-4" />
                      </div>
                    ))}
                  </div>
                )}
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
