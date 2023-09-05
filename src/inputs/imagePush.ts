import * as vscode from 'vscode';

async function imageInfo() {
  const imageNamespace = await vscode.window.showInputBox({
    title: 'Image Namespace',
    prompt: 'Enter a namespace for your image',
    ignoreFocusOut: true,
    placeHolder: 'my_namespace'
  });

  if (!imageNamespace) {
    throw new Error('Operation cancelled.');
  }

  const imageName = await vscode.window.showInputBox({
    title: 'Image Name',
    prompt: 'Enter a name for your image',
    ignoreFocusOut: true,
    placeHolder: 'my_image'
  });

  if (!imageName) {
    throw new Error('Operation cancelled.');
  }

  const imageTag = await vscode.window.showInputBox({
    title: 'Image Tag',
    prompt: 'Enter a tag for your image',
    ignoreFocusOut: true,
    placeHolder: 'latest'
  });

  if (!imageTag) {
    throw new Error('Operation cancelled.');
  }

  const imageRegion = await vscode.window.showInputBox({
    title: 'Image Region',
    prompt: 'Enter a region for your image',
    ignoreFocusOut: true,
    placeHolder: 'us-east-1'
  });

  if (!imageRegion) {
    throw new Error('Operation cancelled.');
  }

  const imageArtifactId = await vscode.window.showInputBox({
    title: 'Image Artifact ID',
    prompt: 'Enter your Massdriver cloud credential artifact ID',
    ignoreFocusOut: true,
    placeHolder: 'Copy ID button on artifact page',
  });

  if (!imageArtifactId) {
    throw new Error('Operation cancelled.');
  }

  return {
    imageNamespace,
    imageName,
    imageTag,
    imageRegion,
    imageArtifactId
  };
}

export {
  imageInfo
};