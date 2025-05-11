"use client"

import { useState } from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { toast } from "sonner"
import { auth } from "../../firebase"
import { sendPasswordResetEmail, signInWithEmailAndPassword } from "firebase/auth"
import { useRouter } from "next/navigation"

const formSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password is required"),
})

export default function LoginForm() {
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()
  const [isResetMode, setIsResetMode] = useState(false)

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  })

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    setIsLoading(true)

    try {
      const userCredential = await signInWithEmailAndPassword(auth, values.email, values.password)
      
      if (!userCredential.user.emailVerified) {
        toast.error("Email not verified", {
          description: "Please verify your email before logging in.",
        })
        return
      }

      toast.success("Login successful!", {
        description: "Welcome back!",
      })

      // Redirect to dashboard or home page
      if (values.email.endsWith("@mercymission.org")) {
        router.push("/mercy-mission")
      } else {
        router.push("/charity")
      }
    } catch (error) {
      console.error(error)
      toast.error("Login failed", {
        description: "Invalid email or password. Please try again.",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handlePasswordReset = async (event: React.FormEvent) => {
    event.preventDefault(); // Prevent form submission from reloading the page
    const email = form.getValues("email");
    if (!email) {
      toast.error("Please enter your email address to reset your password.");
      return;
    }

    try {
      await sendPasswordResetEmail(auth, email);
      toast.success("Password reset email sent!", {
        description: "Check your inbox for further instructions.",
      });
    } catch (error) {
      console.error(error);
      toast.error("Failed to send password reset email", {
        description: "Please try again later.",
      });
    }
  };

  const toggleResetMode = () => {
    setIsResetMode(!isResetMode);
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-background p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-2xl">{isResetMode ? 'Reset Password' : 'Login'}</CardTitle>
          <CardDescription>{isResetMode ? 'Enter your email to reset your password' : 'Welcome back! Please login to your account'}</CardDescription>
        </CardHeader>
        <Form {...form}>
          <form onSubmit={isResetMode ? handlePasswordReset : form.handleSubmit(onSubmit)}>
            <CardContent className="space-y-4">
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input placeholder="you@example.com" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              {!isResetMode && (
                <FormField
                  control={form.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Password</FormLabel>
                      <FormControl>
                        <Input type="password" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}
              <div className="mb-4" />
            </CardContent>

            <CardFooter className="flex flex-col space-y-2">
              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? (isResetMode ? 'Sending...' : 'Logging in...') : (isResetMode ? 'Send Reset Email' : 'Login')}
              </Button>
              <Button variant="link" onClick={toggleResetMode} className="w-full">
                {isResetMode ? 'Back to Login' : 'Forgot Password?'}
              </Button>
            </CardFooter>
          </form>
        </Form>
      </Card>
    </div>
  )
} 