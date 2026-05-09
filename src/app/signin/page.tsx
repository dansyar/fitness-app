"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function SignInPage() {
  const [email, setEmail] = useState("");
  const [emailSent, setEmailSent] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  async function handleEmailSignIn(e: React.FormEvent) {
    e.preventDefault();
    if (!email) return;
    setSubmitting(true);
    await signIn("nodemailer", { email, callbackUrl: "/workout" });
    setEmailSent(true);
    setSubmitting(false);
  }

  return (
    <div className="flex-1 flex items-center justify-center px-4 py-12">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Sign in to Forge</CardTitle>
          <CardDescription>
            Pick the option you like — both create the same account.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Button
            className="w-full"
            variant="outline"
            onClick={() => signIn("google", { callbackUrl: "/workout" })}
          >
            Continue with Google
          </Button>
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-card px-2 text-muted-foreground">or</span>
            </div>
          </div>
          {emailSent ? (
            <p className="text-sm text-muted-foreground text-center py-4">
              Check your inbox for a sign-in link.
            </p>
          ) : (
            <form onSubmit={handleEmailSignIn} className="space-y-3">
              <div className="space-y-2">
                <Label htmlFor="email">Email magic link</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
              <Button type="submit" className="w-full" disabled={submitting || !email}>
                {submitting ? "Sending..." : "Email me a link"}
              </Button>
            </form>
          )}
          <p className="text-xs text-muted-foreground text-center pt-2">
            Local dev without OAuth/SMTP configured? Set them in{" "}
            <code className="text-foreground">.env</code> first.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
