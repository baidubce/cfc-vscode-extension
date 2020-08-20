import * as os from 'os';
import * as path from 'path';
import * as fs from 'fs';
import * as vscode from 'vscode';
import * as configparser from 'configparser';
import { CfcClient } from '@baiducloud/sdk';
import { endpointMap } from '../model/region';
import { AK_CONFIG_KEY, SK_CONFIG_KEY } from '../commands/bindAccount';

let cfcClient: undefined | CfcClient;

export async function getCfcClient() {
  if (cfcClient !== undefined) {
    return cfcClient;
  }

  const endpoint = await getEndpoint();
  const credentials = await getCredential();

  return new CfcClient({
    endpoint: <string>endpoint,
    credentials: credentials,
  });
}

// 更新了地域、ak sk 后重置 client
export function resetCfcClient() {
  cfcClient = undefined;
}

async function getEndpoint() {
  return vscode.workspace.getConfiguration().get<string>("cfc.extension.deployEndpoint", <string>endpointMap.get('bj'));
}

async function getCredential() {
  const credentials = path.join(os.homedir(), '.bce', 'credentials');
  const parser = new configparser();
  let ak, sk = '';
  const exist = fs.existsSync(credentials);

  if (exist) {
    await parser.readAsync(credentials);
    ak = parser.get('defaults', AK_CONFIG_KEY);
    sk = parser.get('defaults', SK_CONFIG_KEY);
  }

  if (!exist || !sk || !ak) {
    throw new Error('You haven\'t bind the account yet.');
  }

  return { ak, sk };
}
