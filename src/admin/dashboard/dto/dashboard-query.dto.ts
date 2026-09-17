import { DateRangeQueryDto } from 'src/common/dto/date-range.dto';

/**
 * `from`/`to` scope the "in range" figures. Both default to the current
 * calendar month when omitted.
 */
export class AdminDashboardQueryDto extends DateRangeQueryDto {}
