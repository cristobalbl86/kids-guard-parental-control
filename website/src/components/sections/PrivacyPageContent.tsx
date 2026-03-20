'use client';

import Link from 'next/link';
import { APP_META } from '@/lib/constants';
import { translations, type Locale } from '@/lib/translations';

interface PrivacyPageContentProps {
  locale: Locale;
}

export function PrivacyPageContent({ locale }: PrivacyPageContentProps) {
  const t = translations[locale];
  const p = t.privacy;

  return (
    <div className="pt-24 pb-20">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="p-6 sm:p-10 rounded-2xl bg-white dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700">
          <article className="prose-custom">
            <h1>{p.title}</h1>

            <p className="text-sm text-slate-500 dark:text-slate-400">
              <strong>{p.effectiveDate}</strong>: January 3, 2026 &middot;{' '}
              <strong>{p.lastUpdated}</strong>: January 3, 2026
            </p>

            <h2>{p.introduction}</h2>
            <p>{p.introText}</p>

            <h2>{p.developerInfo}</h2>
            <ul>
              <li><strong>{p.appName}</strong>: Kids Guard - Parental Control</li>
              <li><strong>{p.developerLabel}</strong>: Cristobal Buenrostro Lopez</li>
              <li>
                <strong>{p.contactEmail}</strong>:{' '}
                <a href={`mailto:${APP_META.developer.email}`}>{APP_META.developer.email}</a>
              </li>
              <li><strong>{p.appPackage}</strong>: com.kidsguard</li>
            </ul>

            <h2>{p.infoWeCollect}</h2>

            <h3>{p.infoStoredLocally}</h3>
            <p>{p.infoStoredLocallyDesc}</p>
            <ul>
              <li><strong>{p.parentPIN}</strong>: {p.parentPINDesc}</li>
              <li><strong>{p.volumeSettings}</strong>: {p.volumeSettingsDesc}</li>
              <li><strong>{p.brightnessSettings}</strong>: {p.brightnessSettingsDesc}</li>
              <li><strong>{p.adTimestamps}</strong>: {p.adTimestampsDesc}</li>
            </ul>
            <p><strong>{p.importantLocalStorage}</strong></p>

            <h3>{p.infoWeDoNotCollect}</h3>
            <p>{p.infoWeDoNotCollectDesc}</p>
            <ul>
              {p.noCollectItems.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>

            <h2>{p.thirdPartyServices}</h2>

            <h3>{p.googleAdMob}</h3>
            <p>{p.adMobDesc}</p>
            <ul>
              <li><strong>{p.deviceInfo}</strong>: {p.deviceInfoDesc}</li>
              <li><strong>{p.advertisingID}</strong>: {p.advertisingIDDesc}</li>
              <li><strong>{p.usageData}</strong>: {p.usageDataDesc}</li>
            </ul>
            <p>{p.adMobGoverned}</p>
            <ul>
              <li>
                <a href="https://policies.google.com/privacy" target="_blank" rel="noopener noreferrer">
                  {p.googlePrivacyPolicy}
                </a>
              </li>
              <li>
                <a href="https://support.google.com/admob/answer/6128543" target="_blank" rel="noopener noreferrer">
                  {p.adMobPrivacyInfo}
                </a>
              </li>
            </ul>
            <p>
              <strong>{p.adSettings}</strong>: {p.adSettingsDesc}
              <br />
              {p.adSettingsPath}
            </p>

            <h3>{p.noOtherThirdParty}</h3>
            <p>{p.noOtherThirdPartyDesc}</p>

            <h2>{p.howWeUseInfo}</h2>
            <p>{p.howWeUseInfoDesc}</p>
            <ol>
              <li>
                <strong>{p.appFunctionality}</strong>:
                <ul>
                  {p.appFuncItems.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              </li>
              <li>
                <strong>{p.noOtherPurposes}</strong>: {p.noOtherPurposesDesc}
              </li>
            </ol>

            <h2>{p.dataSecurity}</h2>
            <ul>
              <li><strong>{p.localStorage}</strong>: {p.localStorageDesc}</li>
              <li><strong>{p.pinSecurity}</strong>: {p.pinSecurityDesc}</li>
              <li><strong>{p.noTransmission}</strong>: {p.noTransmissionDesc}</li>
            </ul>

            <h2>{p.childrenPrivacy}</h2>
            <p>{p.childrenPrivacyDesc}</p>
            <ul>
              {p.childrenItems.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
            <p>{p.childrenContact}</p>

            <h2>{p.dataRetention}</h2>

            <h3>{p.localData}</h3>
            <ul>
              {p.localDataItems.map((item) => (
                <li key={item}>{item}</li>
              ))}
              <li>
                {p.deleteDataIntro}
                <ul>
                  {p.deleteDataItems.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              </li>
            </ul>

            <h3>{p.adMobData}</h3>
            <ul>
              {p.adMobDataItems.map((item) => (
                <li key={item}>{item}</li>
              ))}
              <li>
                {p.deleteGoogleData}{' '}
                <a href="https://myactivity.google.com/" target="_blank" rel="noopener noreferrer">
                  {p.myActivity}
                </a>
              </li>
            </ul>

            <h2>{p.yourRights}</h2>
            <p>{p.yourRightsDesc}</p>
            <ul>
              <li><strong>{p.access}</strong>: {p.accessDesc}</li>
              <li><strong>{p.delete}</strong>: {p.deleteDesc}</li>
              <li><strong>{p.optOut}</strong>: {p.optOutDesc}</li>
              <li><strong>{p.contactRight}</strong>: {p.contactRightDesc}</li>
            </ul>

            <h2>{p.changesToPolicy}</h2>
            <p>{p.changesToPolicyDesc}</p>

            <h2>{p.compliance}</h2>
            <p>{p.complianceDesc}</p>
            <ul>
              {p.complianceItems.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>

            <h2>{p.contactUs}</h2>
            <p>
              {p.contactUsDesc}{' '}
              <Link href="/contact" className="text-brand-primary hover:underline">
                {p.contactUsLink}
              </Link>{' '}
              {p.orEmailAt}{' '}
              <a href={`mailto:${APP_META.developer.email}`}>{APP_META.developer.email}</a>.
            </p>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              {p.responseTime}
            </p>

            <hr />

            <h2>{p.summary}</h2>
            <ul>
              <li><strong>{p.whatWeCollect}</strong>: {p.whatWeCollectDesc}</li>
              <li><strong>{p.whatWeShare}</strong>: {p.whatWeShareDesc}</li>
              <li><strong>{p.thirdParties}</strong>: {p.thirdPartiesDesc}</li>
              <li><strong>{p.yourControl}</strong>: {p.yourControlDesc}</li>
            </ul>

            <p className="text-sm text-slate-500 dark:text-slate-400 italic">
              {p.lastUpdatedNote}
            </p>
          </article>
        </div>
      </div>
    </div>
  );
}
