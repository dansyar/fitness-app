"use client";

import { signIn } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function SignInPage() {
  return (
    <div className="flex-1 flex items-center justify-center px-4 py-12">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Sign in to Forge</CardTitle>
          <CardDescription>Continue with your Google account.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Button
            className="w-full"
            variant="outline"
            onClick={() => signIn("google", { callbackUrl: "/workout" })}
          >
            Continue with Google
          </Button>
          <p className="text-xs text-muted-foreground text-center pt-2">
            Local dev without Google OAuth configured? Set it in{" "}
            <code className="text-foreground">.env</code> first.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
