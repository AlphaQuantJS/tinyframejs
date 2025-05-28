// src/core/lazy/optimizer.js
/**
 * Simple optimizer for LazyFrame DAG plan.
 * Currently does two things:
 *   1) Merges consecutive filter nodes into one composite filter
 *   2) Moves select "above" filter (push-down projection),
 *      so that fewer columns run through the chain
 *
 * The plan is stored as an array of nodes { op, ... } (see LazyFrame._plan).
 * Returns a NEW array of steps.
 *
 * ⚠  First iteration: without complex transformations or expression analysis.
 *
 * @param {Array<{ op:string, [key:string]:any }>} plan
 * @returns {Array<{ op:string, [key:string]:any }>}
 */
export function optimize(plan) {
  if (plan.length <= 2) return plan; // nothing to optimize

  const optimized = [plan[0]]; // first node is source

  for (let i = 1; i < plan.length; i++) {
    const step = plan[i];
    const prev = optimized[optimized.length - 1];

    /* ---------- 1. Merging filter + filter ---------- */
    if (step.op === 'filter' && prev.op === 'filter') {
      // Сохраняем оригинальные функции, чтобы избежать циклических ссылок
      const prevFn = prev.fn;
      const stepFn = step.fn;
      prev.fn = (row) => prevFn(row) && stepFn(row);
      continue; // don't push a new node
    }

    /* ---------- 2. Push-down select above filter ------ */
    if (step.op === 'select' && prev.op === 'filter') {
      // change order: select → filter
      optimized.pop(); // remove prev
      optimized.push(step); // put select
      optimized.push(prev); // then filter
      continue;
    }

    optimized.push(step);
  }

  return optimized;
}
