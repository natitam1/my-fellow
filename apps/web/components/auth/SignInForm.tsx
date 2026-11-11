"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "sonner";
import {
  Phone,
  Lock,
  ArrowRight,
  RefreshCw,
  Edit2,
  CheckCircle2,
  AlertCircle,
  Eye,
  EyeOff,
  ShieldCheck,
  User as UserIcon,
} from "lucide-react";

import { useAuth } from "@/context/AuthContext";
import { OtpInput } from "@/components/auth/OtpInput";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { normalizeEthiopianPhone, isValidEthiopianPhone, formatDisplayPhone } from "@/lib/phone";

export function SignInForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectUrl = searchParams.get("redirect") || searchParams.get("returnUrl") || "";

  const { sendPhoneOtp, verifyPhoneOtp, loginWithPassword } = useAuth();

  // Tab state: "otp" | "password"
  const [activeTab, setActiveTab] = useState<"otp" | "password">("otp");

  // Phone OTP Flow State
  const [phoneNumber, setPhoneNumber] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [otpCode, setOtpCode] = useState("");
  const [countdown, setCountdown] = useState(60);
  const [isSendingOtp, setIsSendingOtp] = useState(false);
  const [isVerifyingOtp, setIsVerifyingOtp] = useState(false);
  const [otpError, setOtpError] = useState(false);

  // Password Flow State
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isSigningIn, setIsSigningIn] = useState(false);

  // Countdown timer for OTP
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (otpSent && countdown > 0) {
      timer = setInterval(() => {
        setCountdown((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [otpSent, countdown]);

  // Handle Send OTP
  const handleSendOtp = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();

    const normalized = normalizeEthiopianPhone(phoneNumber);
    if (!isValidEthiopianPhone(normalized)) {
      toast.error("Please enter a valid Ethiopian phone number (e.g. 09... or 07...)");
      return;
    }

    setIsSendingOtp(true);
    try {
      const res = await sendPhoneOtp(normalized);
      setOtpSent(true);
      setCountdown(60);
      setOtpCode("");
      setOtpError(false);
      toast.success(`Verification code sent to ${formatDisplayPhone(normalized)}`);
    } catch (err: any) {
      const msg =
        err.response?.data?.message ||
        err.message ||
        "Failed to send verification code. Please check your number.";
      toast.error(msg);
    } finally {
      setIsSendingOtp(false);
    }
  };

  // Handle Resend OTP
  const handleResendOtp = async () => {
    if (countdown > 0 || isSendingOtp) return;
    await handleSendOtp();
  };

  // Handle Verify OTP
  const handleVerifyOtp = async (codeToVerify?: string) => {
    const code = (codeToVerify || otpCode).trim();
    if (!code || (code !== "00" && code.length !== 6)) {
      toast.error("Please enter the 6-digit verification code");
      return;
    }

    const normalized = normalizeEthiopianPhone(phoneNumber);
    setIsVerifyingOtp(true);
    setOtpError(false);

    try {
      const res = await verifyPhoneOtp(normalized, code);
      toast.success("Phone verified successfully!");

      const isNewUser = res?.isNewUser || !res?.user?.fullName;
      if (isNewUser) {
        router.push("/onboarding");
      } else {
        const userRole = res?.user?.role;
        const isAdmin = userRole === "admin" || userRole === "super_admin" || userRole === "leader";
        if (redirectUrl) {
          router.push(redirectUrl);
        } else if (isAdmin) {
          router.push("/admin");
        } else {
          router.push("/");
        }
      }
    } catch (err: any) {
      setOtpError(true);
      const msg =
        err.response?.data?.message ||
        err.message ||
        "Invalid or expired verification code. Please try again.";
      toast.error(msg);
    } finally {
      setIsVerifyingOtp(false);
    }
  };

  // Handle Password Sign In
  const handlePasswordSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!identifier.trim()) {
      toast.error("Please enter your phone number or username");
      return;
    }
    if (!password) {
      toast.error("Please enter your password");
      return;
    }

    setIsSigningIn(true);
    try {
      // If it looks like a phone number, normalize it, otherwise pass as is
      const trimmedIdentifier = identifier.trim();
      const loginPayload = isValidEthiopianPhone(trimmedIdentifier)
        ? normalizeEthiopianPhone(trimmedIdentifier)
        : trimmedIdentifier;

      const res = await loginWithPassword(loginPayload, password);
      toast.success("Welcome back!");

      const user = res?.user || res?.data?.user;
      const isAdmin =
        user?.role === "admin" ||
        user?.role === "super_admin" ||
        user?.role === "leader";

      if (redirectUrl) {
        router.push(redirectUrl);
      } else if (isAdmin) {
        router.push("/admin");
      } else {
        router.push("/");
      }
    } catch (err: any) {
      const msg =
        err.response?.data?.message ||
        err.message ||
        "Invalid credentials. Please verify your details.";
      toast.error(msg);
    } finally {
      setIsSigningIn(false);
    }
  };

  return (
    <div className="w-full max-w-md mx-auto">
      <Card className="border-border/80 shadow-md bg-card">
        <CardHeader className="space-y-3 pb-4 text-center">
          <div className="flex justify-center">
            <div className="relative h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center p-2 border border-primary/20">
              <Image
                src="/images/logo-primary.png"
                alt="4 Kilo Fellowship"
                width={40}
                height={40}
                className="object-contain"
                priority
              />
            </div>
          </div>
          <div>
            <CardTitle className="text-xl font-bold tracking-tight text-foreground">
              Sign in to My Fellow
            </CardTitle>
            <CardDescription className="text-xs text-muted-foreground mt-1">
              4 Kilo Christian Students Fellowship (AAU ECSF)
            </CardDescription>
          </div>

          {/* Mode Switcher Tabs */}
          <div className="grid grid-cols-2 p-1 rounded-lg bg-muted text-muted-foreground text-xs font-medium">
            <button
              type="button"
              onClick={() => {
                setActiveTab("otp");
                setOtpSent(false);
                setOtpCode("");
              }}
              className={`py-1.5 px-3 rounded-md transition-all duration-150 flex items-center justify-center gap-1.5 ${
                activeTab === "otp"
                  ? "bg-background text-foreground font-semibold shadow-xs"
                  : "hover:text-foreground"
              }`}
            >
              <Phone className="h-3.5 w-3.5" />
              <span>Student OTP</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("password")}
              className={`py-1.5 px-3 rounded-md transition-all duration-150 flex items-center justify-center gap-1.5 ${
                activeTab === "password"
                  ? "bg-background text-foreground font-semibold shadow-xs"
                  : "hover:text-foreground"
              }`}
            >
              <ShieldCheck className="h-3.5 w-3.5" />
              <span>Leader / Admin</span>
            </button>
          </div>
        </CardHeader>

        <CardContent className="pt-2 pb-6">
          {activeTab === "otp" ? (
            /* OTP Flow */
            !otpSent ? (
              <form onSubmit={handleSendOtp} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="phone" className="text-xs font-semibold text-foreground">
                    Ethiopian Phone Number
                  </Label>
                  <div className="relative flex items-center">
                    <span className="absolute left-3 text-xs font-medium text-muted-foreground select-none pointer-events-none">
                      +251
                    </span>
                    <Input
                      id="phone"
                      type="tel"
                      inputMode="tel"
                      placeholder="09... or 07..."
                      value={phoneNumber}
                      onChange={(e) => setPhoneNumber(e.target.value)}
                      className="pl-13 font-mono text-sm tracking-wide h-10 border-input focus-visible:ring-primary focus-visible:ring-1"
                      autoFocus
                      required
                    />
                  </div>
                  <p className="text-[11px] text-muted-foreground">
                    Enter your phone number to receive a 6-digit login code via SMS.
                  </p>
                </div>

                <Button
                  type="submit"
                  disabled={isSendingOtp || !phoneNumber.trim()}
                  className="w-full h-10 bg-primary hover:bg-primary/90 text-primary-foreground font-semibold text-sm shadow-xs transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  {isSendingOtp ? (
                    <>
                      <RefreshCw className="h-4 w-4 animate-spin" />
                      <span>Sending verification code...</span>
                    </>
                  ) : (
                    <>
                      <span>Send Login Code</span>
                      <ArrowRight className="h-4 w-4" />
                    </>
                  )}
                </Button>
              </form>
            ) : (
              /* OTP Verification Step */
              <div className="space-y-5">
                <div className="flex items-center justify-between p-3 rounded-lg bg-muted/60 border border-border/60 text-xs">
                  <div>
                    <span className="text-muted-foreground block text-[11px]">Code sent to</span>
                    <span className="font-semibold text-foreground font-mono">
                      {formatDisplayPhone(phoneNumber)}
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setOtpSent(false);
                      setOtpCode("");
                    }}
                    className="flex items-center gap-1 text-primary hover:text-primary/80 font-medium text-xs px-2 py-1 rounded hover:bg-primary/10 transition-colors"
                  >
                    <Edit2 className="h-3 w-3" />
                    <span>Change</span>
                  </button>
                </div>

                <div className="space-y-3">
                  <Label className="text-xs font-semibold text-center block text-foreground">
                    Enter 6-Digit Verification Code
                  </Label>
                  <OtpInput
                    length={6}
                    value={otpCode}
                    onChange={setOtpCode}
                    onComplete={(code) => handleVerifyOtp(code)}
                    disabled={isVerifyingOtp}
                    hasError={otpError}
                  />
                  {otpError && (
                    <p className="text-xs text-destructive text-center flex items-center justify-center gap-1">
                      <AlertCircle className="h-3.5 w-3.5" />
                      <span>Invalid code. Please try again.</span>
                    </p>
                  )}
                </div>

                <Button
                  type="button"
                  onClick={() => handleVerifyOtp()}
                  disabled={isVerifyingOtp || (!otpCode || (otpCode !== "00" && otpCode.length !== 6))}
                  className="w-full h-10 bg-primary hover:bg-primary/90 text-primary-foreground font-semibold text-sm shadow-xs transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  {isVerifyingOtp ? (
                    <>
                      <RefreshCw className="h-4 w-4 animate-spin" />
                      <span>Verifying code...</span>
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="h-4 w-4" />
                      <span>Verify & Continue</span>
                    </>
                  )}
                </Button>

                {/* Resend Countdown */}
                <div className="text-center pt-1">
                  {countdown > 0 ? (
                    <p className="text-xs text-muted-foreground">
                      Resend code in{" "}
                      <span className="font-mono font-semibold text-foreground">
                        {countdown}s
                      </span>
                    </p>
                  ) : (
                    <button
                      type="button"
                      onClick={handleResendOtp}
                      disabled={isSendingOtp}
                      className="text-xs font-semibold text-primary hover:text-primary/80 transition-colors underline-offset-4 hover:underline"
                    >
                      Resend Verification Code
                    </button>
                  )}
                </div>
              </div>
            )
          ) : (
            /* Password Login Flow */
            <form onSubmit={handlePasswordSignIn} className="space-y-4">
              <div className="space-y-1.5">
                <Label htmlFor="identifier" className="text-xs font-semibold text-foreground">
                  Phone Number or Username
                </Label>
                <div className="relative">
                  <UserIcon className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground pointer-events-none" />
                  <Input
                    id="identifier"
                    type="text"
                    placeholder="09... or admin_username"
                    value={identifier}
                    onChange={(e) => setIdentifier(e.target.value)}
                    className="pl-9 h-10 border-input focus-visible:ring-primary focus-visible:ring-1 text-sm"
                    autoFocus
                    required
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="password" className="text-xs font-semibold text-foreground">
                  Password
                </Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground pointer-events-none" />
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="pl-9 pr-9 h-10 border-input focus-visible:ring-primary focus-visible:ring-1 text-sm font-mono"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-2.5 top-2.5 text-muted-foreground hover:text-foreground transition-colors p-0.5 rounded"
                    aria-label={showPassword ? "Hide password" : "Show password"}
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              <Button
                type="submit"
                disabled={isSigningIn || !identifier.trim() || !password}
                className="w-full h-10 bg-primary hover:bg-primary/90 text-primary-foreground font-semibold text-sm shadow-xs transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                {isSigningIn ? (
                  <>
                    <RefreshCw className="h-4 w-4 animate-spin" />
                    <span>Signing in...</span>
                  </>
                ) : (
                  <>
                    <ShieldCheck className="h-4 w-4" />
                    <span>Sign In</span>
                  </>
                )}
              </Button>
            </form>
          )}
        </CardContent>

        <CardFooter className="flex flex-col gap-2 pt-0 pb-6 border-t border-border/50 text-center">
          <p className="text-[11px] text-muted-foreground mt-3">
            By signing in, you agree to fellowship community guidelines and academic standards.
          </p>
          <div className="flex items-center justify-center gap-4 text-xs text-muted-foreground">
            <Link href="/terms" className="hover:text-foreground transition-colors">
              Terms
            </Link>
            <span>•</span>
            <Link href="/privacy" className="hover:text-foreground transition-colors">
              Privacy
            </Link>
            <span>•</span>
            <Link href="/support" className="hover:text-foreground transition-colors">
              Support
            </Link>
          </div>
        </CardFooter>
      </Card>
    </div>
  );
}
