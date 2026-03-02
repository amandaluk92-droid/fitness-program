import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Privacy & Data Protection',
  description: 'How Axio collects, uses, and protects your personal and fitness data.',
}

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <article className="mx-auto max-w-3xl">
        <h1 className="text-2xl font-bold text-gray-900 sm:text-3xl">
          Privacy & Data Protection
        </h1>
        <p className="mt-2 text-sm text-gray-500">Last updated: February 2025</p>

        <section className="mt-6 text-gray-700 space-y-6">
          <div>
            <h2 id="intro" className="text-lg font-semibold text-gray-900">
              Introduction
            </h2>
            <p>
              This Privacy & Data Protection policy applies to users of the Axio fitness platform
              (&quot;we&quot;, &quot;our&quot;, or &quot;the app&quot;). The data controller is
              Axio. We are committed to protecting your privacy and handling
              your data in line with applicable data protection laws. This document explains what
              data we collect, how we use it, and your rights.
            </p>
          </div>

          <div>
            <h2 id="toc" className="text-lg font-semibold text-gray-900">
              Table of contents
            </h2>
            <ul className="list-disc pl-5 space-y-1 text-primary-600">
              <li><a href="#data-we-collect" className="hover:underline">What data we collect</a></li>
              <li><a href="#how-we-use" className="hover:underline">How and why we use your data</a></li>
              <li><a href="#sharing" className="hover:underline">Data sharing</a></li>
              <li><a href="#retention" className="hover:underline">Data retention</a></li>
              <li><a href="#security" className="hover:underline">Security</a></li>
              <li><a href="#cookies" className="hover:underline">Cookies and similar technology</a></li>
              <li><a href="#rights" className="hover:underline">Your rights</a></li>
              <li><a href="#transfers" className="hover:underline">International transfers</a></li>
              <li><a href="#changes" className="hover:underline">Changes to this policy</a></li>
              <li><a href="#contact" className="hover:underline">Contact</a></li>
            </ul>
          </div>

          <div>
            <h2 id="data-we-collect" className="text-lg font-semibold text-gray-900">
              What data we collect
            </h2>
            <p>We collect the following categories of data:</p>
            <ul className="list-disc pl-5 mt-2 space-y-1">
              <li>
                <strong>Account and identity:</strong> name, email address, password (stored in
                hashed form), role (trainer or trainee), and sign-up choices (e.g. newsletter
                opt-in, acceptance of terms).
              </li>
              <li>
                <strong>Profile (optional):</strong> phone number, age, sex, fitness goals, and
                weight. These are provided by trainees on their profile and may be visible to
                connected trainers.
              </li>
              <li>
                <strong>Fitness and training:</strong> training programs, program assignments,
                and session logs (date, RPE, notes, and per-exercise sets, reps, and weights).
              </li>
              <li>
                <strong>Subscriptions and payments:</strong> subscription and payment records.
                Payment processing is carried out by Stripe; Stripe&apos;s privacy policy applies
                to that processing:{' '}
                <a
                  href="https://stripe.com/privacy"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary-600 hover:underline"
                >
                  https://stripe.com/privacy
                </a>
                .
              </li>
              <li>
                <strong>Technical:</strong> session and authentication data (e.g. cookies used for
                login and to keep you signed in).
              </li>
            </ul>
            <p className="mt-2">
              We do not sell your data. We do not use your fitness or health data for advertising.
            </p>
          </div>

          <div>
            <h2 id="how-we-use" className="text-lg font-semibold text-gray-900">
              How and why we use your data
            </h2>
            <p>We use your data to:</p>
            <ul className="list-disc pl-5 mt-2 space-y-1">
              <li>Provide the service (accounts, programs, session logging, progress tracking, subscriptions).</li>
              <li>Communicate with you about your account and, if you opted in, send newsletters and updates.</li>
              <li>Comply with legal and security obligations (e.g. record of terms acceptance, fraud prevention).</li>
            </ul>
            <p className="mt-2">
              Where required by law, we rely on contract performance and your consent as the legal
              basis for processing (e.g. consent for newsletter; contract for providing the service).
            </p>
          </div>

          <div>
            <h2 id="sharing" className="text-lg font-semibold text-gray-900">
              Data sharing
            </h2>
            <p>
              We do not sell your personal or fitness data. We may share data only as follows:
            </p>
            <ul className="list-disc pl-5 mt-2 space-y-1">
              <li>
                <strong>Stripe:</strong> payment-related data is shared with Stripe for processing
                payments; Stripe has its own privacy policy.
              </li>
              <li>
                <strong>Service providers:</strong> we may use hosting and infrastructure providers
                necessary to run the app; they process data on our instructions.
              </li>
              <li>
                <strong>Legal:</strong> we may disclose data when required by law or to protect
                rights and safety.
              </li>
            </ul>
            <p className="mt-2">
              We do not use your fitness or health data for advertising or share it with
              advertisers.
            </p>
          </div>

          <div>
            <h2 id="retention" className="text-lg font-semibold text-gray-900">
              Data retention
            </h2>
            <p>
              We keep your account and profile data for as long as your account is active. After
              you delete your account, we retain data only as needed for legal, security, or
              legitimate business purposes (e.g. resolving disputes, compliance). Session and
              training logs are retained as necessary to provide the service and for the same
              limited purposes after account closure.
            </p>
          </div>

          <div>
            <h2 id="security" className="text-lg font-semibold text-gray-900">
              Security
            </h2>
            <p>
              We use appropriate technical and organisational measures to protect your data.
              Passwords are stored in hashed form. Access to personal data is limited to what is
              necessary to operate the service, support you, and meet legal obligations.
            </p>
          </div>

          <div>
            <h2 id="cookies" className="text-lg font-semibold text-gray-900">
              Cookies and similar technology
            </h2>
            <p>
              We use session and authentication cookies that are necessary to keep you logged in
              and to provide the app. We do not use marketing or analytics cookies for
              advertising. If we introduce optional cookies in the future, we will update this
              section and, where required, obtain your consent.
            </p>
          </div>

          <div>
            <h2 id="rights" className="text-lg font-semibold text-gray-900">
              Your rights
            </h2>
            <p>Depending on where you live, you may have the right to:</p>
            <ul className="list-disc pl-5 mt-2 space-y-1">
              <li><strong>Access</strong> your personal data.</li>
              <li><strong>Correct</strong> inaccurate data.</li>
              <li><strong>Delete</strong> your data or request account deletion.</li>
              <li><strong>Data portability</strong> (receive your data in a portable format).</li>
              <li><strong>Withdraw consent</strong> (e.g. for newsletter) at any time.</li>
              <li><strong>Object or restrict</strong> certain processing where applicable by law.</li>
            </ul>
            <p className="mt-2">
              To exercise these rights or ask questions about your data, please contact us using
              the details in the Contact section below.
            </p>
          </div>

          <div>
            <h2 id="transfers" className="text-lg font-semibold text-gray-900">
              International transfers
            </h2>
            <p>
              Your data may be stored or processed in regions where our servers or service
              providers operate. If that involves a transfer outside your jurisdiction, we will
              ensure appropriate safeguards (such as standard contractual clauses or equivalent
              mechanisms) where required by law.
            </p>
          </div>

          <div>
            <h2 id="changes" className="text-lg font-semibold text-gray-900">
              Changes to this policy
            </h2>
            <p>
              We may update this policy from time to time. The &quot;Last updated&quot; date at
              the top will be revised when we make changes. For material changes, we will
              notify you via the app or by email where appropriate.
            </p>
          </div>

          <div>
            <h2 id="contact" className="text-lg font-semibold text-gray-900">
              Contact
            </h2>
            <p>
              For privacy requests or questions about this policy, contact the data controller:
            </p>
            <p className="mt-2">
              Email: <a href="mailto:privacy@axio.app" className="text-primary-600 hover:underline">privacy@axio.app</a>
            </p>
          </div>
        </section>

        <p className="mt-10">
          <Link href="/register" className="text-primary-600 hover:text-primary-700 font-medium">
            Back to sign up
          </Link>
        </p>
      </article>
    </div>
  )
}
