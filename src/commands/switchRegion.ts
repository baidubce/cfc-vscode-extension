import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';
import * as os from 'os';
import * as configparser from 'configparser';
import { resetCfcClient } from '../utils/client';
import { getLogger } from '../logger/logger';
import { endpointMap } from '../model/region';

export async function switchRegion() {
  try {
    const configFile = path.join(os.homedir(), '.bce', 'config');
    const parser = new configparser();

    try {
      if (fs.existsSync(configFile)) {
        await parser.readAsync(configFile);
      }
    } catch (e) {
      throw new Error(`Read config file ${configFile} failed: ${e.message}`);
    }

    if (!parser.hasSection('defaults')) {
      parser.addSection('defaults');
    }

    const currRegion = parser.get('defaults', 'region');
    const newRegion = await pickRegion(currRegion);
    if (!newRegion || newRegion.label === currRegion) {
      return;
    }

    parser.set('defaults', 'region', newRegion.label);
    parser.writeAsync(configFile, true);

    await vscode.workspace.getConfiguration().update("cfc.extension.deployEndpoint", endpointMap.get(newRegion.label), vscode.ConfigurationTarget.Global);
    getLogger().info('changing deploy endpoint to ' + endpointMap.get(newRegion.label));

    resetCfcClient();
    vscode.commands.executeCommand('extension.refreshRemote');

  } catch (e) {
    vscode.window.showErrorMessage(e.message);
  }
}

async function pickRegion(currRegion: string | undefined) {
  const regionList = [
    {
      label: 'bj',
      detail: '北京',
    },
    {
      label: 'gz',
      detail: '广州',
    },
    {
      label: 'su',
      detail: '苏州',
    }
  ];

  regionList.forEach(item => {
    if (item.label === currRegion) {
      item.detail = item.detail + '(当前地域)';
    }
  });

  return await vscode.window.showQuickPick(regionList, {
    ignoreFocusOut: true,
    canPickMany: false,
    placeHolder: '请选择一个地域',
  });
}
