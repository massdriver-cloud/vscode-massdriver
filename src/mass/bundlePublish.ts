import * as vscode from 'vscode';
import * as path from 'path';
import * as fs from 'fs';
import { getToken } from '../settings';
import { getOrgId } from '../settings';
import { exec } from 'child_process';

async function bundlePublish () {
  const editor = vscode.window.activeTextEditor;
  if (!editor) {
    return;
  }

  const token = getToken();
  const orgId = getOrgId();
  const currentDir = path.dirname(editor.document.uri.fsPath);
  const command = `export MASSDRIVER_API_KEY=${token} && export MASSDRIVER_ORG_ID=${orgId} && cd ${currentDir} && mass bundle publish`;

  if (token) {
    if (orgId) {
      if (fs.existsSync(currentDir + '/massdriver.yaml')) {
        exec(command, (err: Error | null) => {
          if (err) {
            console.error(`exec error: ${err}`);
          } else {
            vscode.window.showInformationMessage('Bundle published successfully');
          }
        });
      }
    } else if (fs.existsSync(currentDir + '/../massdriver.yaml')) {
      exec(command, (err: Error | null) => {
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
}

export { 
  bundlePublish,
};