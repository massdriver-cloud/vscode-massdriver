import * as vscode from 'vscode';
import * as path from 'path';
import * as fs from 'fs';
import { getToken } from '../settings';

function bundleBuild () {
  let editor = vscode.window.activeTextEditor;
  if (!editor) {
    return;
  }

  const token = getToken();
  var currentDir = path.dirname(editor.document.uri.fsPath);
  const { exec } = require('child_process');

  if (token) {
    if (fs.existsSync(currentDir + '/massdriver.yaml')) {
      exec(`export MASSDRIVER_API_KEY=${token} && cd ${currentDir} && mass bundle build`, (err: any, stdout: any, stderr: any) => {
        if (err) {
          console.error(`exec error: ${err}`);
        } else {
          vscode.window.showInformationMessage('Bundle built successfully');
        }
      });
    } else if (fs.existsSync(currentDir + '/../massdriver.yaml')) {
      exec(`cd ${currentDir} && cd .. && export MASSDRIVER_API_KEY=${token} && mass bundle build`, (err: any, stdout: any, stderr: any) => {
        if (err) {
          console.error(`exec error: ${err}`);
        } else {
          vscode.window.showInformationMessage('Bundle built successfully');
        }
      });
    } else {
      vscode.window.showErrorMessage('massdriver.yaml not found in current directory');
    }
  } else {
  }
};

export { 
  bundleBuild,
};