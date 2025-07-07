export function trimMap<T = string>(strArr: string[], cb?: (str: string, i:number, arr:string[]) => T) {
    return strArr.map<T>((str, i) => {
        str = str?.trim();
        return (cb ? cb(str, i, strArr) : str) as T;
    });
}