export default function PrivacyPage() {
  return (
    <div className="py-12 px-6">
      <div className="max-w-3xl mx-auto">
        {/* Draft Banner */}
        <div className="bg-field-wheat/40 border border-field-wheat rounded-lg p-4 mb-8">
          <p className="text-sm text-field-ink/70 text-center">
            <strong>Draft:</strong> This privacy policy is a working draft and
            will be reviewed by legal counsel before launch.
          </p>
        </div>

        <h1 className="text-3xl font-bold text-field-ink mb-2">
          Privacy Policy
        </h1>
        <p className="text-field-ink/50 text-sm mb-10">
          Last updated: February 2026
        </p>

        <div className="space-y-8">
          <section>
            <h2 className="text-xl font-semibold text-field-ink mb-3">
              Information We Collect
            </h2>
            <p className="text-field-ink/70 leading-relaxed mb-3">
              When you create an account with FieldFile, we collect information
              you provide directly, including your name, email address, phone
              number, property address, and county information.
            </p>
            <p className="text-field-ink/70 leading-relaxed">
              We also collect information related to your wildlife management
              activities, including photographs, activity logs, GPS coordinates,
              receipts, and documents you upload to the platform.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-field-ink mb-3">
              How We Use Your Information
            </h2>
            <p className="text-field-ink/70 leading-relaxed mb-3">
              We use your information to provide and improve our services,
              including:
            </p>
            <ul className="list-disc pl-6 space-y-2 text-field-ink/70">
              <li>
                Compiling and submitting your wildlife management reports to
                county appraisal districts
              </li>
              <li>
                Generating activity reminders and compliance notifications
              </li>
              <li>Providing customer support and specialist consultations</li>
              <li>Improving our platform and developing new features</li>
              <li>
                Communicating with you about your account, services, and updates
              </li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-field-ink mb-3">
              Data Storage & Security
            </h2>
            <p className="text-field-ink/70 leading-relaxed mb-3">
              Your data is stored securely using industry-standard encryption.
              All data is encrypted in transit (TLS 1.2+) and at rest. We use
              secure cloud infrastructure to ensure your information is protected
              against unauthorized access.
            </p>
            <p className="text-field-ink/70 leading-relaxed">
              We implement appropriate technical and organizational measures to
              safeguard your personal data, including regular security audits and
              access controls.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-field-ink mb-3">
              Third-Party Services
            </h2>
            <p className="text-field-ink/70 leading-relaxed mb-3">
              We use trusted third-party services to operate our platform:
            </p>
            <ul className="list-disc pl-6 space-y-2 text-field-ink/70">
              <li>
                <strong>Clerk</strong> &mdash; Authentication and user account
                management
              </li>
              <li>
                <strong>Supabase</strong> &mdash; Database and file storage
              </li>
            </ul>
            <p className="text-field-ink/70 leading-relaxed mt-3">
              These services have their own privacy policies and data handling
              practices. We only share the minimum data necessary for these
              services to function.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-field-ink mb-3">
              Your Rights
            </h2>
            <p className="text-field-ink/70 leading-relaxed mb-3">
              You have the right to:
            </p>
            <ul className="list-disc pl-6 space-y-2 text-field-ink/70">
              <li>Access and receive a copy of your personal data</li>
              <li>Request correction of inaccurate information</li>
              <li>Request deletion of your account and associated data</li>
              <li>Export your data in a portable format</li>
              <li>Opt out of marketing communications at any time</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-field-ink mb-3">
              Data Retention
            </h2>
            <p className="text-field-ink/70 leading-relaxed">
              We retain your data for as long as your account is active or as
              needed to provide you with our services. If you request account
              deletion, we will remove your personal data within 30 days, except
              where we are required to retain it for legal or compliance
              purposes.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-field-ink mb-3">
              Contact
            </h2>
            <p className="text-field-ink/70 leading-relaxed">
              If you have questions about this privacy policy or your data,
              please contact us at{" "}
              <a
                href="mailto:katie@fieldfile.com"
                className="text-field-forest hover:underline"
              >
                katie@fieldfile.com
              </a>
              .
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
