import {HookContext, Hook, Fiber} from './types'

const hookContext: HookContext = {
    currentFiber: null,
    currentHook: null
}

function setCurrentFiber(fiber: Fiber){
    hookContext.currentFiber = fiber
    hookContext.currentHook = null
}

function useState<T>(init: T): [() => Hook, (state: T) => void]{
    if(hookContext.currentFiber === null){
        throw new Error('should not be null')
    }
    if (hookContext.currentHook === null){
       hookContext.currentHook = hookContext.currentFiber.state
    }
    let hook = hookContext.currentHook.next || {state: init,next: null}
    hookContext.currentHook.next = hook
    return [() => hook, state => (hook.state = state)]
}

export {setCurrentFiber, useState, hookContext}