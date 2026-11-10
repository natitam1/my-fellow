"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  ShieldAlert,
  Trash2,
  CheckCircle2,
  ArrowLeft,
  Loader2,
  Lock,
} from "lucide-react";
import { toast } from "sonner";

export default function DeleteAccountPage() {
  const [phoneNumber, setPhoneNumber] = useState("");
  const [fullName, setFullName] = useState("");
  const [reason, setReason] = useState("");
  const [confirmed, setConfirmed] = useState(false);
  const [loading, setLoading] = useState(false);
  const [submittedRef, setSubmittedRef] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!phoneNumber.trim()) {
      toast.error("Please enter your registered mobile number.");
      return;
    }

    if (!confirmed) {
      toast.error("Please confirm that you understand account deletion is permanent.");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch("/api/account-deletion-request", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          phoneNumber: phoneNumber.trim(),
          fullName: fullName.trim(),
          reason: reason.trim(),
          confirmation: true,
        }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.message || "Failed to submit request.");
      }

      setSubmittedRef(data.referenceId || "DEL-REQUEST-ACCEPTED");
      toast.success("Account deletion request submitted successfully.");
    } catch (err: unknown) {
      const message =
        err instanceof Error
          ? err.message
          : "Failed to submit deletion request. Please try again.";
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto space-y-8">
        <Link
          href="/"
          className="inline-flex items-center text-sm font-medium text-gray-500 hover:text-gray-900 transition-colors"
        >
          <ArrowLeft className="w-4 h-4 mr-1" />
          Back to Fellowship Home
        </Link>

        <div>
          <div className="flex items-center space-x-3 mb-2">
            <div className="p-2 bg-red-100 rounded-lg text-red-600">
              <Trash2 className="w-6 h-6" />
            </div>
            <h1 className="text-3xl font-bold tracking-tight text-gray-900">
              Account & Data Deletion
            </h1>
          </div>
          <p className="text-gray-600">
            Submit a permanent account deletion request for the <strong>My Fellow</strong> mobile application (AAU 4-Kilo ECSF).
          </p>
        </div>

        {submittedRef ? (
          <div className="bg-white border border-green-200 rounded-xl p-8 shadow-sm space-y-4">
            <div className="flex items-center space-x-3 text-green-700">
              <CheckCircle2 className="w-8 h-8 text-green-600 flex-shrink-0" />
              <div>
                <h2 className="text-xl font-bold text-gray-900">
                  Deletion Request Registered
                </h2>
                <p className="text-sm text-gray-600">
                  Your reference ID is{" "}
                  <code className="font-mono font-bold bg-green-50 px-2 py-0.5 rounded text-green-800">
                    {submittedRef}
                  </code>
                </p>
              </div>
            </div>

            <p className="text-gray-700 text-sm leading-relaxed">
              We have received your account and data deletion request for{" "}
              <strong>{phoneNumber}</strong>. An administrative confirmation SMS/call will verify your identity, after which all personal records, devotional history, and credentials will be permanently purged within <strong>14 to 30 business days</strong>.
            </p>

            <div className="pt-4 border-t border-gray-100 flex items-center justify-between">
              <span className="text-xs text-gray-400">
                Retention: Transaction audit records preserved per tax laws.
              </span>
              <button
                onClick={() => {
                  setSubmittedRef(null);
                  setPhoneNumber("");
                  setFullName("");
                  setReason("");
                  setConfirmed(false);
                }}
                className="text-xs font-semibold text-blue-600 hover:underline"
              >
                Submit another request
              </button>
            </div>
          </div>
        ) : (
          <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
            <div className="p-6 sm:p-8 border-b border-gray-100">
              <h2 className="text-xl font-semibold text-gray-900 mb-2">
                Submit Online Deletion Request
              </h2>
              <p className="text-sm text-gray-600">
                Under Google Play and privacy regulations, you may request complete deletion of your account and personal data at any time without needing to retain the app on your device.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="p-6 sm:p-8 space-y-6">
              <div>
                <label
                  htmlFor="phone"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Registered Mobile Phone Number <span className="text-red-500">*</span>
                </label>
                <input
                  id="phone"
                  type="tel"
                  required
                  placeholder="0911234567 or +251911234567"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500 text-sm"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Must match the Ethiopian phone number registered with your My Fellow profile.
                </p>
              </div>

              <div>
                <label
                  htmlFor="fullName"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Full Name (Optional)
                </label>
                <input
                  id="fullName"
                  type="text"
                  placeholder="Your full name as entered in the app"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500 text-sm"
                />
              </div>

              <div>
                <label
                  htmlFor="reason"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Reason for Leaving (Optional)
                </label>
                <textarea
                  id="reason"
                  rows={3}
                  placeholder="Help us improve: let us know why you are deleting your account"
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500 text-sm"
                />
              </div>

              <div className="bg-red-50 border border-red-100 rounded-lg p-4">
                <div className="flex items-start space-x-3">
                  <input
                    id="confirm"
                    type="checkbox"
                    checked={confirmed}
                    onChange={(e) => setConfirmed(e.target.checked)}
                    className="mt-1 h-4 w-4 rounded border-gray-300 text-red-600 focus:ring-red-500"
                  />
                  <label htmlFor="confirm" className="text-xs text-red-900 leading-relaxed">
                    I acknowledge that requesting account deletion is <strong>permanent and irreversible</strong>. I will lose access to my fellowship membership record, devotion bookmarks, prayer commitments, and team affiliations.
                  </label>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full inline-flex items-center justify-center px-6 py-3 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50 transition-colors"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Submitting Deletion Request...
                  </>
                ) : (
                  <>
                    <Trash2 className="w-4 h-4 mr-2" />
                    Submit Account Deletion Request
                  </>
                )}
              </button>
            </form>
          </div>
        )}

        {/* Informational Data Transparency Blocks */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm space-y-3">
            <div className="flex items-center space-x-2 text-gray-900 font-semibold">
              <ShieldAlert className="w-5 h-5 text-red-500" />
              <h3>Data That Will Be Deleted</h3>
            </div>
            <ul className="text-xs text-gray-600 space-y-1.5 list-disc pl-5">
              <li>Full Name, Phone Number, and Ethiopian campus ID</li>
              <li>Fellowship department, batch, and assigned ministry teams</li>
              <li>Daily Devotional streaks, progress, notes, and comments</li>
              <li>Event registrations and physical check-in badges</li>
              <li>Community prayer requests, social interactions, and likes</li>
              <li>Authentication tokens, OTP session logs, and device push tokens</li>
            </ul>
          </div>

          <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm space-y-3">
            <div className="flex items-center space-x-2 text-gray-900 font-semibold">
              <Lock className="w-5 h-5 text-blue-500" />
              <h3>Data Retained & Retention Policy</h3>
            </div>
            <ul className="text-xs text-gray-600 space-y-1.5 list-disc pl-5">
              <li>
                <strong>Financial & Tithe Logs:</strong> Giving and marketplace purchases processed via Jami are retained in an anonymized general ledger for up to 7 years in compliance with Ethiopian non-profit auditing laws.
              </li>
              <li>
                <strong>Aggregated Metrics:</strong> De-identified high-level statistics (e.g. historical devotion engagement totals) stripped of all PII.
              </li>
              <li>
                <strong>Processing Schedule:</strong> Immediate session deactivation; permanent automated database purge within <strong>14–30 business days</strong>.
              </li>
            </ul>
          </div>
        </div>

        <div className="text-center text-xs text-gray-500">
          Questions regarding data handling? Review our{" "}
          <Link href="/privacy" className="text-blue-600 hover:underline">
            Privacy Policy
          </Link>{" "}
          or contact{" "}
          <a
            href="mailto:privacy@4kilofellowship.org"
            className="text-blue-600 hover:underline"
          >
            privacy@4kilofellowship.org
          </a>
          .
        </div>
      </div>
    </div>
  );
}
