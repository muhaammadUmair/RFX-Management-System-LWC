import { LightningElement, api } from 'lwc';

export default class Matching_type_selector_option extends LightningElement {
    @api type;
    matchingType = [];
    matchingTypeManager(){
        this.matchingType = [];
        if(type == 'custom'){
            this.matchingType.custom = true;
        }else if(type == 'astario'){
            this.matchingType.astario = true;
        }else if(type == 'both'){
            this.matchingType.both = true;
        }
        
    }
}