import { Command } from 'commander';
import { writeFileSync, mkdirSync, existsSync } from 'fs';
import { join } from 'path';
import chalk from 'chalk';
import { Panel, info } from '../ui/Spinner';

export const initCommand = new Command('init')
  .description('Initialize ClipCode in the current repository')
  .option('-y, --yes', 'Skip prompts and use defaults')
  .action(async (options) => {
    const workflowDir = join(process.cwd(), '.github', 'workflows');
    const workflowPath = join(workflowDir, 'clipcode.yml');

    if (existsSync(workflowPath) && !options.yes) {
      const prompts = await import('prompts');
      const { overwrite } = await prompts.default({
        type: 'confirm',
        name: 'overwrite',
        message: 'GitHub Action workflow already exists. Overwrite?',
        initial: false,
      });
      if (!overwrite) {
        console.log(info('Skipped', ['Workflow file already exists']));
        return;
      }
    }

    const workflow = `# ClipCode - Generate launch video on release
name: ClipCode
on:
  release:
    types: [published]
  workflow_dispatch:

jobs:
  generate:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: clipcode/action@v1
        with:
          template: social-30s
      - uses: actions/upload-artifact@v4
        with:
          name: launch-video
          path: clipcode-output/*.mp4
`;

    mkdirSync(workflowDir, { recursive: true });
    writeFileSync(workflowPath, workflow);

    console.log(info('Initialized!', [
      `Created ${chalk.cyan('.github/workflows/clipcode.yml')}`,
      `Push a release to trigger video generation`,
      `Or run ${chalk.cyan('npx clipcode generate')} locally`,
    ]));
  });