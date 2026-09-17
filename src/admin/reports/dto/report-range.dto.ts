import { DateRangeQueryDto } from 'src/common/dto/date-range.dto';

/** Every report takes the same window; it defaults to the last 30 days. */
export class AdminReportRangeDto extends DateRangeQueryDto {}
