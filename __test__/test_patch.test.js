/**
 * @jest-environment jsdom
 */
import Leact from '../src/leact'
import { testWithJSOMEnv } from './utils'


function DomPatchComponent(){
    const [show, setShow] = Leact.useState(true)
    return (
        <>
            <button id="btn" onClick={() => setShow(false)}></button>
            {
                show ? <div id="id1" className="class1" style={{height: "15px"}}></div>:
                <div id="id2" style={{width: "15px"}}></div>
            }
        </>
    )
}

testWithJSOMEnv('test-path-dom', () => {
    Leact.render(document.getElementById("root"), <DomPatchComponent/>)
    document.getElementById("btn").click()
    expect(document.getElementById("id1")).toBeNull()
    const div = document.getElementById("id2")
    expect(div.className).toBe('')
    expect(div.style.width).toBe("15px")
    expect(div.style.height).toBe('')
})