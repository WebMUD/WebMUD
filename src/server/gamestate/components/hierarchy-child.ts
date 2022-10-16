import { EntityID } from "../entity";
import { Component } from "./base/component";

export class HierarchyChild extends Component {
    public parent?: EntityID;

    constructor(parent?: EntityID) {
        super();
        if (parent) this.parent = parent;
    }
}