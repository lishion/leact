const Placement                       = 0b00000000001
const Delete                          = 0b00000000010
const ChildDelete                     = 0b00000001000
const UpdateText                      = 0b00000010000
const NoFlags                         = 0

const FunctionComponent                           = 0b00000000001
const RootFiber                                   = 0b00000000010
const HostComponent                               = 0b00000000100
const HostText                                    = 0b00000001000
const FragmentComponent                           = 0b00000010000


type StateHook = {
    state: any,
    next: StateHook | null,
}

type EffectHook = {
    effect: (deps?:any[]) => (() => void) | void,
    destroy?: () => void,
    pendingDeps: any[],
    next: EffectHook,
    isLayout: boolean,
}


type Flags = number
type Component = number

type TagName = keyof HTMLElementTagNameMap

export {
    StateHook,
    EffectHook,

    TagName,

    Placement,
    Delete,

    ChildDelete,
    UpdateText,
    NoFlags,

    FunctionComponent,
    RootFiber,
    HostComponent,
    HostText,
    FragmentComponent,
    Flags,
    Component,
}