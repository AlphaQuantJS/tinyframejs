/**
 * Simple script to test Apache Arrow integration
 */

// Try to load Apache Arrow
console.log('Attempting to load Apache Arrow...');
try {
  // Use dynamic import for ESM
  import('apache-arrow')
    .then((Arrow) => {
      console.log('Apache Arrow loaded successfully');
      console.log('Arrow version:', Arrow.version);
      console.log('Arrow exports:', Object.keys(Arrow));

      // Try to create a vector
      if (Arrow.vectorFromArray) {
        console.log('Creating vector from array...');
        const vector = Arrow.vectorFromArray(['test', 'data']);
        console.log('Vector created successfully');
        console.log('Vector type:', vector.constructor.name);
        console.log('Vector length:', vector.length);
        console.log('Vector data:', vector.toArray());
      } else {
        console.log('Arrow.vectorFromArray is not available');
        console.log('Looking for alternative methods...');

        // Check for other vector creation methods
        const methods = Object.keys(Arrow).filter(
          (key) =>
            typeof Arrow[key] === 'function' &&
            key.toLowerCase().includes('vector'),
        );
        console.log('Potential vector methods:', methods);
      }
    })
    .catch((e) => {
      console.error('Error loading Apache Arrow:', e);
    });
} catch (e) {
  console.error('Error with dynamic import of Apache Arrow:', e);
}
