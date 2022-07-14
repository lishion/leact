import {Fiber, TagName} from './types'

function propNameToEventName(name: string): string{
    return name.toLocaleLowerCase().substring(2)
}

function applyProperties(element: Element, props: any){
    for(let [key, value] of Object.entries(props)){
        if(key !== "children" && typeof(value) === 'string'){
            element.setAttribute(key, value)
        }else if(key === 'style'){
            const style = (element as any).style
            for(let [cssKey, cssValue] of Object.entries(value)){
                style[cssKey as string] = cssValue
            }
        }else if(typeof(value) === 'function'){
            element.addEventListener(propNameToEventName(key), value as EventListenerOrEventListenerObject)
        }
    }
}


function patchDiffProps(wip: Fiber){
    const element = wip.container as Element;
    if(!wip.patchProps){
        return
    }
    applyProperties(element, wip.patchProps)
    if(wip.alternate === null){
        return
    }
    for(let [key, value] of Object.entries(wip.patchProps)){
        if(typeof value === 'function' && key in wip.alternate.props){
            const oldCallback = wip.alternate.props[key]
            console.info('oldCallback', oldCallback)
            wip.container.removeEventListener(propNameToEventName(key), oldCallback)
        }
    }
}


function createDOMElementFromFiber(fiber: Fiber): Element | Text{
    if(fiber.type === null){
        return document.createTextNode(fiber.props)
    }
    const element = document.createElement(fiber.type as TagName)
    applyProperties(element, fiber.props)
    return element
}


export {createDOMElementFromFiber, patchDiffProps}