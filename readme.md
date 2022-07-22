![](https://img.shields.io/badge/coverage-90.58%25-green)
![](https://img.shields.io/badge/licence-MIT-green)

**a tiny react-like js framework build by typescript**

implemented features:    
* only support function component
* support hooks:    
    * useState
    * useEffect
    * useLayoutEffect
    * useRef
* no time slice support

## useage

```jsx

import Leact from 'leact'

function Counter(){
    const [count, setCount] = Leact.useState(0)
    return <div>{count}</div>
}

Leact.render(document.getElementById("root"), <Counter/>)

```


## jsx support
```json
"presets": [
    [
      "@babel/preset-react",
      {
        "pragma": "Leact.createElement", 
        "pragmaFrag": "Leact.Fragment", 
        "throwIfNamespace": false, 
        "runtime": "classic" 
      }
    ],
  ]
```