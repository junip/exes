#!/usr/bin/env node
'use strict';
// imports
const path = require('path');
const fs = require('fs');
const jq = require('node-jq')
const inquirer = require("inquirer");
const chalk = require('chalk');
const { exec } = require('child_process');


// constants
const currDir = process.cwd()
const hasYarn = fs.existsSync(path.resolve(currDir, 'yarn.lock'));
const SCRIPT_PATH =  `package.json`

let baseCommand = hasYarn ? `yarn` : `npm run`

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




function executeCommand() {
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
        let selectedCommand = answers.option.split(' ')[0]
        let command = `${baseCommand} ${selectedCommand}`
        exec(command, {
          cwd: `${currDir}`
        }, function(error, stdout, stderr) {
          if(!error) {
            console.log(`stdout: ${stdout}`);
            console.log(`stderr: ${stderr}`);
          }
          
        });
      })
    }
  }).catch((err) => {
    console.log(chalk.red(err))
  })
}

executeCommand()