import { StateHook, EffectHook } from './types'
import { Fiber } from './fiber'
import { startWorkLoop } from './workloop'
import { shallowArrayEqual } from './utils'

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
    const hook: StateHook = hookContext.currentStateHook.next || { state: init, next: null }
    hookContext.currentStateHook = hookContext.currentStateHook.next = hook
    const thisFiber = hookContext.currentFiber
    function setState(state: T) {
        hook.state = state
        markUpdateToRoot(thisFiber)
        startWorkLoop()
    }
    return [hook.state, setState]
}

function useRef<T>(init: T): { current: T } {
    const [state, _] = this.useState({ current: init })
    return state
}

function useEffectImpl(isLayout: boolean, effect: () => ((() => void) | void), deps?: any[]){
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

    if (deps !== undefined && !Array.isArray(deps)) {
        throw Error('second parameter should be a array')
    }
    if (isMount || deps === undefined || !shallowArrayEqual(deps, hook.pendingDeps)) {
        hook.effect = effect
        hook.pendingDeps = deps
        hookContext.currentFiber.effects.push(hook)
    }
}

function callEffect(effectHooks: EffectHook[]) {
    effectHooks.forEach(hook => {
        if (typeof hook.destroy === 'function') {
            hook.destroy()
        }
        const maybeDestroy = hook.effect()
        if (typeof maybeDestroy === 'function') {
            hook.destroy = maybeDestroy
        }
    })
}

function destroyEffect(firstEffect: EffectHook) {
    let effectHook = firstEffect
    while (effectHook !== null) {
        if (typeof effectHook.destroy === 'function') {
            effectHook.destroy()
        }
        effectHook = effectHook.next
    }
}

function useEffect(effect: () => ((() => void) | void), deps?: any[]): void{
    useEffectImpl(false, effect, deps)
}

function useLayoutEffect(effect: () => ((() => void) | void), deps?: any[]): void{
    useEffectImpl(true, effect, deps)
}


export {
    setCurrentFiber,
    hookContext,
    useState,
    useRef,
    useEffect,
    useLayoutEffect,
    callEffect,
    destroyEffect,
}