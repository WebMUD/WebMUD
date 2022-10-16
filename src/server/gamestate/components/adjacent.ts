import { EntityID } from "../entity";
import { Component } from "./base/component";

export class Adjacent extends Component {
    public north?: EntityID;
    public south?: EntityID;
    public east?: EntityID;
    public west?: EntityID;
    public up?: EntityID;
    public down?: EntityID;

    constructor() {
        super();
    }
}