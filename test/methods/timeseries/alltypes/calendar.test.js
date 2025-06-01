import { describe, expect, test } from 'vitest';
import {
  isBusinessDay,
  nextBusinessDay,
  previousBusinessDay,
  endOfMonth,
  startOfMonth,
  endOfQuarter,
  startOfQuarter,
  endOfYear,
  startOfYear,
  addBusinessDays,
  dateRange,
} from '../../../../src/methods/timeseries/alltypes/calendar.js';

describe('isBusinessDay', () => {
  test('should identify business days', () => {
    // Monday to Friday are business days
    expect(isBusinessDay(new Date('2023-01-02'))).toBe(true); // Monday
    expect(isBusinessDay(new Date('2023-01-03'))).toBe(true); // Tuesday
    expect(isBusinessDay(new Date('2023-01-04'))).toBe(true); // Wednesday
    expect(isBusinessDay(new Date('2023-01-05'))).toBe(true); // Thursday
    expect(isBusinessDay(new Date('2023-01-06'))).toBe(true); // Friday
  });

  test('should identify non-business days', () => {
    // Saturday and Sunday are not business days
    expect(isBusinessDay(new Date('2023-01-07'))).toBe(false); // Saturday
    expect(isBusinessDay(new Date('2023-01-08'))).toBe(false); // Sunday
  });

  test('should handle invalid dates', () => {
    expect(isBusinessDay(new Date('invalid date'))).toBe(false);
    expect(isBusinessDay(null)).toBe(false);
    expect(isBusinessDay(undefined)).toBe(false);
  });
});

describe('nextBusinessDay', () => {
  test('should get next business day from weekday', () => {
    // Monday to Thursday -> next day
    expect(nextBusinessDay(new Date('2023-01-02'))).toEqual(
      new Date('2023-01-03'),
    ); // Monday -> Tuesday
    expect(nextBusinessDay(new Date('2023-01-03'))).toEqual(
      new Date('2023-01-04'),
    ); // Tuesday -> Wednesday
    expect(nextBusinessDay(new Date('2023-01-04'))).toEqual(
      new Date('2023-01-05'),
    ); // Wednesday -> Thursday
    expect(nextBusinessDay(new Date('2023-01-05'))).toEqual(
      new Date('2023-01-06'),
    ); // Thursday -> Friday
  });

  test('should skip weekend for Friday', () => {
    // Friday -> Monday
    expect(nextBusinessDay(new Date('2023-01-06'))).toEqual(
      new Date('2023-01-09'),
    ); // Friday -> Monday
  });

  test('should skip weekend for weekend days', () => {
    // Saturday and Sunday -> Monday
    expect(nextBusinessDay(new Date('2023-01-07'))).toEqual(
      new Date('2023-01-09'),
    ); // Saturday -> Monday
    expect(nextBusinessDay(new Date('2023-01-08'))).toEqual(
      new Date('2023-01-09'),
    ); // Sunday -> Monday
  });

  test('should handle invalid dates', () => {
    expect(nextBusinessDay(new Date('invalid date'))).toBeNull();
    expect(nextBusinessDay(null)).toBeNull();
    expect(nextBusinessDay(undefined)).toBeNull();
  });
});

describe('previousBusinessDay', () => {
  test('should get previous business day from weekday', () => {
    // Tuesday to Friday -> previous day
    expect(previousBusinessDay(new Date('2023-01-03'))).toEqual(
      new Date('2023-01-02'),
    ); // Tuesday -> Monday
    expect(previousBusinessDay(new Date('2023-01-04'))).toEqual(
      new Date('2023-01-03'),
    ); // Wednesday -> Tuesday
    expect(previousBusinessDay(new Date('2023-01-05'))).toEqual(
      new Date('2023-01-04'),
    ); // Thursday -> Wednesday
    expect(previousBusinessDay(new Date('2023-01-06'))).toEqual(
      new Date('2023-01-05'),
    ); // Friday -> Thursday
  });

  test('should skip weekend for Monday', () => {
    // Monday -> Friday
    expect(previousBusinessDay(new Date('2023-01-09'))).toEqual(
      new Date('2023-01-06'),
    ); // Monday -> Friday
  });

  test('should skip weekend for weekend days', () => {
    // Saturday and Sunday -> Friday
    expect(previousBusinessDay(new Date('2023-01-07'))).toEqual(
      new Date('2023-01-06'),
    ); // Saturday -> Friday
    expect(previousBusinessDay(new Date('2023-01-08'))).toEqual(
      new Date('2023-01-06'),
    ); // Sunday -> Friday
  });

  test('should handle invalid dates', () => {
    expect(previousBusinessDay(new Date('invalid date'))).toBeNull();
    expect(previousBusinessDay(null)).toBeNull();
    expect(previousBusinessDay(undefined)).toBeNull();
  });
});

describe('endOfMonth', () => {
  test('should get end of month for various months', () => {
    expect(endOfMonth(new Date('2023-01-15'))).toEqual(new Date('2023-01-31')); // January
    expect(endOfMonth(new Date('2023-02-10'))).toEqual(new Date('2023-02-28')); // February (non-leap year)
    expect(endOfMonth(new Date('2024-02-10'))).toEqual(new Date('2024-02-29')); // February (leap year)
    expect(endOfMonth(new Date('2023-04-05'))).toEqual(new Date('2023-04-30')); // April
    expect(endOfMonth(new Date('2023-12-25'))).toEqual(new Date('2023-12-31')); // December
  });

  test('should handle invalid dates', () => {
    expect(endOfMonth(new Date('invalid date'))).toBeNull();
    expect(endOfMonth(null)).toBeNull();
    expect(endOfMonth(undefined)).toBeNull();
  });
});

describe('startOfMonth', () => {
  test('should get start of month for various months', () => {
    expect(startOfMonth(new Date('2023-01-15'))).toEqual(
      new Date('2023-01-01'),
    ); // January
    expect(startOfMonth(new Date('2023-02-10'))).toEqual(
      new Date('2023-02-01'),
    ); // February
    expect(startOfMonth(new Date('2023-04-05'))).toEqual(
      new Date('2023-04-01'),
    ); // April
    expect(startOfMonth(new Date('2023-12-25'))).toEqual(
      new Date('2023-12-01'),
    ); // December
  });

  test('should handle invalid dates', () => {
    expect(startOfMonth(new Date('invalid date'))).toBeNull();
    expect(startOfMonth(null)).toBeNull();
    expect(startOfMonth(undefined)).toBeNull();
  });
});

describe('endOfQuarter', () => {
  test('should get end of quarter for various dates', () => {
    expect(endOfQuarter(new Date('2023-01-15')).toDateString()).toEqual(
      new Date('2023-03-31').toDateString(),
    ); // Q1
    expect(endOfQuarter(new Date('2023-05-10')).toDateString()).toEqual(
      new Date('2023-06-30').toDateString(),
    ); // Q2
    expect(endOfQuarter(new Date('2023-08-05')).toDateString()).toEqual(
      new Date('2023-09-30').toDateString(),
    ); // Q3
    expect(endOfQuarter(new Date('2023-11-25')).toDateString()).toEqual(
      new Date('2023-12-31').toDateString(),
    ); // Q4
  });

  test('should handle invalid dates', () => {
    expect(endOfQuarter(new Date('invalid date'))).toBeNull();
    expect(endOfQuarter(null)).toBeNull();
    expect(endOfQuarter(undefined)).toBeNull();
  });
});

describe('startOfQuarter', () => {
  test('should get start of quarter for various dates', () => {
    expect(startOfQuarter(new Date('2023-01-15')).toDateString()).toEqual(
      new Date('2023-01-01').toDateString(),
    ); // Q1
    expect(startOfQuarter(new Date('2023-05-10')).toDateString()).toEqual(
      new Date('2023-04-01').toDateString(),
    ); // Q2
    expect(startOfQuarter(new Date('2023-08-05')).toDateString()).toEqual(
      new Date('2023-07-01').toDateString(),
    ); // Q3
    expect(startOfQuarter(new Date('2023-11-25')).toDateString()).toEqual(
      new Date('2023-10-01').toDateString(),
    ); // Q4
  });

  test('should handle invalid dates', () => {
    expect(startOfQuarter(new Date('invalid date'))).toBeNull();
    expect(startOfQuarter(null)).toBeNull();
    expect(startOfQuarter(undefined)).toBeNull();
  });
});

describe('endOfYear', () => {
  test('should get end of year for various dates', () => {
    expect(endOfYear(new Date('2023-01-15')).toDateString()).toEqual(
      new Date('2023-12-31').toDateString(),
    );
    expect(endOfYear(new Date('2023-06-10')).toDateString()).toEqual(
      new Date('2023-12-31').toDateString(),
    );
    expect(endOfYear(new Date('2023-12-25')).toDateString()).toEqual(
      new Date('2023-12-31').toDateString(),
    );
    expect(endOfYear(new Date('2024-02-29')).toDateString()).toEqual(
      new Date('2024-12-31').toDateString(),
    ); // Leap year
  });

  test('should handle invalid dates', () => {
    expect(endOfYear(new Date('invalid date'))).toBeNull();
    expect(endOfYear(null)).toBeNull();
    expect(endOfYear(undefined)).toBeNull();
  });
});

describe('startOfYear', () => {
  test('should get start of year for various dates', () => {
    expect(startOfYear(new Date('2023-01-15')).toDateString()).toEqual(
      new Date('2023-01-01').toDateString(),
    );
    expect(startOfYear(new Date('2023-06-10')).toDateString()).toEqual(
      new Date('2023-01-01').toDateString(),
    );
    expect(startOfYear(new Date('2023-12-25')).toDateString()).toEqual(
      new Date('2023-01-01').toDateString(),
    );
    expect(startOfYear(new Date('2024-02-29')).toDateString()).toEqual(
      new Date('2024-01-01').toDateString(),
    ); // Leap year
  });

  test('should handle invalid dates', () => {
    expect(startOfYear(new Date('invalid date'))).toBeNull();
    expect(startOfYear(null)).toBeNull();
    expect(startOfYear(undefined)).toBeNull();
  });
});

describe('addBusinessDays', () => {
  test('should add business days correctly', () => {
    // Add 1 business day
    expect(addBusinessDays(new Date('2023-01-02'), 1)).toEqual(
      new Date('2023-01-03'),
    ); // Monday -> Tuesday

    // Add 3 business days
    expect(addBusinessDays(new Date('2023-01-02'), 3)).toEqual(
      new Date('2023-01-05'),
    ); // Monday -> Thursday

    // Add 5 business days (crossing weekend)
    expect(addBusinessDays(new Date('2023-01-05'), 5)).toEqual(
      new Date('2023-01-12'),
    ); // Thursday -> next Thursday

    // Add 0 business days
    expect(addBusinessDays(new Date('2023-01-02'), 0)).toEqual(
      new Date('2023-01-02'),
    ); // No change
  });

  test('should handle weekend start dates', () => {
    // Add business days from weekend
    expect(addBusinessDays(new Date('2023-01-07'), 1)).toEqual(
      new Date('2023-01-09'),
    ); // Saturday -> Monday
    expect(addBusinessDays(new Date('2023-01-08'), 1)).toEqual(
      new Date('2023-01-09'),
    ); // Sunday -> Monday
  });

  test('should handle invalid dates and inputs', () => {
    expect(addBusinessDays(new Date('invalid date'), 1)).toBeNull();
    expect(addBusinessDays(null, 1)).toBeNull();
    expect(addBusinessDays(undefined, 1)).toBeNull();
    expect(addBusinessDays(new Date('2023-01-02'), 'not a number')).toBeNull();
  });
});

describe('dateRange', () => {
  test('should generate daily date range', () => {
    const start = new Date('2023-01-01');
    const end = new Date('2023-01-05');

    const range = dateRange(start, end, 'D');

    expect(range.length).toBe(5);
    expect(range[0].toDateString()).toEqual(
      new Date('2023-01-01').toDateString(),
    );
    expect(range[1].toDateString()).toEqual(
      new Date('2023-01-02').toDateString(),
    );
    expect(range[2].toDateString()).toEqual(
      new Date('2023-01-03').toDateString(),
    );
    expect(range[3].toDateString()).toEqual(
      new Date('2023-01-04').toDateString(),
    );
    expect(range[4].toDateString()).toEqual(
      new Date('2023-01-05').toDateString(),
    );
  });

  test('should generate business day range', () => {
    const start = new Date('2023-01-01'); // Sunday
    const end = new Date('2023-01-08'); // Sunday

    const range = dateRange(start, end, 'B');

    expect(range.length).toBe(6); // Sunday, 5 business days, Sunday
    expect(range[0].toDateString()).toEqual(
      new Date('2023-01-01').toDateString(),
    ); // Sunday (start date)
    expect(range[1].toDateString()).toEqual(
      new Date('2023-01-02').toDateString(),
    ); // Monday
    expect(range[2].toDateString()).toEqual(
      new Date('2023-01-03').toDateString(),
    ); // Tuesday
    expect(range[3].toDateString()).toEqual(
      new Date('2023-01-04').toDateString(),
    ); // Wednesday
    expect(range[4].toDateString()).toEqual(
      new Date('2023-01-05').toDateString(),
    ); // Thursday
    expect(range[5].toDateString()).toEqual(
      new Date('2023-01-06').toDateString(),
    ); // Friday
  });

  test('should generate weekly date range', () => {
    const start = new Date('2023-01-01');
    const end = new Date('2023-01-29');

    const range = dateRange(start, end, 'W');

    expect(range.length).toBe(5);
    expect(range[0].toDateString()).toEqual(
      new Date('2023-01-01').toDateString(),
    );
    expect(range[1].toDateString()).toEqual(
      new Date('2023-01-08').toDateString(),
    );
    expect(range[2].toDateString()).toEqual(
      new Date('2023-01-15').toDateString(),
    );
    expect(range[3].toDateString()).toEqual(
      new Date('2023-01-22').toDateString(),
    );
    expect(range[4].toDateString()).toEqual(
      new Date('2023-01-29').toDateString(),
    );
  });

  test('should generate monthly date range', () => {
    const start = new Date('2023-01-01');
    const end = new Date('2023-06-01');

    const range = dateRange(start, end, 'M');

    expect(range.length).toBe(6);
    expect(range[0].toDateString()).toEqual(
      new Date('2023-01-01').toDateString(),
    );
    expect(range[1].toDateString()).toEqual(
      new Date('2023-02-01').toDateString(),
    );
    expect(range[2].toDateString()).toEqual(
      new Date('2023-03-01').toDateString(),
    );
    expect(range[3].toDateString()).toEqual(
      new Date('2023-04-01').toDateString(),
    );
    expect(range[4].toDateString()).toEqual(
      new Date('2023-05-01').toDateString(),
    );
    expect(range[5].toDateString()).toEqual(
      new Date('2023-06-01').toDateString(),
    );
  });

  test('should generate quarterly date range', () => {
    const start = new Date('2023-01-01');
    const end = new Date('2024-01-01');

    const range = dateRange(start, end, 'Q');

    expect(range.length).toBe(5);
    expect(range[0].toDateString()).toEqual(
      new Date('2023-01-01').toDateString(),
    );
    expect(range[1].toDateString()).toEqual(
      new Date('2023-04-01').toDateString(),
    );
    expect(range[2].toDateString()).toEqual(
      new Date('2023-07-01').toDateString(),
    );
    expect(range[3].toDateString()).toEqual(
      new Date('2023-10-01').toDateString(),
    );
    expect(range[4].toDateString()).toEqual(
      new Date('2024-01-01').toDateString(),
    );
  });

  test('should generate yearly date range', () => {
    const start = new Date('2020-01-01');
    const end = new Date('2025-01-01');

    const range = dateRange(start, end, 'Y');

    expect(range.length).toBe(6);
    expect(range[0].toDateString()).toEqual(
      new Date('2020-01-01').toDateString(),
    );
    expect(range[1].toDateString()).toEqual(
      new Date('2021-01-01').toDateString(),
    );
    expect(range[2].toDateString()).toEqual(
      new Date('2022-01-01').toDateString(),
    );
    expect(range[3].toDateString()).toEqual(
      new Date('2023-01-01').toDateString(),
    );
    expect(range[4].toDateString()).toEqual(
      new Date('2024-01-01').toDateString(),
    );
    expect(range[5].toDateString()).toEqual(
      new Date('2025-01-01').toDateString(),
    );
  });

  test('should handle invalid inputs', () => {
    expect(dateRange(new Date('invalid date'), new Date('2023-01-05'))).toEqual(
      [],
    );
    expect(dateRange(new Date('2023-01-01'), new Date('invalid date'))).toEqual(
      [],
    );
    expect(dateRange(null, new Date('2023-01-05'))).toEqual([]);
    expect(dateRange(new Date('2023-01-01'), null)).toEqual([]);
    expect(dateRange(undefined, new Date('2023-01-05'))).toEqual([]);
    expect(dateRange(new Date('2023-01-01'), undefined)).toEqual([]);

    // End date before start date
    expect(dateRange(new Date('2023-01-05'), new Date('2023-01-01'))).toEqual(
      [],
    );
  });

  test('should default to daily frequency if invalid frequency provided', () => {
    const start = new Date('2023-01-01');
    const end = new Date('2023-01-03');

    const range = dateRange(start, end, 'invalid');

    expect(range.length).toBe(3);
    expect(range[0]).toEqual(new Date('2023-01-01'));
    expect(range[1]).toEqual(new Date('2023-01-02'));
    expect(range[2]).toEqual(new Date('2023-01-03'));
  });
});
