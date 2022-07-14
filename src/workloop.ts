import { Fiber, HostComponent, HostText, LeactElement, NoFlags, Placement, RootFiber, UpdateText } from "./types"
import { Differ, diffProps } from './diff'
import { createDOMElementFromFiber, patchDiffProps } from './dom'
import {setCurrentFiber} from './hook'


type WorkContext = {
    current: Fiber | null,
    wip: Fiber | null
}

function beginWork(wip: Fiber): Fiber | null {
    const differ = new Differ(wip)
    if (typeof (wip.type) === 'function') { // 函数组件
        setCurrentFiber(wip)
        const child = wip.type(wip.props)
        let nextFiber = null;
        console.info('wip', wip, wip.alternate)
        let existFirstChild = wip.alternate === null ? null : wip.alternate.child
        if (Array.isArray(child)) {
            nextFiber = differ.diffChildren(child, existFirstChild)
        } else {
            nextFiber = differ.diffChild(child as LeactElement, existFirstChild)
        }
        wip.child = nextFiber
        console.info('nextFiber', nextFiber)
        return nextFiber
    } else {
        const child = wip.props.children
        if (wip.typeOf === HostText) {
            return null
        }
        let existFirstChild = wip.alternate === null ? null : wip.alternate.child
        let nextFiber = null;
        if (Array.isArray(child)) {
            nextFiber = differ.diffChildren(child, existFirstChild)
        } else {
            nextFiber = differ.diffChild(child as LeactElement, existFirstChild)
        }
        wip.child = nextFiber
        return nextFiber
    }
}


function getFirstLayerDOM(wip: Fiber): Fiber[] {
    let node = wip.child
    const elements: Fiber[] = []
    while (true) {
        // 如果找到了第一层子节点
        if (node.typeOf === HostComponent || node.typeOf === HostText) {
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
    if (wip.typeOf === HostComponent || wip.typeOf === HostText) {
        // 如果这是一个新增 dom 节点，需要将第一层子节点插入到当前节点下
        if (wip.alternate === null) {
            wip.container = createDOMElementFromFiber(wip)
            if(wip.typeOf === HostText){
                return
            }
            getFirstLayerDOM(wip).forEach(hostFiber => {
                wip.container.appendChild(hostFiber.container)
                hostFiber.flags &= ~Placement // 只保留子树 root 节点的 placement
            })
        } else {
            const current = wip.alternate
            const patchProps = diffProps(current, wip)
            if(Object.entries(patchProps).length > 0){
                wip.patchProps = patchProps
            }
        }
    }
}

function completeWork(wip: Fiber): Fiber | null {
    if (wip.sibling !== null) {
        completeEachFiber(wip)
        return wip.sibling
    }
    let node = wip;
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
        }
        workInProgress = completeWork(last)
    }
}

function getSibling(node: Fiber): Fiber | null{
    let workNode = node;
    while(true){
        if(workNode !== node && workNode.typeOf === HostText){
            return workNode;
        }
        if (workNode !== node && workNode.child !== null){
            workNode = workNode.child;
        }
        else if(workNode.sibling !== null){
            workNode = workNode.sibling;
        }else{
            while(true){
                workNode = workNode.parent;
                if(workNode === null){
                    return null;
                }
                else if(workNode.sibling !== null){
                    workNode = workNode.sibling;
                    break;
                }
            }
        }
    }
}


function commit(wip: Fiber){
    let hostComponent = null
    let node = wip
    while(true){
        if(node.typeOf === HostComponent){
            if(node.patchProps){
                patchDiffProps(node)
            }
            console.info(node, (node.flags & Placement) != NoFlags)
            if((node.flags & Placement) != NoFlags){
                if(hostComponent === null){
                    throw new Error('parent host is null')
                }
               const sibling = getSibling(node)
               if(sibling === null){
                hostComponent.container.appendChild(node.container)
               }else{
                hostComponent.container.insertBefore(node.container, sibling.container)
               }
            }
        }
        else if(node.typeOf === HostText){
            if((node.flags & UpdateText) != NoFlags){
                (node.container as Text).data = node.props
            }
        }
        
        if(node.typeOf === HostComponent || node.typeOf === RootFiber){
            hostComponent = node
        }

        if(node.child !== null){
            node = node.child
        }else if(node.sibling !== null){
            node = node.sibling
        }else{
            while(node.sibling === null){
                node = node.parent
                if(node === null){
                    return
                }
            }
            node = node.sibling
        }
    }
}

export { workLoop, commit}