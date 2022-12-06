import {
  Component,
  SerializableComponentClass,
} from './components/base/component';
import { Entity, EntityID } from './entity';
import { Collection } from '../../common/collection';
import { HierarchyChild, HierarchyContainer } from './components';

export class ErrorDoesNotExist extends Error {}

export class ErrorEntityDNE extends ErrorDoesNotExist {}

export class ErrorComponentDNE extends ErrorDoesNotExist {}

export class Manager {
  private entities = new Collection<Entity>();
  private componentDefinitions = new Set<SerializableComponentClass>();

  public createEntity(): EntityID {
    const entity = new Entity();
    this.entities.add(entity);
    return entity.id;
  }

  public entity(entity: EntityID) {
    const result = this.entities.get(entity);
    if (!result) throw new ErrorEntityDNE(`Entity ${entity} does not exist`);
    return result;
  }

  public entityExists(entity: EntityID) {
    return this.entities.has(entity);
  }

  public destroyEntity(entity: EntityID) {
    for (const component of this.entity(entity)) {
      component.free(entity, this);
    }
    this.entities.remove(this.entity(entity));
  }

  public *filter(...components: Function[]): Iterable<EntityID> {
    for (const entity of this.entities.members()) {
      if (entity.has(...components)) yield entity.id;
    }
  }

  public *all(): Iterable<EntityID> {
    for (const entity of this.entities.members()) {
      yield entity.id;
    }
  }

  public defineComponent(...components: SerializableComponentClass[]) {
    for (const componentClass of components) {
      this.componentDefinitions.add(componentClass);
    }
  }

  public reset() {
    this.entities.clear();
  }

  public seralize() {
    const result: any = {};

    // seralize entites
    for (const entity of this.all()) {
      const serialized = [];
      for (const component of this.entity(entity)) {
        serialized.push(component.serialize());
      }
      result[entity] = serialized;
    }

    return result;
  }

  public deseralize(data: unknown) {
    this.entities.clear();

    if (typeof data === 'string') data = JSON.parse(data);
    if (typeof data !== 'object' || data === null)
      throw new Error('invalid data');
    const entities = Object.entries(data);

    for (const [entity, components] of entities) {
      const e = new Entity(entity);

      if (!Array.isArray(components))
        throw new Error(`Invalid data at ${entity} "${components}"`);

      for (const componentData of components) {
        const c = this.deseralizeComponent(componentData);
        if (!c)
          throw new Error(
            `Invalid data at ${entity}: "${JSON.stringify(componentData)}"`
          );
        e.add(c);
      }

      this.entities.add(e);
    }
  }

  private deseralizeComponent(data: unknown): Component | false {
    for (const componentClass of this.componentDefinitions) {
      const result = componentClass.deserialize(data);
      if (result) return result;
    }
    return false;
  }
}
