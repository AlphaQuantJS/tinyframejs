// src/methods/filtering/expr$.js

/**
 * Creates a function that filters rows in a DataFrame using template literals.
 * This provides a more intuitive syntax similar to Pandas:
 * df.expr$`age > 40` or df.expr$`department == "IT"`
 *
 * @returns {Function} Function that filters rows using template literals
 */
export const expr$ =
  () =>
    (frame, strings, ...values) => {
    // Combine the template strings and values to get the full expression
      const expressionStr = strings.reduce(
        (acc, str, i) =>
          acc + str + (values[i] !== undefined ? JSON.stringify(values[i]) : ''),
        '',
      );

      // Get all column names
      const columns = Object.keys(frame.columns);
      const result = {
        columns: {},
        columnNames: [...columns], // Add columnNames property
        dtypes: { ...frame.dtypes }, // Copy dtypes if available
      };

      // Initialize empty arrays for each column
      columns.forEach((column) => {
        result.columns[column] = [];
      });

      // Get the number of rows
      const originalRowCount = frame.columns[columns[0]]?.length || 0;

      // Create a function that will evaluate the expression for each row
      // We need to use new Function to dynamically create a function from the expression
      // This is similar to how the query method works but with a simpler syntax
      const createFilterFn = (expr) => {
        try {
        // Create a function that takes a row object and evaluates the expression
        // We add some helper methods to make string operations more intuitive
          return new Function(
            'row',
            `
        // Add helper methods for string operations
        const stringHelpers = {
          includes: (str, search) => String(str).includes(search),
          startsWith: (str, search) => String(str).startsWith(search),
          endsWith: (str, search) => String(str).endsWith(search),
          match: (str, regex) => String(str).match(regex) !== null,
          toLowerCase: (str) => String(str).toLowerCase(),
          toUpperCase: (str) => String(str).toUpperCase(),
          trim: (str) => String(str).trim()
        };
        
        // Destructure the row object to make column names directly accessible
        const { ${columns.join(', ')} } = row;
        
        // Add string helper methods to each string column
        ${columns
    .map(
      (col) => `
          const ${col}_includes = (search) => stringHelpers.includes(${col}, search);
          const ${col}_startsWith = (search) => stringHelpers.startsWith(${col}, search);
          const ${col}_endsWith = (search) => stringHelpers.endsWith(${col}, search);
          const ${col}_match = (regex) => stringHelpers.match(${col}, regex);
          const ${col}_toLowerCase = () => stringHelpers.toLowerCase(${col});
          const ${col}_toUpperCase = () => stringHelpers.toUpperCase(${col});
          const ${col}_trim = () => stringHelpers.trim(${col});
        `,
    )
    .join('\n')}
        
        // Evaluate the expression
        return ${expr};
        `,
          );
        } catch (error) {
          throw new Error(`Invalid expression: ${expr}. Error: ${error.message}`);
        }
      };

      // Create the filter function
      const filterFn = createFilterFn(expressionStr);

      // Apply the filter to each row
      for (let i = 0; i < originalRowCount; i++) {
      // Create a row object
        const row = {};
        columns.forEach((column) => {
          row[column] = frame.columns[column][i];
        });

        // Check if the row passes the filter
        try {
          if (filterFn(row)) {
          // Add the row to the result
            columns.forEach((column) => {
              result.columns[column].push(frame.columns[column][i]);
            });
          }
        } catch (error) {
          throw new Error(
            `Error evaluating expression for row ${i}: ${error.message}`,
          );
        }
      }

      // Update rowCount after filtering
      result.rowCount = result.columns[columns[0]]?.length || 0;

      // Convert arrays to typed arrays if the original columns were typed
      columns.forEach((column) => {
        const originalArray = frame.columns[column];
        if (originalArray instanceof Float64Array) {
          result.columns[column] = new Float64Array(result.columns[column]);
        } else if (originalArray instanceof Int32Array) {
          result.columns[column] = new Int32Array(result.columns[column]);
        }
      });

      // Add metadata for printing
      result._meta = {
        ...result._meta,
        shouldPrint: true, // Always print by default
      };

      return result;
    };
