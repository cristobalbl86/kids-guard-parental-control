import type { Metadata } from 'next';
import Link from 'next/link';
import { APP_META } from '@/lib/constants';

export const metadata: Metadata = {
  title: 'Privacy Policy',
  description: `Privacy Policy for ${APP_META.fullName}.`,
};

export default function PrivacyPage() {
  return (
    <div className="pt-24 pb-20">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="p-6 sm:p-10 rounded-2xl bg-white dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700">
          <article className="prose-custom">
            <h1>Privacy Policy for Kids Guard - Parental Control</h1>

            <p className="text-sm text-slate-500 dark:text-slate-400">
              <strong>Effective Date</strong>: January 3, 2026 &middot;{' '}
              <strong>Last Updated</strong>: January 3, 2026
            </p>

            <h2>Introduction</h2>
            <p>
              This privacy policy applies to the Kids Guard - Parental Control mobile application
              (&ldquo;App&rdquo;) for Android devices. This policy describes how we handle information
              in connection with the App.
            </p>

            <h2>Developer Information</h2>
            <ul>
              <li><strong>App Name</strong>: Kids Guard - Parental Control</li>
              <li><strong>Developer</strong>: Cristobal Buenrostro Lopez</li>
              <li>
                <strong>Contact Email</strong>:{' '}
                <a href={`mailto:${APP_META.developer.email}`}>{APP_META.developer.email}</a>
              </li>
              <li><strong>App Package</strong>: com.kidsguard</li>
            </ul>

            <h2>Information We Collect</h2>

            <h3>Information Stored Locally</h3>
            <p>The App stores the following information <strong>locally on your device only</strong>:</p>
            <ul>
              <li><strong>Parent PIN</strong>: A PIN code you create to protect parent settings</li>
              <li><strong>Volume Settings</strong>: Your configured volume level and lock status</li>
              <li><strong>Brightness Settings</strong>: Your configured brightness level and lock status</li>
              <li><strong>Ad Display Timestamps</strong>: When ads were last shown (for frequency control)</li>
            </ul>
            <p>
              <strong>Important</strong>: All this information is stored locally on your device using
              Android&apos;s secure storage. We do not transmit this data to any servers or third parties.
            </p>

            <h3>Information We Do NOT Collect</h3>
            <p>We do <strong>NOT</strong> collect, store, or transmit:</p>
            <ul>
              <li>Personal information (name, email, phone number, address)</li>
              <li>Device identifiers (beyond what AdMob collects - see below)</li>
              <li>Location data</li>
              <li>Photos, contacts, or other personal files</li>
              <li>Usage analytics or behavioral data</li>
              <li>Any data from your device outside the app</li>
            </ul>

            <h2>Third-Party Services</h2>

            <h3>Google AdMob</h3>
            <p>
              The App uses Google AdMob to display advertisements. AdMob may collect certain
              information to serve personalized ads:
            </p>
            <ul>
              <li><strong>Device Information</strong>: Device model, operating system version</li>
              <li><strong>Advertising ID</strong>: Google Advertising ID for ad personalization</li>
              <li><strong>Usage Data</strong>: Ad interaction data</li>
            </ul>
            <p>AdMob&apos;s data collection is governed by Google&apos;s Privacy Policy:</p>
            <ul>
              <li>
                <a href="https://policies.google.com/privacy" target="_blank" rel="noopener noreferrer">
                  Google Privacy Policy
                </a>
              </li>
              <li>
                <a href="https://support.google.com/admob/answer/6128543" target="_blank" rel="noopener noreferrer">
                  AdMob Privacy Information
                </a>
              </li>
            </ul>
            <p>
              <strong>Ad Settings</strong>: You can opt out of personalized ads by visiting:
              <br />
              Android Settings &gt; Google &gt; Ads &gt; Opt out of Ads Personalization
            </p>

            <h3>No Other Third-Party Services</h3>
            <p>
              The App does not use any other third-party services, analytics, crash reporting, or
              data collection tools.
            </p>

            <h2>How We Use Information</h2>
            <p>The information stored locally on your device is used solely for:</p>
            <ol>
              <li>
                <strong>App Functionality</strong>:
                <ul>
                  <li>Verifying parent PIN for access control</li>
                  <li>Enforcing volume and brightness settings</li>
                  <li>Managing ad display frequency (max once per 6 hours)</li>
                </ul>
              </li>
              <li>
                <strong>No Other Purposes</strong>: We do not use your information for marketing,
                profiling, or any other purposes.
              </li>
            </ol>

            <h2>Data Security</h2>
            <ul>
              <li>
                <strong>Local Storage</strong>: All app data is stored locally on your device using
                Android&apos;s secure storage mechanisms
              </li>
              <li>
                <strong>PIN Security</strong>: Parent PIN is stored using Android Keychain with
                hardware encryption
              </li>
              <li>
                <strong>No Transmission</strong>: No app data is transmitted over the internet
                (except AdMob&apos;s standard ad requests)
              </li>
            </ul>

            <h2>Children&apos;s Privacy</h2>
            <p>
              This App is designed for <strong>parents</strong> to use, not children. The App is not
              directed at children under 13.
            </p>
            <ul>
              <li>The App does not knowingly collect personal information from children</li>
              <li>The App requires a parent PIN to access settings</li>
              <li>The App is a parental control tool, not a children&apos;s app</li>
            </ul>
            <p>
              If you believe we have inadvertently collected information from a child under 13,
              please contact us immediately.
            </p>

            <h2>Data Retention and Deletion</h2>

            <h3>Local Data</h3>
            <ul>
              <li>All app data is stored on your device</li>
              <li>
                You can delete all app data by:
                <ul>
                  <li>Uninstalling the App, OR</li>
                  <li>
                    Going to Android Settings &gt; Apps &gt; Kids Guard &gt; Storage &gt; Clear Data
                  </li>
                </ul>
              </li>
            </ul>

            <h3>AdMob Data</h3>
            <ul>
              <li>AdMob data is managed by Google</li>
              <li>
                To reset your advertising ID: Android Settings &gt; Google &gt; Ads &gt; Reset
                advertising ID
              </li>
              <li>
                To delete Google account data: Visit{' '}
                <a href="https://myactivity.google.com/" target="_blank" rel="noopener noreferrer">
                  My Activity
                </a>
              </li>
            </ul>

            <h2>Your Rights</h2>
            <p>You have the right to:</p>
            <ul>
              <li><strong>Access</strong>: View all data stored by the App (stored locally on your device)</li>
              <li><strong>Delete</strong>: Delete all app data by clearing storage or uninstalling</li>
              <li><strong>Opt-out</strong>: Opt out of personalized ads via Android settings</li>
              <li><strong>Contact</strong>: Contact us with questions or concerns</li>
            </ul>

            <h2>Changes to This Privacy Policy</h2>
            <p>
              We may update this Privacy Policy from time to time. Changes will be posted in the App
              and on this page. Continued use of the App after changes constitutes acceptance of the
              updated policy.
            </p>

            <h2>Compliance</h2>
            <p>This App and Privacy Policy comply with:</p>
            <ul>
              <li>Google Play Developer Program Policies</li>
              <li>Android Developer Policy</li>
              <li>General Data Protection Regulation (GDPR) - for EU users</li>
              <li>California Consumer Privacy Act (CCPA) - for California users</li>
              <li>Children&apos;s Online Privacy Protection Act (COPPA)</li>
            </ul>

            <h2>Contact Us</h2>
            <p>
              If you have questions, concerns, or requests regarding this Privacy Policy or the
              App&apos;s data practices, please{' '}
              <Link href="/contact" className="text-brand-primary hover:underline">
                contact us
              </Link>{' '}
              or email us at{' '}
              <a href={`mailto:${APP_META.developer.email}`}>{APP_META.developer.email}</a>.
            </p>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              Response Time: We aim to respond within 48 hours.
            </p>

            <hr />

            <h2>Summary</h2>
            <ul>
              <li><strong>What we collect</strong>: Nothing personally identifiable. Only local app settings.</li>
              <li><strong>What we share</strong>: Nothing. We don&apos;t transmit your data.</li>
              <li><strong>Third parties</strong>: Only Google AdMob for ads (governed by Google&apos;s policies).</li>
              <li><strong>Your control</strong>: Uninstall or clear app data to remove everything.</li>
            </ul>

            <p className="text-sm text-slate-500 dark:text-slate-400 italic">
              This privacy policy was last updated on January 3, 2026. Please review periodically
              for updates.
            </p>
          </article>
        </div>
      </div>
    </div>
  );
}
