import { Fiber, HostComponentFiber, HostTextFiber, createElement } from '../src/fiber'
import { HostText, HostComponent, FunctionComponent } from '../src/types'
import Leact from '../src/leact'

test('test create host component', ()=>{
    let element = <p>text</p>
    expect(element.elementType).toBe(HostComponent)
    expect(element.type).toBe('p')
    expect(element.props.child).toBe(element.child)
    expect(element.props.child[0].elementType).toBe(HostText)
    expect(element.props.child[0].props.value).toBe('text')

    element = <p key="1" id="test-id" className="test-class">text</p>
    expect(element.props.id).toBe('test-id')
    expect(element.props.className).toBe('test-class')
    expect(element.props.key).toBe(element.key)
    expect(element.props.key).toBe('1')
    expect(element.type).toBe('p')
    expect(element.props.child).toBe(element.child)
})

function TestComponemt({text}){
    return <p key="1" id="test-id">{text}</p>
}

test('test create function component', ()=>{
    const element = <TestComponemt ref="test-ref" key="test-key" text="hello">
                        <p>test</p>
                    </TestComponemt>
     expect(element.elementType).toBe(FunctionComponent)
     expect(element.type).toBe(TestComponemt)
     expect(element.key).toBe('test-key')
     expect(element.ref).toBe('test-ref')
     expect(element.props.ref).toBe(undefined)
     expect(element.props.text).toBe('hello')
     expect(element.props.child).toBe(element.child)
     expect(element.props.child[0].elementType).toBe(HostComponent)
})

test('test create fiber', () => {
    const element = <p key="1" ref="1" id="test-id" className="test-class">text</p>
    const fiber = Fiber.fromElement(element)
    expect(fiber.key).toBe('1')
    expect(fiber.elementType).toBe(HostComponent)
    expect(fiber.type).toBe('p')
})

test('test create resuse workinprogress', () => {
    const parent = new Fiber()
    const current = new Fiber()
    const wip = new Fiber()

    current.parent = parent
    current.key = '1'
    current.props = '2'
    current.alternate = wip
    
    const createdWip = current.createWorkInProgress('3')
    expect(createdWip.props).toBe('3')
    expect(createdWip).toBe(wip)
    expect(createdWip.alternate).toBe(current)
    expect(createdWip.key).toBe('1')

    const otherWip = createdWip.createWorkInProgress('1')
    expect(otherWip.props).toBe('1')
    expect(otherWip).toBe(current)
    expect(otherWip.alternate).toBe(createdWip)
    expect(otherWip.key).toBe('1')
})

test('test create workinprogress', () => {
    const parent = new Fiber()
    const current = new Fiber()
    current.parent = parent
    
    current.parent = parent
    current.key = '1'
    current.props = '2'

    const createdWip = current.createWorkInProgress('3')
    expect(createdWip.props).toBe('3')
    expect(createdWip).toBe(current.alternate)
    expect(createdWip.alternate).toBe(current)
    expect(createdWip.key).toBe('1')
})


test('test create fragment', () => {
    const frag = (
        <>
            <div></div>
            <p></p>
        </>
    )
    expect(frag.props.child.length).toBe(2)
})