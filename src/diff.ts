import { Tree } from "./tree";

export class TreeWithHole<V> {
    constructor(public tree?: Tree<V>, public path?: ReadonlyArray<number>) { }
    public fill(tree: Tree<V>): Tree<V> {
        function findAndReplace<V>(t: Tree<V>, tree: Tree<V>,
                                   path: ReadonlyArray<number>, n: number): Tree<V> {
            if (n == path.length) {
                // Replace
                return tree
            } else {
                const retval = findAndReplace(t.children[path[n]], tree, path, n + 1)
                const children = Array.from(t.children)
                children[path[n]] = retval
                return { value: t.value, children }
            }
        }
        if (this.path == null) {
            return this.tree
        } else {
            return findAndReplace(this.tree, tree, this.path, 0)
        }
    }
}

export class Delta<V> {
    constructor(public path: ReadonlyArray<number>, public replace: TreeWithHole<V>) { }
}

export type Diff<V> = ReadonlyArray<Delta<V>>


function comparePath(a: ReadonlyArray<number>, b: ReadonlyArray<number>, n: number): number {
    if (a.length < b.length) {
        return 1
    } else if (a.length > b.length) {
        return -1;
    }

    if (a[n] < b[n]) {
        return 1
    } else if (a[n] > b[n]) {
        return -1;
    } else {
        if (n + 1 == a.length) {
            return 0;
        } else {
            return comparePath(a, b, n + 1)
        }
    }
}

export function applyDelta<V>(tree: Tree<V>, delta: Delta<V>): Tree<V> {
    function findAndReplace<V>(t: Tree<V>, delta: Delta<V>, n: number): Tree<V> {
        if (n == delta.path.length) {
            // Replace
            return delta.replace.fill(t)
        } else {
            const retval = findAndReplace(t.children[delta.path[n]], delta, n + 1)
            const children = Array.from(t.children)
            if (retval == null) {
                children.splice(delta.path[n], 1)
            } else {
                children[delta.path[n]] = retval
            }
            return { value: t.value, children }
        }
    }
    return findAndReplace(tree, delta, 0)
}

export function applyDiff<V>(tree: Tree<V>, diff: Diff<V>): Tree<V> {
    const deltas = Array.from(diff)
    deltas.sort((a, b) => {
        return comparePath(a.path, b.path, 0)
    })
    let retval = tree
    for (const delta of deltas) {
        retval = applyDelta(retval, delta)
    }

    return retval
}
