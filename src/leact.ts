
import { 
    TagName, 
    FunctionComponent, 
    LeactElement, 
    ElementChild,
    Fiber,
    RootFiber,
    Function,
} from "./types"

import { createEmptyFiber, createFiberFromElement, createWorkInProgress } from "./fiber"

import { commit, workLoop } from "./workloop"

import {useState, hookContext} from './hook'

function wrapValue(value: any){
    if(value === '' || value === null){
        return null
    }
    const valueType = typeof value
    if(valueType === 'number' || valueType === 'boolean' || valueType === 'string'){
        const elementWrap = new LeactElement()
        elementWrap.props = {value: value.toString(), children: null}
        return elementWrap
    }else if(value instanceof LeactElement){
        return value
    }else {
        throw new Error('child of a component should be a comoponet|string|number|boolean|null but got ' + typeof value)
    }
}


class Leact{
    private current: Fiber = null
    render(dom: Element, leactElement: LeactElement){
        const rootFiber = createEmptyFiber()
        rootFiber.typeOf |= RootFiber
        rootFiber.container = dom
        rootFiber.props = {children: leactElement}
        this.current = rootFiber
        this.startWorkloop()
    }

    useState<T>(init: T): [T, (state: T) => void]{
        if(hookContext.currentFiber === null){
            throw new Error('should not be null')
        }
        if (hookContext.currentHook === null){
           hookContext.currentHook = hookContext.currentFiber.state
        }
        console.info('hookContext', hookContext.currentHook.next)
        let hook = hookContext.currentHook.next || {state: init,next: null}
        hookContext.currentHook.next = hook
        return [hook.state, state => {
            console.info(state)
            hook.state = state
            this.startWorkloop()
        }]
    }

    createWIPRootFiber(): Fiber{
        if(this.current.alternate === null){
            console.info("first")
            return createWorkInProgress(this.current, this.current.props)
        }
        console.info('second',this.current.alternate)
        return this.current.alternate
    }

    startWorkloop(){
        const wipRootFiber = this.createWIPRootFiber()
        workLoop(wipRootFiber)
        commit(wipRootFiber)
        console.info('finish render', wipRootFiber.alternate)
        this.current = wipRootFiber
    }

    createElement(type: string | Function, props: any, ...child: (LeactElement|string|number|null)[]): LeactElement{
        const children = Array.isArray(child) ? child.map(wrapValue) : wrapValue(child)
        const element  = new LeactElement()
        element.type = type
        element.props = {...props, children: children}
        return element
    }
}



export default new Leact()