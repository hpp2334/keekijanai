type ConstructorTypeWithReturn<P extends any[] = any[], R = any> = new (...args: P) => R;
type ConstructorType<P extends any[] = any[]> = ConstructorTypeWithReturn<P, any>;

interface RegisterEntry<C extends ConstructorType, ARG_CLASSES extends ConstructorType[]> {
  class: C;
  constructorArgClasses: ARG_CLASSES;
  postConstruct?: keyof InstanceType<C>;
  mode?: "singleton";
}

export class DIContainer {
  private classMapEntry: Map<any, RegisterEntry<any, any[]>> = new Map();
  private singletonClassMapInstance: Map<ConstructorType, any> = new Map();

  public constructor() {
    this.register = this.register.bind(this);
    this.resolve = this.resolve.bind(this);
  }

  public register<C extends ConstructorType<[]>>(entry: RegisterEntry<C, []>): void;
  public register<A1 extends ConstructorType, C extends ConstructorType<[InstanceType<A1>]>>(
    entry: RegisterEntry<C, [A1]>
  ): void;
  public register<
    A1 extends ConstructorType,
    A2 extends ConstructorType,
    C extends ConstructorType<[InstanceType<A1>, InstanceType<A2>]>
  >(entry: RegisterEntry<C, [A1, A2]>): void;
  public register<
    A1 extends ConstructorType,
    A2 extends ConstructorType,
    A3 extends ConstructorType,
    C extends ConstructorType<[InstanceType<A1>, InstanceType<A2>, InstanceType<A3>]>
  >(entry: RegisterEntry<C, [A1, A2, A3]>): void;
  public register<
    A1 extends ConstructorType,
    A2 extends ConstructorType,
    A3 extends ConstructorType,
    A4 extends ConstructorType,
    C extends ConstructorType<[InstanceType<A1>, InstanceType<A2>, InstanceType<A3>, InstanceType<A4>]>
  >(entry: RegisterEntry<C, [A1, A2, A3]>): void;
  public register<C extends ConstructorType>(entry: RegisterEntry<C, any[]>) {
    this.classMapEntry.set(entry.class, entry);
  }

  public resolve<A>(Cls: ConstructorTypeWithReturn<any[], A>): A {
    const currentResolved = new Map<ConstructorType, any>();
    const resolvingStack: Array<ConstructorType> = [];
    const resolvingStackSet: Set<ConstructorType> = new Set();

    resolvingStack.push(Cls);
    resolvingStackSet.add(Cls);

    while (resolvingStack.length > 0) {
      const Cls = resolvingStack[resolvingStack.length - 1];
      const entry = this.getRegisteredEntry(Cls);
      let allDependencyResolved = true;
      let hasChangeResolvingStack = false;

      // resolve classes in writing order
      for (let index = entry.constructorArgClasses.length - 1; index >= 0; index--) {
        const depCls = entry.constructorArgClasses[index];
        if (currentResolved.has(depCls) || this.singletonClassMapInstance.has(depCls)) {
          continue;
        }
        allDependencyResolved = false;
        if (!resolvingStackSet.has(depCls)) {
          resolvingStack.push(depCls);
          resolvingStackSet.add(depCls);
          hasChangeResolvingStack = true;
        }
      }
      if (!allDependencyResolved && !hasChangeResolvingStack) {
        throw new Error("cyclic dependency detect.");
      }
      if (!allDependencyResolved) {
        continue;
      }

      // now all dependency classes are resolved
      const args: any[] = [];
      for (const depCls of entry.constructorArgClasses) {
        const depInstance = currentResolved.get(depCls) ?? this.singletonClassMapInstance.get(depCls);
        if (!depInstance) {
          throw new Error(`get resolved "${depCls.name}" fail. It's an internal bug.`);
        }
        args.push(depInstance);
      }
      const currentInstance = new Cls(...args);
      currentResolved.set(Cls, currentInstance);
      if (entry.mode === "singleton") {
        this.singletonClassMapInstance.set(Cls, currentInstance);
      }
      if (entry.postConstruct) {
        currentInstance[entry.postConstruct]();
      }

      resolvingStack.pop();
    }

    return currentResolved.get(Cls)!;
  }

  private getRegisteredEntry(Cls: ConstructorType) {
    const entry = this.classMapEntry.get(Cls);
    if (!entry) {
      throw new Error(`Cannot find registered class "${Cls.name}". Did you forget to register it?`);
    }
    return entry;
  }
}
