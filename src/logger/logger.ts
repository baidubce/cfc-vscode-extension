import * as vscode from 'vscode';
import * as winston from 'winston';
import { getOutputChannel, OutputChannelTransport } from './channel';

let extLogger: undefined | winston.Logger;

export function activeLogger(context: vscode.ExtensionContext) {
  const level: string = vscode.workspace.getConfiguration().get<string>('cfc.extension.logLevel', 'info');
  extLogger = makeLogger(context, level);
}

export function getLogger(): winston.Logger {
  if (!extLogger) {
    throw new Error('Logger is not actived, something is wrong');
  }

  return extLogger;
}

function makeLogger(context: vscode.ExtensionContext, level: string) {
  const logger = winston.createLogger({
    transports: [
      new OutputChannelTransport({
        level: level,
        outputChannel: getOutputChannel(),
      })
    ]
  });

  vscode.workspace.onDidChangeConfiguration(
    configurationChangeEvent => {
      if (configurationChangeEvent.affectsConfiguration('cfc.extension.logLevel')) {
        const newLogLevel = vscode.workspace.getConfiguration().get<string>('cfc.extension.logLevel', 'info');
        logger.level = newLogLevel;
      }
    },
    undefined,
    context.subscriptions
  );
  return logger;
}

export function withFunctionName(name: string, msg: string) {
  return '[' + name + '] ' + msg;
}