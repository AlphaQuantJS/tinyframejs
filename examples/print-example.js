// examples/print-example.js

import { DataFrame } from '../src/core/DataFrame.js';

// Create test data
const data = [
  { name: 'Alice', age: 25, city: 'New York', salary: 75000 },
  { name: 'Bob', age: 30, city: 'Boston', salary: 85000 },
  { name: 'Charlie', age: 35, city: 'Chicago', salary: 95000 },
  { name: 'David', age: 40, city: 'Denver', salary: 105000 },
  { name: 'Eve', age: 45, city: 'El Paso', salary: 115000 },
  { name: 'Frank', age: 50, city: 'Fresno', salary: 125000 },
  { name: 'Grace', age: 55, city: 'Greensboro', salary: 135000 },
  { name: 'Hannah', age: 60, city: 'Houston', salary: 145000 },
  { name: 'Ian', age: 65, city: 'Indianapolis', salary: 155000 },
  { name: 'Julia', age: 70, city: 'Jacksonville', salary: 165000 },
  { name: 'Kevin', age: 75, city: 'Kansas City', salary: 175000 },
  { name: 'Laura', age: 80, city: 'Los Angeles', salary: 185000 },
];

// Create DataFrame
const df = DataFrame.create(data);

// Use the print method to display data in the console
console.log('Standard output (default 10 rows):');
df.print();

console.log('\nOutput with row limit:');
df.print({ maxRows: 5 });

console.log('\nOutput with column limit:');
df.print({ maxCols: 2 });

console.log('\nOutput without indices:');
df.print({ showIndex: false });

console.log('\nFull output:');
df.print({ maxRows: 20, maxCols: 10 });

// Example of using in a method chain (when they are implemented)
// df.sort('age').filter(row => row.salary > 100000).print();
