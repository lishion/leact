import Leact from './leact'

function HelloWorld({text}) {
    const [state, setState] = Leact.useState(0)
    function incr(){
        setState(state + 1)
    }
    return (
        <div style={{ color: 'red', border: '1px solid' }}>
            <button onClick={incr}>+1</button>
            <p>{state}</p>
            {text}
        </div>
    )
}

Leact.render(document.getElementById("root"), <HelloWorld text="hello world"/>)