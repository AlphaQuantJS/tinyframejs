/**
 * Централизованная инъекция зависимостей для методов (валидаторы и пр.)
 *
 * Этот файл импортирует все методы из raw.js и инъектирует в них зависимости,
 * такие как валидаторы и другие утилиты, необходимые для их работы.
 */

import * as rawFns from './raw.js';
import { validateColumn, validateType } from '../core/utils/validators.js';
import { isNumeric } from '../core/utils/typeChecks.js';

/**
 * Зависимости, которые будут инъектированы в методы
 * @type {Object}
 */
const deps = {
  validateColumn,
  isNumeric,
  validateType,
  // Здесь можно добавить другие зависимости в будущем
};

/**
 * Инъектирует зависимости во все методы агрегации/трансформации и возвращает объект,
 * где каждый метод предварительно подготовлен с необходимыми зависимостями.
 *
 * @returns {Record<string, Function>} Объект с именами методов в качестве ключей и
 * готовыми к использованию функциями в качестве значений
 */
export function injectMethods() {
  return Object.fromEntries(
    Object.entries(rawFns).map(([name, fn]) => [
      name,
      typeof fn === 'function' ? fn(deps) : fn, // инъектируем зависимости только в функции
    ]),
  );
}
