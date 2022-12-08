import { v4 as uuidv4 } from 'uuid';
import { Component } from './components/base/component';
import { EntityError } from './entity-error';

export type EntityID = string;

/**
 * Allows typesctipt to automatically infer the type of the component returned
 */
export type ComponentClass<T extends Component> = new (...args: any[]) => T;

/**
 * Contains the components for an entity
 */
export class Entity {
  public readonly id: string;
  private map = new Map<Function, Component>();

  public constructor(id?: string) {
    this.id = id ?? 'e-' + uuidv4();
  }

  public add(component: Component): this {
    this.map.set(component.constructor, component);
    return this;
  }

  public get<T extends Component>(componentClass: ComponentClass<T>): T {
    this.require(componentClass);
    return this.map.get(componentClass) as T;
  }

  public delete(componentClass: Function): boolean {
    return this.map.delete(componentClass);
  }

  public has(...components: Function[]): boolean {
    for (let cls of components) if (!this.map.has(cls)) return false;
    return true;
  }

  public require(...components: Function[]): this {
    for (let cls of components)
      if (!this.map.has(cls))
        throw new EntityError(this, `missing component ${cls.name}`);
    return this;
  }

  *[Symbol.iterator]() {
    for (const component of this.map.values()) {
      yield component;
    }
  }
}
