
function initJSDOMEnv(){
    const root = document.createElement("div")
    root.id = "root"
    document.body = document.createElement("body");
    document.body.appendChild(root)
}

function destoryJSDOMEnv(){
    const root = document.getElementById("root")
    document.body.removeChild(root)
}

function withJSDOMEnv(func){
    initJSDOMEnv()
    func()
    destoryJSDOMEnv()
}

function testWithJSOMEnv(msg, func){
    test(msg, () => withJSDOMEnv(func))
}

export {
    initJSDOMEnv,
    withJSDOMEnv,
    testWithJSOMEnv
}