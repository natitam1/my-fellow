export default function TermsPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-16 sm:px-6 lg:px-8">
      <h1 className="text-3xl font-bold tracking-tight text-gray-900 mb-8">
        Terms of Service
      </h1>

      <div className="prose prose-blue max-w-none text-gray-600 space-y-6">
        <p className="text-lg text-gray-500">
          Last Updated: <strong>{new Date().toLocaleDateString()}</strong>
        </p>

        <section className="space-y-4">
          <h2 className="text-xl font-semibold text-gray-900 border-b border-gray-100 pb-2">
            1. Acceptance of Terms
          </h2>
          <p>
            By creating an account and using the My Fellow application
            ("Service"), you agree to be bound by these Terms of Service. If you
            do not agree to all the terms and conditions, you must not use our
            Service. My Fellow serves the AAU 4-Killo Evangelical Christian
            Students Fellowship (ECSF).
          </p>
        </section>

        <section className="space-y-4">
          <h2 className="text-xl font-semibold text-gray-900 border-b border-gray-100 pb-2">
            2. Use of Service
          </h2>
          <ul className="list-disc pl-6 space-y-2">
            <li>
              <strong>Eligibility:</strong> You must be an active or alumni
              member of the AAU 4-Killo ECSF or an affiliated partner to utilize
              the full extent of this Service.
            </li>
            <li>
              <strong>Account Responsibilities:</strong> You are responsible for
              safeguarding your password and any activities or actions under
              your password. Notify fellowship leadership immediately upon
              becoming aware of any breach of security or unauthorized use of
              your account.
            </li>
            <li>
              <strong>Prohibited Uses:</strong> You agree not to use the Service
              for any unlawful purpose or to promote illegal activities.
              Appropriate conduct in accordance with fellowship values is
              expected at all times.
            </li>
          </ul>
        </section>

        <section className="space-y-4">
          <h2 className="text-xl font-semibold text-gray-900 border-b border-gray-100 pb-2">
            3. Content and Intellectual Property
          </h2>
          <p>
            Our Service allows you to post, link, store, share, and otherwise
            make available certain information, text, graphics, videos, or other
            material ("Content"). You are responsible for the Content that you
            post on or through the Service, including its legality, reliability,
            and appropriateness. Devotionals, announcements, and official
            fellowship materials remain the intellectual property of AAU 4-Killo
            ECSF.
          </p>
        </section>

        <section className="space-y-4">
          <h2 className="text-xl font-semibold text-gray-900 border-b border-gray-100 pb-2">
            4. Digital Giving and Marketplace
          </h2>
          <p>
            When utilizing digital giving or marketplace features, all
            transactions are processed via our secured payment gateway (Chapa).
            Refunds or disputes must be handled according to specific event or
            item guidelines. The fellowship leadership works to ensure
            transparency and accountability in all received donations and
            payments.
          </p>
        </section>

        <section className="space-y-4">
          <h2 className="text-xl font-semibold text-gray-900 border-b border-gray-100 pb-2">
            5. Termination
          </h2>
          <p>
            We may terminate or suspend your account and bar access to the
            Service immediately, without prior notice or liability, under our
            sole discretion, for any reason whatsoever and without limitation,
            including but not limited to a breach of the Terms.
          </p>
        </section>

        <section className="space-y-4">
          <h2 className="text-xl font-semibold text-gray-900 border-b border-gray-100 pb-2">
            6. Changes to Terms
          </h2>
          <p>
            We reserve the right, at our sole discretion, to modify or replace
            these Terms at any time. By continuing to access or use our Service
            after any revisions become effective, you agree to be bound by the
            revised terms.
          </p>
        </section>
      </div>
    </div>
  );
}
