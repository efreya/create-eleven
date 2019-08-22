'use strict';
const Generator = require('yeoman-generator');
const chalk = require('chalk');
const yosay = require('yosay');
const glob = require("glob");
const { statSync, existsSync } = require("fs");
const path = require("path");

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
      yosay(`Welcome to the finest ${chalk.red('create-eleven')} generator!`)
    );

    const prompts = [
      {
        name: 'isTypeScript',
        type: 'confirm',
        message: 'Do you want to use typescript?',
        default: false,
      },
      {
        name: 'reactFeatures',
        message: 'What functionality do you want to enable?',
        type: 'checkbox',
        choices: [
          { name: 'antd', value: 'antd' },
          { name: 'dva', value: 'dva' },
          { name: 'code splitting', value: 'dynamicImport' },
          { name: 'dll', value: 'dll' },
          { name: 'internationalization', value: 'locale' },
        ],
      },
    ];

    return this.prompt(prompts).then(props => {
      // To access props later use this.props.someAnswer;
      this.props = props;
    });
  }

  writing() {
    const context = {
      name: this.name,
      ...this.props
    }

    const isTsFile = (f) => {
      return f.endsWith(".ts") || f.endsWith(".tsx") || ["tsconfig.json", "tslint.yml"].includes(f)
    }

    const dstFiles = glob.sync("**/*", {
      cwd: this.templatePath(),
      dot: true
    }).filter(f => {
      const { isTypeScript, reactFeatures } = this.props;
      if (isTypeScript) {
        if (f.endsWith(".js")) {
          return false;
        }
      } else {
        if (isTsFile(f)) {
          return false;
        }
      }

      if (!reactFeatures.includes("dva")) {
        if (f.startsWith("src/models")) {
          return false;
        }
      }

      if (!reactFeatures.includes("locale")) {
        if (f.startsWith("src/locales")) {
          return false;
        }
      }

      return true;

    });

    dstFiles.forEach(f => {

      const filePath = this.templatePath(f);
      if (statSync(filePath).isFile()) {
        this.fs.copyTpl(
          this.templatePath(f),
          this.destinationPath(f.replace(/^_/, ".")),
          context
        )
      }
    })

  }

  install() {
    const projectName = this.name || "./";
    const projectPath = path.resolve(projectName);

    process.chdir(projectPath);
    this.installDependencies();
  }
};
