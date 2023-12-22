import * as vscode from 'vscode';
import * as fs from 'fs';
import { getToken } from '../settings';
import { getOrgId } from '../settings';
import { imageInfo } from '../inputs/imagePush';

async function imagePush () {
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
    imageNamespace,
    imageName,
    imageRegion,
    imageArtifactId,
    imageTag,
  } = await imageInfo();

  if (token) {
    if (orgId) {
      const command = `export MASSDRIVER_API_KEY=${token} && export MASSDRIVER_ORG_ID=${orgId} && cd ${currentDir} && mass image push ${imageNamespace}/${imageName} -r ${imageRegion} -a ${imageArtifactId} -t ${imageTag}`;
      if (fs.existsSync(currentDir + '/Dockerfile')) {
          const terminal = vscode.window.createTerminal({ name: 'Image push' });
          terminal.show();
              
          terminal.sendText(command);
      } else if (fs.existsSync(currentDir + '/../Dockerfile')) {
          const terminal = vscode.window.createTerminal({ name: 'Image push' });
          terminal.show();
              
          terminal.sendText(command);
      } else {
        vscode.window.showErrorMessage('No massdriver.yaml file found in current directory.');
      }
    } else {
      vscode.window.showErrorMessage('No organization ID found in settings.');
    }
  } else {
    vscode.window.showErrorMessage('No API key found in settings.');
  }
}

export { 
  imagePush,
};