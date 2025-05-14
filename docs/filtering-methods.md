# Filtering Methods in TinyFrameJS

TinyFrameJS provides several powerful methods for filtering data in your DataFrame. Each method offers a different syntax style to accommodate various programming preferences.

## Overview of Filtering Methods

TinyFrameJS offers four main approaches to filtering data:

1. **filter()**: Functional JavaScript style using predicate functions
2. **where()**: Pandas-like style with column, operator, and value parameters
3. **expr$()**: Modern JavaScript style using template literals
4. **query()**: SQL-like style with string expressions

## Detailed Method Descriptions

### filter(predicate, options)

The `filter()` method uses a standard JavaScript predicate function to filter rows.

**Parameters:**
- `predicate`: A function that takes a row object and returns a boolean
- `options`: (Optional) Configuration options
  - `print`: Boolean, whether to print the result (default: true)

**Example:**
```javascript
// Filter rows where age is greater than 40
df.filter(row => row.age > 40);

// Filter with multiple conditions
df.filter(row => row.age > 30 && row.salary > 100000);
```

### where(column, operator, value, options)

The `where()` method provides a Pandas-like syntax for filtering, specifying a column, an operator, and a value.

**Parameters:**
- `column`: String, the column name to filter on
- `operator`: String, the comparison operator
- `value`: The value to compare against
- `options`: (Optional) Configuration options
  - `print`: Boolean, whether to print the result (default: true)

**Supported Operators:**
- Comparison operators: `==`, `===`, `!=`, `!==`, `>`, `>=`, `<`, `<=`
- Collection operators: `in`
- String operators: `contains`, `startsWith`/`startswith`, `endsWith`/`endswith`, `matches`

**Example:**
```javascript
// Filter rows where age is greater than 40
df.where('age', '>', 40);

// Filter rows where department equals 'IT'
df.where('department', '==', 'IT');

// Filter rows where city contains 'Francisco'
df.where('city', 'contains', 'Francisco');

// Filter rows where department is in a list
df.where('department', 'in', ['IT', 'Finance']);

// Filter rows where name starts with 'A'
df.where('name', 'startsWith', 'A');
```

### expr$(templateString)

The `expr$()` method uses tagged template literals for a more intuitive and expressive syntax.

**Parameters:**
- `templateString`: A template literal containing the expression

**Example:**
```javascript
// Filter rows where age is greater than 40
df.expr$`age > 40`;

// Filter with multiple conditions
df.expr$`age > 30 && salary > 100000`;

// Filter using string methods
df.expr$`city_includes("Francisco")`;

// Using variables in expressions
const minAge = 50;
df.expr$`age >= ${minAge}`;
```

### query(expression, options)

The `query()` method provides an SQL-like syntax for filtering data.

**Parameters:**
- `expression`: String, an SQL-like expression
- `options`: (Optional) Configuration options
  - `print`: Boolean, whether to print the result (default: true)

**Example:**
```javascript
// Filter rows where department equals 'IT'
df.query("department == 'IT'");

// Filter with multiple conditions
df.query("age > 40 and salary > 100000 or city.includes('Francisco')");
```

## Method Chaining

All filtering methods can be chained with other DataFrame methods:

```javascript
// Filter and select columns
df.where('age', '>', 40).select(['name', 'age', 'salary']);

// Multiple filters
df.where('age', '>', 30).where('salary', '>', 100000);

// Filter and sort
df.expr$`department == "IT"`.sort('salary');
```

## Choosing the Right Method

- Use `filter()` when you need full JavaScript functionality in your filter logic
- Use `where()` when you prefer a clean, column-based syntax
- Use `expr$()` when you want to use template literals for dynamic expressions
- Use `query()` when you prefer SQL-like syntax for complex queries

Each method offers the same filtering capabilities with different syntax styles, allowing you to choose the approach that best fits your coding style and requirements.
