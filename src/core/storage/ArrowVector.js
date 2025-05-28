// src/core/storage/ArrowVector.js
import { ColumnVector } from './ColumnVector.js';
import { Vector } from 'apache-arrow';

/**
 * Обёртка над Apache Arrow Vector.
 * Поддерживает get / sum / map и сериализацию.
 */
export class ArrowVector extends ColumnVector {
  /**
   * @param {Vector} arrowVec
   */
  constructor(arrowVec) {
    super();
    this._arrow = arrowVec;
    this.length = arrowVec.length;
  }

  /* -------------------------------------------------- *
   *  Доступ к элементам                                 *
   * -------------------------------------------------- */

  get(i) {
    return this._arrow.get(i);
  }

  /* -------------------------------------------------- *
   *  Агрегаты                                           *
   * -------------------------------------------------- */

  sum() {
    // Arrow Vector имеет reduce
    return this._arrow.reduce((acc, v) => acc + (v ?? 0), 0);
  }

  /* -------------------------------------------------- *
   *  Трансформации                                      *
   * -------------------------------------------------- */

  /**
   * Возвращает новый ArrowVector, к которому применена функция fn.
   * Arrow JS Vector уже имеет метод map, который создаёт новый Vector.
   * @param fn
   */
  map(fn) {
    const mapped = this._arrow.map(fn);
    return new ArrowVector(mapped);
  }

  /* -------------------------------------------------- *
   *  Сериализация / экспорт                             *
   * -------------------------------------------------- */

  /** Быстрое преобразование в JS-массив */
  toArray() {
    return this._arrow.toArray();
  }

  /** Поддержка JSON.stringify(series) */
  toJSON() {
    return this.toArray();
  }

  /** Совместимость с ColumnVector.toArrow() */
  toArrow() {
    return this._arrow;
  }

  /** Маркер, что это Arrow-бэкенд (для внутренней логики) */
  get isArrow() {
    return true;
  }
}
