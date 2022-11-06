# pick-me
Generate functions that pick things from lists with specified frequencies.

## Synopsis

```ts
// Let's make a generator of quasi-Polynesian lorem ipsum!

import { pickMe, rando } from 'pick-me-too'

// we want our text reproducible, so we use a seeded random number generator
const rng = rando(1)

// now we specify the frequency of various patterns in our invented language

const vowels = pickMe(
  [
    ['a', 2],
    ['e', 1],
    ['i', 1.5],
    ['o', 1],
    ['u', 1.5],
    ['ā', 0.75],
    ['ē', 0.5],
    ['ī', 0.75],
    ['ō', 0.5],
    ['ū', 0.75],
  ],
  rng,
)
const consonants = pickMe(
  [
    ["'", 5],
    ['h', 1],
    ['p', 3],
    ['t', 3],
    ['k', 3],
    ['b', 1],
    ['d', 1],
    ['g', 1],
    ['n', 3],
    ['r', 1],
  ],
  rng,
)
// our language has simple CV syllables
const syllable = () => `${consonants()}${vowels()}`
const morphemeLength = pickMe(
  [
    [1, 1],
    [2, 3],
    [3, 1],
  ],
  rng,
)
const morpheme = () => {
  let m = ''
  for (let i = 0, lim = morphemeLength(); i < lim; i++) m += syllable()
  return m
}
const reduplication = () => {
  const r = morpheme()
  return `${r}${r}`
}
// we can pick functions, too!
const segment = pickMe(
  [
    [morpheme, 5],
    [reduplication, 1],
  ],
  rng,
)
const wordLength = pickMe(
  [
    [1, 5],
    [2, 3],
    [3, 2],
    [4, 1],
    [5, 1],
  ],
  rng,
)
const word = () => {
  let w = ''
  for (let i = 0, lim = wordLength(); i < lim; i++) w = w + segment()()
  return w
}
const clauseLength = pickMe(
  [
    [1, 1],
    [2, 3],
    [3, 4],
    [4, 4],
    [5, 5],
    [6, 6],
  ],
  rng,
)
const clause = () => {
  let s = []
  for (let i = 0, lim = clauseLength(); i < lim; i++) s.push(word())
  return s.join(' ')
}

const saying = clause()
// => "'ātika kādepāgū bīpīpe pōhopōhopunā'ī bi'a'anū'ā'idi'idi'ōkē'ōkēpetē"
```

## API

### `function pickMe<T>(frequencies: [T, number][] | T[], rando?: () => number): () => T`

Generates a zero-argument function that returns an item from the frequency list
parameter with a probability concordant with its specified frequency.

The required parameter is a list of pairs: an item to pick and its frequency. The "frequency"
is simply a positive number which determines the probability of picking one item relative to another.
If the parameters are `[[1, 1], [2, 2]]`, you will get twice as many 2s as 1s. You will get the same
results with `[[1, 0.1], [2, 0.2]]`, `[[1, 10], [2, 20]]`, and `[[1, 0.13], [2, 0.26]]`.

The second, optional parameter is a random number sequence generator. Provide this if you want a reproducible
sequence of selections from your frequency list. If this doesn't concern you, leave it off and take
whatever `Math.random()` gives you.

If the frequency list is not a list of pairs but just a list of items, this is equivalent to a list of
pairs where all the frequencies are the same. (Note, this will not work if the items are all pairs whose
second value is a number. If you want to pick among such pairs you'll need to wrap them in new pairs.)

An item with
a non-positive frequency will be culled from the list. `pickMe` will throw an error if the list is empty.
Likewise, it will throw an error if any item appears more than once in the list. `[]` is
not good. `[[1, 1], [1, 2]]` is no better.

Note, the item returned by `pickMe` is the item you provided, not a copy. If you are picking from a list of
objects and you modify one of them, it will remain modified.

Finally, `pickMe` compiles an efficient picker from the parameters provided. As with other compiled things, such
as regular expressions, you want to do this one time in an initialization phase and then reuse it in loops.
The compilation is not terribly expensive, but skipping it altogether is cheaper.

@example
```ts
import { rando, pickMe } from 'pick-me-too'

// make a random number generator with a seed of 1
const rng = rando(1)
const fooBarBaz = pickMe([["foo", 1], ["bar", 2], ["baz", 3]], rng)
const ar: string[] = []
for (let i = 0; i < 10; i++) ar.push(fooBarBaz())
// => [ 'baz', 'foo', 'baz', 'baz', 'baz', 'bar', 'baz', 'baz', 'bar', 'baz' ]
```

### `function pickMeToo<T>(frequencies: [T, number][] | T[]): (rng: () => number) => () => T`

Generates a function from random number generators to generators of `T`.

This is like `pickMe` -- in fact, `pickMe` delegates to this -- but it factors out the random
number generator. It is useful in a situation where you want to incur the compilation of the
picker only once but you want to plug in different random number sequences on different
occasions.

@example
```ts
import { pickMeToo } from 'pick-me-too'

const fooBarBaz = pickMeToo([["foo", 1], ["bar", 1000], ["baz", 1]])

// minimum probablility generator just returns "foo"
fooBarBaz(() => 0)()
// => "foo"

// maximum probability generator just returns "baz"
fooBarBaz(() => 1)()
// => "baz"
```

### `function rando(seed: number): () => number`

Generates a random number sequence generator.

This is a demonstration generator useful for testing and documentation. Any zero-argument function that returns
numbers will suffice for `pickMe`. If it returns 0 or less, the first item
given to `pickMe` will be picked. If it is 1 or more, the last item will be.

The implementation of `rando` is taken from [this Stack Overflow comment](https://stackoverflow.com/a/47593316/15060051).
There are many others if you don't find this suitable.

@example
```ts
import { rando } from 'pick-me-too'

// make a random number generator with a seed of 1
const rng = rando(1)
const ar: number[] = []
for (let i = 0; i < 3; i++) ar.push(rng())
// => [ 0.6270739405881613, 0.002735721180215478, 0.5274470399599522 ]

// reseed the generator
(rng as any)(Math.random())
// => ??? the random number sequence is still deterministic, but at a completely different place
```

## Acknowledgements

It is possible this package is a duplicate. I didn't try very hard to find out. I just felt like writing
this code and, having written it, I felt like publishing it. It may behoove you to check npmjs carefully
and compare packages.

That being said, `pickMe` should be near optimally fast (if the frequences are strongly skewed, it is
possible to compile a picker that uses fewer numerical comparisons in the typical case). Its unit and
documentation tests are thorough.
