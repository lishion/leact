function flattern<T>(array: (T[]|T)[]): T[]{
    let res: T[] = []
    for(let element of array){
        if(Array.isArray(element)){
            res = res.concat(flattern(element))
        }else{
            res.push(element)
        }
    }
    return res
}

export {
    flattern
}