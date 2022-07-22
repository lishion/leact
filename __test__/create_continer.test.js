/**
 * @jest-environment jsdom
 */
import { HostComponentFiber, HostTextFiber } from "../src/fiber";
import { HostText} from "../src/types";

document.body = document.createElement("body");

function withDom(dom, func){
    document.body.appendChild(dom)
    func()
    document.body.removeChild(dom)
}

test('test create normal container', ()=>{
    const ref = {current: 1}
    const fiber = new HostComponentFiber()
    fiber.type = 'p'
    fiber.elementType = HostComponentFiber
    fiber.props = {
        className:"test-class",
        id: "test-id",
        onClick: () => ref.current = 2,
        style: {
            color: "red"
        }
    }

    const dom = fiber.getDom()
    withDom(dom, () => dom.click())

    expect(dom.className).toBe("test-class")
    expect(dom.id).toBe("test-id")
    expect(dom.style.color).toBe("red")
    expect(ref.current).toBe(2)
})

test('test text', ()=>{
    const fiber = new HostTextFiber()
    fiber.elementType = HostText
    fiber.props = {
        value: "text"
    }
    const dom = fiber.getDom()
    expect(dom.data).toBe("text")
})

test('patch normal container', () => {
    const ref = {current: 1}
    const wip = new HostComponentFiber()
    wip.type = 'p'
    wip.elementType = HostComponentFiber
    wip.props = {
        className:"test-class",
        id: "test-id",
        onClick: () => ref.current += 1,
        style: {
            color: "red"
        }
    }

    const current = new HostComponentFiber()
    current.type = 'p'
    current.elementType = HostComponentFiber
    current.props = {
        className:"test-class",
        id: "test-id",
        onClick: () => ref.current += 1,
        style: {
            color: "red"
        }
    }

    wip.alternate = current
    current.alternate = wip

    wip.patchProps = {
        className: "patch-class",
        id: "patch-id",
        onClick: () => ref.current += 1,
        style: {
            color: "white"
        }
    }

    const dom = current.getDom()
    wip.container = current.container
    wip.patchDom()
    withDom(dom, () => dom.click())

    expect(dom.className).toBe("patch-class")
    expect(dom.id).toBe("patch-id")
    expect(dom.style.color).toBe("white")
    expect(ref.current).toBe(2) // test the old listener should be removed from the cotainer
})


test('patch normal tex', () => {
    const wip = new HostTextFiber()
    wip.elementType = HostComponentFiber
    wip.props = {value: "hello"}
    wip.patchProps = {value: "hello"}

    const current = new HostTextFiber()
    current.props = {value: "world"}

    wip.alternate = current
    current.alternate = wip

    const dom = current.getDom()
    wip.container = current.container
    wip.patchDom()

    expect(dom.data).toBe("hello")
})
