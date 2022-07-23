import { flatten } from '../src/utils'

test('flatten', () => {
    const input = [1, 2, [3, [4, [5]]], [6], 7]
    const output = [1, 2, 3, 4, 5, 6, 7]
    expect(flatten(input)).toStrictEqual(output)
})