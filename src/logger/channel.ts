import * as moment from 'moment';
import * as vscode from 'vscode';
import * as Transport from 'winston-transport';

export let outputChannel: vscode.OutputChannel;

interface message {
  level: string
  message: string
}

export function getOutputChannel(): vscode.OutputChannel {
  if (!outputChannel) {
    outputChannel = vscode.window.createOutputChannel("BaiduBCE CFC");
  }
  return outputChannel;
}

export class OutputChannelTransport extends Transport {
  private readonly outputChannel: vscode.OutputChannel;

  public constructor(
    options: Transport.TransportStreamOptions & {
      outputChannel: vscode.OutputChannel
    }
  ) {
    super(options);

    this.outputChannel = options.outputChannel;
  }

  public log(info: message, callback: () => void): void {
    setImmediate(() => {
      info.message = `${makeLogTimestamp()} [${info.level}] ${info.message}`;
      this.outputChannel.appendLine(info.message);
    });

    callback();
  }
}

function makeLogTimestamp(): string {
  return moment().format('YYYY-MM-DD HH:mm:ss');
}
