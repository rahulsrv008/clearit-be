import * as fs from 'fs';
import * as path from 'path';

export const LOG_DIR = process.env.LOG_DIR || 'logs';
export const LOG_DATE_PATTERN = 'YYYY-MM-DD';
export const LOG_MAX_SIZE = '25m';

export function ensureLogDir(): void {
  const dir = path.resolve(process.cwd(), LOG_DIR);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
}
