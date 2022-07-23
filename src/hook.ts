import { StateHook, EffectHook } from './types'
import { Fiber } from './fiber'
import { startWorkloop } from './workloop'

type HookContext = {
    currentFiber: Fiber,
    currentStateHook: StateHook,
    currentEffectHook: EffectHook
}

const hookContext: HookContext = {
    currentFiber: null,
    currentStateHook: null,
    currentEffectHook: null,
}

function setCurrentFiber(fiber: Fiber) {
    hookContext.currentFiber = fiber
    hookContext.currentStateHook = null
    hookContext.currentEffectHook = null
}

function shallowArrayEqual(array1: any[], array2: any[]) {
    if (array1.length !== array2.length) {
        return false
    }
    for (let i = 0; i < array1.length; i++) {
        if (array1[i] !== array2[i]) {
            return false
        }
    }
    return true
}

function markUpdateToRoot(fiber: Fiber) {
    fiber.hasUpdate = true
    let parentFiber = fiber.parent
    while (parentFiber !== null) {
        parentFiber.childrenHaveUpdate = true
        parentFiber = parentFiber.parent
    }
}

function useState<T>(init: T): [T, (state: T) => void] {
    if (hookContext.currentFiber === null) {
        throw new Error('you may call useState outside of a component')
    }
    if (hookContext.currentStateHook === null) {
        hookContext.currentStateHook = hookContext.currentFiber.stateHook
    }
    let hook: StateHook = hookContext.currentStateHook.next || { state: init, next: null }
    hookContext.currentStateHook = hookContext.currentStateHook.next = hook
    const thisFiber = hookContext.currentFiber
    function setState(state: T) {
        hook.state = state
        markUpdateToRoot(thisFiber)
        startWorkloop()
    }
    return [hook.state, setState]
}

function useRef<T>(init: T): { current: T } {
    const [state, _] = this.useState({ current: init })
    return state
}

function useEffectImpl(isLayout: boolean, effect: () => ((() => void) | void), deps?: any[]) {
    if (hookContext.currentFiber === null) {
        throw new Error('you may call useState outside of a component')
    }
    if (hookContext.currentEffectHook === null) {
        hookContext.currentFiber.effects = []
        hookContext.currentEffectHook = hookContext.currentFiber.effectHook
    }
    const isMount = hookContext.currentEffectHook.next === null
    const hook: EffectHook = hookContext.currentEffectHook.next
        || { effect: effect, next: null, pendingDeps: null, isLayout: isLayout }
    hookContext.currentEffectHook = hookContext.currentEffectHook.next = hook
    if (arguments.length > 2 && !Array.isArray(deps)) {
        throw Error("second paremeter should be a array")
    }
    if (isMount || arguments.length === 2 || !shallowArrayEqual(deps, hook.pendingDeps)) {
        hook.effect = effect
        hook.pendingDeps = deps
        hookContext.currentFiber.effects.push(hook)
    }
}

function callEffect(effectHooks: EffectHook[]) {
    effectHooks.forEach(hook => {
        if (typeof hook.destory === 'function') {
            hook.destory()
        }
        const maybeDestory = hook.effect()
        if (typeof maybeDestory === 'function') {
            hook.destory = maybeDestory
        }
    })
}

function destoryEffect(firstEffect: EffectHook) {
    let effectHook = firstEffect
    while (effectHook !== null) {
        if (typeof effectHook.destory === 'function') {
            effectHook.destory()
        }
        effectHook = effectHook.next
    }
}

const useEffect = useEffectImpl.bind(null, false)
const useLayoutEffect = useEffectImpl.bind(null, true)

export {
    setCurrentFiber,
    hookContext,
    useState,
    useRef,
    useEffect,
    useLayoutEffect,
    callEffect,
    destoryEffect,
}