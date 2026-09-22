import { Command } from 'commander';
import { Panel, info } from '../ui/Spinner';
import chalk from 'chalk';

export const templatesCommand = new Command('templates')
  .description('List available templates')
  .action(() => {
    console.log(info('Available Templates', [
      `${chalk.cyan('social-30s')} - Vertical 9:16, 30 seconds (Free)`,
      `  Perfect for Reels, TikTok, Shorts`,
      `  Scenes: Hook → Reveal → Features → Demo → CTA`,
    ]));
  });