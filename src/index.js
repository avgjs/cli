#!/usr/bin/env node

require('colors');
const program = require('commander');
const fs = require('fs-extra');
const path = require('path');
const inquirer = require('inquirer');
const ora = require('ora');
const execa = require('execa');
const fetch = require('node-fetch');
const targz = require('tar.gz2');
const packageNameValidate = require('validate-npm-package-name');
const logger = require('./utils/logger');
const convertImage = require('./mods/convertImage');
const convertAudio = require('./mods/convertAudio');
const processScript = require('./mods/processScript');
const processMain = require('./mods/processMain');

const package_url = 'https://api.github.com/repos/avgjs/template/releases/latest';

program
  .version('0.0.1')
  .usage('<command> [options]');

program
  .command('create [name]')
  .description('create new project')
  .option('-p, --pkg package_url', 'specific package url', package_url)
  .action(async (name, options) => {
    // logger.debug(name)
    const { projectName, gameName } = await inquirer.prompt([{
      type: 'input',
      name: 'projectName',
      message: 'What\'s your project name?',
      validate: input => {
        const { validForNewPackages, errors } = packageNameValidate(input);
        if (validForNewPackages) {
          return true;
        } else {
          return errors.join('\n');
        }
      },
      default: name || 'mygame'
    }, {
      type: 'input',
      name: 'gameName',
      message: 'What\'s your game name?',
      default: 'My Game'
    }]);

    const targetPath = path.resolve(process.cwd(), projectName);

    const pathExist = fs.existsSync(targetPath);

    if (pathExist) {
      logger.errorln(`The directory ${targetPath} already exists`);
      process.exit(0);
    }

    const { confirmed } = await inquirer.prompt({
      type: 'confirm',
      name: 'confirmed',
      message: `Your game project will be created at ${targetPath}\ncontinue?`,
      default: true
    });

    if (!confirmed) {
      process.exit(0);
    }

    logger.infoln('Please make sure you have access to github.com to download the latest template package')

    let spinner = ora('Downloading the latest template...').start();

    const obj = await fetch(package_url).then(res => res.json());

    const tarballName = path.resolve(process.cwd(), `${Math.random().toString(36).substr(2)}.tar.gz`);

    await fetch(obj.tarball_url)
    .then(res => {
      const writeStream = fs.createWriteStream(tarballName);
      return new Promise((resolve, reject) => {
        res.body.pipe(writeStream);
        res.body.on('end', resolve);
        res.body.on('error', reject);
      });
    });
    spinner.succeed();

    spinner = ora('Unzipping...').start();

    // const tarball = fs.createReadStream(tarballName);
    await targz({}, { strip: 1 }).extract(tarballName, path.resolve(process.cwd(), projectName));

    // tarball.pipe(dest);

    // await new Promise((resolve, reject) => {
    //   dest.on('end', resolve);
    //   dest.on('error', reject);
    //   tarball.on('error', reject);
    // });

    fs.removeSync(tarballName);

    spinner.succeed();

    spinner = ora('Initializing...').start();

    const packageData = fs.readJSONSync(path.resolve(targetPath, 'package.json'));
    packageData.name = projectName;
    fs.writeJSONSync(path.resolve(targetPath, 'package.json'), packageData);

    const manifestData = fs.readJSONSync(path.resolve(targetPath, 'manifest.json'));
    manifestData.name = gameName;
    fs.writeJSONSync(path.resolve(targetPath, 'manifest.json'), manifestData);

    let htmlData = fs.readFileSync(path.resolve(targetPath, 'index.html'), 'utf8');
    htmlData = htmlData.replace(/<title>.+?<\/title>/, `<title>${gameName}</title>`);
    htmlData = htmlData.replace(/<meta name="application-name" content=".+?">/, `<meta name="application-name" content="${gameName}">`);
    fs.writeFileSync(path.resolve(targetPath, 'index.html'), htmlData, 'utf8');

    await execa('npm', ['install'], {
      cwd: targetPath
    });

    spinner.succeed();

    logger.successln(`Your project has been created!`);
    logger.successln(`Run \`cd ${projectName} && npm run dev\` to have a quick look.`);
    // logger.debugln(projectName, gameName)
  });

program
  .command('dev')
  .description('open real-time development server')
  .option('-p, --port [port]', null, 2333)
  .option('-i, --ip [address]', null, '127.0.0.1')
  .action((options) => {
    const stream = execa('npm', ['run dev'])
    stream.stdout.pipe(process.stdout);
    stream.stderr.pipe(process.stderr);
    process.stdin.pipe(stream.stdin);
  });

program
  .command('publish')
  .description('Publish your game')
  .action(async (options) => {
    const { confirmEmptyDist } = await inquirer.prompt({
      type: 'confirm',
      name: 'confirmEmptyDist',
      message: `The publishing is going on, the directory ${path.resolve(process.cwd(), 'dist')} will be cleared, continue?`,
      default: false
    });
    
    if (confirmEmptyDist) {
      fs.emptyDirSync(path.resolve(process.cwd(), 'dist'));

      await convertImage(process.cwd());
      await convertAudio(process.cwd());
      await processScript(process.cwd());
      await processMain(process.cwd());
    }
    // devServer(process.cwd());
  });

program
  .command('build <platform>')
  .description('build package for distribution')
  .option('-r, --release', null, false)
  .option('-e, --exclude', null, null)
  .action((platform, options) => {
    if (['android', 'ios', 'windows', 'macos'].includes(platform.toLowerCase())) {
      logger.debugln(`平台: ${platform}, 排除: ${options.exclude}, 发布版: ${options.release}`)
    } else {
      logger.errorln(`Unrecognized platform '${platform}'`);
    }
  });

program
  .command('convert-image')
  .description('convert&optimize images to proper format')
  .action((platform, options) => {
    convertImage(process.cwd());
  });
program
  .command('convert-audio')
  .description('convert&optimize audio to proper format')
  .action((platform, options) => {
    convertAudio(process.cwd());
  });
program
  .command('process-script')
  .description('process script files, including generating .bkc files from .bks files')
  .action((platform, options) => {
    processScript(process.cwd());
  });
program
  .command('process-main')
  .description('build main program and copy them to dist folder, as well as index.html')
  .action((platform, options) => {
    processMain(process.cwd());
  });


program.parse(process.argv);
