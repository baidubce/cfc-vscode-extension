import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';
import * as os from 'os';
import * as configparser from 'configparser';
import { BosClient } from '@baiducloud/sdk';
import { resetCfcClient } from '../utils/client';
import { BindAccountWizard } from '../wizard/BindAccountWizard';
import { getLogger } from '../logger/logger';

export const AK_CONFIG_KEY = 'bce_access_key_id';
export const SK_CONFIG_KEY = 'bce_secret_access_key';

export async function bindAccount() {
  try {

    const wizard = new BindAccountWizard();
    const input = await wizard.run();
    if (!input) {
      return;
    }

    const err = await validateAkSk(input);
    if (err !== undefined) {
      throw err;
    }

    // TODO: 验证 Windows 系统下的文件创建与写入
    const credentialFile = path.join(os.homedir(), '.bce', 'credentials');
    const parser = new configparser();

    try {
      if (fs.existsSync(credentialFile)) {
        await parser.readAsync(credentialFile);
      }
    } catch (e) {
      throw new Error(`Read config file ${credentialFile} failed: ${e.message}`);
    }

    const sections = parser.sections();

    for (let i = 0; i < sections.length; i++) {
      if (parser.get(sections[i], AK_CONFIG_KEY) === input.accessKey &&
        parser.get(sections[i], SK_CONFIG_KEY) === input.secretAccessKey) {
        throw new Error(`This account already exists.`);
      }
    }

    // add new config
    const sectionName = input.accountAlias; //getNewSectionName(sections)
    parser.addSection(sectionName);
    parser.set(sectionName, AK_CONFIG_KEY, input.accessKey);
    parser.set(sectionName, SK_CONFIG_KEY, input.secretAccessKey);

    // update default config
    if (!parser.hasSection('defaults')) {
      parser.addSection('defaults');
    }

    parser.set('defaults', AK_CONFIG_KEY, input.accessKey);
    parser.set('defaults', SK_CONFIG_KEY, input.secretAccessKey);

    parser.writeAsync(credentialFile, true);

    resetCfcClient();
    vscode.commands.executeCommand('extension.refreshRemote');

  } catch (e) {
    vscode.window.showErrorMessage(e.message);
  }
}

async function validateAkSk(input: { accessKey: string, secretAccessKey: string }) {
  const client = new BosClient({
    endpoint: 'https://bj.bcebos.com',
    credentials: {
      ak: input.accessKey,
      sk: input.secretAccessKey,
    }
  });

  return new Promise<Error>((resolve, reject) => {
    client.listBuckets().then(
      res => {
        resolve(undefined);
      }
    ).catch(err => {
      getLogger().info('validate baidu ak sk failed: ' + err.code + ' status_code: ' + err.status_code);
      if (err.code === 'SignatureDoesNotMatch') {
        resolve(new Error(`AccessKey or SecretAccessKey is invalid, please check your input.`));
      } else {
        resolve(new Error(`Error happend when validate credentials: ${err.message}`));
      }
    });
  });
}