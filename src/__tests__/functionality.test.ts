import { pickMe, rando } from '..'

// we need a fixed random number sequence for testing
const rng = rando(1)

describe('rando', () => {
  const bins: number[] = []
  for (let i = 0; i < 100; i++) {
    bins[i] = 0
  }
  for (let i = 0, lim = bins.length * 1000; i < lim; i++) {
    let idx = Math.floor(rng() * 100)
    if (idx === 100) idx = 99
    bins[idx] += 1
  }
  for (let i = 0; i < bins.length; i++) {
    test('even distribution', () => expect(Math.round(bins[i] / 1000)).toEqual(1))
  }
})

describe('pickMe', () => {
  const trueFalse = pickMe(
    [
      ['true', 1],
      ['false', 1],
    ],
    rng,
  )
  for (let i = 0; i < 10; i++) {
    test('returns either "true" or "false"', () => expect(['true', 'false'].indexOf(trueFalse())).toBeGreaterThan(-1))
  }
  test('requires some items', () =>
    expect(() => {
      pickMe([])
    }).toThrowError())
  test('we allow no duplicates', () =>
    expect(() => {
      pickMe([
        ['foo', 1],
        ['foo', 1],
      ])
    }).toThrowError())
  let f = pickMe([['foo', 1]], rng)
  let ar: string[] = []
  for (let i = 0; i < 100; i++) ar.push(f())
  test("we always get the same thing if there's just one item", () =>
    expect(ar.every((s) => s === 'foo')).toEqual(true))
  f = pickMe([
    ['foo', 1],
    ['bar', 0],
    ['baz', -1],
  ])
  ar.length = 0
  for (let i = 0; i < 100; i++) ar.push(f())
  test('we always get the same thing if only one item has a positive frequency', () =>
    expect(ar.every((s) => s === 'foo')).toEqual(true))
  f = pickMe(
    [
      ['foo', 2],
      ['bar', 1],
    ],
    rng,
  )
  const counts1: Record<string, number> = { foo: 0, bar: 0 }
  for (let i = 0; i < 1000; i++) counts1[f()] += 1
  test('we expect some foos', () => expect(counts1.foo).toBeGreaterThan(0))
  test('we expect some bars', () => expect(counts1.bar).toBeGreaterThan(0))
  test('we get roughly as many of each thing as we expect', () =>
    expect(Math.round(counts1.foo / counts1.bar)).toEqual(2))
  // do this with a bit more rigor
  const letters = 'abcdefghijklmnopqrstuvwxyz'.split('')
  const frequencies: [string, number][] = []
  for (let i = 0; i < letters.length; i++) {
    frequencies.push([letters[i], i + 1])
  }
  const segment = (letters.length * (letters.length + 1)) / 2
  f = pickMe(frequencies, rng)
  let counts2: Record<string, number> = {}
  for (const l of letters) counts2[l] = 0
  for (let i = 0, lim = segment * 1000; i < lim; i++) counts2[f()] += 1
  for (const [l, f] of frequencies) {
    const c = Number(counts2[l])
    test(`we got something for ${l}`, () => expect(c).toBeGreaterThan(0))
    const expectation = f * 1000
    test(`we got roughly as many as we expected for ${l}, with frequency ${f}`, () =>
      expect(Math.round(c / expectation)).toEqual(1))
  }
  const f1 = pickMe(
    [
      ['foo', 1],
      ['bar', 1],
      ['baz', 1],
    ],
    rando(1),
  )
  const f2 = pickMe(['foo', 'bar', 'baz'], rando(1))
  const ar1: string[] = []
  const ar2: string[] = []
  for (let i = 0; i < 100; i++) {
    ar1.push(f1())
    ar2.push(f2())
  }
  test('frequencies are optional if all are the same', () => {
    expect(ar1).toEqual(ar2)
  })
})
