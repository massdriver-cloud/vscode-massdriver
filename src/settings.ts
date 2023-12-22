import * as vscode from 'vscode';
import { initStatusBarItem, setMissingApiStatusBarItem, setMissingOrganizationStatusBarItem } from './interface';

// assigns MASSDRIVER_API_KEY
const getToken = (): string | undefined => {
    const configuration: vscode.WorkspaceConfiguration = vscode.workspace.getConfiguration('massdriver');
    const token = configuration.get<string>('token');
    if (!token) {
        vscode.window.showErrorMessage('Massdriver service account token was not found. Please add it to the extension settings in order use the extension features.', 'Open extension settings')
            .then(choice => choice === 'Open extension settings' && vscode.commands.executeCommand('workbench.action.openSettings', 'massdriver.token'));
        setMissingApiStatusBarItem('mass.openExtensionSettings');
    } else {
        initStatusBarItem('mass.openCommandPalette');
    }
    return token;
};

// assigns MASSDRIVER_ORG_ID
const getOrgId = (): string | undefined => {
    const configuration: vscode.WorkspaceConfiguration = vscode.workspace.getConfiguration('massdriver');
    const orgId = configuration.get<string>('org');
    if (!orgId) {
        vscode.window.showErrorMessage('Massdriver organization ID was not found. Please add it to the extension settings in order use the extension features.', 'Open extension settings')
            .then(choice => choice === 'Open extension settings' && vscode.commands.executeCommand('workbench.action.openSettings', 'massdriver.org'));
        setMissingOrganizationStatusBarItem('mass.openExtensionSettings');
    } else {
        initStatusBarItem('mass.openCommandPalette');
    }
    return orgId;
};

export {
    getToken,
    getOrgId,
};