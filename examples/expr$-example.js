// examples/expr$-example.js

// Import DataFrame from the library
import { DataFrame } from '../src/core/DataFrame.js';

// Create test data
const testData = [
  {
    id: 1,
    name: 'Alice',
    age: 25,
    city: 'New York',
    salary: 75000,
    department: 'IT',
  },
  {
    id: 2,
    name: 'Bob',
    age: 30,
    city: 'Boston',
    salary: 85000,
    department: 'HR',
  },
  {
    id: 3,
    name: 'Charlie',
    age: 35,
    city: 'Chicago',
    salary: 92000,
    department: 'IT',
  },
  {
    id: 4,
    name: 'David',
    age: 40,
    city: 'Denver',
    salary: 105000,
    department: 'Finance',
  },
  {
    id: 5,
    name: 'Eve',
    age: 45,
    city: 'Seattle',
    salary: 110000,
    department: 'HR',
  },
  {
    id: 6,
    name: 'Frank',
    age: 50,
    city: 'San Francisco',
    salary: 125000,
    department: 'IT',
  },
  {
    id: 7,
    name: 'Grace',
    age: 55,
    city: 'Los Angeles',
    salary: 130000,
    department: 'Finance',
  },
  {
    id: 8,
    name: 'Heidi',
    age: 60,
    city: 'Houston',
    salary: 95000,
    department: 'HR',
  },
  {
    id: 9,
    name: 'Ivan',
    age: 65,
    city: 'Miami',
    salary: 88000,
    department: 'IT',
  },
  {
    id: 10,
    name: 'Judy',
    age: 70,
    city: 'Atlanta',
    salary: 82000,
    department: 'Finance',
  },
];

// Create DataFrame
const df = DataFrame.create(testData);

console.log('=== Demonstration of expr$() method in TinyFrameJS ===');

// Comparison of different filtering methods
console.log('\n1. Comparison of different filtering methods:');

console.log('\n1.1. Using filter() with predicate function:');
console.log('df.filter(row => row.age > 40)');
df.filter((row) => row.age > 40);

console.log('\n1.2. Using where() with column and operator:');
console.log("df.where('age', '>', 40);");
df.where('age', '>', 40);

console.log('\n1.3. Using expr$() with direct expression:');
console.log('df.expr$`age > 40`');
df.expr$`age > 40`;

// Examples of using expr$() with different expressions
console.log('\n2. Examples of using expr$() with different expressions:');

console.log('\n2.1. Simple comparison:');
console.log('df.expr$`age > 40`');
df.expr$`age > 40`;

console.log('\n2.2. String comparison:');
console.log('df.expr$`department == "IT"`');
df.expr$`department == "IT"`;

console.log('\n2.3. Complex conditions with logical operators:');
console.log('df.expr$`age > 30 && salary > 100000`');
df.expr$`age > 30 && salary > 100000`;

console.log('\n2.4. Using string methods:');
console.log('df.expr$`city_includes("Francisco")`');
df.expr$`city_includes("Francisco")`;

console.log('\n2.5. Combining conditions:');
console.log('df.expr$`department == "IT" && salary > 90000`');
df.expr$`department == "IT" && salary > 90000`;

// Using variables in expressions
console.log('\n3. Using variables in expressions:');

const minAge = 50;
const departments = ['IT', 'Finance'];

console.log('\n3.1. Using a variable:');
console.log('df.expr$`age >= ${minAge}`');
df.expr$`age >= ${minAge}`;

console.log('\n3.2. Using an array:');
console.log('df.expr$`department == "IT" || department == "Finance"`');
df.expr$`department == "IT" || department == "Finance"`;

// Method chaining with expr$()
console.log('\n4. Method chaining with expr$():');

console.log('\n4.1. Filtering and selecting columns:');
console.log('df.expr$`age > 40`.select(["name", "age", "salary"])');
df.expr$`age > 40`.select(['name', 'age', 'salary']);

console.log('\n4.2. Filtering and sorting:');
console.log('df.expr$`department == "IT"`.sort("salary")');
df.expr$`department == "IT"`.sort('salary');

console.log('\n=== End of demonstration ===');
