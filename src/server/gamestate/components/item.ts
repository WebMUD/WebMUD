import { AttributeTag, SerializedAttributeTag } from './base/attribute-tag';

export type SerializedItem =  SerializedAttributeTag & {
    type: "component-item"
   }

export class Item extends AttributeTag {
    static deserialize(data: unknown):Item | false {
        if (Item.validate(data))return new Item();
        return false;
    }

    static validate(data:any):data is SerializedItem {
        if (AttributeTag.validate(data)){
            if (data.type === Item.type ) return true;
            
        }
        return false;
      }
    static type = "component-item";
}
