import {
    Placement,
    Delete,
    ChildDelete,
} from './types'

import { LeactElement, Fiber } from './fiber'



class Differ {
    private readonly parent: Fiber = null
    constructor(parent: Fiber) {
        this.parent = parent
    }
    markDelete(currentFiber: Fiber) {
        if (currentFiber === null) {
            return
        }
        currentFiber.flags |= Delete
        this.parent.flags |= ChildDelete
        this.parent.deletions.push(currentFiber)
    }

    markRemainsDelete(fiber: Fiber) {
        let current = fiber
        while (current !== null) {
            this.markDelete(current)
            current = current.sibling
        }
    }

    placeNewChild(child: LeactElement) {
        const newChild = Fiber.fromElement(child).addFlag(Placement)
        newChild.parent = this.parent
        return newChild
    }

    diffChild(newChild: LeactElement | null, firstCurrentFiber: Fiber): Fiber | null {
        // 如果本次 wip 为空，则需要删除所有的 current 
        if (newChild === null) {
            this.markDelete(firstCurrentFiber)
            return null
        }

        // 首次渲染
        if (firstCurrentFiber === null) {
            return this.placeNewChild(newChild)
        }
        let current = firstCurrentFiber
        while (current !== null) {
            // 如果 type 和 key 都相同，则可以复用m
            if (newChild.isSameType(current) && newChild.key === current.key) {
                return current.createWorkInProgress(newChild.props)
            } else {
                // 否则删除无法复用的 current 
                this.markDelete(current)
            }
            current = current.sibling
        }
        // 否则创建一个新的
        return this.placeNewChild(newChild)
    }

    getKeyFiberMap(fiber: Fiber): Map<string | number, [Fiber, number]> {
        let current = fiber
        const keyIndexMap = new Map<string | number, [Fiber, number]>()
        let index = 0
        while (current !== null) {
            keyIndexMap.set(current.key || index, [current, index])
            current = current.sibling
            index += 1
        }
        return keyIndexMap
    }

    diffChildren(newChildren: (LeactElement | null)[], firstCurrentFiber: Fiber): Fiber | null {
        let baseIndex = 0
        let lastNewFiber: Fiber | null = null
        let firstNewFiber = lastNewFiber
        // 如果本次 wip 为空，则需要删除所有的 current 
        if (newChildren === null || newChildren.length === 0) {
            this.markRemainsDelete(firstCurrentFiber)
            return null
        }
        const keyIndexMap = this.getKeyFiberMap(firstCurrentFiber)
        for (let index = 0; index < newChildren.length; index++) {
            const child = newChildren[index]
            if (child === null) {
                continue
            }
            const newKey = child.props.key || index
            let newFiber = null
            if (keyIndexMap.has(newKey)) {
                const [oldFiber, oldIndex] = keyIndexMap.get(newKey)
                if (child.isSameType(oldFiber)) {
                    newFiber = oldFiber.createWorkInProgress(child.props)
                } else {
                    this.markDelete(oldFiber)
                    newFiber = Fiber.fromElement(child).addFlag(Placement)
                }
                if (oldIndex < baseIndex) {
                    newFiber.addFlag(Placement)
                } else {
                    baseIndex = oldIndex
                }
                keyIndexMap.delete(newKey)
            } else {
                newFiber = Fiber.fromElement(child).addFlag(Placement)
            }
            if (lastNewFiber !== null) {
                lastNewFiber.sibling = newFiber
                lastNewFiber = newFiber
            } else {
                firstNewFiber = lastNewFiber = newFiber
            }
            newFiber.parent = this.parent
        }
        // remove the link of last fiber otherwise there may be a cycle
        lastNewFiber.sibling = null
        keyIndexMap.forEach(([fiber]) => this.markDelete(fiber))
        return firstNewFiber
    }
}

function diffObject(wip: any, current: any): any {
    const diffRes: { [key: string]: any } = {}
    for (const [k, v] of Object.entries(wip)) {
        if (k === 'key' || k === 'children') {
            continue
        }
        if (k === 'style') {
            diffRes['style'] = diffObject(wip.style, current.style || {})
        }
        else if (current[k] !== v) {
            diffRes[k as string] = v
        }
    }
    for (const [k] of Object.entries(current)) {
        if (!Object.prototype.hasOwnProperty.call(wip, k)) {
            diffRes[k] = null
        }
    }
    return diffRes
}


function diffProps(current: Fiber, wip: Fiber) {
    const oldProps = current.props
    const newProps = wip.props
    return diffObject(newProps, oldProps)
}

export { Differ, diffProps, diffObject }