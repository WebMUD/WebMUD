import { Component } from './component';

export class DataAttribute<T> extends Component {
  public data: T;

  constructor(data: T) {
    super();
    this.data = data;
  }

  serialize(type: string) {
    if (!type) throw new Error('missing type');
    return {
      type,
      data: this.data,
    }
  }
}
