function flatten<T>(array: (T[]|T)[]): T[]{
    let res: T[] = []
    for(const element of array){
        if(Array.isArray(element)){
            res = res.concat(flatten(element))
        }else{
            res.push(element)
        }
    }
    return res
}

function shallowArrayEqual(array1: any[], array2: any[]) {
    if (array1.length !== array2.length) {
        return false
    }
    for (let i = 0; i < array1.length; i++) {
        if (array1[i] !== array2[i]) {
            return false
        }
    }
    return true
}

export {
    flatten,
    shallowArrayEqual,
}