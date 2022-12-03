import { SerializedComponent } from './base/component';
import { DataAttribute } from './base/data-attribute';
export type SerializedName = SerializedComponent & {
    type: "component-name";
    data:string;
}
export class Name extends DataAttribute<string> {
    static deserialize(data: unknown):Name | false {
        if (Name.validate(data))return new Name(data.data);
        return false;
    }

    static validate(data:any):data is SerializedName {
        return false;//where AJV will come into play
       
      }
    static type = "component-name";

}
