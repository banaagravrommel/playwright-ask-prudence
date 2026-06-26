export function getTestCredentials() {
  const email = process.env.PRUDENS_TEST_EMAIL ?? 'rav@hubstart.io';
  const password = process.env.PRUDENS_TEST_PASSWORD ?? 'password';

  if (process.env.CI && (!process.env.PRUDENS_TEST_EMAIL || !process.env.PRUDENS_TEST_PASSWORD)) {
    throw new Error(
      'Missing PRUDENS_TEST_EMAIL or PRUDENS_TEST_PASSWORD GitHub Actions secrets.'
    );
  }

  return { email, password };
}
