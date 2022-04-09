/** tests for all the code shown in documentation */

import { rando, pickMe } from '..'

describe('README', () => {
  describe('Synopsis', () => {
    test('REPLACE ME', () => expect(true).toEqual(true))
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
  describe('rando', () => {
    const rng = rando(1)
    const ar: number[] = []
    for (let i = 0; i < 3; i++) ar.push(rng())
    test('rando', () => {
      expect(ar).toEqual([0.6270739405881613, 0.002735721180215478, 0.5274470399599522])
    })
  })
})
