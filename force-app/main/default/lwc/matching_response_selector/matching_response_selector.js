import { LightningElement, api } from 'lwc';
import getMatchingResponses from "@salesforce/apexContinuation/ResponseCreateController.getMatchingResponses";

export default class Matching_response_selector extends LightningElement {
    matchedResponses;
    empty = false;
    showResult = false;
    showLoader = true;
    @api
    loadMatchingResponses(reqID){
        this.showResultDiv('loader');
        getMatchingResponses({ RID: reqID }).then((result) => {
            console.log('Requirement Id is: ' + reqID);
            console.log(result);
            if(result && result.length > 0){
                result.map(ele => {
                    ele.isSelected = false;
                    return ele;
                })
                this.showResultDiv('result');
            }else {
                this.showResultDiv('empty');
            }
            this.matchedResponses = result;
        }).catch((err) => {
            console.log(err)
        })
    }
    showResultDiv(show){
        this.empty = false;
        this.showResult = false;
        this.showLoader = false;
        
        if(show == 'empty'){
            this.empty = true;
        }else if(show == 'result'){
            this.showResult = true;
        }else if(show == 'loader'){
            this.showLoader = true;
        }
    }
    selectResponse(e){
        let ind = parseInt(e.target.dataset.ind);
        this.matchedResponses.forEach(ele => {
            ele.isSelected = false;
        });
        this.matchedResponses[ind].isSelected = true;
        this.matchedResponses = [...this.matchedResponses];
        this.triggerEvent(this.matchedResponses[ind].Response__c);
    }
    deselectResponse(e){
        let ind = parseInt(e.target.dataset.ind);
        this.matchedResponses.forEach(ele => {
            ele.isSelected = false;
        });
        this.matchedResponses = [...this.matchedResponses];
        this.triggerEvent("");
    }
    triggerEvent(val){
        const custEvent = new CustomEvent(
            'selected', {
                detail: {
                    val: val
                } 
            });
        this.dispatchEvent(custEvent);
        //this.showResultDiv();
    }
}