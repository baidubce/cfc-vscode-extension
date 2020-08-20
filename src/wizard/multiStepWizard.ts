import * as vscode from 'vscode';

export interface WizardStep {
  (): Thenable<WizardStep | undefined>;
}

export interface MultiStepPickParameters {
  options: vscode.QuickPickOptions & { title?: string, value?: string };
  items: vscode.QuickPickItem[];
  step: { curr: number, total: number };
  buttons?: vscode.QuickInputButton[];
}

export interface InputBoxParameters {
  options: vscode.InputBoxOptions & { title?: string };
  step: { curr: number, total: number };
  buttons?: vscode.QuickInputButton[];
}

export abstract class MultiStepWizard<TResult> {
  protected constructor() { }

  public async run(): Promise<TResult | undefined> {
    let step: WizardStep | undefined = this.startStep;

    while (step) {
      step = await step();
    }

    return this.getResult();
  }

  protected abstract get startStep(): WizardStep;
  protected abstract getResult(): TResult | undefined;

  async showQuickPick(picker: MultiStepPickParameters): Promise<vscode.QuickPickItem | undefined> {
    const disposables: vscode.Disposable[] = [];
    try {
      return await new Promise((resolve, reject) => {
        const input = vscode.window.createQuickPick();
        input.ignoreFocusOut = picker.options.ignoreFocusOut || true;
        input.title = picker.options.title;
        input.step = picker.step.curr;
        input.totalSteps = picker.step.total;
        input.items = picker.items;
        input.value = picker.options.value ? picker.options.value : '';
        input.placeholder = picker.options.placeHolder;
        input.buttons = picker.buttons || [];

        disposables.push(
          input.onDidTriggerButton((button) => {
            if (button === vscode.QuickInputButtons.Back) {
              resolve(undefined);
            }
          }),
          input.onDidChangeSelection(items => {
            resolve(items[0]);
          }),
          input.onDidHide(() => {
            resolve(undefined);
          }),
          input
        );
        input.show();
      });
    } finally {
      disposables.forEach(d => d.dispose());
    }
  }

  async showInputBox(params: InputBoxParameters): Promise<string | undefined> {
    const disposables: vscode.Disposable[] = [];
    try {
      return await new Promise((resolve, reject) => {
        const input = vscode.window.createInputBox();
        input.ignoreFocusOut = params.options.ignoreFocusOut || true;
        input.title = params.options.title;
        input.step = params.step.curr;
        input.totalSteps = params.step.total;
        input.buttons = params.buttons || [];
        input.value = params.options.value ? params.options.value : '';
        input.password = params.options.password || false;
        input.prompt = params.options.prompt || undefined;
        disposables.push(
          input.onDidTriggerButton(item => {
            if (item === vscode.QuickInputButtons.Back) {
              resolve(undefined);
            }
          }),
          input.onDidAccept(async () => {
            resolve(input.value);
          }),
          input.onDidHide(() => {
            resolve(undefined);
          }),
          input
        );
        input.show();
      });
    } finally {
      disposables.forEach(d => d.dispose());
    }
  }
}
