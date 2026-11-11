import Link from "next/link";

export default function PrivacyPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-16 sm:px-6 lg:px-8">
      <h1 className="text-3xl font-bold tracking-tight text-gray-900 mb-8">
        Privacy Policy
      </h1>

      <div className="prose prose-blue max-w-none text-gray-600 space-y-6">
        <p className="text-lg text-gray-500">
          Last Updated: <strong>November 10, 2026</strong>
        </p>

        <section className="space-y-4">
          <h2 className="text-xl font-semibold text-gray-900 border-b border-gray-100 pb-2">
            1. Introduction
          </h2>
          <p>
            Welcome to <strong>My Fellow</strong>, the official mobile application and ecosystem for the
            AAU 4-Kilo Evangelical Christian Students Fellowship (ECSF). We
            respect your privacy and are committed to protecting it through our
            compliance with this policy. We prioritize keeping your personal
            information secure while enabling you to connect with the fellowship
            community.
          </p>
        </section>

        <section className="space-y-4">
          <h2 className="text-xl font-semibold text-gray-900 border-b border-gray-100 pb-2">
            2. Information We Collect
          </h2>
          <p>
            We collect several types of information from and about users of our
            application:
          </p>
          <ul className="list-disc pl-6 space-y-2">
            <li>
              <strong>Identity & Authentication Data:</strong> Ethiopian mobile
              phone number (used as primary unique identifier) and one-time verification
              PINs. Full name, optional profile picture, and Telegram handle.
            </li>
            <li>
              <strong>Academic & Ministry Affiliations:</strong> AAU campus department,
              academic batch / year of study, and joined fellowship ministry teams.
            </li>
            <li>
              <strong>Spiritual Activity & Engagement:</strong> Daily devotional reading
              progress, streaks, bookmarks, prayer commitments, and event registrations.
            </li>
            <li>
              <strong>Financial & Transaction Data:</strong> When contributing tithes,
              offerings, or purchasing fellowship items via Jami, transaction identifiers
              and statuses are recorded. We do not store full payment card numbers or bank PINs.
            </li>
          </ul>
        </section>

        <section className="space-y-4">
          <h2 className="text-xl font-semibold text-gray-900 border-b border-gray-100 pb-2">
            3. Third-Party Service Providers & Data Processors
          </h2>
          <p>
            To deliver essential authentication and payment services, we partner with
            specialized third-party providers bound by data confidentiality agreements:
          </p>
          <ul className="list-disc pl-6 space-y-2">
            <li>
              <strong>GeezSMS Gateway:</strong> Dispatches encrypted 6-digit SMS OTP
              codes directly to Ethiopian telecom operators (Ethio Telecom, Safaricom Ethiopia).
            </li>
            <li>
              <strong>Jami Payment Platform:</strong> Facilitates seamless digital giving,
              tithes, and merchandise checkouts via Telebirr, CBE Birr, and major Ethiopian banks.
            </li>
            <li>
              <strong>Cloudinary Media CDN:</strong> Provides secure hosting for user profile
              avatars and fellowship devotional illustrations with end-to-end HTTPS delivery.
            </li>
          </ul>
        </section>

        <section className="space-y-4">
          <h2 className="text-xl font-semibold text-gray-900 border-b border-gray-100 pb-2">
            4. Data Security & Retention
          </h2>
          <p>
            We implement robust administrative, technical, and physical safeguards designed to
            protect your personal data against unauthorized access, loss, or alteration. All
            network communication with our API services requires TLS 1.3 encryption.
          </p>
          <p>
            Financial records are retained for up to 7 years in compliance with non-profit
            financial record-keeping regulations. Personal activity data is purged immediately upon
            account deletion request fulfillment.
          </p>
        </section>

        <section className="space-y-4">
          <h2 className="text-xl font-semibold text-gray-900 border-b border-gray-100 pb-2">
            5. Your Rights & Account Deletion
          </h2>
          <p>
            You have full control over your personal data. You may request account access,
            data correction, or permanent deletion at any time.
          </p>
          <p>
            To submit an automated account and data deletion request directly from the web,
            visit our dedicated{" "}
            <Link
              href="/delete-account"
              className="text-red-600 font-medium hover:underline"
            >
              Account Deletion Portal
            </Link>
            . Requests are verified and completely purged within 14 to 30 business days.
          </p>
        </section>

        <section className="space-y-4">
          <h2 className="text-xl font-semibold text-gray-900 border-b border-gray-100 pb-2">
            6. Contact & Support
          </h2>
          <p>
            For privacy-related inquiries, data access requests, or security reports, please reach out to:
          </p>
          <p className="text-sm font-mono bg-gray-50 p-4 rounded-lg border border-gray-200">
            AAU 4-Kilo Evangelical Christian Students Fellowship (ECSF)<br />
            Email:{" "}
            <a
              href="mailto:privacy@4kilofellowship.org"
              className="text-blue-600 hover:underline"
            >
              privacy@4kilofellowship.org
            </a>
            <br />
            Location: Addis Ababa University 4-Kilo Campus, Addis Ababa, Ethiopia
          </p>
        </section>
      </div>
    </div>
  );
}
