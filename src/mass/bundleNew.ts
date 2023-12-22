import * as vscode from 'vscode';
import { getToken } from '../settings';
import { getOrgId } from '../settings';
import { newBundleInfo } from '../inputs/bundleNew';
import { exec } from 'child_process';

async function bundleNew () {
  const token = getToken();
  const orgId = getOrgId();

  const workspaceFolders = vscode.workspace.workspaceFolders;
  if (!workspaceFolders || workspaceFolders.length === 0) {
    vscode.window.showErrorMessage('No workspace folder opened.');
    return;
  }
  const firstWorkspaceFolder = workspaceFolders[0];
  const currentDir = firstWorkspaceFolder.uri.fsPath;

  const {
    bundleName,
    bundleDescription,
    bundleTemplate,
    connectionList,
    bundleOutputDirectory,
  } = await newBundleInfo();

  if (token) {
    if (orgId) {
      exec(`export MASSDRIVER_API_KEY=${token} && export MASSDRIVER_ORG_ID=${orgId} && cd ${currentDir} && mass bundle new -n "${bundleName}" -d "${bundleDescription}" -t ${bundleTemplate} -c "${connectionList}" -o "./${bundleOutputDirectory}"`, (err: Error | null) => {
        if (err) {
          console.error(`exec error: ${err}`);
        } else {
          vscode.window.showInformationMessage('Bundle created successfully');
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
  bundleNew,
};