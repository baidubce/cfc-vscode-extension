import * as spawn from 'cross-spawn';
import { getOutputChannel } from '../logger/channel';

export async function invokeCli(location: string, args: string[]): Promise<ResultProcessor> {
  let result = new ResultProcessor();

  return new Promise<ResultProcessor>((resolve, reject) => {
    const child = spawn(location, args);

    child.stdout?.on('data', (data) => {
      result.processOutput(`${data}`);
    });

    child.stderr?.on('data', (data) => {
      result.processOutput(`${data}`);
    });

    child.on('close', (code) => {
      getOutputChannel().appendLine('');
      result.recordExitCode(code);
      resolve(result);
    });

    child.on('error', (error) => {
      result.recordError(error);
    });
  });
}

export class ResultProcessor {
  private code: number;
  private error: Error | undefined;

  constructor() {
    this.code = 0;
  }

  throwIfFail() {
    if (this.error !== undefined && this.error instanceof Error) {
      throw this.error;
    }
    if (this.code !== 0 || this.error !== undefined) {
      throw new Error('BSAM CLI process failed.');
    }
  };

  processOutput(data: string) {
    const lines = data.split('\n');
    if (lines.length === 0) {
      getOutputChannel().appendLine('');
      return;
    }

    lines.filter(
      line => line !== ''
    ).forEach(line => {
      getOutputChannel().append(this.dealOutput(line));
    });
  }

  // bsam cli's output carries some special characters, as it adds color to the output text.
  // we need to deal with it.
  private dealOutput(line: string) {
    line = line.startsWith('\0') ? line.substr(1) : line;
    line = line.replace(new RegExp('\x1b\[[0-9;]*m', 'g'), '');
    line = line === "." ? line : '\n' + line;
    return line;
  }

  recordExitCode(code: number) {
    this.code = code;
  }

  recordError(err: Error) {
    this.error = err;
  }

  exitCode() {
    return this.code;
  }
}