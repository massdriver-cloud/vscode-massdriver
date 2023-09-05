import * as vscode from 'vscode';
import * as path from 'path';
import * as fs from 'fs';
import { getApiKey } from '../settings';
import { getOrgId } from '../settings';

async function bundlePublish () {
  let editor = vscode.window.activeTextEditor;
  if (!editor) {
    return;
  }

  const apiKey = getApiKey();
  const orgId = getOrgId();
  var currentDir = path.dirname(editor.document.uri.fsPath);
  const { exec } = require('child_process');
  const command = `export MASSDRIVER_API_KEY=${apiKey} && export MASSDRIVER_ORG_ID=${orgId} && cd ${currentDir} && mass bundle publish`;
  // More JavaScript syntax, this is called "descuturing assignment"
  // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Destructuring_assignment

  if (apiKey) {
    if (orgId) {
      if (fs.existsSync(currentDir + '/massdriver.yaml')) {
        exec(command, (err: any) => {
          if (err) {
            console.error(`exec error: ${err}`);
          } else {
            vscode.window.showInformationMessage('Bundle published successfully');
          }
        });
      }
    } else if (fs.existsSync(currentDir + '/../massdriver.yaml')) {
      exec(command, (err: any) => {
        if (err) {
          console.error(`exec error: ${err}`);
        } else {
          vscode.window.showInformationMessage('Bundle published successfully');
        }
      });
    } else {
      vscode.window.showErrorMessage('No organization ID found in settings.');
    }
  } else {
    vscode.window.showErrorMessage('No API key found in settings.');
  }
};

export { 
  bundlePublish,
};