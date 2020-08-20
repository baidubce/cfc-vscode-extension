import * as vscode from 'vscode';
import * as fs from 'fs';
import * as os from 'os';
import * as path from 'path';
import * as request from 'superagent';
import * as admZip from 'adm-zip';
import * as yaml from 'js-yaml';

import { RemoteFunctionNode } from '../model/nodes';
import { getOutputChannel } from '../logger/channel';
import { getCfcClient } from '../utils/client';
import { getLogger, withFunctionName } from '../logger/logger';
import { isJava } from '../model/functionSpec';
import { TemplateYaml } from '../model/templateYaml';
import { Function } from '@baiducloud/sdk';

export async function download(node: RemoteFunctionNode) {
  try {
    const targetDir = await getTargetDir(node.fc);
    if (!targetDir) {
      return;
    }

    await downloadFunction(node.fc, targetDir);
    getOutputChannel().show();
  } catch (e) {
    getLogger().error(e);
    vscode.window.showErrorMessage('download function error: ' + e.message);
  }
}

async function getTargetDir(func: Function) {
  const workspace = vscode.workspace.workspaceFolders;
  const selectedPath = await vscode.window.showOpenDialog({
    canSelectFolders: true,
    canSelectFiles: false,
    canSelectMany: false,
    defaultUri: workspace ? workspace[0].uri : undefined || vscode.Uri.file(os.homedir()),
    openLabel: '下载',
  });

  if (!selectedPath) {
    return;
  }

  const targetDir = path.join(selectedPath[0].fsPath, func.FunctionName);

  if (checkFunctionRepeated(targetDir)) {
    const choice = await vscode.window.showInformationMessage('Function already exists: '
      + `${func.FunctionName}`
      + '. Continuing may overwrite your existing files. Continue ？', 'Continue', 'Cancel');
    if (choice !== 'Continue') {
      return;
    }
  }
  return targetDir;
}

async function downloadFunction(func: Function, functionDir: string) {
  const functionSrcDir = getFunctionSrcDir(func.Runtime, functionDir);
  fs.mkdirSync(functionSrcDir, { recursive: true });

  const client = await getCfcClient();
  const res = await client.getFunction(func.FunctionBrn);

  // update function configuration to prevent inconsistency between remoteFunctionNode and cloud functions
  func = res.body.Configuration;

  const targetZip = path.join(functionDir, func.FunctionName + '.zip');

  request.get(res.body.Code.Location).
    on('error', error => {
      throw error;
    })
    .pipe(fs.createWriteStream(targetZip))
    .on('finish', () => {
      getLogger().info(withFunctionName(func.FunctionName, 'download completed.'));
      const zip = new admZip(targetZip);

      zip.extractAllTo(functionSrcDir, true);
      getLogger().info(withFunctionName(func.FunctionName, 'unzip completed.'));

      // delete source .zip
      fs.unlink(targetZip, () => { });

      generateTemplateYaml(func, functionDir);
      vscode.commands.executeCommand('extension.refreshLocal');
    });
}

function checkFunctionRepeated(funcDir: string): boolean {
  try {
    fs.statSync(funcDir);
    return fs.readdirSync(funcDir).length > 0;
  } catch {
    return false;
  }
}

function generateTemplateYaml(func: Function, functionDir: string) {
  if (isJava(func.Runtime)) {
    return;
  }
  const tp = new TemplateYaml(func);
  const resources = {};
  resources[func.FunctionName] = tp.makeFunctionYamlSpec(func);
  tp.Resources = resources;

  const yamlPath = path.join(functionDir, 'template.yaml');

  getLogger().debug("starting dump template.yaml");
  const yamlStr = yaml.dump(tp, { skipInvalid: true });

  getLogger().debug("starting write template.yaml");
  fs.writeFileSync(yamlPath, yamlStr);
  getLogger().info(withFunctionName(func.FunctionName, "generate template.yaml completed."));
}

function getFunctionSrcDir(runtime: string, functionDir: string) {
  if (isJava(runtime)) {
    return functionDir;
  } else {
    return path.join(functionDir, 'hello_world');
  }
}