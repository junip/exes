#!/usr/bin/env node
'use strict';
// imports
const path = require('path');
const fs = require('fs');
const jq = require('node-jq')
const inquirer = require("inquirer");
const chalk = require('chalk');
const { spawn } = require('child_process');
let currentCommand;

// constants
const currDir = process.cwd()
const hasYarn = fs.existsSync(path.resolve(currDir, 'yarn.lock'));
const SCRIPT_PATH =  `package.json`

let baseCommand = hasYarn ? `yarn` : `npm run`

/**
 * Returns the available scripts from 'package.json'
 * @returns array of strings ['dev dev-script', 'build build-script']
 */
function getScripts() {
  return new Promise((resolve, reject) => {
    jq.run('.scripts', SCRIPT_PATH, {})
    .then((output) => {
      if(output) {
        let parsedOutput = JSON.parse(output),
        availableScripts = Object.keys(parsedOutput).map(key => {
          return `${key} ${chalk.dim(parsedOutput[key])}`
        })
        return resolve(availableScripts);
      } else {
        reject('The file `package.json` is not found"');
      }
    }).catch((err) => {
      reject('The file `package.json` is not found"');
    })
  })
}

/**
 * Question Prompt to Select the commands
 * @returns 
 */
function promptCommands() {
  return new Promise((resolve, reject) => {
    getScripts().then((scripts) => {
      if(scripts) {
        inquirer.prompt([
          {
            type: 'list',
            name: 'option',
            message: 'Select any scripts you want to run?',
            choices: scripts
          }
        ]).then(answers => {
          return resolve(answers.option.split(' ')[0]);
        })
      }
    }).catch((err) => {
      reject(err);
    })
  })
}


/**
 * Execute the selected command 
 * - The spawn() function executes a command in a new process. 
 * - This function uses a Stream API, so its output of the command is made available via listeners.
 */
function executeCommand() {
  promptCommands().then((script) => {
    let executableCommand = `${baseCommand} ${script}`,
    // ['npm', 'run', 'dev'] 
    // spawn('npm', ['run', 'dev'])
    splitted = executableCommand.split(' '),
    command = spawn(`${splitted[0]}`, splitted.splice(1, splitted.length - 1))
    command.stdout.on('data', (data) => {
      console.log(`${data}`);
    });
  }).catch((err) => {
    console.log(chalk.red(err))
  })
}

executeCommand()