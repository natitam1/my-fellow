"use client";

import React, { useState, Suspense } from "react";
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
  Lock,
  Loader2,
  ChevronDown,
  Sparkles,
  ArrowRight,
  AlertCircle,
  Compass,
  Radio,
  CreditCard,
  Wallet,
  Download,
  Share2,
} from "lucide-react";
import { toast } from "sonner";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

// ─── CAMPAIGN DEFINITIONS ─────────────────────────────────────────────
export type GivingCampaign =
  | "campus_ministry"
  | "freshmen_welcome"
  | "charity_fund"
  | "media_equipment";

interface CampaignMeta {
  id: GivingCampaign;
  title: string;
  badge: string;
  description: string;
  impact: string;
  icon: React.ElementType;
}

const GIVING_CAMPAIGNS: CampaignMeta[] = [
  {
    id: "campus_ministry",
    title: "Campus Ministry",
    badge: "Core Fellowship",
    description:
      "Sustaining weekly Friday congregational worship, dormitory Bible study groups, spiritual discipleship, and prayer vigils across AAU faculties.",
    impact: "Funds worship hall logistics, Bibles, and discipleship materials.",
    icon: Sparkles,
  },
  {
    id: "freshmen_welcome",
    title: "Freshmen Welcome",
    badge: "New Students",
    description:
      "Welcoming 1st-year students arriving at AAU 4 Kilo: dorm arrival welcome care packs, campus orientation dinners, and senior fellowship mentors.",
    impact: "Helps first-year students transition with a loving Christian community.",
    icon: Compass,
  },
  {
    id: "charity_fund",
    title: "Charity Fund",
    badge: "Student Welfare",
    description:
      "Confidential daily cafeteria meal vouchers, urgent medical prescriptions, emergency campus survival stipends, and essential living supplies.",
    impact: "100% directly supports vulnerable students with zero administrative overhead.",
    icon: HandHeart,
  },
  {
    id: "media_equipment",
    title: "Media Equipment",
    badge: "Audio & Visual",
    description:
      "Upgrading auditorium digital sound mixers, acoustic stage monitors, wireless vocal microphones, and HD camera livestreaming systems.",
    impact: "Enables clear sound in worship gatherings and outreach broadcasts.",
    icon: Radio,
  },
];

// Amount preset buttons in ETB (100, 250, 500, 1000 ETB, custom)
const AMOUNT_PRESETS = [100, 250, 500, 1000];

// ─── PAYMENT METHODS ──────────────────────────────────────────────────
export type PaymentMethod = "chapa" | "telebirr" | "cbe_birr" | "bank_transfer";

interface PaymentMethodMeta {
  id: PaymentMethod;
  name: string;
  subtitle: string;
  tag: string;
  badgeColor: string;
  icon: React.ElementType;
}

const PAYMENT_METHODS: PaymentMethodMeta[] = [
  {
    id: "chapa",
    name: "Chapa (Instant Online Payment)",
    subtitle: "Ethiopian Debit Cards (CBE, Awash, Dashen, Hibret), Telebirr, CBE Birr & Mobile Banking",
    tag: "Recommended",
    badgeColor: "bg-primary/10 text-primary border-primary/30",
    icon: CreditCard,
  },
  {
    id: "telebirr",
    name: "Direct Telebirr",
    subtitle: "Instant payment via Ethio Telecom SuperApp QR code or USSD prompt (*127#)",
    tag: "Instant",
    badgeColor: "bg-sky-500/10 text-sky-600 border-sky-500/30",
    icon: Wallet,
  },
  {
    id: "cbe_birr",
    name: "Direct CBE Birr",
    subtitle: "Commercial Bank of Ethiopia Mobile Banking Wallet push payment",
    tag: "Popular",
    badgeColor: "bg-purple-500/10 text-purple-600 border-purple-500/30",
    icon: Building2,
  },
  {
    id: "bank_transfer",
    name: "Direct Bank Transfer",
    subtitle: "Deposit directly into official CBE, Awash Bank, or Abyssinia Fellowship Accounts",
    tag: "Direct Deposit",
    badgeColor: "bg-amber-500/10 text-amber-600 border-amber-500/30",
    icon: Building2,
  },
];

// Bank accounts for direct transfer
const BANK_ACCOUNTS = [
  {
    bank: "Commercial Bank of Ethiopia (CBE)",
    accNo: "1000 2348 91234",
    name: "AAU 4 Kilo Christian Students Fellowship",
    branch: "King George VI (4 Kilo) Branch",
  },
  {
    bank: "Awash International Bank",
    accNo: "0132 0491 0240 00",
    name: "AAU 4 Kilo Christian Fellowship",
    branch: "Arat Kilo Branch",
  },
  {
    bank: "Bank of Abyssinia",
    accNo: "1482 9012 3450 01",
    name: "AAU 4 Kilo Christian Students Fellowship",
    branch: "Menelik II Branch",
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
    q: "How does Chapa payment work for fellowship donations?",
    a: "Chapa is Ethiopia's premier certified payment gateway. It allows you to give securely using any Ethiopian bank ATM/Debit card (Commercial Bank of Ethiopia, Awash, Dashen, Bank of Abyssinia, etc.), Telebirr, or CBE Birr. Transactions are encrypted with 256-bit bank-grade security and processed instantly.",
  },
  {
    q: "How are student fellowship gifts audited and administered?",
    a: "100% of contributions are managed under direct oversight of the AAU 4 Kilo Christian Students Fellowship Executive and Audit Committees. Reconciled financial statements are presented quarterly to the student fellowship general assembly.",
  },
  {
    q: "How does the Charity & Needy Students Fund operate?",
    a: "Our Welfare & Compassion Committee confidentially identifies campus students undergoing extreme financial distress. The fund provides direct daily cafeteria meal tickets, emergency medications, and exam semester living stipends with zero administrative fee deduction.",
  },
  {
    q: "Can I give anonymously?",
    a: "Yes. Simply toggle the 'Give Anonymously' option in the form. Your contribution will be recorded in our accounting records solely under an encrypted transaction reference code without displaying your name.",
  },
  {
    q: "What should I do after completing a Direct Bank Transfer?",
    a: "When you choose Direct Bank Transfer, your generated reference code should be included in your bank transfer note/reason. You can also share the digital transaction slip with our student finance committee.",
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

function GivingsContent() {
  const searchParams = useSearchParams();
  const paymentSuccess = searchParams.get("payment") === "success";
  const successTxRef = searchParams.get("tx_ref") || searchParams.get("reference");
  const successAmount = searchParams.get("amount");

  // Form State
  const [selectedCampaign, setSelectedCampaign] = useState<GivingCampaign>("campus_ministry");
  const [selectedPreset, setSelectedPreset] = useState<number | "custom">(250);
  const [customAmount, setCustomAmount] = useState<string>("");
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("chapa");

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

  const currentCampaignMeta =
    GIVING_CAMPAIGNS.find((c) => c.id === selectedCampaign) || GIVING_CAMPAIGNS[0];

  // Handle Copy helper
  const handleCopy = (text: string, type: "ref" | "bank") => {
    if (navigator?.clipboard) {
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
      toast.error("Please enter a valid Ethiopian phone number (e.g. 0911223344 or 0712345678).");
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
          category: selectedCampaign,
          categoryTitle: currentCampaignMeta.title,
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
    } catch (err: unknown) {
      const errorMsg = err instanceof Error ? err.message : "Could not process transaction. Please try again.";
      console.error("Giving error:", err);
      toast.error(errorMsg);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* ─── PAYMENT SUCCESS BANNER IF REDIRECTED FROM CHAPA ─── */}
      {paymentSuccess && (
        <div className="bg-emerald-500/10 border-b border-emerald-500/20 py-3 px-4">
          <div className="max-w-6xl mx-auto flex items-center justify-between gap-3 text-xs sm:text-sm text-emerald-800 dark:text-emerald-300">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>
                Payment received successfully via Chapa! Ref:{" "}
                <span className="font-mono font-semibold">{successTxRef}</span>{" "}
                {successAmount && `(${successAmount} ETB)`}
              </span>
            </div>
            <span className="font-medium">Thank you for your generosity!</span>
          </div>
        </div>
      )}

      {/* ─── TOP HERO & STEWARDSHIP HEADER ─── */}
      <section className="relative border-b border-border/80 bg-gradient-to-b from-card via-card/80 to-background pt-12 pb-14 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center space-y-4">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full border border-primary/30 bg-primary/10 text-xs font-semibold text-primary shadow-xs">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>AAU ECSF Financial Stewardship • 100% Accountable</span>
          </div>

          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight text-foreground">
            Fellowship Giving Portal
          </h1>

          <p className="text-sm sm:text-base text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            Support university discipleship, cafeteria meal stipends for needy students,
            and campus revival at Addis Ababa University 4 Kilo. Powered by Chapa.
          </p>

          <blockquote className="pt-2 text-xs sm:text-sm italic text-muted-foreground/90 border-l-2 border-primary pl-3.5 inline-block text-left max-w-xl">
            &ldquo;Each of you should give what you have decided in your heart to give,
            not reluctantly or under compulsion, for God loves a cheerful giver.&rdquo;
            <span className="block not-italic font-semibold text-primary text-xs mt-0.5">
              — 2 Corinthians 9:7
            </span>
          </blockquote>
        </div>
      </section>

      {/* ─── MAIN GIVING INTERFACE ─── */}
      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left Column: Interactive Giving Form */}
          <div className="lg:col-span-7 space-y-6">
            <div className="bg-card border border-border/80 rounded-3xl shadow-sm p-6 sm:p-8 space-y-8">
              <form onSubmit={handleGiveNow} className="space-y-8">
                {/* 1. Campaign Selection */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <Label className="text-xs font-bold tracking-wider uppercase text-muted-foreground flex items-center gap-1.5">
                      <span>1. Select Ministry Campaign</span>
                    </Label>
                    <span className="text-[11px] text-primary font-medium">Required</span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {GIVING_CAMPAIGNS.map((camp) => {
                      const Icon = camp.icon;
                      const isSelected = selectedCampaign === camp.id;

                      return (
                        <button
                          type="button"
                          key={camp.id}
                          onClick={() => setSelectedCampaign(camp.id)}
                          className={`relative text-left p-4 rounded-2xl border transition-all text-sm flex flex-col justify-between gap-2.5 cursor-pointer ${
                            isSelected
                              ? "border-primary bg-primary/[0.05] ring-2 ring-primary/40 text-foreground shadow-xs"
                              : "border-border hover:border-primary/40 bg-background/60 text-muted-foreground hover:text-foreground"
                          }`}
                        >
                          <div className="flex items-start justify-between w-full">
                            <div className="flex items-center gap-2.5 font-bold text-foreground">
                              <span
                                className={`p-2 rounded-xl transition-colors ${
                                  isSelected
                                    ? "bg-primary text-primary-foreground shadow-xs"
                                    : "bg-muted text-muted-foreground"
                                }`}
                              >
                                <Icon className="w-4 h-4" />
                              </span>
                              <span className="text-sm font-semibold">{camp.title}</span>
                            </div>
                            <Badge
                              variant="outline"
                              className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                                isSelected
                                  ? "bg-primary/15 text-primary border-primary/30"
                                  : "bg-muted text-muted-foreground border-border"
                              }`}
                            >
                              {camp.badge}
                            </Badge>
                          </div>
                          <p className="text-xs text-muted-foreground leading-relaxed line-clamp-2">
                            {camp.description}
                          </p>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* 2. Amount Presets & Custom */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <Label className="text-xs font-bold tracking-wider uppercase text-muted-foreground">
                      2. Choose Amount (ETB)
                    </Label>
                    {activeAmount > 0 && (
                      <span className="text-xs font-bold text-primary">
                        Gift: {activeAmount.toLocaleString()} ETB
                      </span>
                    )}
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5">
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
                          className={`py-3 px-3 rounded-full text-sm font-bold border transition-all cursor-pointer ${
                            isSelected
                              ? "border-primary bg-primary text-primary-foreground shadow-sm scale-[1.02]"
                              : "border-border bg-background hover:bg-muted text-foreground"
                          }`}
                        >
                          {amt} <span className="text-xs font-normal opacity-90">ETB</span>
                        </button>
                      );
                    })}
                    <button
                      type="button"
                      onClick={() => setSelectedPreset("custom")}
                      className={`py-3 px-3 rounded-full text-sm font-bold border transition-all cursor-pointer ${
                        selectedPreset === "custom"
                          ? "border-primary bg-primary text-primary-foreground shadow-sm scale-[1.02]"
                          : "border-border bg-background hover:bg-muted text-foreground"
                      }`}
                    >
                      Custom
                    </button>
                  </div>

                  {selectedPreset === "custom" && (
                    <div className="pt-2">
                      <div className="relative">
                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-xs font-bold text-muted-foreground border-r border-border pr-2.5">
                          ETB
                        </span>
                        <Input
                          type="number"
                          min="1"
                          placeholder="Enter custom amount in Birr (e.g. 1500)"
                          value={customAmount}
                          onChange={(e) => setCustomAmount(e.target.value)}
                          className="pl-16 h-11 text-base font-medium rounded-xl border-border focus-visible:ring-primary"
                          autoFocus
                        />
                      </div>
                      <p className="text-[11px] text-muted-foreground mt-1.5">
                        Suggested: 150 ETB covers one week of student cafeteria lunches; 500 ETB provides semester stationery and literature.
                      </p>
                    </div>
                  )}
                </div>

                {/* 3. Giver Contact & Verification */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <Label className="text-xs font-bold tracking-wider uppercase text-muted-foreground">
                      3. Giver Information
                    </Label>
                    <label className="flex items-center gap-2 cursor-pointer text-xs font-medium text-muted-foreground hover:text-foreground">
                      <input
                        type="checkbox"
                        checked={isAnonymous}
                        onChange={(e) => setIsAnonymous(e.target.checked)}
                        className="rounded border-border text-primary focus:ring-primary w-3.5 h-3.5"
                      />
                      <span>Give Anonymously</span>
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
                        <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-xs font-semibold text-muted-foreground border-r border-border pr-2">
                          +251
                        </span>
                        <Input
                          id="phone"
                          type="tel"
                          placeholder="911 223 344"
                          value={phoneNumber}
                          onChange={(e) => setPhoneNumber(e.target.value)}
                          className="pl-16 h-10 text-sm rounded-xl"
                          required
                        />
                      </div>
                      <p className="text-[11px] text-muted-foreground">
                        For SMS transaction verification & payment receipt.
                      </p>
                    </div>

                    {/* Full Name */}
                    <div className="space-y-1.5">
                      <Label htmlFor="fullName" className="text-xs font-medium flex items-center gap-1.5">
                        <User className="w-3.5 h-3.5 text-muted-foreground" />
                        Full Name {isAnonymous ? "(Anonymous)" : "(Optional)"}
                      </Label>
                      <Input
                        id="fullName"
                        type="text"
                        placeholder={isAnonymous ? "Anonymous Member" : "e.g. Yohannes Bekele"}
                        value={isAnonymous ? "" : fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        disabled={isAnonymous}
                        className="h-10 text-sm rounded-xl"
                      />
                      <p className="text-[11px] text-muted-foreground">
                        {isAnonymous ? "Your identity is hidden." : "Used for official fellowship audit records."}
                      </p>
                    </div>
                  </div>

                  {/* Email & Dedication Note */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <Label htmlFor="email" className="text-xs font-medium flex items-center gap-1.5">
                        <Mail className="w-3.5 h-3.5 text-muted-foreground" />
                        Email Address (Optional)
                      </Label>
                      <Input
                        id="email"
                        type="email"
                        placeholder="student@aau.edu.et"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="h-10 text-sm rounded-xl"
                      />
                      <p className="text-[11px] text-muted-foreground">
                        For an electronic PDF donation receipt.
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
                        placeholder="e.g. Pray for engineering finalists"
                        value={notes}
                        onChange={(e) => setNotes(e.target.value)}
                        className="h-10 text-sm rounded-xl"
                      />
                      <p className="text-[11px] text-muted-foreground">
                        Shared confidentially with the intercession ministry.
                      </p>
                    </div>
                  </div>
                </div>

                {/* 4. Payment Method Selection (Supporting Chapa) */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <Label className="text-xs font-bold tracking-wider uppercase text-muted-foreground">
                      4. Payment Gateway & Method
                    </Label>
                    <span className="text-[11px] text-muted-foreground">Supporting Chapa</span>
                  </div>

                  <div role="radiogroup" aria-label="Payment Method" className="space-y-2.5">
                    {PAYMENT_METHODS.map((pm) => {
                      const isSelected = paymentMethod === pm.id;
                      const Icon = pm.icon;

                      return (
                        <button
                          type="button"
                          role="radio"
                          aria-checked={isSelected}
                          key={pm.id}
                          onClick={() => setPaymentMethod(pm.id)}
                          className={`w-full text-left p-4 rounded-2xl border transition-all cursor-pointer flex items-center justify-between gap-3 ${
                            isSelected
                              ? "border-primary bg-primary/[0.05] ring-2 ring-primary/40 shadow-xs"
                              : "border-border hover:border-primary/40 bg-background/60"
                          }`}
                        >
                          <div className="flex items-start gap-3">
                            <div
                              className={`w-5 h-5 rounded-full border mt-0.5 flex items-center justify-center shrink-0 ${
                                isSelected
                                  ? "border-primary bg-primary text-primary-foreground"
                                  : "border-muted-foreground/40"
                              }`}
                            >
                              {isSelected && <div className="w-2 h-2 rounded-full bg-white" />}
                            </div>

                            <div className="space-y-0.5">
                              <div className="text-sm font-bold text-foreground flex items-center gap-2">
                                <span>{pm.name}</span>
                                <Badge
                                  variant="outline"
                                  className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${pm.badgeColor}`}
                                >
                                  {pm.tag}
                                </Badge>
                              </div>
                              <p className="text-xs text-muted-foreground leading-relaxed">
                                {pm.subtitle}
                              </p>
                            </div>
                          </div>

                          <div className="shrink-0 hidden sm:flex items-center justify-center w-8 h-8 rounded-lg bg-muted text-muted-foreground">
                            <Icon className="w-4 h-4 text-primary" />
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Direct Bank Accounts Callout (if active) */}
                {paymentMethod === "bank_transfer" && (
                  <div className="p-4 rounded-2xl border border-primary/20 bg-primary/[0.03] space-y-3 text-xs">
                    <div className="flex items-center gap-2 font-bold text-foreground">
                      <Building2 className="w-4 h-4 text-primary" />
                      <span>Official AAU 4 Kilo Fellowship Bank Accounts</span>
                    </div>
                    <div className="space-y-2">
                      {BANK_ACCOUNTS.map((acc, idx) => (
                        <div
                          key={idx}
                          className="flex items-center justify-between p-2.5 rounded-xl bg-card border border-border"
                        >
                          <div>
                            <p className="font-semibold text-foreground text-xs">{acc.bank}</p>
                            <p className="font-mono text-muted-foreground text-[11px] select-all">
                              {acc.accNo}
                            </p>
                          </div>
                          <button
                            type="button"
                            onClick={() => handleCopy(acc.accNo, "bank")}
                            className="p-1.5 rounded-lg hover:bg-muted text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1"
                            title="Copy Account Number"
                          >
                            {copiedBankAcc === acc.accNo ? (
                              <Check className="w-3.5 h-3.5 text-green-600" />
                            ) : (
                              <Copy className="w-3.5 h-3.5" />
                            )}
                            <span className="text-[10px]">Copy</span>
                          </button>
                        </div>
                      ))}
                    </div>
                    <p className="text-[11px] text-muted-foreground">
                      Note: You will receive a unique transaction reference code to put into your bank deposit slip description.
                    </p>
                  </div>
                )}

                {/* 5. Submit Button */}
                <div className="pt-2 space-y-3">
                  <Button
                    type="submit"
                    disabled={isSubmitting || activeAmount <= 0}
                    className="w-full h-12 text-sm sm:text-base font-bold bg-primary hover:bg-primary/90 text-primary-foreground rounded-full shadow-md transition-all flex items-center justify-center gap-2 hover:scale-[1.01]"
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
                          Proceed to Give {activeAmount > 0 ? `${activeAmount.toLocaleString()} ETB` : ""}
                        </span>
                        <ArrowRight className="w-4 h-4" />
                      </>
                    )}
                  </Button>

                  <div className="flex items-center justify-center gap-2 text-[11px] text-muted-foreground">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Chapa PCI-DSS Level 1 Encrypted • 100% Student Committee Audited</span>
                  </div>
                </div>
              </form>
            </div>
          </div>

          {/* Right Column: Giving Summary & Financial Stewardship Statement */}
          <div className="lg:col-span-5 space-y-6">
            {/* Real-time Giving Summary Card */}
            <div className="bg-card border border-border/80 rounded-3xl p-6 space-y-4 shadow-sm">
              <h3 className="text-sm font-bold uppercase tracking-wider text-foreground border-b border-border/60 pb-3">
                Giving Overview
              </h3>

              <div className="space-y-3 text-xs">
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Selected Campaign</span>
                  <span className="font-semibold text-foreground">
                    {currentCampaignMeta.title}
                  </span>
                </div>

                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Impact Focus</span>
                  <Badge variant="outline" className="text-[10px] text-primary border-primary/30">
                    {currentCampaignMeta.badge}
                  </Badge>
                </div>

                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Payment Gateway</span>
                  <span className="font-semibold text-foreground uppercase">
                    {paymentMethod.replace("_", " ")}
                  </span>
                </div>

                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Processing Fee</span>
                  <span className="font-semibold text-emerald-600">0.00 ETB (Free)</span>
                </div>

                <div className="border-t border-border/70 pt-3 flex justify-between items-baseline">
                  <span className="text-sm font-bold text-foreground">Total Gift</span>
                  <span className="text-xl font-extrabold text-primary">
                    {activeAmount.toLocaleString()} <span className="text-xs font-normal">ETB</span>
                  </span>
                </div>
              </div>

              <div className="p-3 rounded-2xl bg-primary/[0.04] border border-primary/20 text-[11px] text-muted-foreground leading-relaxed">
                {currentCampaignMeta.impact}
              </div>
            </div>

            {/* Financial Integrity & Audit Card */}
            <div className="bg-card border border-border/80 rounded-3xl p-6 space-y-5 shadow-sm">
              <div className="flex items-center gap-3 border-b border-border/60 pb-4">
                <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
                  <ShieldCheck className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <h3 className="font-bold text-foreground text-sm sm:text-base">
                    Fellowship Financial Integrity
                  </h3>
                  <p className="text-xs text-muted-foreground">
                    100% accountable to AAU 4 Kilo Fellowship Executive
                  </p>
                </div>
              </div>

              <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                The 4 Kilo Christian Students Fellowship (AAU ECSF) is committed to absolute biblical transparency in handling all gifts, tithes, and offerings entrusted by students, alumni, and partners.
              </p>

              {/* Fund Allocation Breakdown */}
              <div className="space-y-3 pt-1">
                <div className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                  Where Your Contribution Goes
                </div>

                <div className="space-y-2 text-xs">
                  <div>
                    <div className="flex justify-between font-medium mb-1">
                      <span>Needy Students Cafeteria & Welfare</span>
                      <span className="font-bold text-foreground">40%</span>
                    </div>
                    <div className="w-full h-1.5 rounded-full bg-muted overflow-hidden">
                      <div className="h-full bg-emerald-500 rounded-full" style={{ width: "40%" }} />
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between font-medium mb-1">
                      <span>Weekly Congregational Worship & Sound Media</span>
                      <span className="font-bold text-foreground">25%</span>
                    </div>
                    <div className="w-full h-1.5 rounded-full bg-muted overflow-hidden">
                      <div className="h-full bg-primary rounded-full" style={{ width: "25%" }} />
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between font-medium mb-1">
                      <span>Campus Evangelism & Freshmen Welcome</span>
                      <span className="font-bold text-foreground">20%</span>
                    </div>
                    <div className="w-full h-1.5 rounded-full bg-muted overflow-hidden">
                      <div className="h-full bg-blue-500 rounded-full" style={{ width: "20%" }} />
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between font-medium mb-1">
                      <span>Discipleship & Student Literature</span>
                      <span className="font-bold text-foreground">15%</span>
                    </div>
                    <div className="w-full h-1.5 rounded-full bg-muted overflow-hidden">
                      <div className="h-full bg-purple-500 rounded-full" style={{ width: "15%" }} />
                    </div>
                  </div>
                </div>
              </div>

              {/* Accountability Badges */}
              <div className="grid grid-cols-2 gap-3 pt-2 border-t border-border/60">
                <div className="p-3 rounded-2xl bg-muted/40 border border-border/50 text-left">
                  <div className="font-bold text-xs text-foreground">Quarterly Audits</div>
                  <div className="text-[11px] text-muted-foreground mt-0.5">
                    Internal committee reconciles every Birr.
                  </div>
                </div>
                <div className="p-3 rounded-2xl bg-muted/40 border border-border/50 text-left">
                  <div className="font-bold text-xs text-foreground">Open Reports</div>
                  <div className="text-[11px] text-muted-foreground mt-0.5">
                    Presented to General Fellowship Assembly.
                  </div>
                </div>
              </div>

              {/* Office Location */}
              <div className="pt-2 text-xs text-muted-foreground flex items-center justify-between">
                <span>Finance Committee:</span>
                <span className="font-semibold text-foreground">Room 12, Student Union (4 Kilo)</span>
              </div>
            </div>

            {/* Quick Link to Fellowship Store */}
            <div className="p-5 rounded-3xl border border-border/80 bg-gradient-to-br from-card to-muted/30 flex items-center justify-between gap-4 shadow-xs">
              <div className="space-y-1">
                <h4 className="text-sm font-bold text-foreground">
                  Looking for Fellowship Gear?
                </h4>
                <p className="text-xs text-muted-foreground">
                  Browse fellowship hoodies, journal notebooks, and Amharic study Bibles.
                </p>
              </div>
              <Button asChild variant="outline" size="sm" className="rounded-full shrink-0 text-xs gap-1.5">
                <Link href="/store">
                  <span>Visit Store</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </Button>
            </div>
          </div>
        </div>

        {/* ─── FREQUENTLY ASKED QUESTIONS ─── */}
        <section className="mt-16 pt-12 border-t border-border/80 max-w-4xl mx-auto space-y-6">
          <div className="text-center space-y-2">
            <h2 className="text-2xl font-bold tracking-tight text-foreground">
              Frequently Asked Questions
            </h2>
            <p className="text-xs sm:text-sm text-muted-foreground">
              Answers regarding Chapa online payments, donor anonymity, and fellowship financial accountability.
            </p>
          </div>

          <div className="space-y-3 pt-4">
            {FAQS.map((faq, index) => (
              <details
                key={index}
                className="group border border-border/80 rounded-2xl bg-card p-4 transition-colors open:bg-card/90 shadow-xs"
              >
                <summary className="font-semibold text-xs sm:text-sm text-foreground cursor-pointer list-none flex items-center justify-between gap-2">
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

      {/* ─── OFFICIAL GIVING RECEIPT & CHAPA CHECKOUT MODAL ─── */}
      <Dialog open={isReceiptOpen} onOpenChange={setIsReceiptOpen}>
        <DialogContent className="sm:max-w-md bg-card border-border p-6 rounded-3xl">
          <DialogHeader className="text-center space-y-2">
            <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 text-emerald-600 mx-auto flex items-center justify-center">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <DialogTitle className="text-xl font-bold text-foreground">
              Giving Transaction Initialized
            </DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground">
              Thank you for your generous heart and financial stewardship for the 4 Kilo Fellowship.
            </DialogDescription>
          </DialogHeader>

          {receipt && (
            <div className="space-y-4 pt-2">
              {/* Receipt Summary Card */}
              <div className="p-4 rounded-2xl border border-dashed border-border bg-muted/30 space-y-3">
                <div className="flex items-center justify-between border-b border-border/70 pb-2.5">
                  <span className="text-xs text-muted-foreground">Reference Code</span>
                  <div className="flex items-center gap-1.5">
                    <span className="font-mono text-xs font-bold text-primary bg-primary/10 px-2 py-0.5 rounded">
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
                    <span className="text-muted-foreground block text-[11px]">Campaign</span>
                    <span className="font-semibold text-foreground">
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
                    <span className="text-muted-foreground block text-[11px]">Payment Gateway</span>
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
              {receipt.paymentMethod === "chapa" ? (
                <div className="space-y-3 pt-1">
                  <div className="p-3 rounded-2xl border border-primary/25 bg-primary/[0.04] text-xs space-y-1">
                    <p className="font-semibold text-foreground">
                      Ready for Chapa Payment
                    </p>
                    <p className="text-muted-foreground">
                      Click below to finalize with your ATM Card, Telebirr, or CBE Birr.
                    </p>
                  </div>

                  <a
                    href={checkoutUrl || "#"}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block w-full"
                  >
                    <Button className="w-full h-11 bg-primary hover:bg-primary/90 text-primary-foreground rounded-full gap-2 text-sm font-bold shadow-md">
                      <span>Pay with Chapa</span>
                      <ExternalLink className="w-4 h-4" />
                    </Button>
                  </a>
                </div>
              ) : receipt.paymentMethod === "bank_transfer" ? (
                <div className="p-3.5 rounded-2xl border border-amber-500/20 bg-amber-500/5 text-xs space-y-2">
                  <div className="font-semibold text-amber-700 dark:text-amber-400 flex items-center gap-1.5">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    <span>Next Step: Bank Deposit Transfer</span>
                  </div>
                  <p className="text-muted-foreground leading-normal">
                    Please transfer <span className="font-bold text-foreground">{receipt.amount.toLocaleString()} ETB</span> to CBE Account <span className="font-mono font-bold text-foreground">1000 2348 91234</span>. Include reference code <span className="font-mono font-bold text-primary">{receipt.reference}</span> in the reason note.
                  </p>
                </div>
              ) : checkoutUrl ? (
                <div className="pt-2">
                  <a
                    href={checkoutUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block w-full"
                  >
                    <Button className="w-full h-11 bg-primary hover:bg-primary/90 text-primary-foreground rounded-full gap-2 text-sm font-bold shadow-md">
                      <span>Open Payment Gateway</span>
                      <ExternalLink className="w-4 h-4" />
                    </Button>
                  </a>
                </div>
              ) : (
                <div className="p-3.5 rounded-2xl border border-emerald-500/20 bg-emerald-500/5 text-xs space-y-1.5 text-center">
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
                  className="w-full rounded-full text-xs h-10"
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

export default function GivingsPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-background" />}>
      <GivingsContent />
    </Suspense>
  );
}
