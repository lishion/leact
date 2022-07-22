/**
 * @jest-environment jsdom
 */
import Leact from '../src/leact'
import { testWithJSOMEnv } from './utils'

function EmptyElement(){
  return null
}


function DivWrapper({child, id}){
  return <div id={id}>{child}</div>
}


function Wrapper({child}){
  return child
}

testWithJSOMEnv('test-render', () => {

    function StateTestComponent(){
        return <>
                <DivWrapper id="id1">
                    test
                </DivWrapper>
                  <>
                    <EmptyElement/>
                    <DivWrapper id="id2">
                      hello 
                      <DivWrapper id="id3">
                          world
                      </DivWrapper>
                      <p id="1d4"></p>
                    </DivWrapper>
                    <p id="1d5"></p>
                    <EmptyElement/>
                  </>
                  <EmptyElement/>
            </>
    }

    Leact.render(document.getElementById("root"), <StateTestComponent/>)
    const div1 = document.getElementById("id1")
    const div2 = document.getElementById("id2")
    const div3 = document.getElementById("id3")

    expect(div1).not.toBeNull()
    expect(div2).not.toBeNull()
    expect(div3).not.toBeNull()
    expect(document.getElementById("1d4")).not.toBeNull()
    expect(document.getElementById("1d5")).not.toBeNull()
    expect(Array.from(div2.childNodes)[0].data).toBe("hello")
    expect(Array.from(div3.childNodes)[0].data).toBe("world")
})


testWithJSOMEnv('test-add-sub-tree', () => {
    function StateTestComponent(){
        const [state, setState] = Leact.useState(false)
        return <div>
             <div id="id1" onClick={() => setState(true)}></div>
             {
                state ? (
                    <div id="id2">
                        hello 
                        <div id="id3">
                            world
                        </div>
                    </div>
                 ): null
             }
        </div>
    }

    Leact.render(document.getElementById("root"), <StateTestComponent/>)
    const div1 = document.getElementById("id1")
    div1.click()

    const div2 = document.getElementById("id2")
    const div3 = document.getElementById("id3")

    expect(div1).not.toBeNull()
    expect(div2).not.toBeNull()
    expect(div3).not.toBeNull()

    expect(Array.from(div2.childNodes)[0].data).toBe("hello")
    expect(Array.from(div3.childNodes)[0].data).toBe("world")
})

testWithJSOMEnv('test-add', () => {
  function StateTestComponent() {
    const [state, setState] = Leact.useState(["d"])
    return <div id="wrapper">
      <div id="id1" onClick={() => setState(["d", "c", "b", "a"])}>hello</div>
      {
        state.map(key => <div id={key} key={key}>{key}</div>)
      }
      <Wrapper key="yyy">
        <EmptyElement></EmptyElement>
      </Wrapper>
      <DivWrapper key="xxx"/>
    </div>
  }

  Leact.render(document.getElementById("root"), <StateTestComponent/>)
  document.getElementById("id1").click()
  const keys = Array.from(document.getElementById("wrapper").childNodes)
              .filter(node => node.childNodes.length > 0)
              .map(node => node.childNodes[0].data)
  expect(keys).toStrictEqual(["hello", "d", "c", "b", "a"])
})


testWithJSOMEnv('test-switch', () => {
  function StateTestComponent() {
    const [state, setState] = Leact.useState(["a", "b", "c", "d"])
    return <div id="wrapper">
      <div id="id1" onClick={() => setState(["d", "c", "b", "a"])}>hello</div>
      {
        state.map(key => <div id={key} key={key}>{key}</div>)
      }
    </div>
  }

  Leact.render(document.getElementById("root"), <StateTestComponent />)
  const div1 = document.getElementById("id1")
  let keys = Array.from(document.getElementById("wrapper").childNodes).map(node => node.childNodes[0].data)
  expect(keys).toStrictEqual(["hello", "a", "b", "c", "d"])
  div1.click()
  keys = Array.from(document.getElementById("wrapper").childNodes).map(node => node.childNodes[0].data)
  expect(keys).toStrictEqual(["hello", "d", "c", "b", "a"])
})

testWithJSOMEnv('test-delete', () => {
  function StateTestComponent() {
    const [state, setState] = Leact.useState(["a", "b", "c", "d"])
    return <div id="wrapper">
      <div id="id1"
        onClick={() => {
          setState(["v", "a", "e", "d", "x"])
        }}
      >
          hello
      </div>
      {
        state.map(key => (<div id={key} key={key}>{key}</div>))
      }
    </div>
  }

  Leact.render(document.getElementById("root"), <StateTestComponent />)
  const div1 = document.getElementById("id1")
  let keys = Array.from(document.getElementById("wrapper").childNodes).map(node => node.childNodes[0].data)
  expect(keys).toStrictEqual(["hello", "a", "b", "c", "d"])
  div1.click()
  keys = Array.from(document.getElementById("wrapper").childNodes).map(node => node.childNodes[0].data)
  expect(keys).toStrictEqual(["hello", "v", "a", "e", "d", "x"])
  expect(document.getElementById("b")).toBeNull()
  expect(document.getElementById("c")).toBeNull()
})


testWithJSOMEnv('test-delete-multi-times', () => {
  const initState = ["a", "b", "c", "d"]
  function StateTestComponent() {
    const [state, setState] = Leact.useState(initState)
    return <div id="wrapper">
      <div id="id1"
        onClick={() => {
          state.pop()
          setState([...state])
        }}
      >
          hello
      </div>
      {
        state.map(key => (<div id={key} key={key}>{key}</div>))
      }
    </div>
  }

  Leact.render(document.getElementById("root"), <StateTestComponent />)
  const div1 = document.getElementById("id1")
  for(let i = 0; i < initState.length; i++){
    const keys = Array.from(document.getElementById("wrapper").childNodes).map(node => node.childNodes[0].data)
    expect(keys).toStrictEqual(["hello", ...initState])
    initState.pop()
    div1.click()
  }
})



testWithJSOMEnv('test-destory', () => {
  const initState = ["a", "b", "c", "d"]
  let ref = {count: 1};
  function EffectTestComponent(){
    Leact.useEffect(() => {
      ref.count += 2
      return () => (ref.count -= 1)
    })
    return <p id="id2"></p>
  }

  function StateTestComponent() {
    const [state, setState] = Leact.useState(true)
    return <>
      <div id="id1"
        onClick={() => setState(false)}
      >
        hello
      </div>
      {
        state ? <EffectTestComponent/> : null
      }
    </>
  }

  Leact.render(document.getElementById("root"), <StateTestComponent />)
  expect(ref.count).toBe(1)
  document.getElementById("id1").click()
  expect(document.getElementById("id2")).toBeNull()
})

testWithJSOMEnv('test-layout-effect-and-ref', () => {
  let count = 0
  function EffectTestComponent(){
    const ref = Leact.useRef(null)
    Leact.useLayoutEffect(() => {
      count += 1
      expect(ref.current).not.toBeNull()
    })
    return <p ref={ref} id="id2"></p>
  }
  Leact.render(document.getElementById("root"), <EffectTestComponent />)
  expect(count).toBe(1)
})


testWithJSOMEnv('test-layout-effect-and-ref', () => {
  let count = 0
  function EffectTestComponent(){
    const ref = Leact.useRef(null)
    Leact.useLayoutEffect(() => {
      count += 1
      expect(ref.current).not.toBeNull()
    })
    return <p ref={ref} id="id2"></p>
  }
  Leact.render(document.getElementById("root"), <EffectTestComponent />)
  expect(count).toBe(1)
})


testWithJSOMEnv('test-layout-effect-and-ref', () => {
  let count = 0
  function EffectTestComponent(){
    const ref = Leact.useRef(null)
    Leact.useLayoutEffect(() => {
      count += 1
      expect(ref.current).not.toBeNull()
    })
    return <p ref={ref} id="id2"></p>
  }
  Leact.render(document.getElementById("root"), <EffectTestComponent />)
  expect(count).toBe(1)
})



testWithJSOMEnv('test-bailout', () => {
  let ref = {count: 0}
  
  function ShouldOnlyRenderOnce(){
    ref.count += 1
    Leact.useLayoutEffect(() => {
      ref.count += 2
    }, [])
    return <div>ssss</div>
  }

  function UpdateComponent(){
    const [count, setCount] = Leact.useState(0)
    return (
      <>
        <button id="btn" onClick={() => setCount(count + 1)}></button>
        <p>{count}</p>
      </>
    )
  }

  function EffectTestComponent(){
    return (
      <>
        <ShouldOnlyRenderOnce/>
        <UpdateComponent/>
      </>
    )
  }
  Leact.render(document.getElementById("root"), <EffectTestComponent />)
  const btn = document.getElementById("btn")
  btn.click()
  btn.click()
  btn.click()
  // useEffect and render for ShouldOnlyRenderOnce should only execute once
  expect(ref.count).toBe(3)
})