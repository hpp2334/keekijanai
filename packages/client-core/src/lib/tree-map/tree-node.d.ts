export declare class TreeNode<V> {
    _value: V;
    _parent: null | TreeNode<V>;
    _selfKeyInParent: string | null;
    _child: null | Map<string, TreeNode<V>>;
    constructor(value: V);
    get parent(): TreeNode<V> | null;
    get children(): Map<string, TreeNode<V>> | null;
    hasValue(): boolean;
    getValue(): V | undefined;
    setValue(nextValue: V): void;
    /** Remove value in this tree node */
    deleteValue(): void;
    /**
     * Remove node in sub tree. NOTICE: this method only delete value for this node, and unlink between this node and its parent and children.
     * @param inclusive include itself or not
     */
    removeAll(inclusive?: boolean): void;
    getChild<AC extends boolean>(key: string, autoCreate: AC): AC extends true ? TreeNode<V> : TreeNode<V> | undefined;
    access<AC extends boolean>(treepath: string | string[], autoCreate?: AC): AC extends true ? TreeNode<V> : TreeNode<V> | undefined;
    visit<AC extends boolean>(treepath: string | string[], onVisit?: (node: TreeNode<V>) => void, inclusive?: boolean, autoCreate?: AC): AC extends true ? TreeNode<V> : TreeNode<V> | undefined;
}
export declare function createTreeNode<V>(value?: V): TreeNode<V>;
