import Leact from './leact'


// function Wrapper(){
//     Leact.useEffect(() => {
//         console.info("ref mount")
//         return () => {console.info("ref unmount")}
//     }, [])
//     return <p>show</p>
// }

// function HelloWorld({text}) {
//     const [state, setState] = Leact.useState(0)
//     const [show, setShow] = Leact.useState(true)
//     const ref = Leact.useRef()
//     console.info("show", show, ref)
//     function incr(){
//         setState(state + 1)
//     }
//     Leact.useEffect(() => {
//         console.info("ref1")
//         return () => {console.info("ref clear")}
//     }, [state])
//     Leact.useEffect(() => {
//         console.info("ref2")
//         return () => {console.info("ref clear")}
//     }, [state])
//     return (
//         <div style={{ color: 'red', border: '1px solid' }}>
//             <button onClick={incr}>+1</button>
//             <button onClick={() => setShow(!show)}>switch</button>
//             <p>{state}</p>
//             {text}
//             <div>{show ? <Wrapper/> : null}</div>
//         </div>
//     )
// }

// function randomInt(start, max) {
//     return start + Math.floor(Math.random() * (max - start));
// }
  

// class Snake{
//     static DIRECTION_MAP = {
//         left: 1,
//         right: -1,
//         up: 2,
//         down: -2
//     }
//     constructor(firstX, firstY, maxWidht, maxHeight){
//         this.body = [[firstX, firstY]]
//         this.maxWidht = maxWidht
//         this.maxHeight = maxHeight
//         this.food = []
//         this.direction = "left"
//     }

//     setDirection(direction){
//         this.direction = direction
//     }

//     randomFood(){
//         console.info(this.maxWidht, this.maxHeight)
//         const foodX = randomInt(1, this.maxWidht - 1)
//         const foodY = randomInt(1, this.maxHeight - 1)
//         console.info(foodX, foodY)
//         this.food = [foodX, foodY]
//     }

//     initSnake(){
//         let [nextX, nextY] = this.body[0]
//         for(let i = 0; i < 3; i++){
//             [nextX, nextY] = this.getNextNodePosition(nextX, nextY, "right")
//             this.body.push([nextX, nextY])
//         }
//         this.randomFood()
//     }

//     getNextNodePosition(x, y, position){
//         let nextX = x
//         let nextY = y
//         switch(position){
//             case "left": nextX = nextX - 1 ; break
//             case "right": nextX = nextX + 1; break
//             case "up": nextY = nextY - 1; break
//             case "down": nextY = nextY + 1; break
//             default: console.info("error position")
//         }
//         return [nextX, nextY]
//     }

//     moveForwad(direction){
//         let [headX, headY] = this.body[0]
//         const [nextX, nextY] = this.getNextNodePosition(headX, headY, direction)
//         if(nextX < 0 || nextY < 0){
//             return false
//         }
//         if(nextX === this.food[0] && nextY === this.food[1]){
//             this.body.unshift([...this.food])
//             this.randomFood()
//             return true
//         }
//         for(let i = this.body.length - 1; i >= 1; i--){
//             this.body[i] = this.body[i - 1]
//         }
//         this.body[0] = [nextX, nextY]
        
//         return true
//     }

//     moveBack(direction){
//         let [headX, headY] = this.body[this.body.length - 1]
//         const [nextX, nextY] = this.getNextNodePosition(headX, headY, direction)
        
//         if(nextX >= this.maxWidht || nextY >= this.maxHeight){
//             return false
//         }
//         if(nextX === this.food[0] && nextY === this.food[1]){
//             this.body.append([...this.food])
//             this.randomFood()
//             return true
//         }
//         for(let i = 0; i < this.body.length - 1; i++){
//             this.body[i] = this.body[i + 1]
//         }
//         this.body[this.body.length - 1] = [nextX, nextY]
        
//         return true
//     }

//     move(direction){
//         if(Snake.DIRECTION_MAP[direction] + Snake.DIRECTION_MAP[this.direction] === 0){
//             this.setDirection(direction)
//             return this.moveBack(direction)
//         }
//         this.setDirection(direction)
//         return this.moveForwad(direction)
//     }

//     allNodes(){
//         return [...this.body, this.food]
//     }
// }

// const snake = new Snake(10, 10, 20, 20)
// snake.initSnake()
// snake.food = [5, 10]
// function SnakeComponent(){
//     const directionRef = Leact.useRef("left")
//     const nodesRef = Leact.useRef(snake.allNodes())
//     const [noUse, setNoUse] = Leact.useState({})
//     const [status, setStatus] = Leact.useState("live")
//     Leact.useEffect(() => {
//         document.addEventListener('keydown', (e) => {
//             let direction = null
//             switch(e.key){
//                 case "ArrowUp": direction = "up"; break
//                 case "ArrowDown": direction = "down"; break
//                 case "ArrowLeft": direction = "left"; break
//                 case "ArrowRight": direction = "right"; break
//                 default: break
//             }
//             if(direction !== null){
//                 directionRef.current = direction
//             }
//         })  
//         if(status === "dead"){
//             return
//         }
//         const timer = setInterval(() => {
//             const live = snake.move(directionRef.current)
//             if(!live){
//                 setStatus("dead")
//                 clearInterval(timer)
//             }
//             nodesRef.current = snake.allNodes()
//             setNoUse({})
//         }, 300)
//     }, [])

//     return (
//        <div style={{
//             display: 'flex',
//             justifyContent: 'center',
//             onKeyDown: (e) => {
//                 console.info(e)
//             }
//        }}>
//             <div>
//                 <button onClick={() => {
//                     directionRef.current = "up"
//                     console.info("go to left")
//                 }}> up </button>
//                 <button onClick={() => {
//                     directionRef.current = "down"
//                     console.info("go to down")
//                 }}> down </button>
//                 <button onClick={() => {
//                     directionRef.current = "left"
//                     console.info("go to left")
//                 }}> left </button>
//                 <button onClick={() => {
//                     directionRef.current = "right"
//                     console.info("go to right")
//                 }}> right </button>
//             </div>
//             <div style={{
//                 width: '600px',
//                 height: '600px',
//                 border: '1px solid',
//                 position: 'relative',
//             }}>
//                 {
//                     nodesRef.current.map(([x, y]) => {
//                         return <div 
//                             style={{
//                                 position: 'absolute',
//                                 left: `${x * 30}px`,
//                                 top: `${y * 30}px`,
//                                 width: `30px`,
//                                 height: `30px`,
//                                 background: 'black'
//                             }}
//                         />
//                     })
//                 }
//             </div>
//        </div>
//     )
// }

// function DivWrapper(){
//   console.info("should not see this")
//   return <div id="aaaaa">ddddd</div>
// }

// function StateTestComponent(){
//   const [state, setState] = Leact.useState(false)
//   return <div>
//        <button id="id1" onClick={() => setState(true)}>show</button>
//        {
//           state ? (
//               <div id="id2">
//                   hello 
//                   <div id="id3">
//                       world
//                   </div>
//               </div>
//            ): null
//        }
       
//   </div>
// }

// function Outter(){
//   return <div>
//     <StateTestComponent/>
//     <DivWrapper key="ttt"/>
//   </div>
// }

function StateTestComponent(){
  const [state1, setState1] = Leact.useState(1)
  const [state2, setState2] = Leact.useState(3)
  console.info("state", state1, state2)
  return <>
      <button id="btn1" onClick={() => setState1(state1 + 1)}>s1+1</button>
      <button id="btn2" onClick={() => setState2(state2 + 1)}>s2+1</button>
      <button id="btn3" onClick={() => {
          console.info("final state", state1, state2)
      }}>result</button>
  </>
}

Leact.render(document.getElementById("root"), <StateTestComponent/>)