class LeactElement{
    public type: any = null
    public props: { [prop: string]: any; children: LeactElement[] }
    constructor(){
        this.type = null
        this.props = {children: null}
    }
}

type ElementChild = LeactElement|string|number|null|boolean


type Hook = {
    state: any,
    next: Hook | null,
}

const Placement                       = 0b00000000001
const Delete                          = 0b00000000010
const Update                          = 0b00000000100
const ChildDelete                     = 0b00000001000
const UpdateText                      = 0b00000010000
const RestText                        = 0b00000100000
const UpdateProps                        = 0b00001000000
const NoFlags                         = 0

const FunctionComponent                  = 0b00000000001
const RootFiber                          = 0b00000000010
const HostComponent                      = 0b00000000100
const HostText                           = 0b00000001000

type Flags = number
type Component = number


type Fiber = {
    parent: Fiber | null,
    child: Fiber | null,
    sibling: Fiber | null,
    state: Hook,
    type: TagName | Function | null,
    container: Element | Text | null,
    alternate: Fiber | null,
    props: any,
    patchProps?:any,
    index: number,
    flags: Flags | null,
    key: string | null,
    typeOf: Component,
    deleteions: Fiber[]
}

type FiberRoot = {

    current: Fiber,
    wip: Fiber
}

type TagName = keyof HTMLElementTagNameMap
type Function = (...args: any) => LeactElement | LeactElement[] | number | string | false | null

type HookContext = {
    currentFiber: Fiber | null,
    currentHook: Hook | null
}

export {
    LeactElement,
    ElementChild,
    
    Hook,
    Fiber,
    FiberRoot,
    TagName,
    Function,
    HookContext,
    
    Placement,
    Delete,
    Update,
    ChildDelete,
    UpdateText,
    RestText,
    NoFlags,
    UpdateProps,

    FunctionComponent,
    RootFiber,
    HostComponent,
    HostText
}