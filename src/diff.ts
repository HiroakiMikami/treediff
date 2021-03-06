import { Tree } from "./tree";

export class ReplaceValue<V> {
    public readonly type = "replace"
    constructor(public readonly value: V) {}
    public fill(tree: Tree<V>): Tree<V> {
        return {
            value: this.value,
            children: tree.children
        }
    }
}

export class DeleteTree<V> {
    public readonly type = "delete"
    public fill(): Tree<V> {
        return null
    }
}

export class InsertTree<V> {
    public readonly type = "insert"
    constructor(public readonly path: ReadonlyArray<number>, public readonly tree: Tree<V>) { }
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
        if (tree == null && this.path.length === 0) {
            return this.tree
        }
        return findAndReplace(this.tree, tree, this.path, 0)
    }
}

export type Patch<V> = ReplaceValue<V> | DeleteTree<V> | InsertTree<V>

export class Delta<V> {
    constructor(public readonly path: ReadonlyArray<number>, public readonly patch: Patch<V>) { }
}

export type Diff<V> = ReadonlyArray<Delta<V>>


function compareDelta<V>(a: Delta<V>, b: Delta<V>, n: number): number {
    if (a.path.length < b.path.length) {
        return 1
    } else if (a.path.length > b.path.length) {
        return -1;
    }

    if (a.path[n] < b.path[n]) {
        return 1
    } else if (a.path[n] > b.path[n]) {
        return -1;
    } else {
        if (n + 1 == a.path.length) {
            if (a.patch.type == "delete") {
                return -1
            }
            if (b.patch.type == "delete") {
                return 1
            }
            return 0;
        } else {
            return compareDelta(a, b, n + 1)
        }
    }
}

export function applyDelta<V>(tree: Tree<V>, delta: Delta<V>): Tree<V> {
    function findAndReplace<V>(t: Tree<V>, delta: Delta<V>, n: number): Tree<V> {
        if (n == delta.path.length) {
            // Replace
            return delta.patch.fill(t)
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
        return compareDelta(a, b, 0)
    })
    let retval = tree
    for (const delta of deltas) {
        retval = applyDelta(retval, delta)
    }

    return retval
}
