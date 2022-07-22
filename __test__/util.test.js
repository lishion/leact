import { flattern } from "../src/utils";

test('flattern', () => {
    const input = [1, 2, [3, [4, [5]]], [6], 7]
    const output = [1, 2, 3, 4, 5, 6, 7]
    expect(flattern(input)).toStrictEqual(output)
})