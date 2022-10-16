import { Name } from './components/name';
import { Entity, EntityID } from './entity';

export class EntityError extends Error {
  public entity?: Entity;
  public entityId?: EntityID;
  public entityName?: string;

  constructor(e: Entity, msg: string) {
    let id = e.id,
      name,
      header = 'Unkown Entity:';

    if (e.has(Name)) {
      name = e.get(Name).data;
      header = `${name}#${id}`;
    }

    super(`${header}: ${msg}`);

    this.entity = e;
    this.entityId = id;
    this.entityName = name;
  }
}
