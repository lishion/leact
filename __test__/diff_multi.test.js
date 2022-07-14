import {Differ} from '../src/diff'
import leact from '../src/leact'
import {createEmptyFiber, createFiberFromElement} from '../src/fiber'
import {Placement, NoFlags, Delete, UpdateText} from '../src/types'

function createElements(array){
    return array.map(([name, key, props]) => leact.createElement(name, {key: key, ...(props || {})}))
}

function collectFibers(firstFiber, flags){
    let fiber = firstFiber
    let res = []
    while(fiber !== null){
        res.push([fiber.type, fiber.key, (fiber.flags & flags) !== NoFlags])
        fiber = fiber.sibling
    }
    return res
}

function diff(oldElementsRepr, newElementsRepr){
    const parent = createEmptyFiber()
    const oldElements = createElements(oldElementsRepr)
    const newElements = createElements(newElementsRepr)

    const differ = new Differ(parent)

    const oldFibers = oldElements.map(createFiberFromElement).map((fiber) => {
        fiber.parent = parent
        return fiber
    })
    for(let i = 0; i < oldFibers.length - 1; i++){
        oldFibers[i].sibling = oldFibers[i + 1]
    }
    const newFibers = differ.diffChildren(newElements, oldFibers[0])
    return {
        oldFiber: oldFibers[0],
        newFiber: newFibers,
    }
}

test('test diff multi child with same type', () => {
    const oldElementsRepr = [
        ["p", "a"],
        ["p", "b"],
        ["p", "c"]
    ]
    const newElementsRepr = [
        ["p", "a"],
        ["p", "c"],
        ["p", "b"]
    ]
    const res = diff(oldElementsRepr, newElementsRepr, Placement)
    expect(collectFibers(res.newFiber, Placement)).toStrictEqual([
        ['p', 'a', false],
        ['p', 'c', false],
        ['p', 'b', true],
    ])
    
})

test('test diff multi child with diff type', () => {
    const oldElementsRepr = [
        ["p", "a"],
        ["div", "b"],
        ["p", "c"]
    ]
    const newElementsRepr = [
        ["p", "a"],
        ["p", "b"],
        ["p", "c"]
    ]
    const res = diff(oldElementsRepr, newElementsRepr, Placement)
    expect(collectFibers(res.newFiber, Placement)).toStrictEqual([
        ['p', 'a', false],
        ['p', 'b', true],
        ['p', 'c', false],
    ])
    expect(collectFibers(res.oldFiber, Delete)).toStrictEqual([
        ["p", "a", false],
        ["div", "b", true],
        ["p", "c", false],
    ])
})

test('test no key', () => {
    const oldElementsRepr = [
        ["a", null],
        ["p", null],
        ["div", null]
    ]
    const newElementsRepr = [
        ["a", null],
        ["p", null],
        ["div", null]
    ]
    const res = diff(oldElementsRepr, newElementsRepr, Placement)
    expect(collectFibers(res.newFiber, Placement)).toStrictEqual([
        ['a', null, false],
        ['p', null, false],
        ['div', null, false],
    ])
})

test('test no key with type change', () => {
    const oldElementsRepr = [
        ["a", null],
        ["p", null],
        ["div", null]
    ]
    const newElementsRepr = [
        ["a", null],
        ["p", null],
        ["div", null]
    ]
    const res = diff(oldElementsRepr, newElementsRepr, Placement)
    expect(collectFibers(res.newFiber, Placement)).toStrictEqual([
        ['a', null, false],
        ['p', null, false],
        ['div', null, false],
    ])
})


test('test delete', () => {
    let oldElementsRepr = [
        ["a", null],
        ["p", null],
        ["div", null]
    ]
    let newElementsRepr = [
    ]
    let res = diff(oldElementsRepr, newElementsRepr, Placement)
    expect(collectFibers(res.oldFiber, Delete)).toStrictEqual([
        ['a', null, true],
        ['p', null, true],
        ['div', null, true],
    ])

    oldElementsRepr = [
        ["a", null],
        ["p", null],
        ["div", null]
    ]
    newElementsRepr = [
        ["a", null],
        ["div", null]
    ]
    res = diff(oldElementsRepr, newElementsRepr, Placement)
    expect(collectFibers(res.oldFiber, Delete)).toStrictEqual([
        ['a', null, false],
        ['p', null, true],
        ['div', null, true],
    ])
    expect(collectFibers(res.newFiber, Placement)).toStrictEqual([
        ['a', null, false],
        ['div', null, true]
    ])

    oldElementsRepr = [
        ["a", "1"],
        ["p", "2"],
        ["div", "3"]
    ]
    newElementsRepr = [
        ["a", "1"],
        ["p", "2"]
    ]
    res = diff(oldElementsRepr, newElementsRepr, Placement)
    expect(collectFibers(res.oldFiber, Delete)).toStrictEqual([
        ['a', "1", false],
        ['p', "2", false],
        ['div', "3", true],
    ])
    expect(collectFibers(res.newFiber, Placement)).toStrictEqual([
        ['a', "1", false],
        ['p', "2", false]
    ])


    oldElementsRepr = [
        ["a", "1"],
        ["p", "2"],
        ["div", "3"]
    ]
    newElementsRepr = [
        ["a", "1"],
        ["div", "3"]
    ]
    res = diff(oldElementsRepr, newElementsRepr, Placement)
    expect(collectFibers(res.oldFiber, Delete)).toStrictEqual([
        ['a', "1", false],
        ['p', "2", true],
        ['div', "3", false],
    ])
    expect(collectFibers(res.newFiber, Placement)).toStrictEqual([
        ['a', "1", false],
        ['div', "3", false]
    ])
})


test('test text update', () => {
    let oldElementsRepr = [
        ["p", "1"],
        [null, null, {value: "123"}],
        ["div", "2"]
    ]
    let newElementsRepr = [
        ["p", "1"],
        [null, null, {value: "456"}],
        ["div", "2"]
    ]
    let res = diff(oldElementsRepr, newElementsRepr, Placement)
    expect(collectFibers(res.newFiber, UpdateText)).toStrictEqual([
        ["p", "1", false],
        [null, null, true],
        ['div', "2", false],
    ])

    oldElementsRepr = [
        ["p", "1"],
        ["p", "3"],
        ["div", "2"]
    ]
    newElementsRepr = [
        ["p", "1"],
        [null, null, {value: "456"}],
        ["div", "2"]
    ]
    res = diff(oldElementsRepr, newElementsRepr)
    expect(collectFibers(res.newFiber, Placement)).toStrictEqual([
        ["p", "1", false],
        [null, null, true],
        ['div', "2", false],
    ])
    expect(collectFibers(res.oldFiber, Delete)).toStrictEqual([
        ["p", "1", false],
        ["p","3", true],
        ['div', "2", false],
    ])
})


test('test insert', () => {
    let oldElementsRepr = [
        ["p", "1"],
        ["p", "2"],
        ["div", "3"]
    ]
    let newElementsRepr = [
        ["p", "1"],
        ["p", "4"],
        ["p", "2"],
        ["div", "3"]
    ]
    let res = diff(oldElementsRepr, newElementsRepr, Placement)
    expect(collectFibers(res.newFiber, Placement)).toStrictEqual([
        ["p", "1", false],
        ["p", "4", true],
        ["p", "2", false],
        ["div", "3", false]
    ])
})