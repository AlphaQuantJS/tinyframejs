/**
 * Simple CommonJS script to test Apache Arrow integration
 * Using .cjs extension to force CommonJS mode
 */

// Import Apache Arrow
console.log('Attempting to load Apache Arrow...');
let Arrow;
try {
  Arrow = require('apache-arrow');
  console.log('Apache Arrow loaded successfully');
  console.log(
    'Arrow exports:',
    Object.keys(Arrow).slice(0, 10),
    '... and more',
  );

  // Try to create a vector
  if (Arrow.vectorFromArray) {
    console.log('\nCreating vector from array...');
    const vector = Arrow.vectorFromArray(['test', 'data']);
    console.log('Vector created successfully');
    console.log('Vector type:', vector.constructor.name);
    console.log('Vector length:', vector.length);
    console.log('Vector data:', vector.toArray());
  } else {
    console.log('Arrow.vectorFromArray is not available');
  }
} catch (e) {
  console.error('Error loading Apache Arrow:', e);
}

// Import our VectorFactory
console.log('\nAttempting to load VectorFactory...');
try {
  const {
    TypedArrayVector,
  } = require('./src/core/storage/TypedArrayVector.js');
  const { ArrowVector } = require('./src/core/storage/ArrowVector.js');
  const { VectorFactory } = require('./src/core/storage/VectorFactory.js');

  console.log('VectorFactory loaded successfully');

  // Test with string data (should use Arrow)
  console.log('\nTesting with string data:');
  const stringVector = VectorFactory.from(['apple', 'banana', 'cherry']);
  console.log('Vector type:', stringVector.constructor.name);
  console.log('Is ArrowVector:', stringVector instanceof ArrowVector);
  console.log('Is TypedArrayVector:', stringVector instanceof TypedArrayVector);
  console.log('Vector data:', stringVector.toArray());

  // Test with numeric data (should use TypedArray)
  console.log('\nTesting with numeric data:');
  const numericVector = VectorFactory.from([1, 2, 3, 4, 5]);
  console.log('Vector type:', numericVector.constructor.name);
  console.log('Is ArrowVector:', numericVector instanceof ArrowVector);
  console.log(
    'Is TypedArrayVector:',
    numericVector instanceof TypedArrayVector,
  );
  console.log('Vector data:', numericVector.toArray());

  // Test with preferArrow option (should force Arrow for numeric data)
  console.log('\nTesting with preferArrow option:');
  const preferArrowVector = VectorFactory.from([1, 2, 3, 4, 5], {
    preferArrow: true,
  });
  console.log('Vector type:', preferArrowVector.constructor.name);
  console.log('Is ArrowVector:', preferArrowVector instanceof ArrowVector);
  console.log(
    'Is TypedArrayVector:',
    preferArrowVector instanceof TypedArrayVector,
  );
  console.log('Vector data:', preferArrowVector.toArray());
} catch (e) {
  console.error('Error testing VectorFactory:', e);
}
