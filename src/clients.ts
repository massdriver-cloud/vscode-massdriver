import * as vscode from 'vscode';
import * as path from 'path';
import * as semver from 'semver';
import { asyncExec } from './utils';

const minMassVersion = "0.4.8";
const minGoVersion = '1.18';
const minTerraformVersion = '1.0.0';

// Massdriver CLI checking
const isMassdriverCliInstalled = async () => {
    try {
        await asyncExec('mass version');
        return true;
    } catch (error) {
        return false;
    }
};

// Grab CLI version
const getMassVersion = async (): Promise<string> => {
    const configuration: vscode.WorkspaceConfiguration = vscode.workspace.getConfiguration('Massdriver');
    const massVersion = configuration.get<string>('massVersion', 'dev');
    if (massVersion === 'dev') {
        return 'dev';
    } else {
        console.log(`Mass version was not recognized, trying ${massVersion}...`);
        if (!semver.valid(massVersion)) {
            throw Error('Mass version was not recognized: ${massVersion}');
        }

        const clean = semver.clean(massVersion);
        if (!clean) {
            throw Error(`Mass version was not recognized: ${massVersion}`);
        }

        if (!semver.satisfies(massVersion, `>=${minMassVersion}`)) {
            throw Error(`Mass version invalid: ${massVersion} (must be >=${minMassVersion}`);
        }

        console.log(`Cleaned version: ${clean}`);

        return clean;
    }
};

const getMassExecutablePath = async (): Promise<string> => {
    const [goPath] = await asyncExec('go env GOPATH');
    console.log(`go PATH: ${goPath}`);
    return path.join(goPath.trim(), 'bin', 'mass');
};

const installOrUpdateMassdriverCli = async (massVersion: string): Promise<string | null> => {
    vscode.window.showInformationMessage('Trying to install Massdriver CLI');

    let firstTry = true;
    let go = 'go';
    let sudo = 'sudo';

    while (true) {
        try {
            await verifyGoVersion();
            const command = `${go} <placeholder command>`;
            console.log(`Testing cli installation with command: ${command}`);
            await asyncExec(command);

            let massPath;
            if (await isMassdriverCliInstalled()) {
                massPath = 'mass';
            } else {
                massPath = await getMassExecutablePath();
            }
            vscode.window.showInformationMessage(`Massdriver CLI installed successfully.`, massPath);
            return massPath;
        } catch (error) {
            vscode.window.showErrorMessage(`Failed to install Massdriver CLI. Error:`, (error as Error).message);
            if (firstTry) {
                console.log('Retrying with sudo');
                const command = (`${sudo} ${go} <placeholder command>`);
                await asyncExec(command);
                firstTry = false;
            } else {
                return null;
            }
        }
    }
};

interface MassInstall {
    version: string;
}

const installMassdriverCli = async (massVersion: string): Promise<MassInstall> => {
    const is = await installOrUpdateMassdriverCli(massVersion);

    if (await isMassdriverCliInstalled()) {
        vscode.window.showWarningMessage('Massdriver CLI is already installed. Skipping installation.');
        return { version: massVersion };
    } else {
        vscode.window.showErrorMessage('Could not find Massdriver CLI. Please install it manually.');
    }
    throw new Error('Massdriver CLI installation failed.');
};

// Golang checking
const verifyGoVersion = async (): Promise<void> => {
    const [goVersionResponse] = await asyncExec('go version');
    console.log(goVersionResponse);
    const goVersion = goVersionResponse.split(' ')[2];
    if (semver.lt(goVersion, minGoVersion)) {
        throw Error('Invalid Go version. Please install Go version 1.18 or higher.');
    }
};

// Terraform checking
const isTerraformInstalled = async () => {
    try {
        await asyncExec('terraform version');
        return true;
    } catch (error) {
        return false;
    }
};

const terraformInstalled = async (): Promise<boolean> => {
    const isInstalled = await isTerraformInstalled();
    return isInstalled;
};

export {
    minTerraformVersion,
    MassInstall,
    installMassdriverCli,
    terraformInstalled,
    getMassVersion
};