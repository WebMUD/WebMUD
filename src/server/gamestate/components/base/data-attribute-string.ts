import { Component } from "./component";

export class DataAttributeString extends Component {
    public data: string;

    constructor(data: string) {
        super();
        this.data = data;
    }
}