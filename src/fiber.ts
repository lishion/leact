import {
    StateHook,
    EffectHook, 
    TagName, 
    Component, 
    Flags, 
    HostComponent, 
    HostText, 
    FunctionComponent, 
    NoFlags, 
    FragmentComponent,
} from './types'

import { flatten } from './utils'

class LeactElement {
    public key: string|number|null
    public ref: {current: string}
    constructor(
        public elementType: number,
        public type: any,
        public props: { [propName: string]: any },
        public child: LeactElement | LeactElement[]) 
    {
        this.key = props?.key || null
        this.ref = props?.ref || null
        if(this.ref !== null){
            delete props.ref
        }
        this.child = child
        this.props = {...props, child: child}
    }

    public static of(value: any): LeactElement{
        if(value === '' || value === null){
            return null
        }
        const valueType = typeof value
        if(valueType === 'number' || valueType === 'boolean' || valueType === 'string'){
            const elementWrap = new LeactElement(HostText, null, {value: value.toString()}, null)
            return elementWrap
        }else if(value instanceof LeactElement){
            return value
        }else {
            throw new Error('child of a component should be a comoponet|string|number|boolean|null but got ' + typeof value)
        }
    }

    public isSameType(fiber: Fiber): boolean{
        if(fiber.elementType !== this.elementType){
            return false
        }else if(fiber.type !== this.type){
            return false
        }
        return true
    }

}

type ElementChild = LeactElement|string|number|null|boolean

function createElement(type: string | ((...args: any) => ElementChild), props: any, ...child: ElementChild[]): LeactElement{
    if(Array.isArray(child)){
        child = flatten(child)
    }
    const children = Array.isArray(child) ? child.map(LeactElement.of) : LeactElement.of(child)
    const elementType = typeof type === 'function' ? FunctionComponent: HostComponent
    return new LeactElement(elementType, type, props, children)
}

class Fiber{
    public parent: Fiber | null = null
    public child: Fiber | null = null
    public sibling: Fiber | null = null
    public stateHook: StateHook
    public effectHook: EffectHook
    public type: TagName | ((...args: any) => ElementChild) | null = null
    public alternate: Fiber | null = null
    public props: any = null
    public flags: Flags | null = null
    public key: string | number | null = null
    public elementType: Component = null
    public deletions: Fiber[] = []
    public ref?: any 
    public effects: EffectHook[] = []
    public previousProps: any = null
    public hasUpdate = false
    public childrenHaveUpdate = false

    constructor(){
        this.stateHook = {state: null, next: null}
        this.effectHook = {effect: null, pendingDeps: null, next: null, isLayout: null}
    }

    public hasFlag(flag: number): boolean{
        return (this.flags & flag) !== NoFlags 
    }

    public removeFlag(flag: number){
        this.flags &= ~flag
        return this
    }

    public addFlag(flag: number){
        this.flags |= flag
        return this
    }

    protected copyFiber(wip: Fiber, props: any){
        wip.ref = this.ref
        wip.key = this.key
        wip.type = this.type
        wip.parent = this.parent
        wip.elementType = this.elementType
        wip.child = this.child
        wip.alternate = this
        this.alternate = wip
        wip.stateHook = this.stateHook
        wip.effectHook = this.effectHook
        wip.props = props
        wip.previousProps = this.previousProps
        wip.hasUpdate = this.hasUpdate
        wip.childrenHaveUpdate = this.childrenHaveUpdate
    }

    public createWorkInProgress(props: any): Fiber{
        const wip = this.alternate || new Fiber()
        this.copyFiber(wip, props)
        return wip
    }

    public clean(){
        const sibling = this.sibling
        if(sibling !== null){
            sibling.child = null
            sibling.sibling = null
            sibling.parent = null
        }
        this.child = null
        this.sibling = null
        this.parent = null
    }

    public static fromElement(element: LeactElement): Fiber{
        let fiber = null
        if(element.elementType === HostComponent){
            fiber = new HostComponentFiber()
        }else if(element.elementType === HostText){
            fiber = new HostTextFiber()
        }else{
            fiber = new Fiber()
        }
        fiber.props = element.props
        fiber.key = element.key
        fiber.type = element.type
        fiber.elementType = element.elementType
        fiber.ref = element.ref
        return fiber
    } 
}

abstract class HostFiber extends Fiber{
    public patchProps?: any
    public container: Element | Text
    constructor(){
        super()
        this.container = null
    }

    protected abstract applyProperties(props: any, container: Element | Text): void
    protected abstract createDom(): Element | Text
    public abstract patchDom(): void

    public getDom(): Element | Text{
        if(this.container !== null){
            return this.container
        }
        const initDom = this.createDom()
        if(this.ref && 'current' in this.ref){
            this.ref.current = initDom
        }
        this.applyProperties(this.props, initDom)
        this.container = initDom
        return initDom
    }

    public removeDom(){
        if(this.container){
            this.container.remove()
        }
    }

    
}

class HostComponentFiber extends HostFiber{
    
    private propNameToEventName(name: string): string{
        return name.toLocaleLowerCase().substring(2)
    }
    
    protected applyProperties(props: any, container: Element): void {
        for(const [attr, value] of Object.entries(props)){
            if(attr === 'child'){
                continue
            }
            const realAttr = attr === 'className' ? 'class': attr
            if(value === null){
                container.removeAttribute(realAttr)
                continue
            }
            if(typeof(value) === 'string'){
                container.setAttribute(realAttr, value)
            }else if(realAttr === 'style'){
                const style = (container as any).style
                for(const [cssKey, cssValue] of Object.entries(value)){
                    if(cssValue === null){
                        style.removeProperty(cssKey)
                    }else{
                        style[cssKey as string] = cssValue
                    }
                }
            }else if(typeof(value) === 'function'){
                container.addEventListener(this.propNameToEventName(attr), value as EventListenerOrEventListenerObject)
            }
        }
    }

    protected createDom(): Element{
        return document.createElement(this.type as TagName)
    }
    
    public patchDom(): void {
        if(!this.patchProps){
            return
        }
        const element = this.container as Element
        this.applyProperties(this.patchProps, element)
        if(this.alternate === null){
            return
        }
        for(const [key, value] of Object.entries(this.alternate.props)){
            if(typeof value === 'function'
                && Object.prototype.hasOwnProperty.call(this.patchProps, key)){
                element.removeEventListener(this.propNameToEventName(key), value as any)
            }
        }
        this.patchProps = null
    }

    public appendChild(fiber: HostFiber){
        this.container.appendChild(fiber.getDom())
    }

    public insertBefore(fiber: HostFiber, base: HostFiber){
        this.container.insertBefore(fiber.getDom(), base.getDom())
    }

    public createWorkInProgress(props: any): HostFiber {
        const wip = this.alternate || new HostComponentFiber()
        wip.container = this.container
        this.copyFiber(wip, props)
        return wip
    }

    public patchProps?: any
    public container: Element
    public alternate: HostComponentFiber
    constructor(){
        super()
    }
}

function createFragment(props: any, child: LeactElement | LeactElement[]): LeactElement{
    if(Array.isArray(child)){
        child = flatten(child)
    }
    return new LeactElement(FragmentComponent, null, props, child)
}

function Fragment(props: {key: string, child: LeactElement | LeactElement[]}): LeactElement{
    return createFragment(props, props.child)
}

class HostTextFiber extends HostFiber{
    protected applyProperties(props: any, container: Text): void {
        container.data = props.value
    }
    protected createDom(): Element | Text {
        return document.createTextNode(this.props.value)
    }
    public patchDom(): void {
        if(this.patchProps){
            this.applyProperties(this.patchProps, this.container)
        }
        this.patchProps = null
    }
    public createWorkInProgress(props: any): HostFiber {
        const wip = this.alternate || new HostTextFiber()
        wip.container = this.container
        this.copyFiber(wip, props)
        return wip
    }
    public patchProps?: {value: string}
    public container: Text
    public alternate: HostComponentFiber
    constructor(){
        super()
    }
}

export {
    Fiber,
    HostComponentFiber as HostComponentFiber,
    HostTextFiber,
    HostFiber,
    LeactElement,
    ElementChild, 
    createElement,
    createFragment,
    Fragment,
}