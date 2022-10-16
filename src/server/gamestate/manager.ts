import { Component } from './components/base/component';
import { Entity, EntityID } from './entity';
import { Collection } from '../../common/collection';

export class ErrorDoesNotExist extends Error {}

export class ErrorEntityDNE extends ErrorDoesNotExist {}

export class ErrorComponentDNE extends ErrorDoesNotExist {}

export class Manager {
  private entities = new Collection<Entity>();

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
      component.free();
    }
    this.entities.delete(entity);
  }

  public *filter(...components: Function[]): Iterable<EntityID> {
    for (const entity of this.entities.members()) {
      if (entity.has(...components)) yield entity.id;
    }
  }
}
