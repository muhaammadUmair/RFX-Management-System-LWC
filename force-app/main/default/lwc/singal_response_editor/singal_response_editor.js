import { LightningElement, api, track, wire } from 'lwc';
import { CurrentPageReference } from 'lightning/navigation';
import getResonseSections from "@salesforce/apexContinuation/ResponseController.getResonseSections";
import getResponseTags from "@salesforce/apexContinuation/ResponseController.getResponseTags";
import deleteResponseTags from "@salesforce/apexContinuation/ResponseController.deleteResponseTags";
import addOrRemoveToLib from "@salesforce/apexContinuation/ResponseController.addOrRemoveToLib";
import getResponseLibrary from "@salesforce/apexContinuation/ResponseController.getResponseLibrary";
import assignBulkUserToRequirements from "@salesforce/apexContinuation/ResponseController.assignBulkUserToRequirements";
import isInLibrary from "@salesforce/apexContinuation/ResponseController.isInLibrary";
import getLibraryData from "@salesforce/apexContinuation/ResponseController.getLibraryData";
import fetchFiles from "@salesforce/apexContinuation/FetchFiles.getFiles";
import selectorCSS from '@salesforce/resourceUrl/selector';
import { loadStyle, loadScript } from 'lightning/platformResourceLoader';

import { ShowToastEvent } from 'lightning/platformShowToastEvent';

export default class Singal_response_editor extends LightningElement {

    @api
    options8 = [];
    @api
    options7 = [{ label: "Not Started", value: "Not Started" }, { label: "In Progress", value: "In Progress" }, { label: "Completed", value: "Completed" }];

    clr = "nuteral";
    selectedSectionClass = "selectedSection ";
    sectionsList = [];
    libraryList = [];
    tempSectionList = [];
    tempLibraryList = [];
    docLibraryList = [];
    tempDocLibraryList = [];
    tagsList = [];
    tagNames = "";
    dataList;
    fileCount = 0;
    RequirementId;
    RequirementName = "";
    userPhoto = '';
    activeIndex = [0];
    characterLength = 0;
    wordLength = 0;
    tempMatchingIndex = '';
    @track openModal = false;
    @track openResponseModal = false;
    @track activeSection = "";
    @track openSingleResponseModal = false;
    @track knowlegdeArticlePopup = false;
    @track knowlegdeArticleData = '';
    @track ischecked;
    addLibraryButtonColor;
    check = 0;
    isSectionView = false;
    openBulkModal = false;
    respTxt = "";
    recordId;
    sId;
    @wire(CurrentPageReference)
    currentPageReference;

    connectedCallback() {
        this.recordId = this.currentPageReference.state.c__recId;
        this.sId = this.currentPageReference.state.c__sId;
        this.activeSection = this.sId;
        var ind = -1;
        loadStyle(this, selectorCSS);
        getResonseSections({ opportunityId: this.recordId }).then((result) => {
            console.log(result)
            if (result) {
                result.forEach(ele => {
                    ind++;
                    if (ele.Id == this.activeSection) {
                        this.activeIndex = [ind];
                    }
                    ele.lengthofCompleteRequirement = 0;
                    ele.lengthofInProgressRequirement = 0;
                    ele.lengthofNotStartedRequirement = 0;
                    if (ele.Requirements__r) {
                        ele.Requirements__r.forEach(el => {
                            if (el.Status__c == 'Completed') {
                                ele.lengthofCompleteRequirement += 1;
                            }
                            else if (el.Status__c == 'In Progress') {
                                ele.lengthofInProgressRequirement += 1;
                            }
                            else if (el.Status__c == 'Not Started') {
                                ele.lengthofNotStartedRequirement += 1;
                            }

                        });
                    }
                })
                this.sectionsList = result;
                console.log(this.sectionsList)
                this.tempSectionList = result.map(function (ele) {
                    return ele;
                })
            }
        });



        getResponseLibrary().then((result) => {
            if (result) {
                this.tempLibraryList = result;
                this.libraryList = result;
                console.log(this.libraryList)
            }
        });

        getLibraryData().then((result) => {
            if (result) {
                this.tempDocLibraryList = result;
                this.docLibraryList = result;
                console.log(this.libraryList)
            }
        });

    }

    showModal(event) {
        var eid = event.target.dataset.id;
        if (eid) {
            this.RequirementId = eid;
        }
        console.log('req id is: ' + this.RequirementId);
        this.openModal = true;
        console.log(this.selectedSection)
    }
    changePicture = '';

    knowlegdeArticleOnchange(e) {
        this.knowlegdeArticlePopup = !this.knowlegdeArticlePopup;
        this.knowlegdeArticleData = e.target.value;
    }
    onSubmitPhoto() {
        getResonseSections({ opportunityId: this.recordId }).then((result) => {
            console.log(result)
            if (result) {
                result.forEach(ele => {
                    if (ele.Id == this.selectedSection.Id) {
                        this.selectedSection = ele;
                    }
                })
            }

        })
        this.selectedSection.Requirements__r.forEach((req) => {
            if (this.RequirementId == req.Id) {
                console.log(req.Id + this.RequirementId)
                if (req.Assign_to__r) {
                    console.log(req.Assign_to__r)
                    this.userPhoto = req.Assign_to__r.SmallPhotoUrl;
                    console.log(this.userPhoto);
                }
            }
        });
        console.log(this.selectedSection)
    }

    matchResponse(event) {
        var eid = event.currentTarget.dataset.id;
        this.matchingIndex = event.currentTarget.dataset.ind;
        console.log("This is Index: " + this.matchingIndex)
        if (eid) {
            this.RequirementId = eid;
        }
        this.openResponseModal = true;
        setTimeout(function () {
            var mrs = this.template.querySelector("c-matching_response_selector");
            if (mrs) {
                mrs.loadMatchingResponses(this.RequirementId);
            }
        }.bind(this), 500);
    }

    singleMatchResponse(event) {
        var eid = event.currentTarget.dataset.id;
        this.matchingIndex = event.currentTarget.dataset.ind;
        console.log("This is Index: " + this.matchingIndex)
        if (eid) {
            this.RequirementId = eid;
        }
        this.openSingleResponseModal = true;
        setTimeout(function () {
            var mrs = this.template.querySelector("c-matching_response_selector");
            if (mrs) {
                mrs.loadMatchingResponses(this.RequirementId);
            }
        }.bind(this), 500);
    }
    tempSingelResponse;
    responseSelected(e) {
        console.log("Selected Response " + e.detail.val)
        this.selectedSection.Requirements__r[this.matchingIndex].responseText = e.detail.val;
        //this.selectedSection = [...this.selectedSection];
    }

    singleResponseSelected(e) {
        console.log("Selected Response " + e.detail.val)
        this.selectedSection.Requirements__r[this.matchingIndex].responseText = e.detail.val;
        this.tempSingelResponse = e.detail.val;
        //this.selectedSection = [...this.selectedSection];
    }

    addResponse() {
        console.log("Bulk Click");
        this.selectedSection.Requirements__r[this.matchingIndex].Response__c = this.selectedSection.Requirements__r[this.matchingIndex].responseText;
        this.template.querySelector('lightning-button[data-ind="' + this.matchingIndex + '"]').click();
        this.openResponseModal = false;
        this.openSingleResponseModal = false;

    }

    addSingleResponse() {
        console.log("Single click");
        console.log(this.selectedSection)
        console.log("Active Index : " + this.matchingIndex)
        this.selectedSection.Requirements__r[this.matchingIndex].Response__c = this.selectedSection.Requirements__r[this.matchingIndex].responseText;
        this.template.querySelector('lightning-button.single-form').click();
        this.selectedResponse = this.tempSingelResponse;
        this.openResponseModal = false;
        this.openSingleResponseModal = false;

    }

    handleAvatarChange(event) {
        console.log(event.target.value);
    }
    handleSubmitResponse(event) {

        const inputFields = event.detail.fields;
        /*if (inputFields) {
            inputFields.forEach(field => {
                console.log('Field is==> ' + field.fieldName);
                console.log('Field is==> ' + field.value);
            });
        }*/
        if (this.matchingIndex != undefined && this.matchingIndex != '') {
            event.preventDefault();
            inputFields.Response__c = this.selectedSection.Requirements__r[this.matchingIndex].Response__c;
            this.template.querySelector('lightning-record-edit-form[data-ind="' + this.matchingIndex + '"]').submit(inputFields);
            this.matchingIndex = '';
        }

    }

    closeResponseModal() {
        this.selectedSection.Requirements__r[this.matchingIndex].responseText = this.selectedSection.Requirements__r[this.matchingIndex].Response__c;
        this.openResponseModal = false;
        this.openSingleResponseModal = false;
        this.matchingIndex = '';
    }
    closeSingleResponseModal() {
        this.openSingleResponseModal = false;
    }
    closeModal() {
        this.openModal = false;
    }
    closeBulkModal() {
        this.openBulkModal = false;
    }
    openBulkModalHandle() {
        this.openBulkModal = true;
    }
    bulkUserId;
    updateBulkAssignment(e) {
        if (!this.bulkUserId && this.bulkUserId != '') {
            const event = new ShowToastEvent({
                title: 'Please select user',
                message: 'Please select user',
                variant: 'error'
            });
            this.dispatchEvent(event);
        } else {
            var checkBoxes = this.template.querySelectorAll('input[type="checkbox"]');
            let ids = '';
            checkBoxes.forEach(e => {
                if (e.checked) {
                    ids += ", " + e.dataset.userid;
                }
            });
            if (ids != '') {
                assignBulkUserToRequirements({ ids: ids, UserId: this.bulkUserId }).then(result => {
                    const event = new ShowToastEvent({
                        title: 'User is assigned to requirement',
                        message: 'User is assigned to requirement',
                        variant: 'success'
                    });
                    this.dispatchEvent(event);
                    this.closeBulkModal();
                }).catch(error => {

                });
            } else {
                const event = new ShowToastEvent({
                    title: 'Please select requirement',
                    message: 'Please select requirement',
                    variant: 'error'
                });
                this.dispatchEvent(event);
            }

        }
        //bulkUser.
    }
    bulkUserChange(e) {
        this.bulkUserId = e.target.value;
    }
    changeSection = '';
    // submi
    handleStatusChange(e) {
        if (e.target.dirty) {
            this.changeSection = e.target.value;
            var submit = this.template.querySelector(".submite-data-button");
            if (submit) {
                submit.click();
            }
        }

    }
    handleEffortChange(e) {
        if (e.target.dirty) {
            var submit = this.template.querySelector(".submite-data-button");
            if (submit) {
                submit.click();
            }
        }

    }
    textWithoutTags = "";

    handleResponseEditor(event) {
        console.log(event.target.value);
        this.textWithoutTags = event.target.value.replace(/(<([^>]+)>)/ig,'');
        this.characterLength = this.textWithoutTags.length;
        this.wordLength = this.textWithoutTags.split(" ").length;
        if(event.target.value == ""){
            this.wordLength = 0;
        }
    }

    handleSuccessForm() {
        const event = new ShowToastEvent({
            title: 'Changes',
            message: 'Changes Saved!',
            variant: 'success'
        });
        this.dispatchEvent(event);
        console.log("Changes Success")
    }
    handleErrorForm() {
        const event = new ShowToastEvent({
            title: 'Changes',
            message: 'Changes Not Saved!',
            variant: 'error'
        });
        this.dispatchEvent(event);
        console.log("Changes Error")

    }
    preStatus = '';
    handleResponseSuccess() {
        this.tempSectionList.forEach((e) => {
            if (e.Requirements__r) {
                e.Requirements__r.forEach((ev) => {
                    console.log("Selected Id:  " + this.selectedSectionID)
                    if (ev.Id == this.selectedSectionID) {
                        if (ev.Status__c == 'Completed') {
                            e.lengthofCompleteRequirement = e.lengthofCompleteRequirement - 1;
                        }
                        else if (ev.Status__c == 'In Progress') {
                            e.lengthofInProgressRequirement = e.lengthofInProgressRequirement - 1;
                        }
                        else if (ev.Status__c == 'Not Started') {
                            e.lengthofNotStartedRequirement = e.lengthofNotStartedRequirement - 1;
                        }

                        if (this.changeSection) {
                            ev.Status__c = this.changeSection;
                        }

                        this.selectedSectionClass = "selectedSection ";
                        console.log('status: ' + ev.Status__c);
                        if (ev.Status__c == 'Completed') {
                            this.clr = "avtemplate-box__background_inverse slds-box ";
                            this.clr += "success";
                            this.selectedSectionClass += "success";
                            e.lengthofCompleteRequirement += 1;
                        }
                        else if (ev.Status__c == 'In Progress') {
                            this.clr = "avtemplate-box__background_inverse slds-box ";
                            this.clr += "nuteral";
                            this.selectedSectionClass += "nuteral";
                            e.lengthofInProgressRequirement += 1;
                        }
                        else if (ev.Status__c == 'Not Started') {
                            this.clr = "avtemplate-box__background_inverse slds-box ";
                            this.clr += "destructive";
                            this.selectedSectionClass += "destructive";
                            e.lengthofNotStartedRequirement += 1;
                        }
                        ev.selectedClass = "slds-border_top slds-border_right slds-border_bottom slds-border_left " + this.selectedSectionClass;
                        console.log('s: ' + ev.selectedClass);
                        console.log('req id is: ' + this.RequirementId);
                    }
                })
            }
        });


        this.sectionsList.forEach((e) => {
            if (e.Requirements__r) {
                e.Requirements__r.forEach((ev) => {
                    console.log("Selected Id:  " + this.selectedSectionID)
                    if (ev.Id == this.selectedSectionID) {
                        if (ev.Status__c == 'Completed') {
                            e.lengthofCompleteRequirement = e.lengthofCompleteRequirement - 1;
                        }
                        else if (ev.Status__c == 'In Progress') {
                            e.lengthofInProgressRequirement = e.lengthofInProgressRequirement - 1;
                        }
                        else if (ev.Status__c == 'Not Started') {
                            e.lengthofNotStartedRequirement = e.lengthofNotStartedRequirement - 1;
                        }

                        if (this.changeSection) {
                            ev.Status__c = this.changeSection;
                        }

                        this.selectedSectionClass = "selectedSection ";
                        console.log('status: ' + ev.Status__c);
                        if (ev.Status__c == 'Completed') {
                            this.clr = "avtemplate-box__background_inverse slds-box ";
                            this.clr += "success";
                            this.selectedSectionClass += "success";
                            e.lengthofCompleteRequirement += 1;
                        }
                        else if (ev.Status__c == 'In Progress') {
                            this.clr = "avtemplate-box__background_inverse slds-box ";
                            this.clr += "nuteral";
                            this.selectedSectionClass += "nuteral";
                            e.lengthofInProgressRequirement += 1;
                        }
                        else if (ev.Status__c == 'Not Started') {
                            this.clr = "avtemplate-box__background_inverse slds-box ";
                            this.clr += "destructive";
                            this.selectedSectionClass += "destructive";
                            e.lengthofNotStartedRequirement += 1;
                        }
                        ev.selectedClass = this.selectedSectionClass;
                        console.log('s: ' + ev.selectedClass);
                        console.log('req id is: ' + this.RequirementId);
                    }
                })
            }
        });

        const event = new ShowToastEvent({
            title: 'Response',
            message: 'Changes Saved!',
            variant: 'success'
        });
        this.dispatchEvent(event);
        console.log("Response Saved!")
    }

    numberOfResponseCharacter() {

    }

    handleReponseError() {
        const event = new ShowToastEvent({
            title: 'Response',
            message: 'Changes Not Saved!',
            variant: 'error'
        });
        this.dispatchEvent(event);
        console.log("Response Not Saved!")
    }
    // var btn =submitData.event.fetchFileData(e,(err)=>{
    //     if (!err) {
    //         console.log('data sent successfully')

    //     } else {
    //         console.log(err)
    //     }
    // })
    // btn.addEventListener( 'click', function() {
    //     sendData( {test:'ok'} );
    //   } )

    @track nextButton = true;
    @track prevButton = false;
    nextClicked(event) {
        console.log("Next Clicked!");
        this.clr = "avtemplate-box__background_inverse slds-box ";
        this.isSectionView = false;
        this.tempMatchingIndex = parseInt(this.tempMatchingIndex);

        if (event.target.label === "Next") {
            this.tempMatchingIndex = this.tempMatchingIndex + 1;
        }
        if (event.target.label === "Previous") {
            this.tempMatchingIndex = this.tempMatchingIndex - 1;
        }
        console.log("Updated Index: " + this.tempMatchingIndex)
        var eid;
        var rText;
        this.sectionsList.forEach((section) => {
            if (section.Id === this.LibSecionId) {
                if (this.tempMatchingIndex != 0) {
                    this.prevButton = true
                }
                else {
                    this.prevButton = false;
                }
                if (this.tempMatchingIndex < section.Requirements__r.length - 1) {
                    this.nextButton = true;
                }
                else {
                    this.nextButton = false;
                }
                section.Requirements__r.forEach((ev, index) => {
                    if (index === this.tempMatchingIndex) {
                        eid = ev.Id;
                        this.LibSecionId = section.Id;
                        rText = ev.Requirement__c
                    }
                })
            }
        })

        console.log("Next Req Id: " + eid);
        console.log("Next Section Id: " + this.LibSecionId);
        console.log("Next Requirement Text: " + rText)

        // var rText = event.target.dataset.text;
        this.respTxt = rText;
        this.selectedSectionID = eid;
        // this.LibSecionId = event.target.dataset.sectionid;
        console.log("Section Id: " + this.LibSecionId)
        this.isCheck = false;
        var status;
        this.fileCount = 'Files (0)';
        this.sectionsList.forEach((e) => {
            if (e.Requirements__r) {
                e.Requirements__r.forEach((ev) => {
                    if (ev.Id == eid) {
                        this.selectedSectionClass = "selectedSection ";
                        if (ev.Status__c == 'Completed') {
                            this.clr += "success";
                            this.selectedSectionClass += "success";
                        }
                        else if (ev.Status__c == 'In Progress') {
                            this.clr += "nuteral";
                            this.selectedSectionClass += "nuteral";
                        }
                        else if (ev.Status__c == 'Not Started') {
                            this.clr += "destructive";
                            this.selectedSectionClass += "destructive";
                        }
                        if (ev.Assign_to__r) {
                            this.userPhoto = ev.Assign_to__r.SmallPhotoUrl;
                        }
                        ev.selectedClass = this.selectedSectionClass;
                        console.log('s: ' + ev.selectedClass);
                        status = ev.Status__c;
                        this.RequirementId = eid;

                        console.log('req id is: ' + this.RequirementId);
                        isInLibrary({ requirementId: eid }).then((result) => {
                            console.log('lib: ' + result);
                            if (result) {
                                if (result > 0) {
                                    this.isCheck = true;
                                }
                            }
                        });
                        getResponseTags({ requirementId: eid }).then((result) => {
                            this.tagNames = "";
                            if (result) {
                                this.tagsList = result;

                            }
                        });
                        this.fetchFileData(eid);
                    } else {
                        ev.selectedClass = '';
                    }
                })

            }

        })
        this.sectionsList = [...this.sectionsList];
        this.RequirementName = rText;
        this.singleResponse.req = this.RequirementName;
        const startSelect = this.template.querySelector('.combobox-1');
        if (startSelect) {
            startSelect.value = status;
        }
    }
    AddMatchData(event) {
        var rTxt = event.target.dataset.req;
        console.log(rTxt)
        if (this.selectedSectionID !== 0) {
            this.respTxt = rTxt;
        }
        console.log('rText:' + rTxt + "\nSelectedSectionID: " + this.selectedSectionID);
    }
    singleResponse = [];
    LibSecionId = 0;
    isCheck = false;
    selectedSectionID = 0;
    addedToLibrary;
    libraryButtonTitle;
    selectedResponse;
    handleSectionClick(event) {
        this.clr = "avtemplate-box__background_inverse slds-box ";
        this.isSectionView = false;
        this.tempMatchingIndex = event.target.dataset.ind;
        console.log("Active Index: " + this.tempMatchingIndex);
        var eid = event.target.dataset.id;
        var rText = event.target.dataset.text;
        this.respTxt = rText;
        this.selectedSectionID = eid;
        this.LibSecionId = event.target.dataset.sectionid;
        console.log("Section Id: " + this.LibSecionId);
        this.isCheck = false;
        var status;
        this.fileCount = 'Files (0)';
        this.sectionsList.forEach((e) => {
            if (e.Requirements__r) {
                e.Requirements__r.forEach((ev) => {
                    if (ev.Id == eid) {
                        if (ev.Added_to_Library__c === undefined) {
                            this.addedToLibrary = false;
                            this.libraryButtonTitle = "Add to Library"
                        }
                        else {
                            this.addedToLibrary = ev.Added_to_Library__c;
                        }
                        if (ev.Response__c == undefined) {
                            this.selectedResponse = "";
                        } else {
                            this.selectedResponse = ev.Response__c;
                        }
                        console.log("Selected Response:  " + this.selectedResponse)
                        this.textWithoutTags = this.selectedResponse.replace(/(<([^>]+)>)/ig, '');
                        this.characterLength = this.textWithoutTags.length;
                        this.wordLength = this.textWithoutTags.split(" ").length;
                        if(this.wordLength == 1){
                            this.wordLength = 0;
                        }

                        console.log("Backend Value" + this.addedToLibrary)
                        if (this.addedToLibrary === true) {
                            this.addLibraryButtonColor = "brand";
                            this.libraryButtonTitle = "Remove from Library"
                        }
                        if (this.addedToLibrary === false) {
                            this.addLibraryButtonColor = "neutral";
                            this.libraryButtonTitle = "Add to Library"
                        }
                        this.selectedSectionClass = "selectedSection ";
                        if (ev.Status__c == 'Completed') {
                            this.clr += "success";
                            this.selectedSectionClass += "success";
                        }
                        else if (ev.Status__c == 'In Progress') {
                            this.clr += "nuteral";
                            this.selectedSectionClass += "nuteral";
                        }
                        else if (ev.Status__c == 'Not Started') {
                            this.clr += "destructive";
                            this.selectedSectionClass += "destructive";
                        }
                        if (ev.Assign_to__r) {
                            this.userPhoto = ev.Assign_to__r.SmallPhotoUrl;
                        }
                        ev.selectedClass = this.selectedSectionClass;
                        console.log('s: ' + ev.selectedClass);
                        status = ev.Status__c;
                        this.RequirementId = eid;

                        console.log('req id is: ' + this.RequirementId);

                        isInLibrary({ requirementId: eid }).then((result) => {
                            console.log('lib: ' + result);
                            if (result) {
                                if (result > 0) {
                                    this.isCheck = true;
                                }
                            }
                        });
                        getResponseTags({ requirementId: eid }).then((result) => {
                            this.tagNames = "";
                            if (result) {
                                this.tagsList = result;

                            }
                        });
                        this.fetchFileData(eid);
                    } else {
                        ev.selectedClass = '';
                        this.addedToLibrary = false;
                    }
                })

            }

        })
        this.sectionsList = [...this.sectionsList];
        this.RequirementName = event.target.dataset.text;
        this.singleResponse.req = this.RequirementName;
        const startSelect = this.template.querySelector('.combobox-1');
        if (startSelect) {
            startSelect.value = status;
        }
        this.tempMatchingIndex = parseInt(this.tempMatchingIndex);
        if (this.tempMatchingIndex != 0) {
            this.prevButton = true
        }
        else {
            this.prevButton = false;
        }
        if (this.tempMatchingIndex < section.Requirements__r.length - 1) {
            this.nextButton = true;
        }
        else {
            this.nextButton = false;
        }
        //this.template.querySelector('response-detail').innerHTML = event.target.dataset.text;
        //$(this.template.querySelector(event.target.dataset.Id)).addClass('selectedSection');
    }

    buttonOnClick(event) {
        console.log("Clicked!")
        var preHtml = "<p>Hi</p>"
        var postHtml = "</body></html>";
        var html = preHtml + document.getElementById(event.target.label).innerHTML + postHtml;

        var blob = new Blob(['\ufeff', html], {
            type: 'application/msword'
        });

        // Specify link url
        var url = 'data:application/vnd.ms-word;charset=utf-8,' + encodeURIComponent(html);

        // Specify file name
        filename = filename ? filename + '.doc' : 'document.doc';

        // Create download link element
        var downloadLink = document.createElement("a");

        document.body.appendChild(downloadLink);

        if (navigator.msSaveOrOpenBlob) {
            navigator.msSaveOrOpenBlob(blob, filename);
            console.log("If Runing")
        } else {
            // Create a link to the file
            downloadLink.href = url;

            // Setting the file name
            downloadLink.download = filename;

            //triggering the function
            downloadLink.click();
            console.log("Else Runing")
        }

        document.body.removeChild(downloadLink);
    }


    filterDocLibraryList(event) {
        this.docLibraryList = JSON.parse(JSON.stringify(this.tempDocLibraryList));
        var search = event.target.value;
        console.log(this.docLibraryList);
        var searchList = [];
        if (search != undefined && search.length > 0) {
            var reqList = [];
            this.docLibraryList.forEach((item) => {
                if (item.Description__c && item.Description__c.includes(search)) {
                    reqList.push(item);
                }
            });
            this.docLibraryList = reqList;
            this.docLibraryList = [...this.docLibraryList];

        }
        else {
            console.log(this.docLibraryList);
        }

    }

    filterLibraryList(event) {


        this.libraryList = JSON.parse(JSON.stringify(this.tempLibraryList));
        var search = event.target.value;
        console.log(this.libraryList);
        var searchList = [];
        if (search != undefined && search.length > 0) {
            var reqList = [];
            this.libraryList.forEach((item) => {
                if (item.Requirement_Name__c && item.Requirement_Name__c.includes(search)) {
                    reqList.push(item);
                }
            });
            this.libraryList = reqList;

            this.libraryList = [...this.libraryList];

        }
        else {
            console.log(this.libraryList);
        }

    }


    filterArr = [];
    prevSecId = null;
    prevSecName = null;
    isSame = false;
    filterList(event) {
        this.sectionsList = JSON.parse(JSON.stringify(this.tempSectionList));
        var search = event.target.value;
        console.log(this.sectionsList);
        var searchList = [];
        if (search != undefined && search.length > 0) {
            this.sectionsList.forEach((item) => {
                var reqList = [];
                if (item.Requirements__r) {
                    item.Requirements__r.forEach((req) => {
                        if (req.Requirement__c && req.Requirement__c.includes(search)) {
                            reqList.push(req);
                        }
                    });
                    item.Requirements__r = reqList;
                }
                searchList.push(item);

                // item.Requirements__r = item.Requirements__r.filter(function(req){
                //     return req.Status__c == name;
                //});
            });
            //this.sectionsList = this.sectionsList.filter(d => d.Requirements__r.every(c => { if(c.Requirements__c) {c.Requirements__c.includes(search)} }));
            /*this.sectionsList = this.sectionsList.filter((item) => {
                if(item.Requirements__r){
                    item.Requirements__r.filter((req) => {
                        if(req.Requirement__c){
                            console.log(req.Section__c);
                            var isIncludes = req.Requirement__c.includes(search);
                            if(isIncludes){
                                return true;
                            }else{
                                return false;
                            }
                            
                        }
                        return false;
                    });
                    
                }
                return true;
                
            })*/
            this.sectionsList = [...this.sectionsList];
            /*this.sectionsList.forEach((item)=>{
                    item.Requirements__r.filter(function(req, index, object){
                        try{ 
                            if(req != null && req.Requirement__c != undefined){
                                if(req.Requirement__c.indexOf(search) == -1){
                                     object.splice(index,1);
                                    }
                                }
                            }
                        catch(Exception){
                            console.log(Exception);
                        }
                        //req.Requirements__r =  req.Requirements__r.Requirements__c.indexOf(search) > -1 ? req.Requirements__r : null;
                    });
            });*/
            if (this.sectionsList) {
                this.sectionsList.forEach(ele => {
                    ele.lengthofCompleteRequirement = 0;
                    ele.lengthofInProgressRequirement = 0;
                    ele.lengthofNotStartedRequirement = 0;
                    if (ele.Requirements__r) {
                        ele.Requirements__r.forEach(el => {
                            if (el.Status__c == 'Completed') {
                                ele.lengthofCompleteRequirement += 1;
                            }
                            else if (el.Status__c == 'In Progress') {
                                ele.lengthofInProgressRequirement += 1;
                            }
                            else if (el.Status__c == 'Not Started') {
                                ele.lengthofNotStartedRequirement += 1;
                            }

                        });
                    }
                })
                this.sectionsList = result;
                this.tempSectionList = result.map(function (ele) {
                    return ele;
                })
            }
        }
        else {
            var sectionId = event.target.dataset.id;
            var name = event.target.dataset.name;

            if (sectionId === this.prevSecId && name === this.prevSecName) {
                this.isSame = true;
            }
            else {
                this.isSame = false;
                this.sectionsList.forEach((item) => {
                    if (item.Id === sectionId) {
                        item.Requirements__r = item.Requirements__r.filter(function (req) {
                            return req.Status__c == name;
                        })
                    };
                });
            }
        }
        if (this.isSame) {
            this.prevSecId = null;
            this.prevSecName = null;
        }
        else {
            this.prevSecId = sectionId;
            this.prevSecName = name;
        }
        /*
        this.sectionsList = this.filterArr;
        this.sectionsList = [...this.sectionsList];*/
    }
    activeSectionMessage = '';
    selectedSection = [];
    handleToggleSection(event) {
        var sOpen = event.detail.openSections;
        //if (!sOpen) {
        //sOpen = 0;
        //}
        this.isSectionView = true;
        if (sOpen.length != 0) {
            this.selectedSection = this.sectionsList[sOpen[0]];
            if (this.selectedSection.Requirements__r) {
                this.selectedSection.Requirements__r.forEach((req) => {
                    if (req.Assign_to__r) {
                        req.SmallPhotoUrl = req.Assign_to__r.SmallPhotoUrl;
                    } else {
                        req.SmallPhotoUrl = "";
                    }
                });
            }
            console.log('toggle fire' + this.selectedSection);
        }


    }
    formatBytes(bytes, decimals = 2) {
        if (bytes === 0) return '0 Bytes';

        const k = 1024;
        const dm = decimals < 0 ? 0 : decimals;
        const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];

        const i = Math.floor(Math.log(bytes) / Math.log(k));

        return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
    }
    handleTagSelection(event) {
        getResponseTags({ requirementId: this.RequirementId }).then((result) => {
            if (result) {
                this.tagsList = result;

            }
        });
        console.log(event.target)
    }
    removeTag(event) {
        var tId = event.currentTarget.dataset.id;
        var tName = event.currentTarget.dataset.name;

        deleteResponseTags({ tagId: tId }).then((result) => {
            if (result) {
                this.removeFromList(tName, ',');
            }
        });
    }

    handleUploadFinished(event) {
        this.fetchFileData(this.RequirementId);
    }
    removeFromList(value, separator) {
        separator = separator || ",";
        var list = this.tagNames;
        var values = list.split(separator);
        for (var i = 0; i < values.length; i++) {
            if (values[i] == value) {
                values.splice(i, 1);
                this.tagNames = values.join(separator);
            }
        }
        //this.tagNames = list;
        getResponseTags({ requirementId: this.RequirementId }).then((result) => {
            if (result) {
                this.tagsList = result;
            }
        });
    }
    fetchFileData(Id) {
        fetchFiles({
            recordId: Id
        })
            .then(result => {
                this.fileCount = 'Files (' + result.length + ')';
                result.forEach(file => {
                    file.CREATED_BY = file.ContentDocument.CreatedBy.Name;
                    file.Size = this.formatBytes(file.ContentDocument.ContentSize, 2);
                    if (file.FileExtension == 'docx' || file.FileExtension == 'docx' || file.FileExtension == 'docx') {
                        file.icon = 'doctype:word';
                    }
                    else if (file.FileExtension == 'csv' || file.FileExtension == 'xls' || file.FileExtension == 'xlsx') {
                        file.icon = 'doctype:excel';
                    }
                    else if (file.FileExtension == 'pdf' || file.FileExtension == 'xps') {
                        file.icon = 'doctype:pdf';
                    }
                });
                this.dataList = result;
            })
            .catch(error => {
                console.error('**** error **** \n ', error)
            });
    }
    handleLibraryCheck(event) {
        var sectionId = event.target.dataset.id;
        console.log('sec: ' + sectionId + '\nreqId: ' + this.RequirementId);
        if (sectionId != 0) {
            addOrRemoveToLib({
                sectionId: sectionId, reqId: this.RequirementId, ischecked: !this.addedToLibrary, RequirementName: this.RequirementName
                , tags: this.tagNames
            }).then((result) => {
                this.sectionsList.forEach((e) => {
                    if (e.Requirements__r) {
                        if (e.Id === sectionId) {
                            e.Requirements__r.forEach((ev) => {
                                if (ev.Id === this.RequirementId) {
                                    this.addedToLibrary = !this.addedToLibrary;
                                    ev.Added_to_Library__c = this.addedToLibrary;
                                    console.log("Backend Value After Change" + ev.Added_to_Library__c)
                                }
                            })
                        }

                    }
                });
                this.sectionsList = [...this.sectionsList];

                if (this.addedToLibrary === true) {
                    this.addLibraryButtonColor = "brand";
                    this.libraryButtonTitle = "Remove from Library"
                }
                if (this.addedToLibrary === false) {
                    this.addLibraryButtonColor = "neutral";
                    this.libraryButtonTitle = "Add to Library"
                }
                console.log(this.addedToLibrary)
                console.log(this.sectionsList)
                console.log(result);
            }).catch((err) => {
                console.log(err)
            })
        }

    }
}