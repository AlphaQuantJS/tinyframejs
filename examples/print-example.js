// examples/print-example.js

import { DataFrame } from '../src/core/DataFrame.js';

// Create sample data
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
  { name: 'Mike', age: 85, city: 'Miami', salary: 195000 },
  { name: 'Nancy', age: 90, city: 'Nashville', salary: 205000 },
  { name: 'Oscar', age: 95, city: 'Oakland', salary: 215000 },
  { name: 'Patty', age: 100, city: 'Portland', salary: 225000 },
  { name: 'Quincy', age: 105, city: 'Queens', salary: 235000 },
  { name: 'Randy', age: 110, city: 'Richmond', salary: 245000 },
  { name: 'Sarah', age: 115, city: 'Seattle', salary: 255000 },
  { name: 'Tom', age: 120, city: 'Tampa', salary: 265000 },
];

// Create DataFrame
const df = DataFrame.create(data);

// Use the print method to display data in the console
console.log('Standard output (default):');
df.print();

console.log('\nOutput with row limit (first 5 rows):');
df.print(5);

console.log('\nOutput with column limit (first 2 columns):');
df.print(undefined, 2);

console.log('\nOutput with both row and column limits:');
df.print(3, 2);
