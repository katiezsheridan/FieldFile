export default function TermsPage() {
  return (
    <div className="py-12 px-6">
      <div className="max-w-3xl mx-auto">
        {/* Draft Banner */}
        <div className="bg-field-wheat/40 border border-field-wheat rounded-lg p-4 mb-8">
          <p className="text-sm text-field-ink/70 text-center">
            <strong>Draft:</strong> These terms of service are a working draft
            and will be reviewed by legal counsel before launch.
          </p>
        </div>

        <h1 className="text-3xl font-bold text-field-ink mb-2">
          Terms of Service
        </h1>
        <p className="text-field-ink/50 text-sm mb-10">
          Last updated: February 2026
        </p>

        <div className="space-y-8">
          <section>
            <h2 className="text-xl font-semibold text-field-ink mb-3">
              Acceptance of Terms
            </h2>
            <p className="text-field-ink/70 leading-relaxed">
              By accessing or using FieldFile (&ldquo;the Service&rdquo;), you
              agree to be bound by these Terms of Service. If you do not agree to
              these terms, please do not use the Service. We reserve the right to
              update these terms at any time, and will notify you of material
              changes via email or through the platform.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-field-ink mb-3">
              Description of Service
            </h2>
            <p className="text-field-ink/70 leading-relaxed">
              FieldFile provides a platform for Texas landowners to organize,
              document, and file wildlife management activities for the purpose
              of maintaining wildlife tax exemptions. Our services include
              activity tracking, document management, report generation, and
              filing with county appraisal districts.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-field-ink mb-3">
              Account Registration
            </h2>
            <p className="text-field-ink/70 leading-relaxed mb-3">
              To use the Service, you must create an account and provide
              accurate, complete information. You are responsible for maintaining
              the security of your account credentials and for all activity that
              occurs under your account.
            </p>
            <p className="text-field-ink/70 leading-relaxed">
              You must be at least 18 years old to create an account. By
              registering, you represent that you are a lawful owner or
              authorized manager of the property for which you are filing.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-field-ink mb-3">
              Fees & Payment
            </h2>
            <p className="text-field-ink/70 leading-relaxed mb-3">
              FieldFile offers paid subscription plans as described on our
              pricing page. Fees are billed annually and are non-refundable
              except as required by law. We reserve the right to change our
              pricing with 30 days&apos; advance notice.
            </p>
            <p className="text-field-ink/70 leading-relaxed">
              Add-on services such as wildlife plan creation and site visits are
              billed separately at the rates listed at the time of purchase.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-field-ink mb-3">
              User Responsibilities
            </h2>
            <p className="text-field-ink/70 leading-relaxed mb-3">
              You are responsible for:
            </p>
            <ul className="list-disc pl-6 space-y-2 text-field-ink/70">
              <li>
                Providing accurate and truthful information about your property
                and wildlife management activities
              </li>
              <li>
                Ensuring that photographs and documents you upload are genuine
                and accurately represent your activities
              </li>
              <li>
                Complying with all applicable local, state, and federal laws
                regarding wildlife management and property tax exemptions
              </li>
              <li>
                Reviewing your filing before submission and confirming its
                accuracy
              </li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-field-ink mb-3">
              Limitation of Liability
            </h2>
            <p className="text-field-ink/70 leading-relaxed mb-3">
              FieldFile is a documentation and filing service.{" "}
              <strong>
                We do not provide tax advice, legal advice, or wildlife
                management consulting.
              </strong>{" "}
              We are not responsible for the approval or denial of your wildlife
              tax exemption by any county appraisal district.
            </p>
            <p className="text-field-ink/70 leading-relaxed">
              To the maximum extent permitted by law, FieldFile shall not be
              liable for any indirect, incidental, special, consequential, or
              punitive damages resulting from your use of the Service, including
              but not limited to loss of tax exemption status, property tax
              increases, or penalties assessed by governmental authorities.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-field-ink mb-3">
              Governing Law
            </h2>
            <p className="text-field-ink/70 leading-relaxed">
              These Terms shall be governed by and construed in accordance with
              the laws of the State of Texas, without regard to conflict of law
              principles. Any disputes arising from these Terms or your use of
              the Service shall be resolved in the courts located in Travis
              County, Texas.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-field-ink mb-3">
              Contact
            </h2>
            <p className="text-field-ink/70 leading-relaxed">
              If you have questions about these terms, please contact us at{" "}
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
