"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Badge } from "@/components/ui/badge"
import { MoreHorizontal, Search } from "lucide-react"

export default function UsersPage() {
  const [searchQuery, setSearchQuery] = useState("")

  // Sample user data
  const users = [
    {
      id: "1",
      name: "John Doe",
      email: "john@example.com",
      status: "active",
      role: "user",
      createdAt: "2023-05-15",
      resumes: 3,
    },
    {
      id: "2",
      name: "Jane Smith",
      email: "jane@example.com",
      status: "active",
      role: "user",
      createdAt: "2023-06-22",
      resumes: 5,
    },
    {
      id: "3",
      name: "Robert Johnson",
      email: "robert@example.com",
      status: "inactive",
      role: "user",
      createdAt: "2023-04-10",
      resumes: 1,
    },
    {
      id: "4",
      name: "Emily Davis",
      email: "emily@example.com",
      status: "active",
      role: "admin",
      createdAt: "2023-03-05",
      resumes: 7,
    },
    {
      id: "5",
      name: "Michael Wilson",
      email: "michael@example.com",
      status: "active",
      role: "user",
      createdAt: "2023-07-18",
      resumes: 2,
    },
  ]

  // Filter users based on search query
  const filteredUsers = users.filter(
    (user) =>
      user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.email.toLowerCase().includes(searchQuery.toLowerCase()),
  )

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Users</h2>
        <p className="text-muted-foreground">Manage user accounts and permissions</p>
      </div>

      <div className="flex items-center justify-between">
        <div className="relative w-64">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search users..."
            className="pl-8"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <Button>Add User</Button>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Role</TableHead>
              <TableHead>Joined</TableHead>
              <TableHead>Resumes</TableHead>
              <TableHead className="w-[50px]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredUsers.map((user) => (
              <TableRow key={user.id}>
                <TableCell className="font-medium">{user.name}</TableCell>
                <TableCell>{user.email}</TableCell>
                <TableCell>
                  <Badge variant={user.status === "active" ? "default" : "secondary"}>{user.status}</Badge>
                </TableCell>
                <TableCell>
                  <Badge variant={user.role === "admin" ? "destructive" : "outline"}>{user.role}</Badge>
                </TableCell>
                <TableCell>{user.createdAt}</TableCell>
                <TableCell>{user.resumes}</TableCell>
                <TableCell>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon">
                        <MoreHorizontal className="h-4 w-4" />
                        <span className="sr-only">Open menu</span>
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuLabel>Actions</DropdownMenuLabel>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem>View details</DropdownMenuItem>
                      <DropdownMenuItem>Edit user</DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem className="text-destructive">Delete user</DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}

