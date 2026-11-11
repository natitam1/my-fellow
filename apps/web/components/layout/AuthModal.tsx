"use client";

import * as React from "react";
import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/context/AuthContext";
import { toast } from "sonner";
import { Phone, Lock, ArrowRight, KeyRound, Loader2, Sparkles } from "lucide-react";
import Link from "next/link";

interface AuthModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  defaultMode?: "otp" | "password";
}

export function AuthModal({
  open,
  onOpenChange,
  defaultMode = "otp",
}: AuthModalProps) {
  const router = useRouter();
  const { sendPhoneOtp, verifyPhoneOtp, loginWithPassword } = useAuth();

  const [mode, setMode] = useState<"otp" | "password">(defaultMode);
  const [step, setStep] = useState<"phone" | "code">("phone");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [otpCode, setOtpCode] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  // Reset state when opening/closing
  React.useEffect(() => {
    if (!open) {
      setStep("phone");
      setOtpCode("");
      setPassword("");
      setLoading(false);
    }
  }, [open]);

  const formatPhoneNumber = (input: string) => {
    let clean = input.trim().replace(/\s+/g, "");
    if (clean.startsWith("0")) {
      clean = "+251" + clean.slice(1);
    } else if (clean.startsWith("9")) {
      clean = "+251" + clean;
    } else if (!clean.startsWith("+") && clean.length > 0) {
      clean = "+" + clean;
    }
    return clean;
  };

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    const formatted = formatPhoneNumber(phoneNumber);
    if (!formatted || formatted.length < 10) {
      toast.error("Please enter a valid phone number (e.g., 0912345678)");
      return;
    }

    setLoading(true);
    try {
      await sendPhoneOtp(formatted);
      toast.success("Verification code sent to " + formatted);
      setStep("code");
    } catch (err: any) {
      const msg = err.response?.data?.message || "Failed to send verification code. Try password login.";
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!otpCode || otpCode.trim().length < 4) {
      toast.error("Please enter the verification code");
      return;
    }

    setLoading(true);
    try {
      const formatted = formatPhoneNumber(phoneNumber);
      const res = await verifyPhoneOtp(formatted, otpCode.trim());
      toast.success(res.isNewUser ? "Welcome to 4 Kilo Fellowship!" : "Signed in successfully!");
      onOpenChange(false);
      router.refresh();
    } catch (err: any) {
      const msg = err.response?.data?.message || "Invalid or expired verification code.";
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    const formatted = formatPhoneNumber(phoneNumber);
    if (!formatted || !password) {
      toast.error("Please enter both phone number and password");
      return;
    }

    setLoading(true);
    try {
      await loginWithPassword(formatted, password);
      toast.success("Signed in successfully!");
      onOpenChange(false);
      router.refresh();
    } catch (err: any) {
      const msg = err.response?.data?.message || "Invalid phone number or password";
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md p-6 bg-background border border-border shadow-2xl rounded-2xl">
        <DialogHeader className="text-left space-y-2 pb-2">
          <div className="flex items-center gap-2">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <Sparkles className="h-4 w-4" />
            </span>
            <span className="text-xs font-semibold uppercase tracking-wider text-primary">
              AAU 4 Kilo ECSF
            </span>
          </div>
          <DialogTitle className="text-xl font-bold tracking-tight text-foreground">
            {mode === "otp"
              ? step === "phone"
                ? "Sign in with Phone"
                : "Enter Verification Code"
              : "Sign in with Password"}
          </DialogTitle>
          <DialogDescription className="text-sm text-muted-foreground">
            {mode === "otp"
              ? step === "phone"
                ? "We will send an instant SMS one-time code to verify your fellowship account."
                : `Enter the code sent to ${phoneNumber}.`
              : "Access your fellowship profile, devotion bookmarks, giving history, and leadership tools."}
          </DialogDescription>
        </DialogHeader>

        {/* Tab switcher */}
        <div className="grid grid-cols-2 rounded-lg bg-muted/50 p-1 text-xs font-medium">
          <button
            type="button"
            onClick={() => {
              setMode("otp");
              setStep("phone");
            }}
            className={`py-1.5 rounded-md transition-colors ${
              mode === "otp"
                ? "bg-background text-foreground shadow-xs font-semibold"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            Instant Phone OTP
          </button>
          <button
            type="button"
            onClick={() => setMode("password")}
            className={`py-1.5 rounded-md transition-colors ${
              mode === "password"
                ? "bg-background text-foreground shadow-xs font-semibold"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            Password Login
          </button>
        </div>

        {/* Mode 1: OTP */}
        {mode === "otp" && (
          <>
            {step === "phone" ? (
              <form onSubmit={handleSendOtp} className="space-y-4 pt-2">
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-foreground">
                    Phone Number
                  </label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      type="tel"
                      placeholder="0911223344 or +251 9..."
                      value={phoneNumber}
                      onChange={(e) => setPhoneNumber(e.target.value)}
                      className="pl-9 h-11 border-border focus-visible:ring-primary"
                      disabled={loading}
                      autoFocus
                      required
                    />
                  </div>
                  <p className="text-[11px] text-muted-foreground">
                    Supports Ethiopian mobile numbers (Ethio Telecom / Safaricom).
                  </p>
                </div>

                <Button
                  type="submit"
                  disabled={loading || !phoneNumber.trim()}
                  className="w-full h-11 bg-primary text-primary-foreground font-semibold hover:bg-primary/90 transition-colors"
                >
                  {loading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Sending SMS Code...
                    </>
                  ) : (
                    <>
                      Send One-Time Code
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </>
                  )}
                </Button>
              </form>
            ) : (
              <form onSubmit={handleVerifyOtp} className="space-y-4 pt-2">
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-foreground">
                    6-Digit Verification Code
                  </label>
                  <div className="relative">
                    <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      type="text"
                      placeholder="123456"
                      value={otpCode}
                      onChange={(e) => setOtpCode(e.target.value)}
                      maxLength={6}
                      className="pl-9 h-11 text-center font-mono tracking-widest text-lg border-border focus-visible:ring-primary"
                      disabled={loading}
                      autoFocus
                      required
                    />
                  </div>
                </div>

                <div className="flex gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setStep("phone")}
                    disabled={loading}
                    className="h-11"
                  >
                    Back
                  </Button>
                  <Button
                    type="submit"
                    disabled={loading || otpCode.trim().length < 4}
                    className="flex-1 h-11 bg-primary text-primary-foreground font-semibold hover:bg-primary/90 transition-colors"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Verifying...
                      </>
                    ) : (
                      "Confirm & Sign In"
                    )}
                  </Button>
                </div>
              </form>
            )}
          </>
        )}

        {/* Mode 2: Password */}
        {mode === "password" && (
          <form onSubmit={handlePasswordLogin} className="space-y-3 pt-2">
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-foreground">
                Phone Number
              </label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  type="tel"
                  placeholder="0911223344"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  className="pl-9 h-11 border-border focus-visible:ring-primary"
                  disabled={loading}
                  autoFocus
                  required
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-xs font-medium text-foreground">
                  Password
                </label>
              </div>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pl-9 h-11 border-border focus-visible:ring-primary"
                  disabled={loading}
                  required
                />
              </div>
            </div>

            <Button
              type="submit"
              disabled={loading || !phoneNumber.trim() || !password}
              className="w-full h-11 bg-primary text-primary-foreground font-semibold hover:bg-primary/90 transition-colors mt-2"
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Signing in...
                </>
              ) : (
                "Sign In"
              )}
            </Button>
          </form>
        )}

        {/* Footer info */}
        <div className="pt-2 text-center text-[11px] text-muted-foreground border-t border-border/60">
          By continuing, you agree to our{" "}
          <Link
            href="/terms"
            onClick={() => onOpenChange(false)}
            className="text-foreground underline underline-offset-2 hover:text-primary"
          >
            Terms of Service
          </Link>{" "}
          and{" "}
          <Link
            href="/privacy"
            onClick={() => onOpenChange(false)}
            className="text-foreground underline underline-offset-2 hover:text-primary"
          >
            Privacy Policy
          </Link>.
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default AuthModal;
