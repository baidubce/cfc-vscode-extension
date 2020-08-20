import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';
import * as yaml from 'js-yaml';
import * as utilfs from '../utils/fs';
import { FunctionSpec, isJava } from '../model/functionSpec';
import { BaseNode, FunctionNode, makeFunctionNode } from '../model/nodes';
import { runtimeSuffixMap } from '../model/runtime';
import { getLogger } from '../logger/logger';

export class LocalFunctionNodeProvider implements vscode.TreeDataProvider<BaseNode> {
  private _onDidChangeTreeData: vscode.EventEmitter<FunctionNode | undefined> = new vscode.EventEmitter<FunctionNode | undefined>();
  readonly onDidChangeTreeData: vscode.Event<FunctionNode | undefined> = this._onDidChangeTreeData.event;
  static WorkspaceFunctions: Map<string, FunctionNode>;

  refresh(): void {
    this._onDidChangeTreeData.fire(undefined);
  }

  constructor(private workspaceRoot: string) {
    LocalFunctionNodeProvider.WorkspaceFunctions = new Map<string, FunctionNode>();
  }

  getTreeItem(element: BaseNode): vscode.TreeItem {
    return element;
  }

  getChildren(element?: BaseNode): Thenable<BaseNode[]> {
    if (!this.workspaceRoot) {
      vscode.window.showInformationMessage('No function in empty workspace');
      return Promise.resolve([]);
    }

    LocalFunctionNodeProvider.WorkspaceFunctions.clear();

    let maxDepth: number | undefined = vscode.workspace.getConfiguration().get<number>('cfc.extension.maxDetectDepth');
    maxDepth = maxDepth ? maxDepth : 4;

    const nodes = this.detectNodes(this.workspaceRoot, 0, maxDepth);
    nodes.then(nodes => this.parseNodeIntoMap(nodes));
    return nodes;
  }

  private async parseNodeIntoMap(nodes: FunctionNode[]) {
    nodes.forEach(node => {
      const runtime = node.config.Properties.Runtime;
      const handler = node.config.Properties.Handler.split('.');
      let handlerPath: string | undefined;

      if (handler.length < 2) { // invalid handler
        return;
      }

      // index.handler 这种形式的 handler，可以直接获取文件路径
      if (handler.length === 2) {
        handlerPath = path.join(node.getAbsDir(), handler[0] + runtimeSuffixMap.get(runtime));
      }

      if (isJava(runtime)) {
        handlerPath = utilfs.searchInDir(path.join(path.dirname(node.yamlPath), 'src'), handler[handler.length - 1] + '.java');
        if (!handlerPath) {
          getLogger().warn('didn\'t find java src file', handler[handler.length - 1] + '.java');
          return;
        }
      }
      LocalFunctionNodeProvider.WorkspaceFunctions.set(<string>handlerPath, node);
    });
  }

  private async detectNodes(dirPath: string, depth: number, maxDepth: number) {
    if (depth >= maxDepth) {
      return Promise.resolve([]);
    }

    let nodes: FunctionNode[] = [];
    const files = fs.readdirSync(dirPath);
    const promises = files.map(file => {
      return fs.statSync(path.join(dirPath, file));
    });

    await Promise.all(promises).then(async (stats) => {
      for (let i = 0; i < files.length; i += 1) {
        const isFile = stats[i].isFile();
        const isDir = stats[i].isDirectory();

        let fileAbsPath = path.join(dirPath, files[i]);

        if (isFile && (files[i] === "template.yaml" || files[i] === "template.yml")) {
          this.parseYaml(fileAbsPath).then((node) => nodes.push(...node));
        }

        if (isDir) {
          const children = await this.detectNodes(fileAbsPath, depth + 1, maxDepth);
          nodes.push(...children);
        }
      }
    });

    return nodes;
  }

  // 解析获取函数名称
  private async parseYaml(yamlPath: string) {
    let doc = await yaml.safeLoad(fs.readFileSync(yamlPath, 'utf8'));

    if (!doc || !doc.BCETemplateFormatVersion || !doc.Resources) {
      return [];
    }

    return Object.entries(doc.Resources)
      .filter(([_, config]) => { return (<FunctionSpec>config).Type === "BCE::Serverless::Function"; })
      .map(([name, config]) => { return makeFunctionNode(name, <FunctionSpec>config, yamlPath); });
  }
}