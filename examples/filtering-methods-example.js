// examples/filtering-methods-example.js

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

console.log('=== Demonstration of filtering methods in TinyFrameJS ===');

// Example 1: Using head() and tail()
console.log('\n1. head() and tail() methods:');
console.log('\n1.1. Getting first 3 rows:');
df.head(3);

console.log('\n1.2. Getting last 3 rows:');
df.tail(3);

// Example 2: Using select() to choose columns
console.log('\n2. select() method:');
console.log('\n2.1. Selecting columns name and age:');
df.select(['name', 'age']);

console.log(
  '\n2.2. Selecting columns name, city and salary with automatic output disabled:',
);
const selectedColumns = df.select(['name', 'city', 'salary'], { print: false });
console.log(`Row count: ${selectedColumns.rowCount}`);
console.log(`Column names: ${selectedColumns.columns.join(', ')}`);
selectedColumns.print();

// Example 3: Using drop() to remove columns
console.log('\n3. drop() method:');
console.log('\n3.1. Removing columns city and salary:');
const droppedColumns = df.drop(['city', 'salary'], { print: false });
droppedColumns.print();

// Example 4: Using filter() for row filtering
console.log('\n4. filter() method:');
console.log('\n4.1. Filtering rows where age is greater than 40:');
const filteredByAge = df.filter((row) => row.age > 40, { print: false });
filteredByAge.print();

console.log('\n4.2. Filtering with multiple conditions:');
const filteredComplex = df.filter(
  (row) => row.age > 30 && row.salary > 100000,
  { print: false },
);
filteredComplex.print();

// Example 5: Using selectByPattern() to select columns by pattern
console.log('\n5. selectByPattern() method:');
console.log('\n5.1. Selecting columns that start with "s":');
const startsWithS = df.selectByPattern('^s', { print: false });
startsWithS.print();

console.log('\n5.2. Selecting columns containing "a":');
const containsA = df.selectByPattern('a', { print: false });
containsA.print();

console.log('\n5.3. Attempt to select non-existent columns:');
const emptyResult = df.selectByPattern('xyz', { print: false });
console.log(`Row count: ${emptyResult.rowCount}`);
console.log(`Column count: ${emptyResult.columns.length}`);

// Example 6: Using query() for SQL-like queries
console.log('\n6. query() method:');
console.log('\n6.1. Simple query:');
const queryIT = df.query("department == 'IT'", { print: false });
queryIT.print();

console.log('\n6.2. Complex query:');
const complexQuery = df.query(
  "age > 40 and salary > 100000 or city.includes('Francisco')",
  { print: false },
);
complexQuery.print();

// Example 7: Using where() for column filtering with enhanced operators
console.log('\n7. where() method:');
console.log('\n7.1. Basic comparison operators:');
console.log('\n7.1.1. Greater than:');
const ageGreaterThan40 = df.where('age', '>', 40, { print: false });
ageGreaterThan40.print();

console.log('\n7.1.2. Equality:');
const itDepartment = df.where('department', '==', 'IT', { print: false });
itDepartment.print();

console.log('\n7.2. String operators:');
console.log('\n7.2.1. Contains:');
const cityContainsFrancisco = df.where('city', 'contains', 'Francisco', {
  print: false,
});
cityContainsFrancisco.print();

console.log('\n7.2.2. StartsWith:');
const nameStartsWithA = df.where('name', 'startsWith', 'A', { print: false });
nameStartsWithA.print();

console.log('\n7.3. Collection operators:');
console.log('\n7.3.1. In:');
const departmentInList = df.where('department', 'in', ['IT', 'Finance'], {
  print: false,
});
departmentInList.print();

console.log('\n7.4. Chain of conditions:');
const highPaidIT = df
  .where('salary', '>', 90000)
  .where('department', '==', 'IT');
console.log(`Result contains ${highPaidIT.rowCount} rows`);
highPaidIT.print();

// Example 8: Using expr$() with template literals
console.log('\n8. expr$() method:');
console.log('\n8.1. Simple expression:');
console.log('df.expr$`age > 40`');
df.expr$`age > 40`;

console.log('\n8.2. Complex expression:');
console.log('df.expr$`age > 30 && salary > 100000`');
df.expr$`age > 30 && salary > 100000`;

console.log('\n8.3. Using string methods:');
console.log('df.expr$`city_includes("Francisco")`');
df.expr$`city_includes("Francisco")`;

console.log('\n8.4. Using variables in expressions:');
const minAge = 50;
console.log('df.expr$`age >= ${minAge}`');
df.expr$`age >= ${minAge}`;

// Example 9: Using iloc() for index-based selection
console.log('\n9. iloc() method:');
console.log('\n9.1. Selecting rows 0 and 2, columns 1 and 3:');
const ilocResult = df.iloc([0, 2], [1, 3], { print: false });
ilocResult.print();

// Example 10: Using loc() for label-based selection
console.log('\n10. loc() method:');
console.log('\n10.1. Selecting rows 0 and 2, columns name and salary:');
const locResult = df.loc([0, 2], ['name', 'salary'], { print: false });
locResult.print();

// Example 11: Method chaining
console.log('\n11. Method chaining:');
console.log('\n11.1. Filtering + selecting columns + head:');
const result = df
  .filter((row) => row.age > 30)
  .select(['name', 'age', 'salary'])
  .head(3);

console.log('\n=== End of demonstration ===');
