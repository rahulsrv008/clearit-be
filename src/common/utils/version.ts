import { readFileSync } from 'fs';
import { join } from 'path';
import { PackageJson } from '../dto/package';
import { cwd } from 'process';

const packageJson: PackageJson = JSON.parse(
  readFileSync(join(cwd(), 'package.json'), 'utf-8'),
) as PackageJson;

export const appVersion = packageJson.version;
