import * as compareVersions from 'compare-versions';
import * as vscode from 'vscode';
import { invokeCli, ResultProcessor } from './childProcessor';
import { InvokeCliResult, invokeCliQuiet } from './childProcessorQuiet';
import { detectCli, OnBsamCli } from '../commands/detectCli';
import { generateLocator } from './locator';
import { getLogger } from '../logger/logger';
import { getOutputChannel } from '../logger/channel';

const MinimumVersionRequired = '0.7.6';

export async function runBsamCmd(eventParms: string[]): Promise<ResultProcessor> {
  let location = await detectCli(OnBsamCli);
  if (!location) {
    getLogger().info('BSAM CLI not found');
    await promptInstallBsamCli();

    location = await detectCli(OnBsamCli);
    if (!location) {
      getLogger().info('BSAM CLI not found after pip3 install, probable install failed~');
      throw new Error('BSAM CLI install failed');
    }
  }

  const versionRet = await getBsamVersion(location, ['--version']);
  if (versionRet.stdout().length > 0) {
    const output = versionRet.stdout()[0].split(' ');
    const version = output[output.length - 1].trim();

    if (compareVersions.compare(version, MinimumVersionRequired, '<')) {
      await promptUpdateBsamCli();
    }
  }

  const bsamRes = await invokeCli(location, eventParms);
  bsamRes.throwIfFail();
  return bsamRes;
}

export async function getBsamVersion(location: string, eventParms: string[]): Promise<InvokeCliResult> {
  const res = await invokeCliQuiet(location, eventParms);
  res.throwIfFail();
  return res;
}

export async function promptUpdateBsamCli() {
  const choice = await vscode.window.showErrorMessage(`The version of Bsam Cli is required to be greater than ${MinimumVersionRequired},` + ' Update now ？', 'Update Now', 'Later');
  if (choice !== 'Update Now') {
    throw new Error('');
  }

  const location = generateLocator().getPipLocation();
  if (!location) {
    throw new Error('Pip3 not found, cannot upgrade bce-sam-cli');
  }

  getOutputChannel().show();
  getLogger().info('going to perform: pip3 install bce-sam-cli --upgrade');
  const res = await invokeCli(location, ['install', 'bce-sam-cli', '--upgrade']);
  res.throwIfFail();
  return res;
}

export async function promptInstallBsamCli() {
  const choice = await vscode.window.showErrorMessage('BSAM CLI not found, install now ?', 'Install Now', 'Later');
  if (choice !== 'Install Now') {
    throw new Error('');
  }

  const location = generateLocator().getPipLocation();
  if (!location) {
    throw new Error('Pip3 not found, cannot install bce-sam-cli');
  }

  getOutputChannel().show();
  getLogger().info('going to perform: pip3 install bce-sam-cli');
  const res = await invokeCli(location, ['install', '-i', 'https://pypi.tuna.tsinghua.edu.cn/simple', 'bce-sam-cli']);
  res.throwIfFail();
  return res;
}