import {
    Fiber, 
    LeactElement, 
    Placement, 
    Delete, 
    ChildDelete, 
    HostText,
    UpdateText,
} from './types'
import {createEmptyFiber, createFiberFromElement, createWorkInProgress} from './fiber'




class Differ{
    private parent: Fiber = null
    constructor(parent: Fiber){
        this.parent = parent
    }
    markDelete(currentFiber: Fiber){
        if(currentFiber === null){
            return
        }
        currentFiber.flags |= Delete
        this.parent.flags |= ChildDelete
        this.parent.deleteions.push(currentFiber)
    }
    markRemainsDelete(fiber: Fiber){
        let current  = fiber
        while(current !== null){
            this.markDelete(current)
            current = current.sibling
        }
    }
    diffChild(newChild: LeactElement | null, firstCurrentFiber: Fiber): Fiber|null{
        // 如果本次 wip 为空，则需要删除所有的 current 
        if(newChild === null){
            this.markDelete(firstCurrentFiber)
            return null
        }
        
        // 首次渲染
        if(firstCurrentFiber === null){
            const fiber = createFiberFromElement(newChild)
            fiber.flags |= Placement
            fiber.parent = this.parent
            return fiber
        }

        if(newChild.type === null){
            if(firstCurrentFiber.typeOf !== HostText){
                this.markRemainsDelete(firstCurrentFiber)
                const fiber = createEmptyFiber()
                fiber.typeOf = HostText
                fiber.flags |= Placement
                fiber.props = newChild.props.value
                fiber.parent = this.parent
                return fiber
            }else{
                const fiber = createWorkInProgress(firstCurrentFiber, newChild.toString())
                fiber.typeOf = HostText
                fiber.flags |= Placement
                this.markRemainsDelete(firstCurrentFiber.sibling)
                fiber.parent = this.parent
                return fiber
            }
        }
    
        let current = firstCurrentFiber;
        let wip = null;
        let newKey = newChild.props.key || null
        while(current !== null){
            // 如果 type 和 key 都相同，则可以复用
            if(current.type === newChild.type && current.key === newKey){
                wip = createWorkInProgress(current, newChild.props)
            }
            // 否则删除无法复用的 current 
            else{
                this.markDelete(current)
            }
            current = current.sibling
        }
        // 如果找到可以复用的则直接返回
        if(wip !== null){
            wip.parent = this.parent
            return wip
        }
        // 否则创建一个新的
        const fiber = createFiberFromElement(newChild)
        fiber.flags |= Placement
        fiber.parent = this.parent
        return fiber
    }
    
    getKeyFiberMap(fiber: Fiber): Map<string|number, [Fiber, number]>{
        let current = fiber
        let keyIndexMap = new Map<string|number, [Fiber, number]>()
        let index = 0;
        while(current !== null){
            keyIndexMap.set(current.key || index, [current, index]);
            index += 1
            current = current.sibling
        }
        return keyIndexMap
    }
    
    diffChildren(newChildren: (LeactElement|null)[], firstCurrentFiber: Fiber): Fiber | null{
        const keyIndexMap = this.getKeyFiberMap(firstCurrentFiber)
        let baseIndex = 0
        let lastNewFiber: Fiber | null = null
        let firstNewFiber = lastNewFiber

        // 如果本次 wip 为空，则需要删除所有的 current 
        if(newChildren === null || newChildren.length === 0){
            this.markRemainsDelete(firstCurrentFiber)
            return null
        }
        for(let index = 0; index < newChildren.length; index++){
            const child = newChildren[index]
            if(child === null){
                continue
            }
            let newKey = child.props.key || index
            let newFiber = null
            if(keyIndexMap.has(newKey)){
                const [oldFiber, oldIndex] = keyIndexMap.get(newKey)
                const oldKey = oldFiber.key || oldIndex
                if(child.type === null){
                    if(oldFiber.typeOf === HostText){
                        newFiber = createWorkInProgress(oldFiber, child.props.value)
                        if(child.props.value !== oldFiber.props){
                            newFiber.flags |= UpdateText
                        }
                    }else{
                        this.markDelete(oldFiber)
                        newFiber = createEmptyFiber()
                        newFiber.typeOf = HostText
                        newFiber.props = child.props.value
                        newFiber.flags |= Placement
                    }
                }else if(oldFiber.type !== child.type){
                    this.markDelete(oldFiber)
                    newFiber = createFiberFromElement(child)
                    newFiber.flags |= Placement
                }else{
                    newFiber = createWorkInProgress(oldFiber, child.props)
                }
                if(oldIndex < baseIndex){
                    newFiber.flags |= Placement
                }else{
                    baseIndex = oldIndex
                }
                keyIndexMap.delete(newKey)
            }else{
                newFiber = createFiberFromElement(child)
                newFiber.flags |= Placement
            }
            if(lastNewFiber !== null){
                lastNewFiber.sibling = newFiber
                lastNewFiber = newFiber
            }else{
                firstNewFiber = lastNewFiber = newFiber
            }
            newFiber.parent = this.parent
        }
        keyIndexMap.forEach(([fiber, _]) => this.markDelete(fiber))
        return firstNewFiber
    }
}


function diffProps(current: Fiber, wip: Fiber){
    const diffRes: {[key: string]: any} = {} 
    const oldProps = current.props
    const newProps = wip.props
    
    for(const [k, v] of Object.entries(newProps)){
        if(k === "key" || k === "children"){
            continue
        }
        if(oldProps[k] !== v){
            diffRes[k as string] = v
        }
    }
    return diffRes
}

export {Differ, diffProps}