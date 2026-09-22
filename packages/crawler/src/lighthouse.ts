export async function runLighthouseOnly(url: string) {
  const lighthouse = (await import('lighthouse')).default;
  const { launch } = await import('chrome-launcher');

  const chrome = await launch({
    chromeFlags: ['--headless', '--no-sandbox', '--disable-gpu'],
  });

  try {
    const lighthouse = (await import('lighthouse')).default;
    const runnerResult = await lighthouse(url, {
      port: chrome.port,
      onlyCategories: ['performance', 'accessibility', 'best-practices', 'seo', 'pwa'],
      output: 'json',
      logLevel: 'error',
    });

    return runnerResult?.lhr ?? null;
  } finally {
    await chrome.kill();
  }
}