/** tests for all the code shown in documentation */

import { rando, pickMe, pickMeToo } from '..'

describe('README', () => {
  describe('Synopsis', () => {
    const rng = rando(1)
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
    test('polynesianish', () => expect(saying).toEqual("rekātū pe'ide kēpe 'ātēdapidapi kaha"))
  })
})

describe('index.ts', () => {
  describe('pickMe', () => {
    const rng = rando(1)
    const fooBarBaz = pickMe(
      [
        ['foo', 1],
        ['bar', 2],
        ['baz', 3],
      ],
      rng,
    )
    const ar: string[] = []
    for (let i = 0; i < 10; i++) ar.push(fooBarBaz())
    test('pickMe', () => expect(ar).toEqual(['baz', 'foo', 'baz', 'baz', 'baz', 'bar', 'baz', 'baz', 'bar', 'baz']))
  })
  describe('pickMeToo', () => {
    const fooBarBaz = pickMeToo([
      ['foo', 1],
      ['bar', 1000],
      ['baz', 1],
    ])
    test('low probability', () => expect(fooBarBaz(() => 0)()).toEqual('foo'))
    test('high probability', () => expect(fooBarBaz(() => 1)()).toEqual('baz'))
  })
  describe('rando', () => {
    const rng = rando(1)
    const ar: number[] = []
    for (let i = 0; i < 3; i++) ar.push(rng())
    test('rando', () => {
      expect(ar).toEqual([0.6270739405881613, 0.002735721180215478, 0.5274470399599522])
    })
  })
})
