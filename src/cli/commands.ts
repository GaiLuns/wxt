import cac from 'cac';
import { build, clean, createServer, initialize, prepare, zip } from '~/core';
import {
  createAliasedCommand,
  getArrayFromFlags,
  wrapAction,
} from './cli-utils';

const cli = cac('wxt');

cli.option('--debug', 'enable debug mode');

// DEV
cli
  .command('[root]', 'start dev server')
  .option('-c, --config <file>', 'use specified config file')
  .option('-m, --mode <mode>', 'set env mode')
  .option('-b, --browser <browser>', 'specify a browser')
  .option(
    '-e, --filter-entrypoint <entrypoint>',
    'only build specific entrypoints',
    {
      type: [],
    },
  )
  .option('--mv3', 'target manifest v3')
  .option('--mv2', 'target manifest v2')
  .action(
    wrapAction(async (root, flags) => {
      const server = await createServer({
        root,
        mode: flags.mode,
        browser: flags.browser,
        manifestVersion: flags.mv3 ? 3 : flags.mv2 ? 2 : undefined,
        configFile: flags.config,
        debug: flags.debug,
        filterEntrypoints: getArrayFromFlags(flags, 'filterEntrypoint'),
      });
      await server.start();
      return { isOngoing: true };
    }),
  );

// BUILD
cli
  .command('build [root]', 'build for production')
  .option('-c, --config <file>', 'use specified config file')
  .option('-m, --mode <mode>', 'set env mode')
  .option('-b, --browser <browser>', 'specify a browser')
  .option(
    '-e, --filter-entrypoint <entrypoint>',
    'only build specific entrypoints',
    {
      type: [],
    },
  )
  .option('--mv3', 'target manifest v3')
  .option('--mv2', 'target manifest v2')
  .option('--analyze', 'visualize extension bundle')
  .action(
    wrapAction(async (root, flags) => {
      await build({
        root,
        mode: flags.mode,
        browser: flags.browser,
        manifestVersion: flags.mv3 ? 3 : flags.mv2 ? 2 : undefined,
        configFile: flags.config,
        debug: flags.debug,
        analysis: flags.analyze ? { enabled: true } : undefined,
        filterEntrypoints: getArrayFromFlags(flags, 'filterEntrypoint'),
      });
    }),
  );

// ZIP
cli
  .command('zip [root]', 'build for production and zip output')
  .option('-c, --config <file>', 'use specified config file')
  .option('-m, --mode <mode>', 'set env mode')
  .option('-b, --browser <browser>', 'specify a browser')
  .option('--mv3', 'target manifest v3')
  .option('--mv2', 'target manifest v2')
  .action(
    wrapAction(async (root, flags) => {
      await zip({
        root,
        mode: flags.mode,
        browser: flags.browser,
        manifestVersion: flags.mv3 ? 3 : flags.mv2 ? 2 : undefined,
        configFile: flags.config,
        debug: flags.debug,
      });
    }),
  );

// PREPARE
cli
  .command('prepare [root]', 'prepare typescript project')
  .option('-c, --config <file>', 'use specified config file')
  .action(
    wrapAction(async (root, flags) => {
      await prepare({
        root,
        configFile: flags.config,
        debug: flags.debug,
      });
    }),
  );

// CLEAN
cli
  .command('clean [root]', 'clean generated files and caches')
  .alias('cleanup')
  .action(
    wrapAction(async (root, flags) => {
      await clean(root);
    }),
  );

// INIT
cli
  .command('init [directory]', 'initialize a new project')
  .option('-t, --template <template>', 'template to use')
  .option('--pm <packageManager>', 'which package manager to use')
  .action(
    wrapAction(
      async (directory, flags) => {
        await initialize({
          directory,
          template: flags.template,
          packageManager: flags.pm,
        });
      },
      { disableFinishedLog: true },
    ),
  );

// SUBMIT
createAliasedCommand(
  cli,
  'submit',
  'publish-extension',
  'https://www.npmjs.com/publish-browser-extension',
);

export default cli;
