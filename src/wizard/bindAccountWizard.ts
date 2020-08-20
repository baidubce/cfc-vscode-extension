import * as vscode from 'vscode';
import { MultiStepWizard, WizardStep } from './multiStepWizard';

export interface BindWizardResult {
  accessKey: string;
  secretAccessKey: string;
  accountAlias: string;
}

export class BindAccountWizard extends MultiStepWizard<BindWizardResult> {
  private accessKey?: string;
  private secretAccessKey?: string;
  private accountAlias?: string;

  constructor() {
    super();
  }

  private readonly GET_AK: WizardStep = async () => {
    const res = await this.showInputBox({
      options: {
        ignoreFocusOut: true,
        title: '请输入百度云账号的 AccessKey',
        value: this.accessKey ? this.accessKey : ''
      },
      step: { curr: 1, total: 3 },
      buttons: [vscode.QuickInputButtons.Back]
    });

    this.accessKey = res;
    return this.accessKey ? this.GET_SK : undefined;
  };

  private readonly GET_SK: WizardStep = async () => {
    const res = await this.showInputBox({
      options: {
        ignoreFocusOut: true,
        title: '请输入百度云账号的 SecretAccessKey',
        value: this.secretAccessKey ? this.secretAccessKey : '',
        password: true
      },
      step: { curr: 2, total: 3 },
      buttons: [vscode.QuickInputButtons.Back]
    });

    this.secretAccessKey = res;
    return this.secretAccessKey ? this.GET_Alias : this.GET_AK;
  };

  private readonly GET_Alias: WizardStep = async () => {
    const res = await this.showInputBox({
      options: {
        ignoreFocusOut: true,
        title: '请输入自定义账号名称',
        value: this.accountAlias ? this.accountAlias : ''
      },
      step: { curr: 3, total: 3 },
      buttons: [vscode.QuickInputButtons.Back]
    });

    this.accountAlias = res;
    return this.accountAlias ? undefined : this.GET_SK;
  };

  getResult(): BindWizardResult | undefined {

    if (this.accountAlias && this.accountAlias === "defaults") {
      throw new Error('"defaults" is used to specfify current account, please use other names.');
    }

    if (this.accessKey && this.secretAccessKey && this.accountAlias) {
      return {
        accessKey: this.accessKey,
        secretAccessKey: this.secretAccessKey,
        accountAlias: this.accountAlias,
      };
    }
    return undefined;
  }

  get startStep(): WizardStep {
    return this.GET_AK;
  }
}