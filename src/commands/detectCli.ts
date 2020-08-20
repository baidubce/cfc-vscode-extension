import * as vscode from 'vscode';
import * as fs from 'fs';
import * as locator from '../cli/locator';
import { promptInstallBsamCli } from '../cli/cmd';

export const OnExtensionActive = 0;
export const OnExtensionCommand = 1;
export const OnBsamCli = 2;

// detect cli in host, update cli path configuration
export async function detectCli(condition: number): Promise<string | undefined> {
  let found, updated = false;

  let location = vscode.workspace.getConfiguration().get<string>("cfc.extension.bsamcli.location");
  if (location !== undefined && fs.existsSync(location)) {
    found = true;
  }

  if (!found) {
    location = locator.generateLocator().getBsamLocation();
    if (location) {
      vscode.workspace.getConfiguration().update("cfc.extension.bsamcli.location", location, vscode.ConfigurationTarget.Global);
      updated = true;
      found = true;
    }
  }

  if (condition === OnExtensionCommand) {
    const msg = updated ? 'Update configuration BSAM CLI path: ' + location :
      found ? 'No need to update, current BSAM CLI path is ' + location :
        'BSAM CLI not found, please make sure bce-sam-cli is installed and location configured correctly.';
    vscode.window.showInformationMessage(msg);
  }

  if (condition === OnExtensionActive) {
    if (!found) {
      await promptInstallBsamCli();
    }
  }
  return location;
}
