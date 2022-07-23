import { HostText, Placement, RootFiber } from './types'
import { Differ, diffProps } from './diff'
import { setCurrentFiber, callEffect, destroyEffect } from './hook'
import { Fiber, HostFiber, HostComponentFiber, LeactElement } from './fiber'


type workLoopContext = {
    current: Fiber | null,
}

function receiverUpdate(fiber: Fiber): boolean{
    return fiber.previousProps !== fiber.props || fiber.hasUpdate || fiber.alternate === null
}

function cloneChildren(fiber: Fiber){
    let child = fiber.alternate.child
    let firstChild: Fiber = null
    let lastChild: Fiber = null 
    while(child !== null){
        const nextChild = child.createWorkInProgress(child.props)
        if(firstChild === null){
            firstChild = lastChild = nextChild
        }else{
            lastChild = lastChild.sibling = nextChild
        }
        child = child.sibling
    }
    fiber.child = firstChild
}

function beginWork(wip: Fiber): Fiber | null {
    if(wip.elementType === HostText){
        return null
    }
    
    if(!receiverUpdate(wip)){
        if(!wip.childrenHaveUpdate){
            return null
        }else{
            cloneChildren(wip)
            return wip.child
        }
    }
    
    const differ = new Differ(wip)
    const existFirstChild = wip.alternate === null ? null : wip.alternate.child
    let newChild = null
    if (typeof (wip.type) === 'function') { // 函数组件
        setCurrentFiber(wip)
        const maybeNewChild = wip.type(wip.props)
        newChild = Array.isArray(maybeNewChild) 
                        ? maybeNewChild.map(LeactElement.of)
                        : LeactElement.of(maybeNewChild)
    } else {
        newChild = wip.props.child
    }
    let nextFiber = null
    if (Array.isArray(newChild)) {
        nextFiber = differ.diffChildren(newChild, existFirstChild)
    } else {
        nextFiber = differ.diffChild(LeactElement.of(newChild), existFirstChild)
    }
    wip.child = nextFiber
    wip.hasUpdate = false
    return nextFiber
}


function getFirstLayerDOM(wip: Fiber): HostFiber[] {
    if(!wip.child){
        return []
    }
    let node = wip.child
    const elements: HostFiber[] = []
    while (true) {
        // 如果找到了第一层子节点
        if (node instanceof HostFiber) {
            elements.push(node)
            if(node.sibling !== null){
                node = node.sibling
                continue
            }
             // 否则往上遍历，直到父节点为空，或为初始节点
            while (node.sibling === null) {
                node = node.parent
                if (node === null || node === wip) {
                    return elements
                }
            }
            node = node.sibling
        } else if (node.child !== null){
           // 如果子节点不为空，则继续往下找
            node = node.child
        } else if (node.sibling !== null) { // 如果兄弟节点不为空，则继续找
            node = node.sibling
        }else{
            while (node.sibling === null) {
                node = node.parent
                if (node === null || node === wip) {
                    return elements
                }
            }
            node = node.sibling
        }
    }
}


function completeEachFiber(wip: Fiber) {
    if (wip instanceof HostFiber) {
        // 如果这是一个新增 dom 节点，需要将第一层子节点插入到当前节点下
        if (wip.alternate === null) {
            wip.getDom()
            if(wip instanceof HostComponentFiber && wip.child !== null){
                getFirstLayerDOM(wip).forEach(hostFiber => {
                    wip.appendChild(hostFiber)
                    hostFiber.removeFlag(Placement) // 只保留子树 root 节点的 placement
                })
            }
        } else {
            const current = wip.alternate
            const patchProps = diffProps(current, wip)
            if(Object.entries(patchProps).length > 0){
                wip.patchProps = patchProps
            }
        }
    }
    wip.childrenHaveUpdate = false
}

function completeWork(wip: Fiber): Fiber | null {
    if (wip.sibling !== null) {
        completeEachFiber(wip)
        return wip.sibling
    }
    let node = wip
    while (node.sibling === null) {
        completeEachFiber(node)
        node = node.parent
        if (node === null) {
            return null
        }
    }
    completeEachFiber(node)
    return node.sibling
}


function workLoop(wip: Fiber) {
    let workInProgress = wip
    while (workInProgress !== null) {
        let last = workInProgress
        while (workInProgress !== null) {
            last = workInProgress
            workInProgress = beginWork(workInProgress)
            last.previousProps = last.props
        }
        workInProgress = completeWork(last)
    }
}

function findNextSibling(node: Fiber){
    let workNode = node
    if(workNode.sibling !== null){
        return workNode.sibling
    }
    while(node.sibling === null){
        workNode = workNode.parent
        if(workNode === null){
            return null
        }
    }
    return node.sibling
}

function findHostSibling(node: Fiber): HostFiber | null {
    let fiber = node
    while(true){
        if(fiber.hasFlag(Placement)){
            fiber = findNextSibling(fiber)
            if(fiber === null){
                return null
            }
        }else if(fiber instanceof HostFiber){
            return fiber
        }else if (fiber.child !== null){
            fiber = fiber.child
        }else{
            fiber = findNextSibling(fiber)
            if(fiber === null){
                return null
            }
        }
    }
}


function commitDelete(node: Fiber){
    let workNode = node
    while(true){
        if(workNode instanceof HostFiber){
            workNode.removeDom()
        }else {
            destroyEffect(workNode.effectHook.next)
        }
        if (workNode.child !== null){
            workNode = workNode.child
        }
        else if(workNode.sibling !== null){
            workNode = workNode.sibling
        }else{
            while(true){
                workNode = workNode.parent
                if(workNode === null || workNode === node){
                    return
                }else if(workNode.sibling !== null){
                    workNode = workNode.sibling
                    break
                }
            }
        }
    }
}

function findParent(fiber: Fiber){
    let parent = fiber.parent
    while(parent !== null){
        if(parent instanceof HostComponentFiber){
            return parent
        }
        parent = parent.parent
    }
    throw Error('no parent found, should be a bug')
}

function commit(wip: Fiber){
    let node = wip
    while(true){
        if(node instanceof HostFiber){
            if(node instanceof HostComponentFiber && node.hasFlag(Placement)){
                const hostComponent = findParent(node)
                const sibling = findHostSibling(node)
                if(sibling === null){
                    hostComponent.appendChild(node)
                }else{
                    hostComponent.insertBefore(node, sibling)
                }
                node.removeFlag(Placement)
            }else if(!node.hasFlag(Placement)){
                node.patchDom()
            }
        }
        if(node.child !== null){
            node = node.child
        }else if(node.sibling !== null){
            node = node.sibling
        }else{
            while(node.sibling === null){
                if(node.deletions && node.deletions.length > 0){
                    node.deletions.forEach(needDeleteFiber => {
                        commitDelete(needDeleteFiber)
                        needDeleteFiber.clean()
                    })
                    // remove 
                    if(node.alternate){
                        node.alternate.child = null
                    }
                }
                node.deletions = []
                node = node.parent
                if(node === null){
                    return
                }
            }
            node = node.sibling
        }
    }
}

function commitEffectImpl(isLayout: boolean, wip: Fiber){
    let node = wip
    while(node !== null){
        callEffect(node.effects.filter(effect => effect.isLayout === isLayout))
        // clear already finished effect
        node.effects = node.effects.filter(effect => effect.isLayout !== isLayout)
        if(!isLayout){
            node.effects = []
        }
        if(node.child !== null){
            node = node.child
        }else if(node.sibling !== null){
            node = node.sibling
        }else{
            node = findNextSibling(node)
        }
    }
}

const commitEffect = commitEffectImpl.bind(null, false)
const commitLayoutEffect = commitEffectImpl.bind(null, true)

const workLoopContext: workLoopContext = {
    current: null,
}

function createWIPRootFiber(): Fiber{
    const rootFiber = workLoopContext.current.alternate === null ? 
        workLoopContext.current.createWorkInProgress(workLoopContext.current.props)
        : workLoopContext.current.alternate
    // no update for rootFiber
    rootFiber.hasUpdate = false
    // the children should have works if the work loop going to launch
    rootFiber.childrenHaveUpdate = true
    return rootFiber
}

function startWorkLoop(){
    const wipRootFiber = createWIPRootFiber()
    workLoop(wipRootFiber)
    commit(wipRootFiber)
    commitLayoutEffect(wipRootFiber)
    setTimeout(commitEffect.bind(null, wipRootFiber), 0)
    workLoopContext.current = wipRootFiber
}

function render(dom: Element, leactElement: LeactElement){
    const rootFiber = new HostComponentFiber()
    rootFiber.elementType |= RootFiber
    rootFiber.container = dom
    rootFiber.props = {child: leactElement}
    workLoopContext.current = rootFiber
    startWorkLoop()
}

export { workLoop, commit, commitEffect, startWorkLoop, render }