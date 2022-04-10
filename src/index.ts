/**
 * Generates a zero-argument function that returns an item from the frequency list
 * parameter with a probability concordant with its specified frequency.
 *
 * The required parameter is a list of pairs: an item to pick and its frequency. The "frequency"
 * is simply a positive number which determines the probability of picking one item relative to another.
 * If the parameters are `[[1, 1], [2, 2]]`, you will get twice as many 2s as 1s. You will get the same
 * results with `[[1, 0.1], [2, 0.2]]`, `[[1, 10], [2, 20]]`, and `[[1, 0.13], [2, 0.26]]`.
 *
 * The second, optional parameter is a random number sequence generator. Provide this if you want a reproducible
 * sequence of selections from your frequency list. If this doesn't concern you, leave it off and take
 * whatever `Math.random()` gives you.
 *
 * If the frequency list is not a list of pairs but just a list of items, this is equivalent to a list of
 * pairs where all the frequencies are the same. (Note, this will not work if the items are all pairs whose
 * second value is a number. If you want to pick among such pairs you'll need to wrap them in new pairs.)
 *
 * An item with
 * a non-positive frequency will be culled from the list. `pickMe` will throw an error if the list is empty.
 * Likewise, it will throw an error if any item appears more than once in the list. `[]` is
 * not good. `[[1, 1], [1, 2]]` is no better.
 * 
 * Note, the item returned by `pickMe` is the item you provided, not a copy. If you are picking from a list of
 * objects and you modify one of them, it will remain modified.
 * 
 * Finally, `pickMe` compiles an efficient picker from the parameters provided. As with other compiled things, such
 * as regular expressions, you want to do this one time in an initialization phase and then reuse it in loops.
 * The compilation is not terribly expensive, but skipping it altogether is cheaper.
 *
 * @example
 * ```ts
 * import { rando, pickMe } from 'pick-me'
 *
 * // make a random number generator with a seed of 1
 * const rng = rando(1)
 * const fooBarBaz = pickMe([["foo", 1], ["bar", 2], ["baz", 3]], rng)
 * const ar: string[] = []
 * for (let i = 0; i < 10; i++) ar.push(fooBarBaz())
 * // => [ 'baz', 'foo', 'baz', 'baz', 'baz', 'bar', 'baz', 'baz', 'bar', 'baz' ]
 * ```
 *
 * @param {[T, number][] | T[]} frequencies - phrases to match
 * @param {() => number} [rando=() => Math.random()] - random number generator
 * @returns {() => T} a picker of T's
 */
export function pickMe<T>(frequencies: [T, number][] | T[], rando?: () => number): () => T {
  frequencies = sanitize(normalize(frequencies))
  // short-circuit edge cases
  if (frequencies.length === 0) throw new Error(`nothing to select in ${frequencies}`)
  if (frequencies.length === 1) {
    const [t] = frequencies[0]
    return () => t
  }
  // throw an error in case of duplicates
  // it is difficult to do this efficiently because we allow T to be anything
  for (let i = 0, lim = frequencies.length - 1; i < lim; i++) {
    const t = frequencies[i][0]
    for (let j = i + 1; j < frequencies.length; j++) {
      if (t === frequencies[j][0]) throw new Error(`${t} appears more than once among frequencies`)
    }
  }
  rando ??= () => Math.random()
  let total = 0,
    acc = 0
  for (const [, n] of frequencies) total += n
  for (let i = 0; i < frequencies.length; i++) {
    const [, n] = frequencies[i]
    acc += n
    frequencies[i][1] = acc / total
  }
  const items: T[] = [],
    thresholds: number[] = []
  for (const [t, n] of frequencies) {
    items.push(t)
    thresholds.push(n)
  }
  const f = thresholder(thresholds)
  return () => items[f(rando!())]!
}

// take in an array of ambiguous type and return a list of pairs, T and frequency
function normalize<T>(frequencies: [T, number][] | T[]): [T, number][] {
  if (frequencies.length === 0) return frequencies as any as [T, number][]
  if ((frequencies as any).every((s: any) => Array.isArray(s) && s.length === 2 && typeof s[1] === 'number'))
    return frequencies as any as [T, number][]
  const ar = frequencies.map((t) => [t, 1])
  return ar as any as [T, number][]
}

// remove impossible frequencies
function sanitize<T>(frequencies: [T, number][]): [T, number][] {
  return frequencies.map(([t, n]) => [t, Number(n)]).filter(([, n]) => Number.isFinite(n) && n > 0) as any as [
    T,
    number,
  ][]
}

// make a function that converts a random number into an index, preserving the frequencies
// assuming the random number is from an even distribution in the interval [0, 1]
function thresholder(thresholds: number[]): (n: number) => number {
  return eval(`(n) => ${portion(thresholds, 0, thresholds.length)}`)
}

// recursively convert the threshold list into nested ternary operators
// this allows us to find our index in O(log(n)) comparisons
function portion(thresholds: number[], start: number, end: number): string {
  const n = end - start
  if (n === 1) return start.toString()
  const i = start + (n % 2 === 0 ? n / 2 - 1 : (n - 1) / 2)
  return `(n > ${thresholds[i]} ? ${portion(thresholds, i + 1, end)} : ${portion(thresholds, start, i + 1)})`
}

/**
 * Generates a random number sequence generator. This is a demonstration generator
 * useful for testing and documentation. Any zero-argument function that returns
 * numbers will suffice for `pickMe`.
 *
 * The implementation of `rando` is taken from https://stackoverflow.com/a/47593316/15060051.
 * It is the Mulberry32 algorithm.
 *
 * @example
 * ```ts
 * import { rando } from 'pick-me'
 *
 * // make a random number generator with a seed of 1
 * const rng = rando(1)
 * const ar: number[] = []
 * for (let i = 0; i < 3; i++) ar.push(rng())
 * // => [ 0.6270739405881613, 0.002735721180215478, 0.5274470399599522 ]
 * ```
 *
 * @param {number} seed - the seed for a random number sequence
 * @returns {() => number} a generator of random numbers
 */
export function rando(seed: number): () => number {
  return () => {
    let t = (seed += 0x6d2b79f5)
    t = Math.imul(t ^ (t >>> 15), t | 1)
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}
