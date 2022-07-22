import {useEffect, setCurrentFiber, callEffect, destoryEffect, useState, useLayoutEffect} from '../src/hook'
import {Fiber} from '../src/fiber'

function EffectMockComponent(count1, count2, count3, arg){
    useEffect(() => {
        count1.current += 2
        return () => count1.current--
    }, [arg])

    useEffect(() => {
        count2.current += 2
        return () => count2.current--
    }, [])

    useEffect(() => {
        count3.current += 2
        return () => count3.current--
    })
}

function LayoutEffectMockComponent(count1, count2, count3, arg){
    useLayoutEffect(() => {
        count1.current += 2
        return () => count1.current--
    }, [arg])

    useLayoutEffect(() => {
        count2.current += 2
        return () => count2.current--
    }, [])

    useLayoutEffect(() => {
        count3.current += 2
        return () => count3.current--
    })
}

test('test use effect', () => {
    const fiber = new Fiber()
    
    let count1 = {current: 0}
    let count2 = {current: 0}
    let count3 = {current: 0}

    const Component = EffectMockComponent.bind(null, count1, count2, count3)

    function mockLoop(arg){
        setCurrentFiber(fiber)
        Component(arg)
        callEffect(fiber.effects)
    }

    mockLoop(1)
    mockLoop(1)
    mockLoop(2)

    destoryEffect(fiber.effectHook.next)
    expect(count1.current).toBe(2)
    expect(count2.current).toBe(1)
    expect(count3.current).toBe(3)
})


test('test use layout effect', () => {
    const fiber = new Fiber()
    
    let count1 = {current: 0}
    let count2 = {current: 0}
    let count3 = {current: 0}

    const Component = LayoutEffectMockComponent.bind(null, count1, count2, count3)

    function mockLoop(arg){
        setCurrentFiber(fiber)
        Component(arg)
        callEffect(fiber.effects)
    }

    mockLoop(1)
    mockLoop(1)
    mockLoop(2)

    destoryEffect(fiber.effectHook.next)
    expect(count1.current).toBe(2)
    expect(count2.current).toBe(1)
    expect(count3.current).toBe(3)
})