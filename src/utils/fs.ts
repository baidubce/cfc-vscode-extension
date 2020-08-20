import * as fs from 'fs';
import * as path from 'path';

/**
 * @param dir top dir to start search
 * @param target target file to search
 */
export function searchInDir(baseDir: string, target: string): string | undefined {
  if (!fs.existsSync(baseDir)) {
    return undefined;
  }

  const files = fs.readdirSync(baseDir);

  for (let i = 0; i < files.length; i++) {
    const filepath = path.join(baseDir, files[i]);
    const stat = fs.lstatSync(filepath);

    if (stat.isDirectory()) {
      return searchInDir(filepath, target);
    } else {
      if (files[i] === target) {
        return filepath;
      }
    };
  };
  return undefined;
}

