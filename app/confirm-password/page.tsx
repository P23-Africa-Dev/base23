"use client";

export const dynamic = "force-dynamic";

import InputError from "@/components/input-error";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import AuthLayout from "@/layouts/auth-layout";
import axios from "axios";
import { LoaderCircle } from "lucide-react";
import { useState } from "react";

export default function ConfirmPassword() {
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [processing, setProcessing] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setProcessing(true);
    setError("");
    try {
      await axios.post("/confirm-password", { password });
      window.history.back();
    } catch (err: any) {
      setError(err.response?.data?.errors?.password || "Incorrect password.");
      setPassword("");
    } finally {
      setProcessing(false);
    }
  };

  return (
    <AuthLayout
      title="Confirm your password"
      subtitle="This is a secure area of the application. Please confirm your password before continuing."
    >
      <form onSubmit={submit}>
        <div className="space-y-6">
          <div className="grid gap-2">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              name="password"
              placeholder="Password"
              autoComplete="current-password"
              value={password}
              autoFocus
              onChange={(e) => setPassword(e.target.value)}
            />
            <InputError message={error} />
          </div>
          <div className="flex items-center">
            <Button className="w-full" disabled={processing}>
              {processing && (
                <LoaderCircle className="h-4 w-4 animate-spin mr-2" />
              )}
              Confirm password
            </Button>
          </div>
        </div>
      </form>
    </AuthLayout>
  );
}
