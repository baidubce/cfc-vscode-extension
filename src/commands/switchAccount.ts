import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';
import * as os from 'os';
import * as configparser from 'configparser';
import { resetCfcClient } from '../utils/client';
import { AK_CONFIG_KEY, SK_CONFIG_KEY } from './bindAccount';

export async function switchAccount() {
  try {
    const credentialsFile = path.join(os.homedir(), '.bce', 'credentials');
    const parser = new configparser();

    try {
      if (fs.existsSync(credentialsFile)) {
        await parser.readAsync(credentialsFile);
      }
    } catch (e) {
      throw new Error(`Read credentials file ${credentialsFile} failed: ${e.message}`);
    }

    if (!parser.hasSection('defaults')) {
      parser.addSection('defaults');
    }

    const currAK = parser.get('defaults', AK_CONFIG_KEY);
    const currSK = parser.get('defaults', SK_CONFIG_KEY);

    const newAccount = await pickNewAccount(parser, currAK, currSK);
    if (!newAccount) {
      return;
    }

    const newAK = parser.get(newAccount.label, AK_CONFIG_KEY);
    const newSK = parser.get(newAccount.label, SK_CONFIG_KEY);

    // no need to update
    if (currAK === newAK && currSK === newSK) {
      return;
    }

    parser.set('defaults', AK_CONFIG_KEY, newAK);
    parser.set('defaults', SK_CONFIG_KEY, newSK);

    parser.writeAsync(credentialsFile, true);

    resetCfcClient();
    vscode.commands.executeCommand('extension.refreshRemote');

  } catch (e) {
    vscode.window.showErrorMessage(e.message);
  }
}

async function pickNewAccount(parser: any, currAK: string | undefined, currSK: string | undefined) {
  let sectionList: vscode.QuickPickItem[] = [];

  parser.sections().forEach(section => {
    if (parser.get(section, AK_CONFIG_KEY) === currAK && parser.get(section, SK_CONFIG_KEY) === currSK) {
      section === 'defaults' ? '' : sectionList.push({ label: section, detail: '当前账户' });
    } else {
      sectionList.push({ label: section });
    }
  });

  if (sectionList.length === 0) {
    throw new Error('You have not logged in any accounts.');
  }

  return await vscode.window.showQuickPick(sectionList, {
    ignoreFocusOut: true,
    canPickMany: false,
    placeHolder: '请选择一个账户',
  });
}
