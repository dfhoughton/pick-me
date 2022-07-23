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
 * @param {Rng} [rando=() => Math.random()] - random number generator
 * @returns {() => T} a picker of T's
 */
export declare function pickMe<T>(frequencies: [T, number][] | T[], rando?: Rng): () => T;
/**
 * Generates pickers of things. This separates the compilation step from frequencies so you
 * can plug different random number generators in.
 *
 * @example
 * ```ts
 * import { pickMeToo } from 'pick-me'
 *
 * const fooBarBaz = pickMeToo([["foo", 1], ["bar", 1000], ["baz", 1]])
 *
 * // minimum probablility generator just returns "foo"
 * fooBarBaz(() => 0)()
 * // => "foo"
 *
 * // maximum probability generator just returns "baz"
 * fooBarBaz(() => 1)()
 * // => "baz"
 * ```
 *
 * @template T - the sort of thing to pick
 * @param {[T, number][] | T[]} frequencies - things to pick according to their frequencies
 * @returns {(rng: Rng) => () => T} - a function from random number generators to pickers of things in the frequency list
 */
export declare function pickMeToo<T>(frequencies: [T, number][] | T[]): (rng: Rng) => () => T;
/**
 * The type of random number generators. Ideally this will return number from a continuous distribution
 * in the interval [0, 1], but for `pickMe` and number less than 0 is the same as 0 and any number
 * greater than 1 is the same as 1.
 */
export declare type Rng = () => number;
/**
 * Generates a random number sequence generator. This is a demonstration generator
 * useful for testing and documentation. Any zero-argument function that returns
 * numbers will suffice for `pickMe`.
 *
 * The implementation of `rando` is taken from https://stackoverflow.com/a/47593316/15060051.
 * It is the Mulberry32 algorithm.
 *
 * Note, `rando` can be re-seeded by passing an optional number argument as the fresh seed (see
 * example below). This can be useful if you are sharing a random number generator among
 * several objects and you need to change random number sequences.
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
 *
 * // the same seed will produce the same random number sequence
 * rando(1)()
 * // => 0.6270739405881613
 * rando(1)()
 * // => 0.6270739405881613
 *
 * // but you can provide a fresh seed to change the sequence
 * (rando(1) as any)(2)
 * // => 0.7342509443406016
 * ```
 *
 * @param {number} seed - the seed for a random number sequence
 * @returns {Rng} a generator of random numbers
 */
export declare function rando(seed: number): Rng;
