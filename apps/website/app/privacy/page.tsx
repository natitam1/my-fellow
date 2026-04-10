export default function PrivacyPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-16 sm:px-6 lg:px-8">
      <h1 className="text-3xl font-bold tracking-tight text-gray-900 mb-8">
        Privacy Policy
      </h1>

      <div className="prose prose-blue max-w-none text-gray-600 space-y-6">
        <p className="text-lg text-gray-500">
          Last Updated: <strong>{new Date().toLocaleDateString()}</strong>
        </p>

        <section className="space-y-4">
          <h2 className="text-xl font-semibold text-gray-900 border-b border-gray-100 pb-2">
            1. Introduction
          </h2>
          <p>
            Welcome to My Fellow, the official fellowship application for the
            AAU 4-Killo Evangelical Christian Students Fellowship (ECSF). We
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
              <strong>Personal Information:</strong> Information by which you
              may be personally identified, such as name, email address, phone
              number, and fellowship team affiliations.
            </li>
            <li>
              <strong>Financial Information:</strong> If you use our marketplace
              or digital giving features, payments are processed by our secure
              third-party gateway (Chapa). We do not store full credit card
              details.
            </li>
            <li>
              <strong>Usage Details:</strong> Information about your
              interactions with the app, including devotionals read, events
              RSVP'd, and feature usage.
            </li>
          </ul>
        </section>

        <section className="space-y-4">
          <h2 className="text-xl font-semibold text-gray-900 border-b border-gray-100 pb-2">
            3. How We Use Your Information
          </h2>
          <p>
            We use information that we collect about you or that you provide to
            us:
          </p>
          <ul className="list-disc pl-6 space-y-2">
            <li>
              To present our application and its contents to you (Devotionals,
              Announcements).
            </li>
            <li>
              To provide you with information, products, or services that you
              request from us.
            </li>
            <li>
              To fulfill any other purpose for which you provide it, such as
              team assignments.
            </li>
            <li>
              To process and record your digital giving and event registrations.
            </li>
          </ul>
        </section>

        <section className="space-y-4">
          <h2 className="text-xl font-semibold text-gray-900 border-b border-gray-100 pb-2">
            4. Data Security
          </h2>
          <p>
            We have implemented measures designed to secure your personal
            information from accidental loss and from unauthorized access, use,
            alteration, and disclosure. Any payment transactions will be
            encrypted using standard protocols provided by Chapa.
          </p>
        </section>

        <section className="space-y-4">
          <h2 className="text-xl font-semibold text-gray-900 border-b border-gray-100 pb-2">
            5. Your Privacy Rights
          </h2>
          <p>
            You can review and change your personal information by logging into
            the app and visiting your account profile page. You may also send us
            an email to request access to, correct, or delete any personal
            information that you have provided to us.
          </p>
        </section>

        <section className="space-y-4">
          <h2 className="text-xl font-semibold text-gray-900 border-b border-gray-100 pb-2">
            6. Contact Information
          </h2>
          <p>
            To ask questions or comment about this privacy policy and our
            privacy practices, contact us via the Telegram Bot `I4U_TEAM_bot` or
            through our designated support channels.
          </p>
        </section>
      </div>
    </div>
  );
}
