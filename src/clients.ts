import * as vscode from 'vscode';
import * as path from 'path';
import * as semver from 'semver';
import { asyncExec } from './utils';

const minMassVersion = "0.4.8";
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

const installOrUpdateMassdriverCli = async (): Promise<string | undefined> => {
    vscode.window.showInformationMessage('Trying to install Massdriver CLI');

    let firstTry = true;
    const go = 'go';
    const sudo = 'sudo';
    const mass_url = 'github.com/massdriver-cloud/mass';

    while (firstTry) {
        try {
            const isInstalled = await isMassdriverCliInstalled();
            if (!isInstalled) {
                const command = `${go} install ${mass_url}`;
                console.log(`Testing cli installation with command: ${command}`);
                await asyncExec(command);
            }

            let massPath;
            if (isInstalled) {
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
                const command = `${sudo} ${go} ${mass_url}`;
                await asyncExec(command);
                firstTry = false;
            } else {
                return undefined;
            }
        }
    }
};

interface MassInstall {
    version: string;
}

const installMassdriverCli = async (massVersion: string): Promise<MassInstall> => {
    try {
        if (await isMassdriverCliInstalled()) {
            vscode.window.showWarningMessage('Massdriver CLI is already installed. Skipping installation.');
            return { version: massVersion };
        } else {
            await installOrUpdateMassdriverCli();
            return { version: massVersion };
        }
    } catch (error) {
        vscode.window.showErrorMessage('Failed to install/update Massdriver CLI. Error:', (error as Error).message);
        throw new Error('Massdriver CLI installation failed.');
    }
};


// Docker checking
const isDockerInstalled = async () => {
    try {
        await asyncExec('docker version');
        return true;
    } catch (error) {
        return false;
    }
};

const dockerInstalled = async (): Promise<boolean> => {
    const isInstalled = await isDockerInstalled();
    return isInstalled;
};

export {
    minTerraformVersion,
    MassInstall,
    installMassdriverCli,
    dockerInstalled,
    getMassVersion
};