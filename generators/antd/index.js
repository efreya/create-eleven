'use strict';
const Generator = require('yeoman-generator');
const chalk = require('chalk');
const yosay = require('yosay');
const glob = require("glob");
const exec = require('execa');

module.exports = class extends Generator {
  constructor(opts) {
    super(opts);
    this.opts = opts;
    this.name = opts.name || "";
  }

  defaults() {
    this.destinationRoot("d:/project/create-eleven/eleven");
  }

  prompting() {
    // Have Yeoman greet the user.
    this.log(
      yosay(`Welcome to the finest ${chalk.red('generator-create-eleven')} generator!`)
    );

    const prompts = [
      {
        type: 'confirm',
        name: 'someAnswer',
        message: 'Would you like to enable this option?',
        default: true
      }
    ];

    return this.prompt(prompts).then(props => {
      // To access props later use this.props.someAnswer;
      this.props = props;
    });
  }

  async writing() {

    let gitArgs = ["clone", "https://github.com/ant-design/ant-design-pro.git", "--depth=1"]

    gitArgs.push(this.name);

    console.log(`${chalk.red("git")} ${chalk.blue(gitArgs.join(" "))}`)

    await exec("git", gitArgs);



  }

  install() {
    //this.installDependencies();
  }
};
