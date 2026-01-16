import { LightningElement, api } from 'lwc';
import getSection from "@salesforce/apexContinuation/SummaryController.getSection";
import getTags from "@salesforce/apexContinuation/SummaryController.getTags";

export default class Reponse_summary_information extends LightningElement {
    @api opportunityId;
    lengthofInProgressRequirement = 0; 
    lengthofNotStartedRequirement = 0; 
    lengthofCompleteRequirement = 0; 
    sumOfEffortLevel = 0.0;
    dataList = [];
    linkList = [];
    tagList = [];
    counter = 0;
    remainingCount = 0;
    remainingShow = false;
    totalCount = 7;
    remainingTagShow = false;
    connectedCallback() {
        
        getSection({ opportunityId: this.opportunityId}).then((result) => {
            if (result) {
                if(result.length > 0){
                    
                    result.forEach(ele => {
                        if(ele.Requirements__r){
                            ele.Requirements__r.forEach(el => {
                                if(el.Status__c == 'Completed'){
                                    this.lengthofCompleteRequirement += 1; 
                                }
                                else if(el.Status__c == 'In Progress'){
                                    this.lengthofInProgressRequirement += 1; 
                                }
                                else if(el.Status__c == 'Not Started'){
                                    this.lengthofNotStartedRequirement += 1; 
                                }
                                if(el.Effort_Level__c){
                                    console.log('effor level: ' + el.Effort_Level__c);
                                    this.sumOfEffortLevel += parseFloat(el.Effort_Level__c);
                                }
                                
                            });
                        }
                    });
                    this.sumOfEffortLevel = this.sumOfEffortLevel.toFixed(1);
                    this.dataList = result;
                }
                console.log(this.dataList,'info');
            }
        })
        .catch((error) => {
            console.log(error);
        });
        getTags({ opportunityId: this.opportunityId}).then((result) => {
            if (result) {
                if(result.length > 0){
                    if(result.length > this.totalCount){
                    this.remainingCount = result.length - this.totalCount + '+';
                    this.remainingShow = true;
                    }
                    result.forEach(ele => {
                        this.counter++;
                        if(ele.Linked_Tags__r){
                            ele.linkName = true;
                        }
                        else{
                            ele.linkName = false;
                        }
                        if(this.counter >= 8)
                        {
                            this.tagList.push(ele);
                        }
                        else{
                            this.linkList.push(ele);
                        }
                    });
                    
                }
            }
        })
        .catch((error) => {
            console.log(error);
        });
    }
    handleBadgeClick(){
        this.remainingTagShow = true;
    }
    closeModal(){
        this.remainingTagShow = false;
    }

}