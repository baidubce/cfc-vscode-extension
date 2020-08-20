import * as vscode from 'vscode';
import { BaseNode, RemoteFunctionNode, makeRemoteFunctionNode } from '../model/nodes';

import { getCfcClient } from '../utils/client';
import { getLogger } from '../logger/logger';
import { parserRegionFromEndpoint } from '../model/region';

export class RemoteFunctionNodeProvider implements vscode.TreeDataProvider<BaseNode> {
  private _onDidChangeTreeData: vscode.EventEmitter<RemoteFunctionNode | undefined> = new vscode.EventEmitter<RemoteFunctionNode | undefined>();
  readonly onDidChangeTreeData: vscode.Event<RemoteFunctionNode | undefined> = this._onDidChangeTreeData.event;
  static WorkspaceFunctions: Map<string, RemoteFunctionNode>;

  refresh(): void {
    this._onDidChangeTreeData.fire(undefined);
  }

  constructor(private workspaceRoot: string) {
    RemoteFunctionNodeProvider.WorkspaceFunctions = new Map<string, RemoteFunctionNode>();
  }

  getTreeItem(element: BaseNode): vscode.TreeItem {
    return element;
  }

  getChildren(element?: BaseNode): Thenable<BaseNode[]> {
    RemoteFunctionNodeProvider.WorkspaceFunctions.clear();

    if (!element) {
      return this.makeRegionNode();
    }
    return this.getRemoteFunctions();
  }

  private async makeInvalidNode() {
    return [new BaseNode("您尚未登录云端账号", vscode.TreeItemCollapsibleState.None)];
  }

  private async makeRegionNode() {
    const endpoint = vscode.workspace.getConfiguration().get<string>('cfc.extension.deployEndpoint', 'bj');
    const region = parserRegionFromEndpoint(endpoint);
    return [new BaseNode(region, vscode.TreeItemCollapsibleState.Expanded)];
  }

  private async getRemoteFunctions() {
    try {
      const client = await getCfcClient();
      const res = await client.listFunctions();

      let nodes: BaseNode[] = [];
      res.body.Functions.forEach(fc => {
        nodes.push(makeRemoteFunctionNode(fc));
      });

      return nodes;
    } catch (e) {
      getLogger().info(e);
      return this.makeInvalidNode();
    }
  }
}
