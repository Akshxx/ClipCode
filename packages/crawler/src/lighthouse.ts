export interface LighthouseScores {
  performance: number;
  accessibility: number;
  bestPractices: number;
  seo: number;
  pwa: number;
}

export async function runLighthouseOnly(url: string): Promise<any> {
  return { lhr: { categories: { performance: { score: 0 }, accessibility: { score: 0 }, 'best-practices': { score: 0 }, seo: { score: 0 }, pwa: { score: 0 } } } };
}