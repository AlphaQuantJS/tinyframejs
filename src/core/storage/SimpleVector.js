// src/core/storage/SimpleVector.js
import { ColumnVector } from './ColumnVector.js';
import { TypedArrayVector } from './TypedArrayVector.js';

/**
 * Простая реализация ColumnVector для работы с нечисловыми данными.
 * Используется как fallback, когда Arrow недоступен и данные не числовые.
 */
export class SimpleVector extends ColumnVector {
  /**
   * @param {Array} data - Массив данных любого типа
   */
  constructor(data) {
    super();
    this._data = Array.isArray(data) ? [...data] : [];
    this.length = this._data.length;
    this._isVector = true;
  }

  /**
   * Получение элемента по индексу
   * @param {number} i - Индекс элемента
   * @returns {*} Значение элемента
   */
  get(i) {
    return this._data[i];
  }

  /**
   * Преобразование в обычный JavaScript массив
   * @returns {Array} Копия внутреннего массива
   */
  toArray() {
    return [...this._data];
  }

  /**
   * Создание нового вектора путем применения функции к каждому элементу.
   * Сохраняет числовой бэкенд для числовых результатов.
   * @param {Function} fn - Функция преобразования (value, index) => newValue
   * @returns {ColumnVector} Новый вектор с преобразованными значениями
   */
  map(fn) {
    const mapped = this._data.map(fn);
    const numeric = mapped.every(
      (v) => typeof v === 'number' && !Number.isNaN(v),
    );
    return numeric
      ? new TypedArrayVector(Float64Array.from(mapped))
      : new SimpleVector(mapped);
  }

  /**
   * Создание подмножества вектора
   * @param {number} start - Начальный индекс (включительно)
   * @param {number} end - Конечный индекс (не включительно)
   * @returns {SimpleVector} Новый вектор с подмножеством элементов
   */
  slice(start, end) {
    return new SimpleVector(this._data.slice(start, end));
  }

  /**
   * Вычисление суммы элементов (только для числовых данных)
   * @returns {number|undefined} Сумма или undefined для нечисловых данных
   */
  sum() {
    // Оптимизация: проверяем только первые несколько элементов
    // для определения, является ли колонка числовой
    const sampleSize = Math.min(10, this.length);
    const sample = this._data.slice(0, sampleSize);

    if (sample.every((v) => typeof v === 'number')) {
      return this._data.reduce(
        (a, b) => a + (typeof b === 'number' ? b : 0),
        0,
      );
    }
    return undefined;
  }

  /**
   * JSON представление вектора
   * @returns {Array} Массив для JSON сериализации
   */
  toJSON() {
    return this.toArray();
  }

  /**
   * Для совместимости с ColumnVector.toArrow()
   * @returns {Array} Внутренний массив данных
   */
  toArrow() {
    return this._data;
  }
}
