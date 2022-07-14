import { Fiber, HostComponent, LeactElement, HostText, FunctionComponent } from "./types";

function createEmptyFiber(): Fiber{
    return {
        type: null,
        props: null,
        child: null,
        sibling: null,
        parent: null,
        container: null,
        alternate: null,
        state: {
            state: null,
            next: null
        },
        flags: 0,
        key: null,
        typeOf: null,
        index: 0,
        deleteions:[]
    }
}

function createFiberFromElement(element: LeactElement): Fiber{
    const fiber = createEmptyFiber()
    if(element.type === null){
        fiber.props = element.props.value
        fiber.typeOf = HostText
        return fiber
    }
    fiber.props = element.props
    fiber.key = element.props.key || null
    fiber.type = element.type
    if(typeof element.type === 'string'){
        fiber.typeOf = HostComponent
    }else{
        fiber.typeOf = FunctionComponent
    }
    return fiber
}

function createWorkInProgress(current: Fiber, props: any): Fiber{
    const wip = current.alternate || createEmptyFiber()
    wip.props = props
    wip.key = props.key || null
    wip.type = current.type
    wip.parent = current.parent
    wip.typeOf = current.typeOf
    wip.container = current.container
    wip.child = current.child
    wip.alternate = current
    wip.state = current.state
    current.alternate = wip
    return wip
}

function clean(fiber: Fiber){
    const sibling = fiber.sibling
    if(sibling !== null){
        sibling.child = null
        sibling.sibling = null
        sibling.parent = null
    }
    fiber.child = null
    fiber.sibling = null
    fiber.parent = null
}




export {createEmptyFiber, createFiberFromElement, createWorkInProgress}