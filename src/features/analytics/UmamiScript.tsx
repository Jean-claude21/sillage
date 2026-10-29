/**
 * Umami Cloud's tracker, only when a website id is configured and only on the shop's own domain
 * (previews and localhost are not counted). No cookies: no consent banner needed.
 */
export function UmamiScript() {
  const website = import.meta.env.VITE_UMAMI_WEBSITE_ID as string | undefined;
  if (!website) return null;
  const host = ((import.meta.env.VITE_UMAMI_HOST as string | undefined) ?? 'https://cloud.umami.is').replace(/\/$/, '');
  const domains = import.meta.env.VITE_UMAMI_DOMAINS as string | undefined;
  return (
    <script
      defer
      src={`${host}/script.js`}
      data-website-id={website}
      {...(domains ? { 'data-domains': domains } : {})}
      data-exclude-search="false"
      data-do-not-track="true"
    />
  );
}
