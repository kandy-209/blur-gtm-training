/**
 * Google Search Console Verification
 * 
 * To verify your site:
 * 1. Go to https://search.google.com/search-console
 * 2. Add property: blursalestrainer.com (or your Browserbase domain)
 * 3. Choose "HTML tag" verification method
 * 4. Copy the content value from the meta tag
 * 5. Add it as an environment variable: GOOGLE_SITE_VERIFICATION
 * 6. Or replace the placeholder below with your verification code
 */

export default function GoogleSiteVerification() {
  const verificationCode = process.env.GOOGLE_SITE_VERIFICATION || '';
  
  if (!verificationCode) {
    return null;
  }

  return (
    <meta
      name="google-site-verification"
      content={verificationCode}
    />
  );
}

