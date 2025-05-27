// src/core/storage/TypedArrayVector.js
import { ColumnVector } from './ColumnVector.js';

/**
 * Обёртка над любым TypedArray, реализующая интерфейс ColumnVector.
 * Применяется для числовых плотных данных без null-битмаски.
 */
export class TypedArrayVector extends ColumnVector {
  // Флаг, указывающий что это вектор
  _isVector = true;
  /**
   * @param {TypedArray} ta — Float64Array / Int32Array / …
   */
  constructor(ta) {
    super();
    this._data = ta;
    this.length = ta.length;
  }

  /* -------------------------------------------------- *
   *  Доступ к элементам                                 *
   * -------------------------------------------------- */

  get(i) {
    // нет проверок границ ради скорости (предполагаем валидный i)
    return this._data[i];
  }

  /* -------------------------------------------------- *
   *  Агрегаты                                           *
   * -------------------------------------------------- */

  sum() {
    // branch-less линейное суммирование
    let acc = 0;
    const d = this._data;
    for (let i = 0; i < d.length; i++) acc += d[i];
    return acc;
  }

  /* -------------------------------------------------- *
   *  Трансформации                                      *
   * -------------------------------------------------- */

  /**
   * Возвращает *новый* TypedArrayVector с применённой функцией.
   * @param {(v:any, i:number)=>any} fn
   * @returns {TypedArrayVector}
   */
  map(fn) {
    const out = new this._data.constructor(this.length);
    for (let i = 0; i < this.length; i++) out[i] = fn(this._data[i], i);
    return new TypedArrayVector(out);
  }

  /**
   * Возвращает новый вектор, содержащий подмножество элементов
   * @param {number} start - Начальный индекс (включительно)
   * @param {number} end - Конечный индекс (не включительно)
   * @returns {TypedArrayVector}
   */
  slice(start, end) {
    const sliced = this._data.slice(start, end);
    return new TypedArrayVector(sliced);
  }

  /* -------------------------------------------------- *
   *  Сериализация / экспорт                             *
   * -------------------------------------------------- */

  /** Быстрое преобразование в обычный массив JS */
  toArray() {
    return Array.from(this._data);
  }

  /** JSON.stringify(series) → plain array */
  toJSON() {
    return this.toArray();
  }

  /** Для совместимости с ColumnVector.toArrow() */
  get _data() {
    return this.__data;
  }
  set _data(val) {
    this.__data = val;
  }
}
