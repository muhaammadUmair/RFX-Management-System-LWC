import { LightningElement, track, api } from 'lwc';
import { mapdataTableAttrib } from 'c/util';

import fetchFiles from "@salesforce/apexContinuation/FetchFiles.getBids";

    const columns = [
        { label: 'Name', fieldName: 'Name' },
        { label: 'Clarification Questions Due', fieldName: 'Clarification_Questions_Due__c', type: 'date' },
        { label: 'Primary Contact', fieldName: 'Primary_Contact_Name', type: 'text' },
        { label: 'Status', fieldName: 'Status__c', type: 'text' }
    ];
export default class Bid_selector extends LightningElement {
    @api recordId;
    @track dataList;
    
    data = [];
    columns = columns;

    renderedCallback() {
        
    }

    @api getBids(recordId){
        console.log("recordId", recordId);
        this.recordId = recordId;
        fetchFiles({
            recordId : recordId
        })
        .then(result => {
            mapdataTableAttrib(this.columns, result);
            result.map(ele => {
                if(ele.Primary_Contact__r){
                    ele.Primary_Contact_Name = ele.Primary_Contact__r.Name;
                }
                return ele;
            })
            console.log(result);
            this.dataList = result;
        })
        .catch(error => {
            console.error('**** error **** \n ',error)
        });

    }
    handleSuccess(){
        this.getBids(this.recordId);
        this.isNewForm = false;
    }
    handleRowSelection(event) {
        var selectedRows = event.detail.selectedRows;
        if(selectedRows.length > 0){
            const selectedEvent = new CustomEvent("enablenext", {
                detail: selectedRows[0].Id
            });
            this.dispatchEvent(selectedEvent);
        }    
        else if(selectedRows.length == 0){
            const selectedEvent = new CustomEvent("disablenext", {
            });
            this.dispatchEvent(selectedEvent);
        }
        
    }
    isNewForm = false;
    handleClickNew(){
        this.isNewForm = true;
    }
}