// tests/viz-tests.js

import { DataFrame } from '../src/core/DataFrame.js';
import {
  lineChart,
  barChart,
  scatterPlot,
  pieChart,
  histogram,
} from '../src/viz/types/index.js';

// Test data
const sampleData = [
  { date: '2023-01-01', value: 10, category: 'A' },
  { date: '2023-01-02', value: 15, category: 'B' },
  { date: '2023-01-03', value: 7, category: 'A' },
  { date: '2023-01-04', value: 20, category: 'C' },
  { date: '2023-01-05', value: 12, category: 'B' },
];

// Create DataFrame
const df = DataFrame.create(sampleData);

// Test functions
function testLineChart() {
  console.log('Testing lineChart...');
  try {
    const config = lineChart(df, {
      x: 'date',
      y: 'value',
      chartOptions: { title: 'Line Chart Test' },
    });

    // Check if configuration is valid
    if (config && config.type === 'line' && config.data && config.options) {
      console.log('✅ lineChart test passed');
      return true;
    } else {
      console.log('❌ lineChart test failed: Invalid configuration');
      return false;
    }
  } catch (error) {
    console.log(`❌ lineChart test failed: ${error.message}`);
    return false;
  }
}

function testBarChart() {
  console.log('Testing barChart...');
  try {
    const config = barChart(df, {
      x: 'category',
      y: 'value',
      chartOptions: { title: 'Bar Chart Test' },
    });

    // Check if configuration is valid
    if (config && config.type === 'bar' && config.data && config.options) {
      console.log('✅ barChart test passed');
      return true;
    } else {
      console.log('❌ barChart test failed: Invalid configuration');
      return false;
    }
  } catch (error) {
    console.log(`❌ barChart test failed: ${error.message}`);
    return false;
  }
}

function testScatterPlot() {
  console.log('Testing scatterPlot...');
  try {
    const config = scatterPlot(df, {
      x: 'date',
      y: 'value',
      chartOptions: { title: 'Scatter Plot Test' },
    });

    // Check if configuration is valid
    if (config && config.type === 'scatter' && config.data && config.options) {
      console.log('✅ scatterPlot test passed');
      return true;
    } else {
      console.log('❌ scatterPlot test failed: Invalid configuration');
      return false;
    }
  } catch (error) {
    console.log(`❌ scatterPlot test failed: ${error.message}`);
    return false;
  }
}

function testPieChart() {
  console.log('Testing pieChart...');
  try {
    // Aggregate data by category
    const categoryData = [];
    const dfArray = df.toArray();
    const categories = [...new Set(dfArray.map((row) => row.category))];

    categories.forEach((category) => {
      const categoryRows = dfArray.filter((row) => row.category === category);
      const totalValue = categoryRows.reduce((sum, row) => sum + row.value, 0);
      categoryData.push({ category, totalValue });
    });

    const categoryDf = DataFrame.create(categoryData);

    const config = pieChart(categoryDf, {
      x: 'category',
      y: 'totalValue',
      chartOptions: { title: 'Pie Chart Test' },
    });

    // Check if configuration is valid
    if (config && config.type === 'pie' && config.data && config.options) {
      console.log('✅ pieChart test passed');
      return true;
    } else {
      console.log('❌ pieChart test failed: Invalid configuration');
      return false;
    }
  } catch (error) {
    console.log(`❌ pieChart test failed: ${error.message}`);
    return false;
  }
}

function testHistogram() {
  console.log('Testing histogram...');
  try {
    const config = histogram(df, {
      column: 'value',
      bins: 5,
      chartOptions: { title: 'Histogram Test' },
    });

    // Check if configuration is valid
    if (config && config.type === 'bar' && config.data && config.options) {
      console.log('✅ histogram test passed');
      return true;
    } else {
      console.log('❌ histogram test failed: Invalid configuration');
      return false;
    }
  } catch (error) {
    console.log(`❌ histogram test failed: ${error.message}`);
    return false;
  }
}

// Run all tests
function runAllTests() {
  console.log('Running visualization module tests...');

  const results = [
    testLineChart(),
    testBarChart(),
    testScatterPlot(),
    testPieChart(),
    testHistogram(),
  ];

  const totalTests = results.length;
  const passedTests = results.filter((result) => result).length;

  console.log(`\nTest Results: ${passedTests}/${totalTests} tests passed`);

  if (passedTests === totalTests) {
    console.log('✅ All tests passed!');
  } else {
    console.log('❌ Some tests failed.');
  }
}

// Run tests
runAllTests();
