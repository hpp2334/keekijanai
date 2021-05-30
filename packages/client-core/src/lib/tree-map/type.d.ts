export declare namespace TreePathNS {
    type SchemaObject<V = any> = {
        [K in string]: V | SchemaObject<V>;
    };
}
export declare namespace TreeMapNS {
    type GetOptions<V> = {
        /** when value not exists, create it. Default is false. */
        autoCreate?: false | (() => V);
    };
    type ConstructOptions<V> = {
        autoCreateWhenGet?: GetOptions<V>['autoCreate'];
    };
}
