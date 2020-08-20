import * as vscode from 'vscode';
import * as path from 'path';
import * as fs from 'fs';
import { FunctionNode } from '../model/nodes';
import { runtimeSuffixMap } from '../model/runtime';
import { isJava, isCsharp } from '../model/functionSpec';
import { getLogger } from '../logger/logger';

export async function gotoFunctionCode(node: FunctionNode) {
  const handlerSplits = node.config.Properties.Handler.split('.');
  const suffix = runtimeSuffixMap.get(node.config.Properties.Runtime);

  if (suffix === undefined) {
    vscode.window.showErrorMessage("Function runtime is invalid, please check your template.yaml.");
    return;
  }

  const yamlDir = path.dirname(node.yamlPath);
  const runtime = node.config.Properties.Runtime;

  let handlerPath: string;

  if (isJava(runtime)) {
    let paths: string[] = [yamlDir, 'src', 'main', 'java'];
    for (let i = 0; i < handlerSplits.length - 1; i++) {
      paths.push(handlerSplits[i]);
    }

    const fileName = handlerSplits[handlerSplits.length - 1] + suffix;
    paths.push(fileName);

    handlerPath = path.join(...paths);
  } else if (isCsharp(runtime)) {
    const className = handlerSplits[handlerSplits.length - 1];
    handlerPath = lookupCsharpHanlderPath(node, path.join(yamlDir, node.config.Properties.CodeUri), className);
  } else {
    handlerPath = path.join(yamlDir, node.config.Properties.CodeUri, handlerSplits[0] + suffix);
  }

  try {
    fs.statSync(handlerPath);
  } catch (e) {
    vscode.window.showErrorMessage(`Can not find function handler file ${handlerPath}.`);
    return;
  }

  vscode.window.showTextDocument(vscode.Uri.file(handlerPath));
}

// read each .cs file and search handler in the file
function lookupCsharpHanlderPath(node: FunctionNode, codeUri: string, className: string): string {
  try {
    const srcfiles = fs.readdirSync(codeUri).filter(file => {
      const fsp = file.split('.');
      return fsp.length === 2 && fsp[1] === 'cs';
    }).map(file => {
      return path.join(codeUri, file);
    });

    for (let i = 0; i < srcfiles.length; i++) {
      const content = fs.readFileSync(srcfiles[i], 'utf8');
      if (content.indexOf(className) !== -1) {
        return srcfiles[i];
      }
    }

  } catch (e) {
    getLogger().info(`lookup csharp handler failed: ${e.message}`);
  }

  // return default file when nothing found
  return path.join(codeUri, 'StreamHandler.cs');
}
