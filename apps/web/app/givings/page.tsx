"use client";

import React, { useState } from "react";
import {
  Heart,
  HandHeart,
  ShieldCheck,
  CheckCircle2,
  Copy,
  Check,
  ExternalLink,
  FileText,
  Phone,
  User,
  Mail,
  Building2,
  HelpCircle,
  Lock,
  Loader2,
  ChevronDown,
  Sparkles,
  ArrowRight,
  Download,
  AlertCircle,
  Share2,
} from "lucide-react";
import { toast } from "sonner";
import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

// Category definitions
export type GivingCategory =
  | "tithe"
  | "general_offering"
  | "needy_students"
  | "conference_support";

interface CategoryMeta {
  id: GivingCategory;
  title: string;
  badge: string;
  description: string;
  icon: React.ElementType;
}

const GIVING_CATEGORIES: CategoryMeta[] = [
  {
    id: "tithe",
    title: "Tithe",
    badge: "10% Devoted",
    description: "Honoring the Lord with firstfruits dedicated to campus pastoral care and fellowship ministry.",
    icon: Heart,
  },
  {
    id: "general_offering",
    title: "General Offering",
    badge: "Weekly Ministry",
    description: "Supports regular Friday and Sunday campus worship gatherings, prayer nights, and sound equipment.",
    icon: Sparkles,
  },
  {
    id: "needy_students",
    title: "Charity & Needy Students Fund",
    badge: "High Impact",
    description: "Direct cafeteria meal tickets, emergency medical aid, and dorm essentials for disadvantaged campus students.",
    icon: HandHeart,
  },
  {
    id: "conference_support",
    title: "Conference & Retreat Support",
    badge: "Discipleship",
    description: "Subsidizes transport, materials, and lodging for the Annual Spiritual Retreat and high-school mission trips.",
    icon: Building2,
  },
];

// Amount preset buttons in ETB
const AMOUNT_PRESETS = [50, 100, 250, 500, 1000];

// Payment methods
export type PaymentMethod = "telebirr" | "cbe_birr" | "bank_transfer";

interface PaymentMethodMeta {
  id: PaymentMethod;
  name: string;
  subtitle: string;
  tag: string;
  colorClass: string;
}

const PAYMENT_METHODS: PaymentMethodMeta[] = [
  {
    id: "telebirr",
    name: "Telebirr",
    subtitle: "Instant SuperApp or USSD Prompt (*127#)",
    tag: "Fastest",
    colorClass: "border-[#FF6719]/40 bg-[#FF6719]/5",
  },
  {
    id: "cbe_birr",
    name: "CBE Birr",
    subtitle: "Commercial Bank of Ethiopia Mobile Wallet",
    tag: "Popular",
    colorClass: "border-purple-600/30 bg-purple-500/5",
  },
  {
    id: "bank_transfer",
    name: "Direct Bank Transfer",
    subtitle: "CBE, Awash Bank, or Abyssinia Account Deposit",
    tag: "Direct Deposit",
    colorClass: "border-blue-600/30 bg-blue-500/5",
  },
];

// Bank accounts for direct transfer
const BANK_ACCOUNTS = [
  {
    bank: "Commercial Bank of Ethiopia (CBE)",
    accNo: "1000234891234",
    name: "AAU 4 Kilo Christian Students Fellowship",
    branch: "King George VI (4 Kilo) Branch",
  },
  {
    bank: "Awash International Bank",
    accNo: "01320491024000",
    name: "AAU 4 Kilo Christian Fellowship",
    branch: "Arat Kilo Branch",
  },
  {
    bank: "Telebirr Merchant Code",
    accNo: "982341",
    name: "4 Kilo Fellowship ECSF",
    branch: "Merchant Payment Paybill",
  },
];

// FAQ items
const FAQS = [
  {
    q: "How are my contributions audited and managed?",
    a: "100% of fellowship gifts are administered under the direct oversight of the AAU 4 Kilo Christian Students Fellowship Executive and Audit Committees. Detailed financial statements are presented quarterly to the student fellowship general assembly.",
  },
  {
    q: "How does the Needy Students Fund work?",
    a: "Our Welfare & Compassion Committee confidentially identifies students on campus facing severe financial distress. Funds provide cafeteria meal vouchers, sanitary supplies, and exam semester survival stipends with zero overhead.",
  },
  {
    q: "Can I give anonymously?",
    a: "Yes. Toggle the 'Give Anonymously' switch on the form. Your gift will be recorded in our audit books solely under a randomized reference code without your name.",
  },
  {
    q: "What should I do after completing a direct bank transfer?",
    a: "When you choose Direct Bank Transfer, your generated reference code should be included in your bank transfer note/reason. You can also send an SMS or Telegram confirmation of the bank slip to our Finance Coordinator.",
  },
  {
    q: "Is online giving through Telebirr / CBE Birr instant?",
    a: "Yes. Telebirr and CBE Birr process contributions instantly. You will receive an immediate SMS alert from Ethio Telecom or CBE confirming the transaction.",
  },
];

interface GivingReceipt {
  reference: string;
  receiptNumber: string;
  amount: number;
  currency: string;
  category: string;
  categoryTitle: string;
  paymentMethod: PaymentMethod;
  phoneNumber: string;
  giverName: string;
  isAnonymous: boolean;
  email: string | null;
  notes: string | null;
  timestamp: string;
  status: string;
  accountabilityNote: string;
}

export default function GivingsPage() {
  // Form State
  const [selectedCategory, setSelectedCategory] = useState<GivingCategory>("tithe");
  const [selectedPreset, setSelectedPreset] = useState<number | "custom">(250);
  const [customAmount, setCustomAmount] = useState<string>("");
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("telebirr");

  const [phoneNumber, setPhoneNumber] = useState<string>("");
  const [fullName, setFullName] = useState<string>("");
  const [email, setEmail] = useState<string>("");
  const [notes, setNotes] = useState<string>("");
  const [isAnonymous, setIsAnonymous] = useState<boolean>(false);

  // Submission & Receipt State
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [receipt, setReceipt] = useState<GivingReceipt | null>(null);
  const [checkoutUrl, setCheckoutUrl] = useState<string | null>(null);
  const [isReceiptOpen, setIsReceiptOpen] = useState(false);
  const [copiedBankAcc, setCopiedBankAcc] = useState<string | null>(null);
  const [copiedRef, setCopiedRef] = useState(false);

  // Active Amount Calculation
  const activeAmount: number =
    selectedPreset === "custom"
      ? parseFloat(customAmount) || 0
      : selectedPreset;

  const currentCategoryMeta =
    GIVING_CATEGORIES.find((c) => c.id === selectedCategory) || GIVING_CATEGORIES[0];

  // Handle Copy
  const handleCopy = (text: string, type: "ref" | "bank") => {
    navigator.clipboard.writeText(text);
    if (type === "ref") {
      setCopiedRef(true);
      toast.success("Reference code copied to clipboard!");
      setTimeout(() => setCopiedRef(false), 2000);
    } else {
      setCopiedBankAcc(text);
      toast.success("Account number copied!");
      setTimeout(() => setCopiedBankAcc(null), 2000);
    }
  };

  // Submit Handler
  const handleGiveNow = async (e: React.FormEvent) => {
    e.preventDefault();

    if (activeAmount < 1) {
      toast.error("Please enter a giving amount of at least 1 ETB.");
      return;
    }

    if (!phoneNumber || phoneNumber.trim().length < 9) {
      toast.error("Please enter a valid Ethiopian phone number (e.g. 0911223344).");
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch("/api/payments/initialize", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          amount: activeAmount,
          category: selectedCategory,
          categoryTitle: currentCategoryMeta.title,
          paymentMethod,
          phoneNumber: phoneNumber.trim(),
          fullName: isAnonymous ? "Anonymous" : fullName.trim() || undefined,
          email: email.trim() || undefined,
          notes: notes.trim() || undefined,
          isAnonymous,
        }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.message || "Failed to initialize giving transaction.");
      }

      setReceipt(data.receipt);
      setCheckoutUrl(data.checkoutUrl || null);
      setIsReceiptOpen(true);
      toast.success("Giving initialized! Official receipt generated.");
    } catch (err: any) {
      console.error("Giving error:", err);
      toast.error(err.message || "Could not process transaction. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground selection:bg-[#FF6719]/20 selection:text-[#FF6719]">
      {/* Top Banner / Quiet Chrome Navigation Header */}
      <section className="relative border-b border-border bg-gradient-to-b from-card to-background pt-12 pb-14 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-[#FF6719]/30 bg-[#FF6719]/10 text-xs font-medium text-[#FF6719]">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>AAU ECSF Financial Stewardship • 100% Accountable</span>
          </div>

          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight text-foreground">
            Fellowship Giving Portal
          </h1>

          <p className="text-base sm:text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            Support campus ministry, student cafeteria stipends, and gospel discipleship at Addis Ababa University 4 Kilo Campus.
          </p>

          <blockquote className="pt-2 text-xs sm:text-sm italic text-muted-foreground/90 border-l-2 border-[#FF6719] pl-3 inline-block text-left max-w-xl">
            &ldquo;Each of you should give what you have decided in your heart to give, not reluctantly or under compulsion, for God loves a cheerful giver.&rdquo;
            <span className="block not-italic font-semibold text-[#FF6719] text-xs mt-0.5">
              — 2 Corinthians 9:7
            </span>
          </blockquote>
        </div>
      </section>

      {/* Main Content Area */}
      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left Column: Interactive Giving Form */}
          <div className="lg:col-span-7 space-y-6">
            <div className="bg-card border border-border rounded-2xl shadow-sm p-6 sm:p-8 space-y-8">
              <form onSubmit={handleGiveNow} className="space-y-8">
                {/* 1. Category Selection */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <Label className="text-sm font-semibold tracking-wide uppercase text-muted-foreground">
                      1. Select Ministry Purpose
                    </Label>
                    <span className="text-xs text-muted-foreground">Required</span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {GIVING_CATEGORIES.map((cat) => {
                      const Icon = cat.icon;
                      const isSelected = selectedCategory === cat.id;

                      return (
                        <button
                          type="button"
                          key={cat.id}
                          onClick={() => setSelectedCategory(cat.id)}
                          className={`relative text-left p-4 rounded-xl border transition-all text-sm flex flex-col justify-between gap-2.5 ${
                            isSelected
                              ? "border-[#FF6719] bg-[#FF6719]/5 ring-1 ring-[#FF6719] text-foreground shadow-xs"
                              : "border-border hover:border-zinc-300 dark:hover:border-zinc-700 bg-background/50 text-muted-foreground hover:text-foreground"
                          }`}
                        >
                          <div className="flex items-start justify-between w-full">
                            <div className="flex items-center gap-2 font-medium text-foreground">
                              <span
                                className={`p-1.5 rounded-lg ${
                                  isSelected
                                    ? "bg-[#FF6719] text-white"
                                    : "bg-muted text-muted-foreground"
                                }`}
                              >
                                <Icon className="w-4 h-4" />
                              </span>
                              <span>{cat.title}</span>
                            </div>
                            <span
                              className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                                isSelected
                                  ? "bg-[#FF6719]/20 text-[#FF6719]"
                                  : "bg-muted text-muted-foreground"
                              }`}
                            >
                              {cat.badge}
                            </span>
                          </div>
                          <p className="text-xs text-muted-foreground leading-normal line-clamp-2">
                            {cat.description}
                          </p>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* 2. Amount Presets & Custom */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <Label className="text-sm font-semibold tracking-wide uppercase text-muted-foreground">
                      2. Choose Amount (ETB)
                    </Label>
                    {activeAmount > 0 && (
                      <span className="text-xs font-semibold text-[#FF6719]">
                        Selected: {activeAmount.toLocaleString()} ETB
                      </span>
                    )}
                  </div>

                  <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
                    {AMOUNT_PRESETS.map((amt) => {
                      const isSelected = selectedPreset === amt;
                      return (
                        <button
                          type="button"
                          key={amt}
                          onClick={() => {
                            setSelectedPreset(amt);
                            setCustomAmount("");
                          }}
                          className={`py-2.5 px-2 rounded-xl text-sm font-semibold border transition-all ${
                            isSelected
                              ? "border-[#FF6719] bg-[#FF6719] text-white shadow-xs"
                              : "border-border bg-background hover:bg-muted text-foreground"
                          }`}
                        >
                          {amt} <span className="text-xs font-normal">ETB</span>
                        </button>
                      );
                    })}
                    <button
                      type="button"
                      onClick={() => setSelectedPreset("custom")}
                      className={`py-2.5 px-2 rounded-xl text-sm font-semibold border transition-all ${
                        selectedPreset === "custom"
                          ? "border-[#FF6719] bg-[#FF6719] text-white shadow-xs"
                          : "border-border bg-background hover:bg-muted text-foreground"
                      }`}
                    >
                      Custom
                    </button>
                  </div>

                  {selectedPreset === "custom" && (
                    <div className="pt-2">
                      <div className="relative">
                        <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-sm font-semibold text-muted-foreground">
                          ETB
                        </span>
                        <Input
                          type="number"
                          min="1"
                          placeholder="Enter custom amount in Birr (e.g. 2000)"
                          value={customAmount}
                          onChange={(e) => setCustomAmount(e.target.value)}
                          className="pl-13 h-11 text-base font-medium border-border focus-visible:ring-[#FF6719]"
                          autoFocus
                        />
                      </div>
                    </div>
                  )}
                </div>

                {/* 3. Phone & Giver Details */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <Label className="text-sm font-semibold tracking-wide uppercase text-muted-foreground">
                      3. Giver Verification
                    </Label>
                    <label className="flex items-center gap-2 cursor-pointer text-xs font-medium text-muted-foreground hover:text-foreground">
                      <input
                        type="checkbox"
                        checked={isAnonymous}
                        onChange={(e) => setIsAnonymous(e.target.checked)}
                        className="rounded border-border text-[#FF6719] focus:ring-[#FF6719] w-3.5 h-3.5"
                      />
                      Give Anonymously
                    </label>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {/* Phone Number */}
                    <div className="space-y-1.5">
                      <Label htmlFor="phone" className="text-xs font-medium flex items-center gap-1.5">
                        <Phone className="w-3.5 h-3.5 text-muted-foreground" />
                        Ethiopian Phone Number <span className="text-red-500">*</span>
                      </Label>
                      <div className="relative">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-medium text-muted-foreground border-r border-border pr-2">
                          +251
                        </span>
                        <Input
                          id="phone"
                          type="tel"
                          placeholder="911 223 344"
                          value={phoneNumber}
                          onChange={(e) => setPhoneNumber(e.target.value)}
                          className="pl-16 h-10 text-sm"
                          required
                        />
                      </div>
                      <p className="text-[11px] text-muted-foreground">
                        Required for Telebirr / CBE payment confirmation.
                      </p>
                    </div>

                    {/* Full Name */}
                    <div className="space-y-1.5">
                      <Label htmlFor="fullName" className="text-xs font-medium flex items-center gap-1.5">
                        <User className="w-3.5 h-3.5 text-muted-foreground" />
                        Full Name {isAnonymous ? "(Hidden)" : "(Optional)"}
                      </Label>
                      <Input
                        id="fullName"
                        type="text"
                        placeholder={isAnonymous ? "Anonymous Member" : "e.g. Dawit Yohannes"}
                        value={isAnonymous ? "" : fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        disabled={isAnonymous}
                        className="h-10 text-sm"
                      />
                      <p className="text-[11px] text-muted-foreground">
                        {isAnonymous ? "Your identity is hidden." : "Used for fellowship records."}
                      </p>
                    </div>
                  </div>

                  {/* Email & Dedication Row */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <Label htmlFor="email" className="text-xs font-medium flex items-center gap-1.5">
                        <Mail className="w-3.5 h-3.5 text-muted-foreground" />
                        Email Address (Optional)
                      </Label>
                      <Input
                        id="email"
                        type="email"
                        placeholder="dawit@example.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="h-10 text-sm"
                      />
                      <p className="text-[11px] text-muted-foreground">
                        For an electronic tax & audit receipt copy.
                      </p>
                    </div>

                    <div className="space-y-1.5">
                      <Label htmlFor="notes" className="text-xs font-medium flex items-center gap-1.5">
                        <FileText className="w-3.5 h-3.5 text-muted-foreground" />
                        Prayer Request or Note (Optional)
                      </Label>
                      <Input
                        id="notes"
                        type="text"
                        placeholder="e.g. Pray for engineering exams"
                        value={notes}
                        onChange={(e) => setNotes(e.target.value)}
                        className="h-10 text-sm"
                      />
                      <p className="text-[11px] text-muted-foreground">
                        Shared with the student prayer team.
                      </p>
                    </div>
                  </div>
                </div>

                {/* 4. Payment Method Selection */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <Label className="text-sm font-semibold tracking-wide uppercase text-muted-foreground">
                      4. Payment Method
                    </Label>
                    <span className="text-xs text-muted-foreground">Select one</span>
                  </div>

                  <div className="space-y-2.5">
                    {PAYMENT_METHODS.map((pm) => {
                      const isSelected = paymentMethod === pm.id;
                      return (
                        <div
                          key={pm.id}
                          onClick={() => setPaymentMethod(pm.id)}
                          className={`p-3.5 rounded-xl border transition-all cursor-pointer flex items-center justify-between gap-3 ${
                            isSelected
                              ? "border-[#FF6719] bg-[#FF6719]/5 ring-1 ring-[#FF6719]"
                              : "border-border hover:border-zinc-300 dark:hover:border-zinc-700 bg-background/50"
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            <div
                              className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                                isSelected
                                  ? "border-[#FF6719] bg-[#FF6719]"
                                  : "border-muted-foreground/40"
                              }`}
                            >
                              {isSelected && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                            </div>
                            <div>
                              <div className="text-sm font-semibold text-foreground flex items-center gap-2">
                                <span>{pm.name}</span>
                                <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-muted text-muted-foreground">
                                  {pm.tag}
                                </span>
                              </div>
                              <p className="text-xs text-muted-foreground mt-0.5">
                                {pm.subtitle}
                              </p>
                            </div>
                          </div>

                          <div className="shrink-0 text-right">
                            {pm.id === "telebirr" && (
                              <span className="text-xs font-bold text-sky-600 bg-sky-50 dark:bg-sky-950/40 px-2 py-1 rounded">
                                Telebirr
                              </span>
                            )}
                            {pm.id === "cbe_birr" && (
                              <span className="text-xs font-bold text-purple-600 bg-purple-50 dark:bg-purple-950/40 px-2 py-1 rounded">
                                CBE Birr
                              </span>
                            )}
                            {pm.id === "bank_transfer" && (
                              <span className="text-xs font-bold text-amber-600 bg-amber-50 dark:bg-amber-950/40 px-2 py-1 rounded">
                                Bank Transfer
                              </span>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Direct Bank Transfer Instructions Callout (if active) */}
                {paymentMethod === "bank_transfer" && (
                  <div className="p-4 rounded-xl border border-blue-500/20 bg-blue-50/50 dark:bg-blue-950/20 space-y-3 text-xs">
                    <div className="flex items-center gap-2 font-semibold text-blue-700 dark:text-blue-300">
                      <Building2 className="w-4 h-4" />
                      <span>Official AAU 4 Kilo Fellowship Bank Accounts</span>
                    </div>
                    <div className="space-y-2">
                      {BANK_ACCOUNTS.map((acc, idx) => (
                        <div
                          key={idx}
                          className="flex items-center justify-between p-2 rounded-lg bg-background/80 border border-border"
                        >
                          <div>
                            <p className="font-semibold text-foreground">{acc.bank}</p>
                            <p className="font-mono text-muted-foreground select-all">
                              {acc.accNo}
                            </p>
                          </div>
                          <button
                            type="button"
                            onClick={() => handleCopy(acc.accNo, "bank")}
                            className="p-1.5 rounded-md hover:bg-muted text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1"
                            title="Copy Account Number"
                          >
                            {copiedBankAcc === acc.accNo ? (
                              <Check className="w-3.5 h-3.5 text-green-500" />
                            ) : (
                              <Copy className="w-3.5 h-3.5" />
                            )}
                            <span className="text-[10px]">Copy</span>
                          </button>
                        </div>
                      ))}
                    </div>
                    <p className="text-muted-foreground leading-normal">
                      Note: After initiating, you will receive a unique reference code to include in your bank transaction transfer description.
                    </p>
                  </div>
                )}

                {/* 5. Submit Button */}
                <div className="pt-2">
                  <Button
                    type="submit"
                    disabled={isSubmitting || activeAmount <= 0}
                    className="w-full h-12 text-base font-semibold bg-[#FF6719] hover:bg-[#FF6719]/90 text-white rounded-xl shadow-sm transition-all flex items-center justify-center gap-2"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>Initializing Giving Transaction...</span>
                      </>
                    ) : (
                      <>
                        <Lock className="w-4 h-4" />
                        <span>
                          Give {activeAmount > 0 ? `${activeAmount.toLocaleString()} ETB` : ""}{" "}
                          Now
                        </span>
                        <ArrowRight className="w-4 h-4" />
                      </>
                    )}
                  </Button>

                  <div className="flex items-center justify-center gap-2 mt-3 text-xs text-muted-foreground">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                    <span>256-bit SSL encrypted & student executive audit backed</span>
                  </div>
                </div>
              </form>
            </div>
          </div>

          {/* Right Column: Financial Integrity & Trust Statement */}
          <div className="lg:col-span-5 space-y-6">
            {/* Integrity Box */}
            <div className="bg-card border border-border rounded-2xl p-6 space-y-5 shadow-sm">
              <div className="flex items-center gap-3 border-b border-border pb-4">
                <div className="w-10 h-10 rounded-xl bg-[#FF6719]/10 text-[#FF6719] flex items-center justify-center shrink-0">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-foreground text-sm sm:text-base">
                    Fellowship Financial Integrity
                  </h3>
                  <p className="text-xs text-muted-foreground">
                    100% accountable to the student fellowship executive body
                  </p>
                </div>
              </div>

              <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                The 4 Kilo Christian Students Fellowship (AAU ECSF) is committed to absolute biblical transparency in handling all gifts, tithes, and offerings entrusted by students, alumni, and friends of the ministry.
              </p>

              {/* Fund Allocation Breakdown */}
              <div className="space-y-3 pt-1">
                <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Where Your Contribution Goes
                </div>

                <div className="space-y-2">
                  <div>
                    <div className="flex justify-between text-xs font-medium mb-1">
                      <span>Needy Students Cafeteria & Welfare</span>
                      <span className="font-semibold text-foreground">40%</span>
                    </div>
                    <div className="w-full h-1.5 rounded-full bg-muted overflow-hidden">
                      <div className="h-full bg-emerald-500 rounded-full" style={{ width: "40%" }} />
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between text-xs font-medium mb-1">
                      <span>Weekly Worship Gatherings & Sound Media</span>
                      <span className="font-semibold text-foreground">25%</span>
                    </div>
                    <div className="w-full h-1.5 rounded-full bg-muted overflow-hidden">
                      <div className="h-full bg-[#FF6719] rounded-full" style={{ width: "25%" }} />
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between text-xs font-medium mb-1">
                      <span>Campus Evangelism & High School Missions</span>
                      <span className="font-semibold text-foreground">20%</span>
                    </div>
                    <div className="w-full h-1.5 rounded-full bg-muted overflow-hidden">
                      <div className="h-full bg-blue-500 rounded-full" style={{ width: "20%" }} />
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between text-xs font-medium mb-1">
                      <span>Student Leadership & Spiritual Literature</span>
                      <span className="font-semibold text-foreground">15%</span>
                    </div>
                    <div className="w-full h-1.5 rounded-full bg-muted overflow-hidden">
                      <div className="h-full bg-purple-500 rounded-full" style={{ width: "15%" }} />
                    </div>
                  </div>
                </div>
              </div>

              {/* Accountability Pillars */}
              <div className="grid grid-cols-2 gap-3 pt-2 border-t border-border">
                <div className="p-3 rounded-xl bg-muted/40 border border-border/50 text-left">
                  <div className="font-semibold text-xs text-foreground">Quarterly Audits</div>
                  <div className="text-[11px] text-muted-foreground mt-0.5">
                    Internal committee reconciles every Birr.
                  </div>
                </div>
                <div className="p-3 rounded-xl bg-muted/40 border border-border/50 text-left">
                  <div className="font-semibold text-xs text-foreground">Open Reports</div>
                  <div className="text-[11px] text-muted-foreground mt-0.5">
                    Presented to the General Student Assembly.
                  </div>
                </div>
              </div>

              {/* Contact Finance */}
              <div className="pt-2 text-xs text-muted-foreground flex items-center justify-between">
                <span>Finance Committee Office:</span>
                <span className="font-medium text-foreground">Room 12, Student Union</span>
              </div>
            </div>

            {/* Quick Link to Fellowship Store */}
            <div className="p-5 rounded-2xl border border-border bg-gradient-to-br from-card to-muted/30 flex items-center justify-between gap-4 shadow-xs">
              <div className="space-y-1">
                <h4 className="text-sm font-semibold text-foreground">
                  Looking for Fellowship Gear?
                </h4>
                <p className="text-xs text-muted-foreground">
                  Browse our t-shirts, fellowship notebooks, and Christian literature.
                </p>
              </div>
              <Link href="/store">
                <Button variant="outline" size="sm" className="shrink-0 text-xs gap-1.5">
                  <span>Visit Store</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Button>
              </Link>
            </div>
          </div>
        </div>

        {/* FAQ Section */}
        <section className="mt-16 pt-12 border-t border-border max-w-4xl mx-auto space-y-6">
          <div className="text-center space-y-2">
            <h2 className="text-2xl font-bold tracking-tight text-foreground">
              Frequently Asked Questions
            </h2>
            <p className="text-sm text-muted-foreground">
              Common questions regarding fellowship giving, tax receipts, and payment methods.
            </p>
          </div>

          <div className="space-y-3 pt-4">
            {FAQS.map((faq, index) => (
              <details
                key={index}
                className="group border border-border rounded-xl bg-card p-4 transition-colors open:bg-card/80"
              >
                <summary className="font-semibold text-sm text-foreground cursor-pointer list-none flex items-center justify-between gap-2">
                  <span>{faq.q}</span>
                  <ChevronDown className="w-4 h-4 text-muted-foreground transition-transform duration-200 group-open:rotate-180" />
                </summary>
                <p className="text-xs sm:text-sm text-muted-foreground mt-3 leading-relaxed border-t border-border/50 pt-2.5">
                  {faq.a}
                </p>
              </details>
            ))}
          </div>
        </section>
      </main>

      {/* Official Receipt Feedback Modal */}
      <Dialog open={isReceiptOpen} onOpenChange={setIsReceiptOpen}>
        <DialogContent className="sm:max-w-md bg-card border-border p-6 rounded-2xl">
          <DialogHeader className="text-center space-y-2">
            <div className="w-12 h-12 rounded-full bg-emerald-500/10 text-emerald-600 mx-auto flex items-center justify-center">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <DialogTitle className="text-xl font-bold text-foreground">
              Giving Transaction Initialized
            </DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground">
              Thank you for your cheerful heart and stewardship for the 4 Kilo Fellowship.
            </DialogDescription>
          </DialogHeader>

          {receipt && (
            <div className="space-y-4 pt-2">
              {/* Receipt Card */}
              <div className="p-4 rounded-xl border border-dashed border-border bg-muted/30 space-y-3">
                <div className="flex items-center justify-between border-b border-border/70 pb-2.5">
                  <span className="text-xs text-muted-foreground">Reference Code</span>
                  <div className="flex items-center gap-1.5">
                    <span className="font-mono text-xs font-bold text-[#FF6719] bg-[#FF6719]/10 px-2 py-0.5 rounded">
                      {receipt.reference}
                    </span>
                    <button
                      type="button"
                      onClick={() => handleCopy(receipt.reference, "ref")}
                      className="p-1 rounded hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
                      title="Copy Reference"
                    >
                      {copiedRef ? (
                        <Check className="w-3.5 h-3.5 text-emerald-600" />
                      ) : (
                        <Copy className="w-3.5 h-3.5" />
                      )}
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div>
                    <span className="text-muted-foreground block text-[11px]">Amount</span>
                    <span className="font-bold text-foreground text-sm">
                      {receipt.amount.toLocaleString()} {receipt.currency}
                    </span>
                  </div>
                  <div>
                    <span className="text-muted-foreground block text-[11px]">Purpose</span>
                    <span className="font-medium text-foreground">
                      {receipt.categoryTitle}
                    </span>
                  </div>
                  <div>
                    <span className="text-muted-foreground block text-[11px]">Giver</span>
                    <span className="font-medium text-foreground">
                      {receipt.giverName}
                    </span>
                  </div>
                  <div>
                    <span className="text-muted-foreground block text-[11px]">Payment Channel</span>
                    <span className="font-semibold text-foreground uppercase">
                      {receipt.paymentMethod.replace("_", " ")}
                    </span>
                  </div>
                </div>

                <div className="border-t border-border/70 pt-2 text-[11px] text-muted-foreground flex justify-between">
                  <span>Timestamp</span>
                  <span>{new Date(receipt.timestamp).toLocaleString("en-US", { dateStyle: "medium", timeStyle: "short" })}</span>
                </div>
              </div>

              {/* Action based on payment method */}
              {receipt.paymentMethod === "bank_transfer" ? (
                <div className="p-3.5 rounded-xl border border-amber-500/20 bg-amber-500/5 text-xs space-y-2">
                  <div className="font-semibold text-amber-700 dark:text-amber-400 flex items-center gap-1.5">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    <span>Next Step: Bank Deposit Transfer</span>
                  </div>
                  <p className="text-muted-foreground leading-normal">
                    Please transfer <span className="font-bold text-foreground">{receipt.amount.toLocaleString()} ETB</span> to CBE Account <span className="font-mono font-bold text-foreground">1000234891234</span>. Put reference code <span className="font-mono font-bold text-[#FF6719]">{receipt.reference}</span> in the reason note.
                  </p>
                </div>
              ) : checkoutUrl ? (
                <div className="pt-2">
                  <a
                    href={checkoutUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full"
                  >
                    <Button className="w-full bg-[#FF6719] hover:bg-[#FF6719]/90 text-white rounded-xl gap-2 text-sm font-semibold">
                      <span>Open Payment Gateway</span>
                      <ExternalLink className="w-4 h-4" />
                    </Button>
                  </a>
                </div>
              ) : (
                <div className="p-3.5 rounded-xl border border-emerald-500/20 bg-emerald-500/5 text-xs space-y-1.5 text-center">
                  <p className="font-semibold text-emerald-700 dark:text-emerald-400">
                    Payment Notification Prompt Sent
                  </p>
                  <p className="text-muted-foreground">
                    Check your mobile phone ({receipt.phoneNumber}) for the USSD or Telebirr SuperApp confirmation prompt to finalize.
                  </p>
                </div>
              )}

              {/* Close Button */}
              <div className="pt-2 flex gap-2">
                <Button
                  variant="outline"
                  onClick={() => setIsReceiptOpen(false)}
                  className="w-full rounded-xl text-xs"
                >
                  Close Receipt
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
