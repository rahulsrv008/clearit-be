import { Transform } from 'class-transformer';

/**
 * Query strings arrive as `'true'`/`'false'`, and `Boolean('false')` is `true`,
 * so filter flags on list endpoints are coerced explicitly instead of with
 * `@Type(() => Boolean)`.
 */
export const BooleanQuery = () =>
  Transform(({ value }: { value: unknown }) => {
    if (value === undefined || value === null || value === '') return undefined;
    if (typeof value === 'boolean') return value;
    const normalized = String(value).trim().toLowerCase();
    if (normalized === 'true' || normalized === '1') return true;
    if (normalized === 'false' || normalized === '0') return false;
    return value;
  });
