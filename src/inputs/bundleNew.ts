import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';
import * as os from 'os';
import { ApolloClient, InMemoryCache, gql } from '@apollo/client/core';
import { getOrgId } from '../settings';
import { getToken } from '../settings';
import { exec } from 'child_process';

// fetches list of artifact definitions and returns an array of artifact names
async function fetchArtifactNames(organizationId: string | undefined): Promise<string[]> {
  interface ArtifactDefinition {
    name: string;
  }
  
  const gql_uri = 'https://api.massdriver.cloud/api/graphql';
  const client = new ApolloClient({
    cache: new InMemoryCache(),
    uri: gql_uri,
    headers: {
      Authorization: `Bearer ${getToken()}`,
    }
  });
  
  const getArtifactDefinitions = gql`
    query GetArtifactDefinitions($organizationId: ID!) {
      artifactDefinitions(organizationId: $organizationId) {
        name
      }
    }`;

  try {
    const { data } = await client.query({
      query: getArtifactDefinitions,
      variables: { organizationId },
    });

    const artifactDefinitions: ArtifactDefinition[] = data.artifactDefinitions;

    const artifactNames: string[] = artifactDefinitions.map((artifact) => artifact.name);
    artifactNames.sort();

    // filter out api and draft-node artifact definitions
    const filteredNames = artifactNames.filter((name) => {
      return !["massdriver/api", "massdriver/draft-node"].includes(name);
    });

    return filteredNames;
  } catch (error) {
    console.error('Error fetching artifact names:', error);
    throw error;
  }
}

// fetches list of bundle templates and returns an array of template names
async function bundleTemplateList(): Promise<string[]> {
  const editor = vscode.window.activeTextEditor;
  if (!editor) {
    return [];
  }

  const templateDir = path.join(os.homedir(), '.massdriver', 'massdriver-cloud', 'application-templates');

  return new Promise((resolve, reject) => {
    exec(`mass bundle template refresh`, async (err: Error | null) => {
      if (err) {
        console.error(`exec error: ${err.message}`);
      } else {
        vscode.window.showInformationMessage('Bundle templates refreshed successfully');

        try {
          const templateFiles = await fs.promises.readdir(templateDir);

          const templateDirectories = templateFiles.filter((file) =>
            fs.statSync(path.join(templateDir, file)).isDirectory() && file !== '.git'
          );

          resolve(templateDirectories);
        } catch (error) {
          console.error('Error fetching bundle templates:', error);
          reject(error);
        }
      }
    });
  });
}

async function newBundleInfo() {
  // set bundle name
  const bundleName = await vscode.window.showInputBox({
    title: 'Bundle Name',
    prompt: 'Enter the name of the new bundle',
    ignoreFocusOut: true,
    placeHolder: 'aws-s3-bucket'
  });

  if (!bundleName) {
    throw new Error('Operation cancelled.');
  }

  // set bundle description
  const bundleDescription = await vscode.window.showInputBox({
    title: 'Bundle Description',
    prompt: 'Enter a description for the new bundle',
    ignoreFocusOut: true,
    placeHolder: 'AWS S3 bucket for storing files'
  });

  if (!bundleDescription) {
    throw new Error('Operation cancelled.');
  }

  const templateList = await bundleTemplateList();

  if (!templateList) {
    throw new Error('No templates found.');
  }

  // select bundle template
  const bundleTemplate = await vscode.window.showQuickPick(templateList, {
    title: 'Bundle Template',
    ignoreFocusOut: true,
    placeHolder: 'Select your application template',
  });

  if (!bundleTemplate) {
    throw new Error('Operation cancelled.');
  }

  // select connections
  const organizationId = getOrgId();
  const filteredNames = await fetchArtifactNames(organizationId);

  const selectedConnections = await vscode.window.showQuickPick(filteredNames, {
    title: 'Select connections to add to bundle',
    ignoreFocusOut: true,
    canPickMany: true,
    placeHolder: 'Optional'
  });

  if (!selectedConnections) {
    throw new Error('Operation cancelled.');
  }

  const connectionPairs: string[] = [];

  // set connection names to match selected connections
  for (const selectedConnection of selectedConnections) {
    const connectionName = await vscode.window.showInputBox({
      title: 'Connection Name',
      prompt: `Enter a name for connection "${selectedConnection}"`,
      ignoreFocusOut: true,
      placeHolder: 'my_connection'
    });
  
    connectionPairs.push(`${connectionName}=${selectedConnection}`);
  }
  
  const connectionList = connectionPairs.join(',');

  // set bundle output directory
  const bundleOutputDirectory = await vscode.window.showInputBox({
    title: 'Bundle Output Directory',
    prompt: 'Enter the output directory for the new bundle',
    ignoreFocusOut: true,
    placeHolder: 'express-app'
  });

  if (!bundleOutputDirectory) {
    throw new Error('Operation cancelled.');
  }

  return {
    bundleName,
    bundleDescription,
    bundleTemplate,
    connectionList,
    bundleOutputDirectory,
  }
}

export {
  newBundleInfo
};
