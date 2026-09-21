import { Command } from 'commander';
import { Panel } from '../ui/Panel';
import chalk from 'chalk';

export const templatesCommand = new Command('templates')
  .description('List available templates')
  .action(() => {
    console.log(Panel.info('Available Templates', [
      `${chalk.cyan('social-30s')} - Vertical 9:16, 30 seconds (Free)`,
      `  Perfect for Reels, TikTok, Shorts`,
      `  Scenes: Hook → Reveal → Features → Demo → CTA`,
    ]));
  });