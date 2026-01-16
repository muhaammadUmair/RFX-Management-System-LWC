import lookUp from '@salesforce/apex/Lookup.search';
import { api, LightningElement, track, wire } from 'lwc';
import saveResponseTags from "@salesforce/apexContinuation/ResponseController.saveResponseTags";
import createTag from "@salesforce/apexContinuation/ResponseController.createTag";

export default class SearchComponent extends LightningElement {

    @api objName;
    @api reqId;
    @api iconName;
    @api filter;
    @api searchPlaceholder='Search';

    @track selectedName;
    @track records;
    @track isValueSelected;
    @track blurTimeout;

    searchTerm;
    //css
    @track boxClass = 'slds-combobox slds-dropdown-trigger slds-dropdown-trigger_click slds-has-focus';
    @track inputClass = '';

    @wire(lookUp, {searchTerm : '$searchTerm', myObject : '$objName', filter : '$filter'})
    wiredRecords({ error, data }) {
        console.log( data);
        if (data) {
            this.error = undefined;
            this.records = data;
        } else if (error) {
            this.error = error;
            this.records = undefined;
        }
    }


    handleClick() {
        this.searchTerm = '';
        this.inputClass = 'slds-has-focus';
        this.boxClass = 'slds-combobox slds-dropdown-trigger slds-dropdown-trigger_click slds-has-focus slds-is-open';
    }

    onBlur() {
        this.blurTimeout = setTimeout(() =>  {this.boxClass = 'slds-combobox slds-dropdown-trigger slds-dropdown-trigger_click slds-has-focus'}, 300);
    }

    onSelect(event) {
        let selectedId = event.currentTarget.dataset.id;
        let selectedName = event.currentTarget.dataset.name;
        saveResponseTags({tagId: selectedId,requirementId: this.reqId}).then((result) => {
            
        })
        const valueSelectedEvent = new CustomEvent('lookupselected', {detail:  selectedName });
        this.dispatchEvent(valueSelectedEvent);
        //this.isValueSelected = true;
        this.selectedName = selectedName;
        /*if(this.blurTimeout) {
            clearTimeout(this.blurTimeout);
        }*/
        this.boxClass = 'slds-combobox slds-dropdown-trigger slds-dropdown-trigger_click slds-has-focus';
        this.searchTerm = '';
    }

    handleRemovePill() {
        this.isValueSelected = false;
    }

    onChange(event) {
        this.searchTerm = event.target.value;
    }

    SaveNewTag(event){
        this.searchTerm = event.target.value;
        if(event.keyCode === 13){
            createTag({tagText: this.searchTerm,ResponsID: this.reqId}).then((result) => {
                if(result){
                    console.log('result',result);
                    const valueSelectedEvent = new CustomEvent('lookupselected', {detail:  this.searchTerm });
                    this.dispatchEvent(valueSelectedEvent);
                }
                this.selectedName = this.searchTerm;
                this.boxClass = 'slds-combobox slds-dropdown-trigger slds-dropdown-trigger_click slds-has-focus';
            })
            this.searchTerm ='';
        }
    }

}