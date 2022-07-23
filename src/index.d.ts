import {
    useState,
    useRef,
    useLayoutEffect,
    useEffect,
} from './hook'

import {
    createElement,
    createFragment,
} from './fiber'

declare const Leact: {
    useState: typeof useState,
    useRef: typeof useRef,
    useLayoutEffect: typeof useLayoutEffect,
    useEffect: typeof useEffect,
    createElement: typeof createElement,
    createFragment: typeof createFragment
}

export default Leact