import * as vscode from 'vscode';
import * as path from 'path';
import * as fs from 'fs';
import { getToken } from '../settings';
import { exec } from 'child_process';

function bundleBuild() {
  const editor = vscode.window.activeTextEditor;
  if (!editor) {
    return;
  }

  const token = getToken();
  const currentDir = path.dirname(editor.document.uri.fsPath);

  if (token) {
    if (fs.existsSync(currentDir + '/massdriver.yaml')) {
      exec(`export MASSDRIVER_API_KEY=${token} && cd ${currentDir} && mass bundle build`, (err: Error | null) => {
        if (err) {
          console.error(`exec error: ${err.message}`);
        } else {
          vscode.window.showInformationMessage('Bundle built successfully');
        }
      });
    } else if (fs.existsSync(currentDir + '/../massdriver.yaml')) {
      exec(`cd ${currentDir} && cd .. && export MASSDRIVER_API_KEY=${token} && mass bundle build`, (err: Error | null) => {
        if (err) {
          console.error(`exec error: ${err.message}`);
        } else {
          vscode.window.showInformationMessage('Bundle built successfully');
        }
      });
    } else {
      vscode.window.showErrorMessage('massdriver.yaml not found in the current directory');
    }
  }
}

export {
  bundleBuild,
};
