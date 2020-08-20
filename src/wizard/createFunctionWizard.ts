import * as vscode from 'vscode';
import { runtimeSuffixMap } from '../model/runtime';
import { MultiStepWizard, WizardStep } from './multiStepWizard';

export interface CreateFunctionResult {
  name: string,
  runtime: string,
  location: string,
}

export class CreateFunctionWizard extends MultiStepWizard<CreateFunctionResult> {
  private name?: string;
  private runtime?: string;
  private location?: string;

  constructor() {
    super();
  }

  private readonly RUNTIME: WizardStep = async () => {
    let runtimeList: vscode.QuickPickItem[] = [];
    runtimeSuffixMap.forEach((_value, key) => {
      runtimeList.push({ label: key, alwaysShow: key === this.runtime });
    });

    const runtime = await this.showQuickPick({
      options: {
        ignoreFocusOut: true,
        title: '请选择函数runtime类型',
        value: this.runtime ? this.runtime : ''
      },
      items: runtimeList,
      step: { curr: 1, total: 3 },
      buttons: [vscode.QuickInputButtons.Back]
    });

    this.runtime = runtime ? runtime.label : undefined;
    return this.runtime ? this.LOCATION : undefined;
  };

  private readonly LOCATION: WizardStep = async () => {
    if (!vscode.workspace.workspaceFolders || vscode.workspace.workspaceFolders.length === 0) {
      throw new Error('Please open a workspace first.');
    }
    const workspace = vscode.workspace.workspaceFolders[0];

    const defaultLocation = workspace.name;
    const res = await this.showQuickPick({
      options: {
        ignoreFocusOut: true,
        title: '请选择函数文件路径',
      },
      items: [{
        label: defaultLocation,
        description: '当前工作空间根路径',
      },
      {
        label: '选择其它路径...'
      }],
      step: { curr: 2, total: 3 },
      buttons: [vscode.QuickInputButtons.Back]
    });

    if (!res) {
      return this.RUNTIME;
    }

    if (res.label === defaultLocation) {
      this.location = workspace.uri.fsPath;
    } else {
      this.location = await this.getFsLocation(workspace);
      if (!this.location) {
        return this.LOCATION;
      }
    }
    return this.NAME;
  };

  private readonly NAME: WizardStep = async () => {
    let runtimeList: vscode.QuickPickItem[] = [];
    runtimeSuffixMap.forEach((_value, key) => {
      runtimeList.push({ label: key, alwaysShow: key === this.runtime });
    });

    const res = await this.showInputBox({
      options: {
        ignoreFocusOut: true,
        title: '请输入函数名称',
        value: this.name ? this.name : '',
        prompt: '函数名称只能包含这些字符: 0-9、a-z、A-Z、_-',
      },
      step: { curr: 3, total: 3 },
      buttons: [vscode.QuickInputButtons.Back]
    });

    this.name = res;
    this.funcnameValidator(this.name);
    return this.name ? undefined : this.LOCATION;
  };

  async getFsLocation(workspace: vscode.WorkspaceFolder) {
    const targetUri = await vscode.window.showOpenDialog({
      defaultUri: workspace.uri,
      canSelectFiles: false,
      canSelectFolders: true,
      canSelectMany: false,
    });

    if (!targetUri || !targetUri.length) {
      return undefined;
    }

    return targetUri[0].fsPath;
  }

  funcnameValidator(name: string | undefined): string | undefined {
    if (!name) {
      return undefined;
    }

    const regexp = new RegExp('^[a-zA-Z0-9-_]+$');
    if (!regexp.test(name)) {
      throw new Error('Function name can only contain 0-9、a-z、A-Z、_- .');
    }
    if (name.length > 65) {
      throw new Error('Function name length cannot exceed 65.');
    }
    return undefined;
  }

  getResult(): CreateFunctionResult | undefined {
    if (this.name && this.location && this.runtime) {
      return {
        name: this.name,
        runtime: this.runtime,
        location: this.location,
      };
    }
    return undefined;
  }

  get startStep(): WizardStep {
    return this.RUNTIME;
  }
}