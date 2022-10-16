export interface HasID {
    id: string;
}

export class Collection<T extends HasID> extends Map<string, T> {
    constructor() {
        super();
    }

    public add(target: T): this {
        return this.set(target.id, target);
    }

    public remove(target: T): boolean {
        return this.delete(target.id);
    }

    public members() {
       return Array.from(this.values());
    }
}