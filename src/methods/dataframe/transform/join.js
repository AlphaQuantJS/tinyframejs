/**
 * Join two DataFrames on specified columns
 *
 * @returns {Function} - Function that takes a DataFrame and joins it with another DataFrame
 */
export const join =
  () =>
  (df, other, options = {}) => {
    const {
      on = null, // Column(s) to join on
      leftOn = null, // Left DataFrame column(s) to join on
      rightOn = null, // Right DataFrame column(s) to join on
      how = 'inner', // Join type: 'inner', 'left', 'right', 'outer'
      suffix = ['_x', '_y'], // Suffixes for overlapping column names
    } = options;

    // Validate other DataFrame
    if (!other || !other.columns) {
      throw new Error('Other DataFrame is required');
    }

    // Validate join type
    if (!['inner', 'left', 'right', 'outer'].includes(how)) {
      throw new Error(
        `Invalid join type: ${how}. Must be one of: inner, left, right, outer`,
      );
    }

    // Determine join columns
    let leftCols, rightCols;

    if (on) {
      // Join on same column names in both DataFrames
      if (!Array.isArray(on)) {
        leftCols = [on];
        rightCols = [on];
      } else {
        leftCols = on;
        rightCols = on;
      }
    } else if (leftOn && rightOn) {
      // Join on different column names
      if (!Array.isArray(leftOn)) {
        leftCols = [leftOn];
        rightCols = [rightOn];
      } else {
        leftCols = leftOn;
        rightCols = rightOn;
      }
    } else {
      throw new Error(
        'Join columns must be specified using either "on" or both "left_on" and "right_on"',
      );
    }

    // Validate join columns
    for (const col of leftCols) {
      if (!df.columns.includes(col)) {
        throw new Error(`Column '${col}' not found in left DataFrame`);
      }
    }

    for (const col of rightCols) {
      if (!other.columns.includes(col)) {
        throw new Error(`Column '${col}' not found in right DataFrame`);
      }
    }

    // Get rows from both DataFrames
    const leftRows = df.toArray();
    const rightRows = other.toArray();

    // Create a map of right rows by join key
    const rightMap = new Map();

    for (const row of rightRows) {
      const key = rightCols.map((col) => row[col]).join('|');
      if (!rightMap.has(key)) {
        rightMap.set(key, []);
      }
      rightMap.get(key).push(row);
    }

    // Perform the join
    const joinedRows = [];

    // Set of columns in the result DataFrame
    const resultColumns = new Set();

    // Add all columns from left DataFrame
    for (const col of df.columns) {
      resultColumns.add(col);
    }

    // Add columns from right DataFrame with suffixes for overlapping names
    for (const col of other.columns) {
      if (df.columns.includes(col) && !leftCols.includes(col)) {
        // Column exists in both DataFrames, add suffix
        resultColumns.add(`${col}${suffix[1]}`);
      } else if (
        !rightCols.includes(col) ||
        !leftCols.includes(rightCols[rightCols.indexOf(col)])
      ) {
        // Column only exists in right DataFrame or is not a join column
        resultColumns.add(col);
      }
    }

    // Inner join or left part of outer join
    for (const leftRow of leftRows) {
      const key = leftCols.map((col) => leftRow[col]).join('|');
      const matchingRightRows = rightMap.get(key) || [];

      if (matchingRightRows.length > 0) {
        // Match found, create joined rows
        for (const rightRow of matchingRightRows) {
          const joinedRow = { ...leftRow };

          // Add columns from right row
          for (const col of other.columns) {
            if (df.columns.includes(col) && !leftCols.includes(col)) {
              // Column exists in both DataFrames, add suffix
              joinedRow[`${col}${suffix[1]}`] = rightRow[col];
              // Rename left column if needed
              if (!joinedRow.hasOwnProperty(`${col}${suffix[0]}`)) {
                joinedRow[`${col}${suffix[0]}`] = leftRow[col];
                delete joinedRow[col];
              }
            } else if (
              !rightCols.includes(col) ||
              !leftCols.includes(rightCols[rightCols.indexOf(col)])
            ) {
              // Column only exists in right DataFrame or is not a join column
              joinedRow[col] = rightRow[col];
            }
          }

          joinedRows.push(joinedRow);
        }
      } else if (how === 'left' || how === 'outer') {
        // No match but include in left join or outer join
        const joinedRow = { ...leftRow };

        // Add null values for right columns
        for (const col of other.columns) {
          if (df.columns.includes(col) && !leftCols.includes(col)) {
            // Column exists in both DataFrames, add suffix
            // Use NaN for numeric columns, null for others
            const colType = typeof rightRows[0]?.[col];
            joinedRow[`${col}${suffix[1]}`] = colType === 'number' ? NaN : null;
            // Rename left column if needed
            if (!joinedRow.hasOwnProperty(`${col}${suffix[0]}`)) {
              joinedRow[`${col}${suffix[0]}`] = leftRow[col];
              delete joinedRow[col];
            }
          } else if (
            !rightCols.includes(col) ||
            !leftCols.includes(rightCols[rightCols.indexOf(col)])
          ) {
            // Column only exists in right DataFrame or is not a join column
            // Use NaN for numeric columns, null for others
            const colType = typeof rightRows[0]?.[col];
            joinedRow[col] = colType === 'number' ? NaN : null;
          }
        }

        joinedRows.push(joinedRow);
      }
    }

    // Right join or right part of outer join
    if (how === 'right' || how === 'outer') {
      // Create a set of keys from left rows
      const leftKeys = new Set(
        leftRows.map((row) => leftCols.map((col) => row[col]).join('|')),
      );

      // Add right rows that don't have a match in left
      for (const rightRow of rightRows) {
        const key = rightCols.map((col) => rightRow[col]).join('|');

        if (!leftKeys.has(key)) {
          const joinedRow = {};

          // Add null values for left columns
          for (const col of df.columns) {
            if (other.columns.includes(col) && !rightCols.includes(col)) {
              // Column exists in both DataFrames, add suffix
              // Use NaN for numeric columns, null for others
              const colType = typeof leftRows[0]?.[col];
              joinedRow[`${col}${suffix[0]}`] =
                colType === 'number' ? NaN : null;
            } else if (
              !leftCols.includes(col) ||
              !rightCols.includes(leftCols[leftCols.indexOf(col)])
            ) {
              // Column only exists in left DataFrame or is not a join column
              // Use NaN for numeric columns, null for others
              const colType = typeof leftRows[0]?.[col];
              joinedRow[col] = colType === 'number' ? NaN : null;
            }
          }

          // Add values from right row
          for (const col of other.columns) {
            if (df.columns.includes(col) && !rightCols.includes(col)) {
              // Column exists in both DataFrames, add suffix
              joinedRow[`${col}${suffix[1]}`] = rightRow[col];
            } else if (
              !rightCols.includes(col) ||
              !leftCols.includes(rightCols[rightCols.indexOf(col)])
            ) {
              // Column only exists in right DataFrame or is not a join column
              joinedRow[col] = rightRow[col];
            } else {
              // Join column
              joinedRow[col] = rightRow[col];
            }
          }

          joinedRows.push(joinedRow);
        }
      }
    }

    // Create a new DataFrame from joined rows
    return df.constructor.fromRows(joinedRows);
  };

export default { join };
