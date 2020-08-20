import * as fs from 'fs';
import * as path from 'path';

abstract class BaseCliLocator {
  getBsamLocation(): string | undefined {
    return this.getLocation(this.candidateBsamExecNames());
  }

  getPipLocation(): string | undefined {
    return this.getLocation(this.candidatePipExecNames());
  }

  private getLocation(execNames: string[]) {
    const locations = this.candidatePaths().map(cpath => execNames.map(name => path.join(cpath, name)))
      .reduce((accumulator, paths) => {
        accumulator.push(...paths);
        return accumulator;
      });

    for (const location of locations) {
      if (fs.existsSync(location)) {
        return location;
      }
    }

    return;
  }

  abstract candidatePaths(): string[];
  abstract candidateBsamExecNames(): string[];
  abstract candidatePipExecNames(): string[];
}

class WindowsCliLocator extends BaseCliLocator {
  candidatePaths() {
    const cpath = process.env['PATH'];
    if (!cpath) {
      return [''];
    }

    return cpath.split(';');
  }

  candidateBsamExecNames(): string[] {
    return ['bsam.exe', 'bsam.cmd'];
  }

  candidatePipExecNames(): string[] {
    return ['pip3'];
  }
}

class UnixCliLocator extends BaseCliLocator {
  candidatePaths() {
    const cpath = process.env['PATH'];
    if (!cpath) {
      return [''];
    }

    return cpath.split(':');
  }

  candidateBsamExecNames(): string[] {
    return ['bsam'];
  }

  candidatePipExecNames(): string[] {
    return ['pip3'];
  }
}

export function generateLocator(): BaseCliLocator {
  if (process.platform === 'win32') {
    return new WindowsCliLocator();
  }
  return new UnixCliLocator();
}
