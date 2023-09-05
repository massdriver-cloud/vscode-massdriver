import * as vscode from 'vscode';
import { initStatusBarItem, setMissingApiStatusBarItem, setMissingOrganizationStatusBarItem } from './interface';

const getApiKey = (): string | undefined => {
    const configuration: vscode.WorkspaceConfiguration = vscode.workspace.getConfiguration('massdriver');
    const apiKey = configuration.get<string>('api_key');
    if (!apiKey) {
        vscode.window.showErrorMessage('Massdriver API key was not found. Please add it to the extension settings in order use the extension features.', 'Open extension settings')
            .then(choice => choice === 'Open extension settings' && vscode.commands.executeCommand('workbench.action.openSettings', 'massdriver.api_key'));
        setMissingApiStatusBarItem('mass.openExtensionSettings');
    } else {
        initStatusBarItem('mass.openCommandPalette');
    }
    return apiKey;
};

const getOrgId = (): string | undefined => {
    const configuration: vscode.WorkspaceConfiguration = vscode.workspace.getConfiguration('massdriver');
    const orgId = configuration.get<string>('org_id');
    if (!orgId) {
        vscode.window.showErrorMessage('Massdriver organization ID was not found. Please add it to the extension settings in order use the extension features.', 'Open extension settings')
            .then(choice => choice === 'Open extension settings' && vscode.commands.executeCommand('workbench.action.openSettings', 'massdriver.org_id'));
        setMissingOrganizationStatusBarItem('mass.openExtensionSettings');
    } else {
        initStatusBarItem('mass.openCommandPalette');
    }
    return orgId;
};

export {
    getApiKey,
    getOrgId,
};