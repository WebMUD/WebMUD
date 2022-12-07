import { Component } from './component';
import { DataAttribute } from './data-attribute';

export class DataAttributeNumber extends DataAttribute<number> {
  static validateDataAttributeType(type: string, data: any): boolean {
    if (!Component.validateType(type, data)) return false;
    if (typeof data.data !== 'number') return false;
    return true;
  }
}
