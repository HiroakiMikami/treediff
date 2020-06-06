export interface Tree<V> {
    value: V
    children: ReadonlyArray<Tree<V>>
}
