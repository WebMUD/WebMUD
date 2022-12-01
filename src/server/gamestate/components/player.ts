import { AttributeTag, SerializedAttributeTag } from './base/attribute-tag';

export type SerializedPlayer =  SerializedAttributeTag & {
    type: "component-player"
   }
   
export class Player extends AttributeTag {
    static deserialize(data: unknown):Player | false {
        if (Player.validate(data))return new Player();
        return false;
    }

    static validate(data:any):data is SerializedPlayer {
        if (AttributeTag.validate(data)){
            if (data.type === Player.type ) return true;
            
        }
        return false;
      }
    static type = "component-player";

}
