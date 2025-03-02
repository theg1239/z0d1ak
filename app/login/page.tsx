"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { SiteHeader } from "@/components/site-header"
import { TerminalText } from "@/components/terminal-text"
import Link from "next/link"
import { signIn, getSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { LogIn, UserPlus } from "lucide-react"

export default function LoginPage() {
  const [isLogin, setIsLogin] = useState(true)
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [name, setName] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError("")

    if (isLogin) {
      const result = await signIn("credentials", {
        redirect: false,
        email,
        password,
      })

      if (result?.ok) {
        const session = await getSession()
        if (session?.user?.role === "member") {
          router.push("/dashboard")
        } else {
          router.push("/writeups")
        }
      } else {
        setError(result?.error || "Login failed. Please check your credentials and try again.")
      }
    } else {
      const res = await fetch("/api/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ name, email, password }),
      })

      const data = await res.json()

      if (res.ok) {
        const result = await signIn("credentials", {
          redirect: false,
          email,
          password,
        })
        if (result?.ok) {
          router.push("/writeups")
        } else {
          setError(result?.error || "Registration succeeded but login failed. Please try logging in.")
        }
      } else {
        setError(data.error || "Registration failed. Please try again.")
      }
    }

    setIsLoading(false)
  }

  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader />

      <main className="flex-1 flex items-center justify-center py-12">
        <div className="container max-w-md px-4">
          <Card className="border-primary/30 bg-black/80 backdrop-blur-sm">
            <CardHeader className="space-y-1">
              <CardTitle className="text-2xl font-bold">
                {isLogin ? (
                  <TerminalText text="$ ./login.sh" typingSpeed={50} />
                ) : (
                  <TerminalText text="$ ./register.sh" typingSpeed={50} />
                )}
              </CardTitle>
              <CardDescription>
                {isLogin
                  ? "Enter your credentials to access your account"
                  : "Create a new account to join the team"}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                {!isLogin && (
                  <div className="space-y-2">
                    <label htmlFor="name" className="text-sm font-medium">
                      Username
                    </label>
                    <Input
                      id="name"
                      placeholder="h4ck3r_n4m3"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      required
                    />
                  </div>
                )}
                <div className="space-y-2">
                  <label htmlFor="email" className="text-sm font-medium">
                    Email
                  </label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="hacker@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label htmlFor="password" className="text-sm font-medium">
                      Password
                    </label>
                    {isLogin && (
                      <Link
                        href="/forgot-password"
                        className="text-xs text-primary hover:underline"
                      >
                        Forgot password?
                      </Link>
                    )}
                  </div>
                  <Input
                    id="password"
                    type="password"
                    placeholder="Enter a secure password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                </div>
                {error && <p className="text-red-500 text-sm">{error}</p>}
                <Button
                  type="submit"
                  variant="hacker"
                  className="w-full gap-2"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <div className="flex items-center gap-2">
                      <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                      Processing...
                    </div>
                  ) : isLogin ? (
                    <>
                      <LogIn className="h-4 w-4" />
                      Login
                    </>
                  ) : (
                    <>
                      <UserPlus className="h-4 w-4" />
                      Register
                    </>
                  )}
                </Button>
              </form>
            </CardContent>
            <CardFooter className="flex flex-col space-y-4">
              <div className="text-sm text-center text-muted-foreground">
                {isLogin
                  ? "Don't have an account?"
                  : "Already have an account?"}{" "}
                <button
                  onClick={() => setIsLogin(!isLogin)}
                  className="text-primary hover:underline"
                >
                  {isLogin ? "Register" : "Login"}
                </button>
              </div>
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-primary/20" />
                </div>
                <div className="relative flex justify-center text-xs">
                  <span className="bg-black px-2 text-muted-foreground">
                    Or continue with
                  </span>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() => signIn("github", { callbackUrl: "/dashboard" })}
                >
                  GitHub
                </Button>
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() => signIn("google", { callbackUrl: "/dashboard" })}
                >
                  Google
                </Button>
              </div>
            </CardFooter>
          </Card>
        </div>
      </main>
    </div>
  )
}
