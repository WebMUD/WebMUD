import { Component } from './component';
import { DataAttribute } from './data-attribute';

export class DataAttributeString extends DataAttribute<string> {
  static validateDataAttributeType(type: string, data: any): boolean {
    if (!Component.validateType(type, data)) return false;
    if (typeof data.data !== 'string') return false;
    return true;
  }
}
