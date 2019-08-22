'use strict';
const Generator = require('yeoman-generator');
const chalk = require('chalk');
const yosay = require('yosay');
const glob = require("glob");
const exec = require('execa');
const path = require("path");
const fs = require('fs-extra');
const prettier = require('prettier');
const sylvanas = require('sylvanas');

function globList(patternList, options) {
  let fileList = [];
  patternList.forEach(pattern => {
    fileList = [...fileList, ...glob.sync(pattern, options)];
  });

  return fileList;
}

const filterPkg = (pkgObject, ignoreList) => {
  const devObj = {};
  Object.keys(pkgObject).forEach(key => {
    const isIgnore = ignoreList.some(reg => {
      return new RegExp(reg).test(key);
    });
    if (isIgnore) {
      return;
    }
    devObj[key] = pkgObject[key];
  });
  return devObj;
};

module.exports = class extends Generator {
  constructor(opts) {
    super(opts);
    this.opts = opts;
    this.name = opts.name || "";
  }

  defaults() {
    //this.destinationRoot("d:/project/create-eleven/eleven");
  }

  prompting() {
    // Have Yeoman greet the user.
    this.log(
      yosay(`Welcome to the finest ${chalk.red('create-eleven antd')} generator!`)
    );

    const prompts = [
      {
        name: 'language',
        type: 'list',
        message: 'Which language do you want to use?',
        choices: ['TypeScript', 'JavaScript'],
      },
    ];

    return this.prompt(prompts).then(props => {
      // To access props later use this.props.someAnswer;
      this.props = props;
    });
  }

  async writing() {

    const projectName = this.name || "./";
    const projectPath = path.resolve(projectName);

    const isTypeScript = this.props.language == "TypeScript";

    const envOption = {
      cwd: projectPath
    }

    let gitArgs = ["clone", "https://github.com/ant-design/ant-design-pro.git", "--depth=1"]
    gitArgs.push(this.name);

    console.log(`${chalk.red("git")} ${chalk.blue(gitArgs.join(" "))}`)
    await exec("git", gitArgs);

    const pkg = require(path.join(projectPath, "package.json"));

    // If javascript, convert the ts to js
    if (!isTypeScript) {
      console.log('[Sylvanas] convert the tsx, ts...');
      const tsFiles = globList(['**/*.tsx', '**/*.ts'], {
        ...envOption,
        ignore: ['**/*.d.ts'],
      });
      sylvanas(tsFiles, {
        ...envOption,
        action: 'overwrite',
      });

      console.log('[JS] remove the d.ts...');
      const removeTsFiles = globList(['**/*.d.ts'], envOption);
      removeTsFiles.forEach(filePath => {
        const targetPath = path.resolve(projectPath, filePath);
        fs.removeSync(targetPath);
      });
    }

    // gen package.json
    if (pkg['create-umi']) {
      const { ignoreScript = [], ignoreDependencies = [] } = pkg['create-umi'];
      // filter scripts and devDependencies
      const projectPkg = {
        ...pkg,
        name: this.name,
        version: '1.0.0',
        scripts: filterPkg(pkg.scripts, ignoreScript),
        devDependencies: filterPkg(pkg.devDependencies, ignoreDependencies),
      };
      // remove create-umi config
      delete projectPkg['create-umi'];
      fs.writeFileSync(
        path.resolve(projectPath, 'package.json'),
        prettier.format(JSON.stringify(projectPkg), {
          parser: 'json',
        }),
      );
    }

    //remove ignore files
    if (pkg["create-umi"] && pkg["create-umi"].ignore) {
      console.log("Clean ignore files...");
      const ignoreFiles = pkg["create-umi"].ignore;
      const filesList = globList(ignoreFiles, envOption);

      filesList.forEach(file => {
        let filepath = path.resolve(projectPath, file);
        fs.removeSync(filepath);
      })

    }
  }

  install() {
    const projectName = this.name || "./";
    const projectPath = path.resolve(projectName);

    process.chdir(projectPath);
    this.installDependencies();
  }
};
