import { LightningElement, api } from 'lwc';
import getSection from "@salesforce/apexContinuation/SummaryController.getSection";
export default class Response_summary_table extends LightningElement {
    @api opportunityId;
    dataList = [];
    userPhoto1 = '';
    userPhoto2 = '';
    numberOfUser = 0;
    showSec = false;
    showThird = false;
    connectedCallback() {

        getSection({ opportunityId: this.opportunityId }).then((result) => {
            if (result) {
                if (result.length > 0) {
                    var lengthofRequirement = 0;
                    var lengthofCompleteRequirement = 0;
                    result.forEach(ele => {
                        ele.ShortName = ele.Name;
                        if (ele.Name.length > 25) {
                            ele.ShortName = ele.Name.substr(0, 22) + '...';
                        }
                        if (ele.Requirements__r) {
                            lengthofRequirement = ele.Requirements__r.length;
                            ele.Requirements__r.forEach(el => {
                                if (el.Status__c == 'Completed') {
                                    lengthofCompleteRequirement += 1;
                                }
                                if (this.userPhoto1 == '') {
                                    if (el.Assign_to__r) {
                                        this.userPhoto1 = el.Assign_to__r.SmallPhotoUrl;
                                    }
                                }
                                else if (this.userPhoto2 == '') {
                                    if (el.Assign_to__r) {
                                        this.userPhoto2 = el.Assign_to__r.SmallPhotoUrl;
                                    }

                                }
                                else {
                                    this.numberOfUser += 1;
                                }
                            });
                            ele.progress = Math.trunc((lengthofCompleteRequirement / lengthofRequirement) * 100);
                            lengthofCompleteRequirement = 0;
                            ele.noReq = false;
                            if (this.userPhoto1 != '') {
                                ele.userPhoto1 = this.userPhoto1;
                                ele.showFirst = true;
                            }
                            else {
                                ele.showFirst = false;
                            }
                            if (this.userPhoto2 != '') {
                                ele.showSec = true;
                                ele.userPhoto2 = this.userPhoto2;
                            }
                            else {
                                ele.showSec = false;
                            }
                            if (this.numberOfUser > 0) {
                                ele.showThird = true;
                                ele.numberOfUser = this.numberOfUser;
                            }
                            else {
                                ele.showThird = false;
                            }
                            this.userPhoto = '';
                            this.userPhoto2 = '';
                            this.showThird = false;
                            this.showSec = false;
                            this.numberOfUser = 0;
                        }
                        else {
                            ele.progress = 0;
                            ele.noReq = true;
                        }
                    });
                    this.dataList = result;
                }
                console.log(this.dataList);
            }
        })
            .catch((error) => {
                console.log(error);
            });
    }
    openResponsePage(e){
        let resID = e.target.dataset.id;
        window.location = '/lightning/n/Response_Editor?c__recId=' + this.opportunityId + '&c__sId=' + resID;
    }
}