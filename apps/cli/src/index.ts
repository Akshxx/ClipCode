#!/usr/bin/env node

import { program } from 'commander';
import { generateCommand } from './commands/generate';
import { initCommand } from './commands/init';
import { templatesCommand } from './commands/templates';
import { version } from '../package.json';

program
  .name('clipcode')
  .description('Turn any repo into a launch video. One command. 30 seconds. Free forever.')
  .version(version);

program.addCommand(generateCommand);
program.addCommand(initCommand);
program.addCommand(templatesCommand);

program.parseAsync(process.argv).catch((err) => {
  console.error(err);
  process.exit(1);
});