import { env } from './config/env';

/**
 * Fails the whole run with one clear message when the app is not running, instead of every
 * test failing with "connection refused".
 */
export default async function globalSetup(): Promise<void> {
  const url = `${env.apiUrl}/tags`;
  try {
    const response = await fetch(url, { signal: AbortSignal.timeout(5000) });
    if (response.ok) return;
    throw new Error(`HTTP ${response.status}`);
  } catch (error) {
    throw new Error(
      `Application under test is not available at ${url} (${String(error)}).\n` +
        'Start it with `npm run env:up`, or set BASE_URL / API_URL to a running instance.',
    );
  }
}
