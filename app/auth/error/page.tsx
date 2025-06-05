"use client"

import { useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import Link from "next/link"

export default function ErrorPage() {
  const searchParams = useSearchParams()
  const error = searchParams?.get("error")

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold text-red-600">Authentication Error</CardTitle>
          <CardDescription>There was a problem signing you in</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="bg-red-50 p-4 rounded-md mb-4">
            <p className="text-sm text-red-800">
              {error === "OAuthSignin" && "Error in the OAuth signin process."}
              {error === "OAuthCallback" && "Error in the OAuth callback process."}
              {error === "OAuthCreateAccount" && "Could not create OAuth provider user in the database."}
              {error === "EmailCreateAccount" && "Could not create email provider user in the database."}
              {error === "Callback" && "Error in the OAuth callback handler."}
              {error === "OAuthAccountNotLinked" &&
                "The email on the account is already linked, but not with this OAuth account."}
              {error === "EmailSignin" && "The e-mail could not be sent."}
              {error === "CredentialsSignin" && "The sign in failed. Check the details you provided are correct."}
              {error === "SessionRequired" && "The content of this page requires you to be signed in at all times."}
              {error === "Default" && "An unexpected error occurred."}
              {!error && "An unknown error occurred during authentication."}
            </p>
          </div>
        </CardContent>
        <CardFooter>
          <Button asChild className="w-full">
            <Link href="/auth/login">Try Again</Link>
          </Button>
        </CardFooter>
      </Card>
    </div>
  )
}
