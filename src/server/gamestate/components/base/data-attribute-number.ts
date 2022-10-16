import { Component } from "./component";

export class DataAttributeNumber extends Component {
    public data: number;

    constructor(data: number) {
        super();
        this.data = data;
    }
}