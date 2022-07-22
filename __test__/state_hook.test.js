/**
 * @jest-environment jsdom
 */

import Leact from '../src/leact'

test('test use state', () => {

    function StateTestComponent(){
        const [state1, setState1] = Leact.useState(1)
        const [state2, setState2] = Leact.useState(3)
        return <>
            <button id="btn1" onClick={() => setState1(state1 + 1)}></button>
            <button id="btn2" onClick={() => setState2(state2 + 1)}></button>
            <button id="btn3" onClick={() => {
                expect(state1).toBe(4)
                expect(state2).toBe(5)
            }}></button>
        </>
    }

    const root = document.createElement("div")
    root.id = "root"
    document.body = document.createElement("body");
    document.body.appendChild(root)
    Leact.render(document.getElementById("root"), <StateTestComponent/>)

    const btn1 = document.getElementById("btn1")
    const btn2 = document.getElementById("btn2")
    btn1.click()
    btn1.click()
    btn1.click()

    btn2.click()
    btn2.click()

    document.getElementById("btn3").click()
})