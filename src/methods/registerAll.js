/**
 * Централизованная инъекция зависимостей для методов (валидаторы и пр.)
 *
 * Этот файл импортирует все регистраторы методов и применяет их к классам DataFrame и Series.
 * В соответствии с новой структурой, здесь регистрируются методы из директорий dataframe, series и reshape.
 */

import { extendDataFrame } from './dataframe/registerAll.js';
import { extendSeries } from './series/registerAll.js';
import { registerReshapeMethods } from './reshape/register.js';

/**
 * Регистрирует все методы для классов DataFrame и Series
 * @param {Object} classes - Объект, содержащий классы DataFrame и Series
 * @param {Class} classes.DataFrame - Класс DataFrame для расширения
 * @param {Class} classes.Series - Класс Series для расширения
 */
export function registerAllMethods({ DataFrame, Series }) {
  // Применяем все регистраторы к классам DataFrame и Series
  extendDataFrame(DataFrame);
  extendSeries(Series);
  registerReshapeMethods(DataFrame);

  // Здесь можно добавить логирование или другие действия при регистрации
  console.debug('Все методы успешно зарегистрированы');
}

export default registerAllMethods;
