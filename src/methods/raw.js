/**
 * Единый экспорт всех методов (агрегация + трансформации)
 *
 * Этот файл экспортирует все методы из соответствующих директорий
 * для DataFrame, Series и методов изменения формы данных.
 */

// DataFrame aggregation methods
export { count } from './dataframe/aggregation/count.js';
export { mean } from './dataframe/aggregation/mean.js';
export { sum } from './dataframe/aggregation/sum.js';
export { min } from './dataframe/aggregation/min.js';
export { max } from './dataframe/aggregation/max.js';
export { median } from './dataframe/aggregation/median.js';

// DataFrame filtering methods
export { select } from './dataframe/filtering/select.js';
export { drop } from './dataframe/filtering/drop.js';
export { filter } from './dataframe/filtering/filter.js';
export { expr$ } from './dataframe/filtering/expr$.js';
export { where } from './dataframe/filtering/where.js';
export { at } from './dataframe/filtering/at.js';
export { iloc } from './dataframe/filtering/iloc.js';

// DataFrame transform methods
export { assign } from './dataframe/transform/assign.js';

// Series aggregation methods
export { count as seriesCount } from './series/aggregation/count.js';
export { mean as seriesMean } from './series/aggregation/mean.js';
export { sum as seriesSum } from './series/aggregation/sum.js';
export { min as seriesMin } from './series/aggregation/min.js';
export { max as seriesMax } from './series/aggregation/max.js';
export { median as seriesMedian } from './series/aggregation/median.js';
// Series filtering methods
export { filter as seriesFilter } from './series/filtering/filter.js';
export { gt } from './series/filtering/register.js';
export { gte } from './series/filtering/register.js';
export { lt } from './series/filtering/register.js';
export { lte } from './series/filtering/register.js';
export { eq } from './series/filtering/register.js';
export { ne } from './series/filtering/register.js';
export { notNull } from './series/filtering/register.js';
export { isin } from './series/filtering/register.js';

// Series transform methods
// TODO: Добавить экспорты методов трансформации для Series

// Reshape methods
export { pivot } from './reshape/pivot.js';
export { melt } from './reshape/melt.js';

// DataFrame timeseries methods
export { resample } from './dataframe/timeseries/register.js';
export { rolling } from './dataframe/timeseries/register.js';
export { expanding } from './dataframe/timeseries/register.js';
export { shift } from './dataframe/timeseries/register.js';
export { pctChange } from './dataframe/timeseries/register.js';

// Series timeseries methods
export { rolling as seriesRolling } from './series/timeseries/register.js';
export { expanding as seriesExpanding } from './series/timeseries/register.js';
export { shift as seriesShift } from './series/timeseries/register.js';
export { pctChange as seriesPctChange } from './series/timeseries/register.js';
