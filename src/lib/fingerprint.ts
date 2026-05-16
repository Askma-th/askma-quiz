/**
 * Generate an anonymous browser fingerprint hash.
 * Uses non-identifying browser characteristics: timezone, language, screen,
 * platform — combined and hashed via SHA-256.
 *
 * NOT a perfect identifier — just enough to prevent same browser from
 * voting multiple times on same quiz. Different devices = different fingerprints.
 */
export async function generateFingerprint(): Promise<string> {
  const components = [
    navigator.userAgent,
    navigator.language,
    new Date().getTimezoneOffset().toString(),
    screen.width + 'x' + screen.height,
    screen.colorDepth.toString(),
    navigator.platform || 'unknown',
    navigator.hardwareConcurrency?.toString() || '0',
  ];

  const text = components.join('|');
  const encoder = new TextEncoder();
  const data = encoder.encode(text);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');

  return hashHex.substring(0, 16);
}

/**
 * Get the referrer URL (the site that linked the user here).
 * Returns null if direct visit or referrer hidden.
 */
export function getReferrer(): string | null {
  if (typeof document === 'undefined') return null;
  const ref = document.referrer;
  if (!ref) return null;
  try {
    const url = new URL(ref);
    return url.hostname;
  } catch {
    return null;
  }
}
