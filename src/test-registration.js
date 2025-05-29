// Testing method registration
import { DataFrame } from './core/dataframe/DataFrame.js';
import { Series } from './core/dataframe/Series.js';
import { extendClasses } from './methods/autoExtend.js';

// Create a test DataFrame
const df = new DataFrame({
  a: [1, 2, 3],
  b: [4, 5, 6],
});

// Check if methods are registered
console.log('DataFrame methods:');
console.log('- melt:', typeof df.melt === 'function');
console.log('- pivot:', typeof df.pivot === 'function');
console.log('- sum:', typeof df.sum === 'function');
console.log('- filter:', typeof df.filter === 'function');

// Explicitly call the method registration function
console.log('\nRegistering methods explicitly...');
extendClasses({ DataFrame, Series });

// Check again
console.log('\nDataFrame methods after explicit registration:');
console.log('- melt:', typeof df.melt === 'function');
console.log('- pivot:', typeof df.pivot === 'function');
console.log('- sum:', typeof df.sum === 'function');
console.log('- filter:', typeof df.filter === 'function');
