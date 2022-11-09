import { Component } from './component';

export class DataAttribute<T> extends Component {
  public data: T;

  constructor(data: T) {
    super();
    this.data = data;
  }
}
