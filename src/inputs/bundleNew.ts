import * as vscode from 'vscode';
import { ApolloClient, InMemoryCache, gql } from '@apollo/client/core';
import { getOrgId } from '../settings';
import { getToken } from '../settings';

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

async function fetchArtifactNames(organizationId: string | undefined): Promise<string[]> {
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

const bundleTemplateList = [
  'aws-api-gateway-lambda',
  'aws-ecs-service',
  'aws-lambda',
  'azure-app-service',
  'azure-function-app',
  'gcp-cloud-function',
  'gcp-cloud-run',
  'gcp-vm',
  'kubernetes-cronjob',
  'kubernetes-deployment',
  'kubernetes-job',
  'phoenix-kubernetes',
  'rails-kubernetes',
  'terraform-module'
];

async function newBundleInfo() {
  const bundleName = await vscode.window.showInputBox({
    title: 'Bundle Name',
    prompt: 'Enter the name of the new bundle',
    ignoreFocusOut: true,
    placeHolder: 'aws-s3-bucket'
  });

  if (!bundleName) {
    throw new Error('Operation cancelled.');
  }

  const bundleDescription = await vscode.window.showInputBox({
    title: 'Bundle Description',
    prompt: 'Enter a description for the new bundle',
    ignoreFocusOut: true,
    placeHolder: 'AWS S3 bucket for storing files'
  });

  if (!bundleDescription) {
    throw new Error('Operation cancelled.');
  }

  const bundleTemplate = await vscode.window.showQuickPick(bundleTemplateList, {
    title: 'Bundle Template',
    ignoreFocusOut: true,
    placeHolder: 'Select your application template',
  });

  if (!bundleTemplate) {
    throw new Error('Operation cancelled.');
  }

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
