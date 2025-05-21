"use client"

import type React from "react"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { toast } from "sonner"
import { auth } from "../../firebase"
import { createUserWithEmailAndPassword, sendEmailVerification } from "firebase/auth"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { doc, setDoc } from "firebase/firestore"
import { db } from "../../firebase"

const formSchema = z.object({
  charity: z.string().min(1, "Please select a charity"),
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
})

export default function RegistrationForm() {
  const [isLoading, setIsLoading] = useState(false)
  // const [error, setError] = useState<string | null>(null)
  // const [success, setSuccess] = useState<string | null>(null)

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      charity: "",
      email: "",
      password: "",
    },
  })

  const charities = [
    { name: "Red Cross", domain: "redcross.org" },
    { name: "UNICEF", domain: "unicef.org" },
    { name: "Doctors Without Borders", domain: "doctorswithoutborders.org" },
    { name: "Save the Children", domain: "savethechildren.org" },
    { name: "World Wildlife Fund", domain: "worldwildlife.org" },
    { name: "Age UK", domain: "ageuk.org.uk" },
  ]

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    setIsLoading(true)

    const selectedCharity = charities.find(c => c.name === values.charity)

    // Add exception for specific email
    if (values.email === "fajita786@gmail.com" || values.email === "impactengine@gmail.com" 
      || values.email === "k.zia@hotmail.co.uk"
    ) {
      // Proceed without charity domain check
    } else if (!selectedCharity || !values.email.endsWith(`@${selectedCharity.domain}`)) {
      toast.error("Email domain does not match the selected charity.", {
        description: "Please try again.",
      });
      setIsLoading(false)
      return
    }

    try {
      const userCredential = await createUserWithEmailAndPassword(auth, values.email, values.password)
      await sendEmailVerification(userCredential.user)
      console.log('userCredential.user.uid', userCredential.user.uid);
      // Store selected charity in Firestore
      await setDoc(doc(db, "users", userCredential.user.uid), {
        charityName: selectedCharity?.name || values.charity,
        email: values.email,
      })

      toast.success("Registration successful!", {
        description: "Please check your email to verify your account.",
      })

      form.reset()
    } catch (error) {
      console.error(error)
      toast.error("Registration failed", {
        description: "There was a problem with your registration. Please try again.",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex justify-center items-center min-h-screen bg-background p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-2xl">Create an account</CardTitle>
          <CardDescription>Register to support your favorite charity</CardDescription>
        </CardHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <CardContent className="space-y-4">
              <FormField
                control={form.control}
                name="charity"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Select Charity</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a charity" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {charities.map(c => (
                          <SelectItem key={c.name} value={c.name}>{c.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

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

              <div className="mb-4" />
            </CardContent>

            <CardFooter>
              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? "Registering..." : "Register"}
              </Button>
            </CardFooter>
          </form>
        </Form>
      </Card>
    </div>
  )
}
