export default function DeleteAccountPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-16 sm:px-6 lg:px-8">
      <h1 className="text-3xl font-bold tracking-tight text-gray-900 mb-8">
        Account and Data Deletion Request
      </h1>

      <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-6 sm:p-10 mb-8">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">
          How to Request Account Deletion
        </h2>
        <p className="text-gray-600 mb-6">
          If you no longer wish to use the <strong>My Fellow</strong>{" "}
          application (by AAU 4-Killo ECSF), you can request to have your
          account and associated personal data permanently deleted from our
          systems. Currently, deletion requests are handled manually by our
          support team or fellowship administrators to ensure security and
          prevent accidental data loss.
        </p>

        <div className="bg-blue-50 border border-blue-100 rounded-md p-4 mb-6">
          <h3 className="font-semibold text-blue-900 mb-2">
            Steps to Delete Your Account:
          </h3>
          <ol className="list-decimal pl-5 text-blue-800 space-y-2">
            <li>
              Send a message to our official Telegram Bot:{" "}
              <strong>@I4U_TEAM_bot</strong>
            </li>
            <li>
              Use the phrase: <em>"I want to request account deletion"</em>.
            </li>
            <li>
              Provide your registered Phone Number or Email address associated
              with your account.
            </li>
            <li>
              Our administrative team will process the deletion request within
              7-14 business days.
            </li>
          </ol>
        </div>

        <p className="text-sm text-gray-500">
          Alternatively, you can email your request to our technical support
          team directly if you have their contact information via your team
          leader.
        </p>
      </div>

      <div className="space-y-8">
        <section>
          <h2 className="text-xl font-semibold text-gray-900 border-b border-gray-100 pb-2 mb-4">
            What Data is Deleted?
          </h2>
          <p className="text-gray-600 mb-3">
            When your account is deleted, the following data is permanently
            purged from our database:
          </p>
          <ul className="list-disc pl-6 text-gray-600 space-y-1">
            <li>
              Personal Profile Information (Name, Phone Number, Profile Image,
              Telegram Username)
            </li>
            <li>Academic Information (Department, Year of Study)</li>
            <li>Active Team and Past Team assignments</li>
            <li>Daily Devotional reading progress and notes</li>
            <li>Event RSVPs and registrations</li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-gray-900 border-b border-gray-100 pb-2 mb-4">
            What Data is Kept? (Data Retention)
          </h2>
          <p className="text-gray-600 mb-3">
            Certain data may be retained even after your account is deleted in
            order to comply with legal obligations, prevent fraud, and maintain
            accurate financial records:
          </p>
          <ul className="list-disc pl-6 text-gray-600 space-y-1">
            <li>
              <strong>Payment History:</strong> Any digital giving, donations,
              or marketplace purchases processed via Chapa will be retained
              globally for accounting and tax purposes. However, it will no
              longer be linked to an active user profile.
            </li>
            <li>
              <strong>Aggregated Analytics:</strong> Anonymized usage data which
              cannot be traced back to you will be kept for improving the app
              experience.
            </li>
          </ul>
        </section>
      </div>
    </div>
  );
}
