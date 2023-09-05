import * as vscode from 'vscode';

const bundleConnectionList = [
  'aws-api-gateway-rest-api',
  'aws-ecs-cluster',
  'aws-dynamodb-table',
  'aws-dynamodb-stream',
  'aws-efs-file-system',
  'aws-eventbridge',
  'aws-eventbridge-rule',
  'aws-iam-role',
  'aws-s3-bucket',
  'aws-sns-topic',
  'aws-sqs-queue',
  'aws-vpc',
  'azure-cognitive-service-language',
  'azure-cognitive-service-openai',
  'azure-communication-service',
  'azure-event-hubs',
  'azure-fhir-service',
  'azure-machine-learning-workspace',
  'azure-service-principal',
  'azure-storage-account-blob',
  'azure-storage-account-data-lake',
  'azure-virtual-network',
  'cosmosdb-sql-authentication',
  'elasticsearch-authentication',
  'gcp-bucket-https',
  'gcp-cloud-function',
  'gcp-firebase-authentication',
  'gcp-global-network',
  'gcp-pubsub-subscription',
  'gcp-pubsub-topic',
  'gcp-service-account',
  'gcp-subnetwork',
  'kafka-authentication',
  'kubernetes-cluster',
  'mongo-authentication',
  'mysql-authentication',
  'postgresql-authentication',
  'redis-authentication',
  'sftp-authentication',
];

const modifiedBundleConnectionList = bundleConnectionList.map(connectionName => {
  return `massdriver/${connectionName}`;
});

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

  const selectedConnections = await vscode.window.showQuickPick(modifiedBundleConnectionList, {
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
  
    connectionPairs.push(`${selectedConnection}=${connectionName}`);
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
  };
}

export {
  newBundleInfo
};
