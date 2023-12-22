import * as vscode from 'vscode';
import * as fs from 'fs';
import { getToken } from '../settings';
import { getOrgId } from '../settings';
import { exec } from 'child_process';

function bundleBuild() {
  const token = getToken();
  const orgId = getOrgId();

  const workspaceFolders = vscode.workspace.workspaceFolders;
  if (!workspaceFolders || workspaceFolders.length === 0) {
    vscode.window.showErrorMessage('No workspace folder opened.');
    return;
  }
  const firstWorkspaceFolder = workspaceFolders[0];
  const currentDir = firstWorkspaceFolder.uri.fsPath;
  
  const command = `export MASSDRIVER_API_KEY=${token} && export MASSDRIVER_ORG_ID=${orgId} && cd ${currentDir} && mass bundle build`

  if (token) {
    if (orgId) {
      if (fs.existsSync(currentDir + '/massdriver.yaml')) {
        exec(command, (err: Error | null) => {
          if (err) {
            console.error(`exec error: ${err.message}`);
          } else {
            vscode.window.showInformationMessage('Bundle built successfully');
          }
        });
      } else if (fs.existsSync(currentDir + '/../massdriver.yaml')) {
        exec(`cd ${currentDir} && cd .. && ${command}`, (err: Error | null) => {
          if (err) {
            console.error(`exec error: ${err.message}`);
          } else {
            vscode.window.showInformationMessage('Bundle built successfully');
          }
        });
      } else {
        vscode.window.showErrorMessage('massdriver.yaml not found in the current directory');
      }
    } else {
      vscode.window.showErrorMessage('No organization ID found in settings.');
    }
  } else {
    vscode.window.showErrorMessage('No API key found in settings.');
  }
}

export {
  bundleBuild,
};
