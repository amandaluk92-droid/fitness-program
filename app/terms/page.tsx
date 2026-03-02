import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Terms of Service',
  description: 'Terms governing your use of Axio.',
}

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <article className="mx-auto max-w-3xl">
        <h1 className="text-2xl font-bold text-gray-900 sm:text-3xl">
          Terms of Service
        </h1>
        <p className="mt-2 text-sm text-gray-500">Last updated: February 2025</p>

        <section className="mt-6 text-gray-700 space-y-6">
          <div>
            <h2 id="agreement" className="text-lg font-semibold text-gray-900">
              1. Agreement and acceptance
            </h2>
            <p>
              By creating an account or using Axio (&quot;Service&quot;), you
              agree to be bound by these Terms of Service (&quot;Terms&quot;). If you do not agree,
              do not use the Service. &quot;We&quot;, &quot;our&quot;, or &quot;Company&quot; means
              Axio.
            </p>
          </div>

          <div>
            <h2 id="toc" className="text-lg font-semibold text-gray-900">
              Table of contents
            </h2>
            <ul className="list-disc pl-5 space-y-1 text-primary-600">
              <li><a href="#agreement" className="hover:underline">Agreement and acceptance</a></li>
              <li><a href="#service" className="hover:underline">Service description and eligibility</a></li>
              <li><a href="#health" className="hover:underline">Health and fitness disclaimers</a></li>
              <li><a href="#accounts" className="hover:underline">Account and registration</a></li>
              <li><a href="#subscription" className="hover:underline">Subscription, fees, and payment</a></li>
              <li><a href="#cancellation" className="hover:underline">Cancellation and refunds</a></li>
              <li><a href="#acceptable-use" className="hover:underline">Acceptable use</a></li>
              <li><a href="#ip" className="hover:underline">Intellectual property</a></li>
              <li><a href="#privacy" className="hover:underline">Privacy and data</a></li>
              <li><a href="#disclaimers" className="hover:underline">Disclaimers</a></li>
              <li><a href="#liability" className="hover:underline">Limitation of liability</a></li>
              <li><a href="#indemnification" className="hover:underline">Indemnification</a></li>
              <li><a href="#termination" className="hover:underline">Termination</a></li>
              <li><a href="#changes" className="hover:underline">Changes to the terms</a></li>
              <li><a href="#governing-law" className="hover:underline">Governing law and dispute resolution</a></li>
              <li><a href="#general" className="hover:underline">General</a></li>
              <li><a href="#contact" className="hover:underline">Contact</a></li>
            </ul>
          </div>

          <div>
            <h2 id="service" className="text-lg font-semibold text-gray-900">
              2. Service description and eligibility
            </h2>
            <p>
              The Service is a fitness program platform that allows trainers to create and assign
              training programs to trainees, and trainees to log sessions, track progress, and
              manage subscriptions. You must use the Service only for lawful purposes and in
              accordance with these Terms.
            </p>
            <p className="mt-2">
              You must be at least 18 years of age (or the age of majority in your jurisdiction)
              and have the legal capacity to enter into a binding agreement. If you are using the
              Service on behalf of an organization, you represent that you have authority to bind
              that organization. You may not use the Service if you are prohibited by applicable
              law.
            </p>
          </div>

          <div>
            <h2 id="health" className="text-lg font-semibold text-gray-900">
              3. Health and fitness disclaimers
            </h2>
            <p>
              <strong>The Service is not medical or professional health advice.</strong> The
              content and programs provided through the Service (including training programs,
              exercises, and suggestions) are for general fitness and informational purposes only.
              They are not a substitute for advice from a qualified healthcare or fitness
              professional.
            </p>
            <p className="mt-2">
              Physical activity involves inherent risks. By using the Service and participating in
              any training or exercise, you assume all risks of injury or harm. We recommend that
              you consult a physician or other qualified health provider before starting any
              fitness program, especially if you have any medical condition or concerns. If you
              experience pain, dizziness, or discomfort, stop and seek medical attention. We are
              not liable for any injury, loss, or damage arising from your use of the Service or
              participation in any fitness activity.
            </p>
          </div>

          <div>
            <h2 id="accounts" className="text-lg font-semibold text-gray-900">
              4. Account and registration
            </h2>
            <p>
              To use the Service you must create an account and provide accurate, current
              information. You are responsible for maintaining the confidentiality of your
              credentials and for all activity under your account. Your account is personal and
              non-transferable. You must notify us promptly of any unauthorized use. We may
              suspend or terminate accounts that violate these Terms or that we reasonably believe
              are fraudulent or abusive.
            </p>
          </div>

          <div>
            <h2 id="subscription" className="text-lg font-semibold text-gray-900">
              5. Subscription, fees, and payment
            </h2>
            <p>
              Some parts of the Service may require a paid subscription. Subscription terms,
              pricing, and billing cycles are displayed at the time of purchase. Fees are
              charged in the currency shown and are as displayed at the time you agree to pay.
              Payment processing is handled by Stripe; by subscribing you also agree to Stripe&apos;s
              terms where applicable. We may change subscription fees with notice; any change will
              apply at the start of the next billing cycle. If your subscription renews
              automatically, you will be charged until you cancel.
            </p>
          </div>

          <div>
            <h2 id="cancellation" className="text-lg font-semibold text-gray-900">
              6. Cancellation and refunds
            </h2>
            <p>
              You may cancel your subscription through your account settings or via the Stripe
              customer portal (where we make it available). Cancellation will take effect at the
              end of the current billing period; you will retain access until then. We do not
              provide refunds for partial billing periods unless required by law (e.g. certain
              distance-selling or consumer rights in your jurisdiction). If you believe you are
              entitled to a refund under applicable law, contact us.
            </p>
          </div>

          <div>
            <h2 id="acceptable-use" className="text-lg font-semibold text-gray-900">
              7. Acceptable use
            </h2>
            <p>You agree not to:</p>
            <ul className="list-disc pl-5 mt-2 space-y-1">
              <li>Use the Service for any illegal purpose or in violation of any applicable law.</li>
              <li>Attempt to gain unauthorized access to the Service, other accounts, or our systems or networks.</li>
              <li>Interfere with or disrupt the Service or the servers or networks connected to it.</li>
              <li>Abuse, harass, or harm other users or our staff.</li>
              <li>Scrape, copy, or automate access to the Service in a way that bypasses normal use.</li>
            </ul>
            <p className="mt-2">
              We may suspend or terminate your access and take other action we deem appropriate
              for breach of this section.
            </p>
          </div>

          <div>
            <h2 id="ip" className="text-lg font-semibold text-gray-900">
              8. Intellectual property
            </h2>
            <p>
              The Service, including its design, features, and content (other than content you
              provide, such as your profile and session data), is owned by Axio or
              its licensors and is protected by intellectual property laws. We grant you a
              limited, non-exclusive, non-transferable license to access and use the Service for
              your personal or internal business use in accordance with these Terms. You may not
              copy, modify, distribute, or create derivative works from the Service or our
              content without our prior written consent.
            </p>
          </div>

          <div>
            <h2 id="privacy" className="text-lg font-semibold text-gray-900">
              9. Privacy and data
            </h2>
            <p>
              Our collection and use of personal data is described in our{' '}
              <Link href="/privacy" className="text-primary-600 hover:underline">
                Privacy & Data Protection
              </Link>{' '}
              policy. By agreeing to these Terms, you also agree to the Privacy Policy. Please
              read it to understand how we handle your data.
            </p>
          </div>

          <div>
            <h2 id="disclaimers" className="text-lg font-semibold text-gray-900">
              10. Disclaimers
            </h2>
            <p>
              THE SERVICE IS PROVIDED &quot;AS IS&quot; AND &quot;AS AVAILABLE&quot; WITHOUT
              WARRANTIES OF ANY KIND, EXPRESS OR IMPLIED. WE DISCLAIM ALL WARRANTIES, INCLUDING
              IMPLIED WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE, AND
              NON-INFRINGEMENT. WE DO NOT WARRANT THAT THE SERVICE WILL BE UNINTERRUPTED,
              ERROR-FREE, OR SECURE. YOUR USE OF THE SERVICE IS AT YOUR OWN RISK.
            </p>
          </div>

          <div>
            <h2 id="liability" className="text-lg font-semibold text-gray-900">
              11. Limitation of liability
            </h2>
            <p>
              TO THE MAXIMUM EXTENT PERMITTED BY APPLICABLE LAW, WE (AND OUR AFFILIATES,
              OFFICERS, DIRECTORS, EMPLOYEES, AND AGENTS) SHALL NOT BE LIABLE FOR ANY INDIRECT,
              INCIDENTAL, SPECIAL, CONSEQUENTIAL, OR PUNITIVE DAMAGES, OR FOR ANY LOSS OF PROFITS,
              DATA, OR GOODWILL, ARISING OUT OF OR IN CONNECTION WITH YOUR USE OF THE SERVICE.
              OUR TOTAL LIABILITY FOR ANY CLAIMS ARISING FROM OR RELATED TO THE SERVICE OR
              THESE TERMS SHALL NOT EXCEED THE AMOUNT YOU PAID US IN THE TWELVE (12) MONTHS
              BEFORE THE CLAIM AROSE (OR ONE HUNDRED US DOLLARS IF GREATER). THESE LIMITATIONS
              APPLY EVEN IF WE HAVE BEEN ADVISED OF THE POSSIBILITY OF SUCH DAMAGES. SOME
              JURISDICTIONS DO NOT ALLOW CERTAIN LIMITATIONS; IN SUCH CASES OUR LIABILITY WILL
              BE LIMITED TO THE MAXIMUM EXTENT PERMITTED BY LAW. WE ARE NOT LIABLE FOR ANY
              INJURY, ILLNESS, OR OTHER HARM RESULTING FROM YOUR PARTICIPATION IN FITNESS OR
              PHYSICAL ACTIVITY IN CONNECTION WITH THE SERVICE.
            </p>
          </div>

          <div>
            <h2 id="indemnification" className="text-lg font-semibold text-gray-900">
              12. Indemnification
            </h2>
            <p>
              You agree to indemnify, defend, and hold harmless Axio and its
              affiliates, officers, directors, employees, and agents from and against any claims,
              damages, losses, costs, or expenses (including reasonable legal fees) arising from
              (a) your use of the Service, (b) your violation of these Terms or any law, or (c)
              your violation of any third party&apos;s rights. We reserve the right to assume the
              exclusive defense and control of any matter subject to indemnification by you; you
              will cooperate with us in asserting any defenses.
            </p>
          </div>

          <div>
            <h2 id="termination" className="text-lg font-semibold text-gray-900">
              13. Termination
            </h2>
            <p>
              We may suspend or terminate your account and access to the Service at any time for
              breach of these Terms or for any other reason we deem appropriate. You may close
              your account at any time through your account settings or by contacting us. Upon
              termination, your right to use the Service ceases. We may retain and use your data
              as described in our Privacy Policy (e.g. for legal or legitimate business purposes).
            </p>
          </div>

          <div>
            <h2 id="changes" className="text-lg font-semibold text-gray-900">
              14. Changes to the terms
            </h2>
            <p>
              We may update these Terms from time to time. We will post the updated Terms on this
              page and update the &quot;Last updated&quot; date. For material changes, we may
              notify you via the Service or by email. Your continued use of the Service after the
              effective date of the changes constitutes your acceptance of the revised Terms. If
              you do not agree, you must stop using the Service and may close your account.
            </p>
          </div>

          <div>
            <h2 id="governing-law" className="text-lg font-semibold text-gray-900">
              15. Governing law and dispute resolution
            </h2>
            <p>
              These Terms are governed by the laws of Hong Kong, without regard to conflict of
              laws principles. Any dispute arising from or relating to these Terms or the
              Service shall be resolved exclusively in the courts located in Hong Kong, and you
              consent to the personal jurisdiction of such courts.
            </p>
          </div>

          <div>
            <h2 id="general" className="text-lg font-semibold text-gray-900">
              16. General
            </h2>
            <p>
              These Terms, together with the Privacy Policy and any other policies we reference,
              constitute the entire agreement between you and us regarding the Service. If any
              provision is held invalid or unenforceable, the remaining provisions will remain in
              effect. Our failure to enforce any right or provision does not waive that right or
              provision. We may assign our rights and obligations under these Terms; you may not
              assign without our prior written consent.
            </p>
          </div>

          <div>
            <h2 id="contact" className="text-lg font-semibold text-gray-900">
              17. Contact
            </h2>
            <p>
              For questions about these Terms, contact us:
            </p>
            <p className="mt-2">
              Axio
              <br />
              Email: <a href="mailto:support@axio.app" className="text-primary-600 hover:underline">support@axio.app</a>
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
