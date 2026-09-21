export async function runLighthouseOnly(url: string) {
  const lighthouse = (await import('lighthouse')).default;
  const chromeLauncher = (await import('chrome-launcher')).default;

  const chrome = await chromeLauncher.launch({
    chromeFlags: ['--headless', '--no-sandbox', '--disable-gpu'],
  });

  try {
    const runnerResult = await lighthouse(url, {
      port: chrome.port,
      onlyCategories: ['performance', 'accessibility', 'best-practices', 'seo', 'pwa'],
      output: 'json',
      logLevel: 'error',
    });

    return runnerResult.lhr;
  } finally {
    await chrome.kill();
  }
}