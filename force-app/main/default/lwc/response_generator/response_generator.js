import { LightningElement, track, wire } from 'lwc';
import { CurrentPageReference } from 'lightning/navigation';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';
import getFileBlob from "@salesforce/apexContinuation/ResponseController.getFileBlob";
import createResponse from "@salesforce/apexContinuation/ResponseController.createResponse";
import jQuery from '@salesforce/resourceUrl/jquery';
import mammothSrc from '@salesforce/resourceUrl/mammoth';
import xlsxSrc from '@salesforce/resourceUrl/xlsx';
import selectorCSS from '@salesforce/resourceUrl/selector';
import responseCreate from "@salesforce/apexContinuation/ResponseCreateController.create";

import { loadStyle, loadScript } from 'lightning/platformResourceLoader';


export default class Response_generator extends LightningElement {
    @track isDialogVisible = false;
    @track originalMessage;
    @track displayMessage = 'Do you want to select all?';
    docId;
    recordId;
    bidId;
    workBooks;
    sheetIndex;
    sheetExcel = false;
    @wire(CurrentPageReference)
    currentPageReference;
    /*disconnectedCallback() {
        window.removeEventListener("beforeunload", this.beforeUnloadHandler);
        console.log("disconnectedCallback executed");
    }*/
    connectedCallback() {
        window.addEventListener("beforeunload", this.beforeUnloadHandler);
        console.log("connectedCallback executed");
        this.docId = this.currentPageReference.state.c__fId;
        this.recordId = this.currentPageReference.state.c__recId;
        this.bidId = this.currentPageReference.state.c__bidId;
        loadStyle(this, selectorCSS);
        loadScript(this, jQuery)
            .then(() => {
                loadScript(this, xlsxSrc)
                    .then(() => {

                        loadScript(this, mammothSrc).then(() => {
                            getFileBlob({ ContentDocumentId: this.docId /*"0697Q000001V9mkQAC"/"0697Q0000006TxzQAE" /*"0697Q0000006mWFQAY"*/ }).then((result) => {
                                if (result) {
                                    var iThis = this;
                                    var blob = this.b64toBlob(result.content, "");
                                    var fileObj = new File([blob], "Name.xlsx");
                                    var result1 = this.template.querySelector('[data-id="file-div"]');// document.getElementById('file-div');
                                    console.time();
                                    var reader = new FileReader();
                                    reader.onloadend = function (event) {
                                        var arrayBuffer = reader.result;
                                        if (result.fileType.includes('EXCEL')) {
                                            console.log("ss");
                                            iThis.sheetExcel = true;
                                            iThis.sheetIndex = 0;
                                            console.log("sheetExcel",this.sheetExcel);
                                            var options = { type: 'buffer' };
                                            var workbook = XLSX.read(arrayBuffer, options);
                                            console.timeEnd();
                                            iThis.workBooks = workbook;
                                            var sheetName = workbook.SheetNames;
                                            let tabBtn = iThis.template.querySelector('[data-id="tabs-btns"]');
                                            tabBtn.innerHTML = '';
                                            var i = 0;
                                            var j = 0;
                                            sheetName.forEach(ele => {
                                                tabBtn.innerHTML += '<button class="slds-m-top_xx-small slds-button slds-button_brand sheet-tabs" data-name="' + ele + '" data-ind="' + j+ '">' + ele + '</button>';
                                                var sheet = workbook.Sheets[ele];
                                                var excelHTML = "";
                                                ele = ele.replaceAll(' ','_');
                                                ele = ele.replace(/[^a-zA-Z0-9 ]/g, "");
                                                if (i != 0) {
                                                    excelHTML += '<div style="display:none" class="' + ele + '" >';
                                                } else {
                                                    excelHTML += '<div class="' + ele + '" >';
                                                    i++;
                                                }
                                                //result1.innerHTML += ' ';
                                                excelHTML += XLSX.utils.sheet_to_html(sheet);
                                                excelHTML += '</div>';
                                                result1.innerHTML += excelHTML;
                                                j++;
                                            });
                                            //var sheet = workbook.Sheets[sheetName[0]];
                                            //result1.innerHTML = XLSX.utils.sheet_to_html(sheet);
                                            setTimeout(() => {
                                                iThis.clickSomethink();
                                                iThis.isLoading = false;
                                            }, 1000);
                                        } else {
                                            iThis.sheetExcel = false;
                                            console.log("sheetExcel11",this.sheetExcel);
                                            var options = {
                                                styleMap: [
                                                    "p.Heading2 => h1.slds-text-heading_medium.RFX-heading2:fresh",
                                                    "p[style-name='Heading 2'] => h1.slds-text-heading_medium:fresh",
                                                    "p.Heading1 => h1.slds-text-heading_large.RFX-heading1:fresh",
                                                    "p[style-name='Heading 1'] => h1.slds-text-heading_large:fresh",
                                                    "p[style-name='Title'] => h2.slds-text-heading_large:fresh",
                                                    "p.Heading7 => h2.slds-text-heading_medium.slds-text-align_center.slds-m-top_small.slds-m-bottom_small:fresh",
                                                    "table => table.slds-table.slds-table_cell-buffer.slds-table_bordered.slds-table_col-bordered.slds-m-bottom_small.slds-no-row-hover:fresh",
                                                    "b => b.slds-m-top_small:fresh"
                                                ],
                                                includeDefaultStyleMap: true,
                                                ignoreEmptyParagraphs: false,
                                                transformDocument: mammoth.transforms.paragraph(function (element) {
                                                    if (element.alignment === "center" && !element.styleId) {
                                                        return { ...element, styleId: "Heading7" };
                                                    } else if (element.type === "table") {
                                                        return { ...element, styleId: "Table1" };
                                                    } else {
                                                        return element;
                                                    }
                                                })
                                            };
                                            mammoth.convertToHtml({ arrayBuffer: arrayBuffer }, options).then(function (resultObject) {
                                                //result1.innerHTML = resultObject.value;
                                                result1.innerHTML = resultObject.value;
                                                //console.log(resultObject.value);
                                                setTimeout(() => {
                                                    iThis.clickSomethink();
                                                    iThis.isLoading = false;
                                                }, 1000);
                                            })
                                            console.timeEnd();
                                        }


                                        /*mammoth.extractRawText({arrayBuffer: arrayBuffer}).then(function (resultObject) {
                                          result2.innerHTML = resultObject.value
                                          console.log(resultObject.value)
                                        })
                                  
                                        mammoth.convertToMarkdown({arrayBuffer: arrayBuffer}).then(function (resultObject) {
                                          result3.innerHTML = resultObject.value
                                          console.log(resultObject.value)
                                        })*/
                                    };
                                    reader.readAsArrayBuffer(fileObj);

                                }
                            })

                        });

                    })
                    .catch(error => {
                        console.log('Failed to load the JQuery : ' + error);
                    });
            })
            .catch(error => {
                console.log('Failed to load the JQuery : ' + error);
            });
    }
    beforeUnloadHandler(ev) {
        console.log("beforeUnloadHandler called");
        return "";
    }
    resetAll(e) {
        var clickedClass = e.target.dataset.reset;
        var elements = this.template.querySelectorAll('.' + clickedClass);
        if (elements) {
            elements.forEach(element => {
                element.className = element.className.replace(clickedClass, '');
            });
        }
        console.log(e);
    }
    confirmationFor = '';
    applyToAll = false;
    copyBtnVariant = "border-filled";
    applyAll(e) {
        if (this.applyToAll) {
            this.applyToAll = false;
            this.copyBtnVariant = "border-filled";
        } else {
            this.applyToAll = true;
            this.copyBtnVariant = "brand";
        }
        return null;
    }
    get getCopyBtnVariant() {
        return this.copyBtnVariant;
    }
    clickSomethink() {
        var indexx = 0;
        var pPara = $('div[data-id="file-div"] > *');
        pPara.each(function (index) {
            console.log('this',$(this));
            if($(this).prop("tagName") == 'UL'){
                $(this).attr("data-ind", indexx);
                indexx++;
               var lengthOfChild = $(this)[0].childNodes.length;
               for(var i = 0 ; i < lengthOfChild ; i++){
                   var li = $(this)[0].childNodes[i];
                   $(li).attr("data-ind", indexx);
                    indexx++;
               }
            }
            else{
                $(this).attr("data-ind", indexx);//.data("index", index);
                indexx++;
            }
            
        });
        var tPara = $('div[data-id="file-div"] > table');
        tPara.each(function (index) {
            $(this).attr("data-ind", index);//.data("index", index);
        });
        $(".sheet-tabs").click(e => {
            this.isLoading = true;
            var iThis = this;
            this.workBooks.SheetNames.forEach(ele => {
                ele = ele.replaceAll(' ','_');
                ele = ele.replace(/[^a-zA-Z0-9 ]/g, "");
                iThis.template.querySelector("." + ele).style = "display:none";
            });
            var sheetName = $(e.currentTarget).data("name");
            this.sheetIndex = $(e.currentTarget).data("ind");
            this.sheetExcel = true;
            sheetName = sheetName.replaceAll(' ','_');
            sheetName = sheetName.replace(/[^a-zA-Z0-9 ]/g, "");
            this.template.querySelector("." + sheetName).style = "display:block";
            //var sheet = this.workBooks.Sheets[$(e.currentTarget).data("name")];
            //var result1 = this.template.querySelector('[data-id="file-div"]');// document.getElementById('file-div');
            //result1.innerHTML = XLSX.utils.sheet_to_html(sheet);

            setTimeout(() => {
                //iThis.clickSomethink();
                iThis.isLoading = false;
            }, 1000);
        });
        $("ul").addClass("slds-list_dotted");
        $("ol").addClass("slds-list_ordered");
        $("p > b:first-child").addClass('umair');
        $('td').click((e) => {
            if (this.isClassExist(e)) {
                $(e.currentTarget).removeClass(this.className);
            } else {
                var selectedEle = $(e.currentTarget);
                var sibSize = selectedEle.siblings().length;
                $(e.currentTarget).addClass(this.className);
                $(e.currentTarget).closest('table').addClass("selected");
                if (sibSize > 1) {
                    const ind = selectedEle.index();
                    var trInd = $(e.currentTarget).closest('tr').index();
                    var table = $(e.currentTarget).closest('tbody');

                    if (table) {
                        const tableTR = table.find("tr");
                        if (tableTR) {
                            for (var i = trInd; i < tableTR.length; i++) {
                                if (tableTR[i].children.length - 1 != sibSize) {
                                    break;
                                }
                                tableTR[i].children[ind].className = this.className;
                            }

                        }
                    }
                }

            }
            //alert('clicked');//$(this).addClass('clicked');
        });
        $(".importResponses").click((e) => {
            let pClicked = $("p.clicked");
            let pClickedData = [];
            pLicked.forEach(ele => {
                pClickedData.push(ele.html());
            });
            console.log(pClickedData);
           
        });
        $(this.template.querySelectorAll("h1.RFX-heading2")).click((e) => {
            var classList = e.currentTarget.className;
            if (this.isClassExist(e)) {
                $(e.currentTarget).removeClass(this.className);
            } else {
                $(e.currentTarget).addClass(this.className);
                if (this.applyToAll) {
                    $("h1.RFX-heading2").addClass(this.className);
                }

            }
        });
        $(this.template.querySelectorAll("h1.RFX-heading1")).click((e) => {
            if (this.isClassExist(e)) {
                $(e.currentTarget).removeClass(this.className);
            } else {
                $(e.currentTarget).addClass(this.className);
                if (this.applyToAll) {
                    $("h1.RFX-heading1").addClass(this.className);
                }
            }

        });

        $(this.template.querySelectorAll('li')).click((e) => {
            if (this.isClassExist(e)) {
                $(e.currentTarget).removeClass(this.className);
            } else {
                $(e.currentTarget).addClass(this.className);
            }
        });
        $(this.template.querySelectorAll('p')).click((e) => {
            const tdLength = $(e.currentTarget).parent().closest('td').length;
            if (tdLength == 0) {
                if (this.isClassExist(e)) {
                    $(e.currentTarget).removeClass(this.className);
                } else {
                    $(e.currentTarget).addClass(this.className);
                }
            }

        });

    }
    closest(arr, num) {
        console.log('abc');
        let retArr = [];
        try {
            arr.forEach((item) => {
                if (item.SectionIndex < num) {
                    retArr = [];
                    retArr = item;
                }
            })
        } catch (Exception) { console.log(Exception); }
        return retArr;
    }
    updateSectionMapping(ind) {
        this.importMapping.forEach((item) => {
            if (item.section === -1) {

            }
        })
    }
    importMapping = [];
    reqArrInd = -1;
    tblArr = "";
    secArr = [];
    secInd = -1;
    reqInd = 0;
    isLoading = true;
    isError = false;
    counter = 0;
    importResponses() {
        this.isLoading = true;
        try {
            this.importMapping = [];
            this.tblArr = [];
            this.secArr = [];
            this.secInd = 0;
            this.reqInd = 0;
            this.isError = false;
            this.importMapping.push({
                SectionText: 'Default',
                SectionIndex: -1,
                OpportunityId: this.recordId,
                BidId: this.bidId,
                Requirements: [{
                    RequirementText: "", RequirementIndex: "",
                    ResponseText: "", ResponseIndex: "", IdText: "", IdIndex: "",
                    LimitText: "", LimitIndex: "", ScoreText: "", ScoreIndex: "",
                    StatusText: "", StatusIndex: ""
                }]
            });

            var sectionLst = this.template.querySelectorAll('div[data-id="file-div"] > .section-clicked, div[data-id="file-div"] > ul .section-clicked, div[data-id="file-div"] > ol .section-clicked,div[data-id="file-div"] > li .section-clicked, div[data-id="file-div"] > .clicked-question, div[data-id="file-div"] > ul .clicked-question, div[data-id="file-div"] > ol .clicked-question, div[data-id="file-div"] > li .clicked-question, div[data-id="file-div"] > .clicked-response, div[data-id="file-div"] > ul .clicked-response, div[data-id="file-div"] > ol .clicked-response, div[data-id="file-div"] > li .clicked-response, div[data-id="file-div"] > .clicked-id, div[data-id="file-div"] > ul .clicked-id, div[data-id="file-div"] > ol .clicked-id, div[data-id="file-div"] > li .clicked-id div[data-id="file-div"] > .clicked-limit, div[data-id="file-div"] > ul .clicked-limit, div[data-id="file-div"] > ol .clicked-limit, div[data-id="file-div"] > li .clicked-limit, div[data-id="file-div"] > .clicked-score, div[data-id="file-div"] > ul .clicked-score, div[data-id="file-div"] > ol .clicked-score, div[data-id="file-div"] > li .clicked-score, div[data-id="file-div"] > .clicked-status, div[data-id="file-div"] > ul .clicked-status, div[data-id="file-div"] > ol .clicked-status, div[data-id="file-div"] > li .clicked-status');
            sectionLst.forEach(ele => {
                if (this.isError) {
                    return false;
                }
                if (ele.className.includes("section-clicked")) {
                    this.secInd++;
                    this.reqInd = 0;
                    let sectionText = ele.innerHTML;
                    if (sectionText) {
                        sectionText = sectionText.replace(/(<([^>]+)>)/gi, "");
                    }
                    this.importMapping.push({
                        SectionIndex: ele.dataset.ind,
                        SectionText: sectionText,
                        OpportunityId: this.recordId,
                        BidId: this.bidId,
                        Requirements: [{
                            RequirementText: "", RequirementIndex: "",
                            ResponseText: "", ResponseIndex: "", IdText: "", IdIndex: "",
                            LimitText: "", LimitIndex: "", ScoreText: "", ScoreIndex: "",
                            StatusText: "", StatusIndex: ""
                        }]
                    });
                }
                else if (ele.className.includes("clicked-question")) {
                    if (!this.importMapping[this.secInd]) {
                        this.isError = true;
                        return false;
                    }
                    if (this.importMapping[this.secInd].Requirements[this.reqInd].RequirementText == "") {
                        this.importMapping[this.secInd].Requirements[this.reqInd].RequirementText = ele.innerHTML;
                        let reqHTML = ele.innerHTML;
                        if (reqHTML != '') {
                            this.importMapping[this.secInd].Requirements[this.reqInd].RequirementPlanText = ele.innerHTML.replace(/(<([^>]+)>)/gi, "");
                        } else {
                            this.importMapping[this.secInd].Requirements[this.reqInd].RequirementPlanText = '';
                        }
                        this.importMapping[this.secInd].Requirements[this.reqInd].RequirementIndex = ele.dataset.ind;
                    }
                    else {
                        this.reqInd++;
                        let reqHTML = ele.innerHTML;
                        if (reqHTML != '') {
                            reqHTML = reqHTML.replace(/(<([^>]+)>)/gi, "");
                        }

                        this.importMapping[this.secInd].Requirements.push({
                            RequirementText: ele.innerHTML, RequirementIndex: ele.dataset.ind,
                            RequirementPlanText: reqHTML,
                            ResponseText: "", ResponseIndex: "", IdText: "", IdIndex: "",
                            LimitText: "", LimitIndex: "", ScoreText: "", ScoreIndex: "",
                            StatusText: "", StatusIndex: ""
                        })
                    }
                }
                else if (ele.className.includes("clicked-response")) {
                    if (!this.importMapping[this.secInd]) {
                        this.isError = true;
                        return false;
                    }
                    this.importMapping[this.secInd].Requirements[this.reqInd].ResponseText = ele.innerHTML;
                    this.importMapping[this.secInd].Requirements[this.reqInd].ResponseIndex = ele.dataset.ind;
                }
                else if (ele.className.includes("clicked-id")) {
                    if (!this.importMapping[this.secInd]) {
                        this.isError = true;
                        return false;
                    }
                    var idText = ele.innerHTML;
                    if (idText != '') {
                        idText = idText.replace(/(<([^>]+)>)/gi, "");
                    }
                    this.importMapping[this.secInd].Requirements[this.reqInd].IdText = idText;
                    this.importMapping[this.secInd].Requirements[this.reqInd].IdIndex = ele.dataset.ind;
                }
                else if (ele.className.includes("clicked-limit")) {
                    if (!this.importMapping[this.secInd]) {
                        this.isError = true;
                        return false;
                    }
                    var limitText = ele.innerHTML;
                    if (limitText != '') {
                        limitText = limitText.replace(/(<([^>]+)>)/gi, "");
                    }

                    this.importMapping[this.secInd].Requirements[this.reqInd].LimitText = limitText;
                    this.importMapping[this.secInd].Requirements[this.reqInd].LimitIndex = ele.dataset.ind;
                }
                else if (ele.className.includes("clicked-score")) {
                    if (!this.importMapping[this.secInd]) {
                        this.isError = true;
                        return false;
                    }
                    var scoreText = ele.innerHTML;
                    if (scoreText != '') {
                        scoreText = scoreText.replace(/(<([^>]+)>)/gi, "");
                    }
                    this.importMapping[this.secInd].Requirements[this.reqInd].ScoreText = scoreText;
                    this.importMapping[this.secInd].Requirements[this.reqInd].ScoreIndex = ele.dataset.ind;
                }
                else if (ele.className.includes("clicked-statuse")) {
                    if (!this.importMapping[this.secInd]) {
                        this.isError = true;
                        return false;
                    }
                    var statusText = ele.innerHTML;
                    if (statusText != '') {
                        statusText = statusText.replace(/(<([^>]+)>)/gi, "");
                    }
                    this.importMapping[this.secInd].Requirements[this.reqInd].StatusText = statusText;
                    this.importMapping[this.secInd].Requirements[this.reqInd].StatusIndex = ele.dataset.ind;
                }
                
            });
            if (this.isError) {
                this.showToast('Section is required', 'Section is required for some requirements.');
                this.isLoading = false;
                return false;
            }
            /*for(var sec=0;sec<this.secArr.length;sec++){
                var pLst = this.template.querySelectorAll('p');
                pLst.forEach(pLstEle => {
                    if(pLstEle.dataset.ind >= this.secArr[0]){

                    }
                })
            }*/
            console.log('abc');
            var tblLst = this.template.querySelectorAll('.selected');
            tblLst.forEach(element => {
                var id = 0;
                if (element.children[0].tagName != "TBODY") {
                    id++;
                }
                this.tblArr = {
                    SectionIndex: "",
                    SectionText: "",
                    OpportunityId: this.recordId,
                    BidId: this.bidId,
                    Requirements: [{
                        RequirementText: "", RequirementIndex: "",
                        ResponseText: "", ResponseIndex: "", IdText: "", IdIndex: "",
                        LimitText: "", LimitIndex: "", ScoreText: "", ScoreIndex: "",
                        StatusText: "", StatusIndex: ""
                    }]
                };
                var isAdded = false;
                var trLst = element.children[id].children;
                for (var k = 0; k < trLst.length; k++) {

                    isAdded = false;
                
                    var tdLst = trLst[k].children;
                    var tLength = this.importMapping.length - 1;
                    for (var j = 0; j < tdLst.length; j++) {
                        var className = "";
                        if (tdLst[j].className.length > 0) {
                            if (tdLst[j].className.indexOf("-") != -1) {
                                className = tdLst[j].className.split('-')[1];
                            }
                            else {
                                className = tdLst[j].className;
                            }
                        }
                        if (className === 'clicked') {
                            var sectionText = tdLst[j].innerHTML;
                            if (sectionText != '') {
                                sectionText = sectionText.replace(/(<([^>]+)>)/gi, "");
                            }
                            if(this.sheetExcel){
                                this.tblArr.SectionIndex = this.sheetIndex + "-" + k + "-" + j;
                            }
                            else{
                                this.tblArr.SectionIndex = element.dataset.ind + "-" + k + "-" + j;
                            }
                            
                            this.tblArr.SectionText = sectionText;
                            isAdded = true;
                        }
                        else if (className === 'question') {
                            console.log('this.sheetExcel',this.sheetExcel);
                            console.log('this.sheetIndex',this.sheetIndex);
                            if(this.sheetExcel){
                                this.tblArr.Requirements[0].RequirementIndex = this.sheetIndex + "-" + k + "-" + j;
                            }
                            else{
                                this.tblArr.Requirements[0].RequirementIndex = element.dataset.ind + "-" + k + "-" + j;
                            }
                            
                            this.tblArr.Requirements[0].RequirementText = tdLst[j].innerHTML;
                            if (tdLst[j].innerHTML != '') {
                                this.tblArr.Requirements[0].RequirementPlanText = tdLst[j].innerHTML.replace(/(<([^>]+)>)/gi, "");
                            }
                            isAdded = true;
                        } else if (className === 'response') {
                             if(this.sheetExcel){
                                this.tblArr.Requirements[0].RequirementIndex = this.sheetIndex + "-" + k + "-" + j;
                            }
                            else{
                                this.tblArr.Requirements[0].RequirementIndex = element.dataset.ind + "-" + k + "-" + j;
                            }
                            this.tblArr.Requirements[0].ResponseText = tdLst[j].innerHTML;
                            isAdded = true;
                        } else if (className === 'id') {
                            var idText = tdLst[j].innerHTML;
                            if (idText != '') {
                                idText = idText.replace(/(<([^>]+)>)/gi, "");
                            }
                            if(this.sheetExcel){
                                this.tblArr.Requirements[0].IdIndex = this.sheetIndex + "-" + k + "-" + j;
                            }
                            else{
                                this.tblArr.Requirements[0].IdIndex =element.dataset.ind + "-" + k + "-" + j;
                            }
                            this.tblArr.Requirements[0].IdText = idText;
                            isAdded = true;
                        }
                        else if (className === 'limit') {
                            var limitText = tdLst[j].innerHTML;
                            if (limitText != '') {
                                limitText = limitText.replace(/(<([^>]+)>)/gi, "");
                            }
                            if(this.sheetExcel){
                                this.tblArr.Requirements[0].LimitIndex = this.sheetIndex + "-" + k + "-" + j;
                            }
                            else{
                                this.tblArr.Requirements[0].LimitIndex = element.dataset.ind + "-" + k + "-" + j;
                            }
                            this.tblArr.Requirements[0].LimitText = limitText;
                            isAdded = true;
                        }
                        else if (className === 'score') {
                            var scoreText = tdLst[j].innerHTML;
                            if (scoreText != '') {
                                scoreText = scoreText.replace(/(<([^>]+)>)/gi, "");
                            }
                            if(this.sheetExcel){
                                this.tblArr.Requirements[0].ScoreIndex = this.sheetIndex + "-" + k + "-" + j;
                            }
                            else{
                                this.tblArr.Requirements[0].ScoreIndex = element.dataset.ind + "-" + k + "-" + j;
                            }
                            this.tblArr.Requirements[0].ScoreText = scoreText;
                            isAdded = true;
                        }
                        else if (className === 'status') {
                            var statusText = tdLst[j].innerHTML;
                            if (statusText != '') {
                                statusText = statusText.replace(/(<([^>]+)>)/gi, "");
                            }
                            if(this.sheetExcel){
                                this.tblArr.Requirements[0].StatusIndex = this.sheetIndex + "-" + k + "-" + j;
                            }
                            else{
                                this.tblArr.Requirements[0].StatusIndex = element.dataset.ind + "-" + k + "-" + j;
                            }
                            this.tblArr.Requirements[0].StatusText = statusText;
                            isAdded = true;
                        }
                    }
                    if (this.tblArr.SectionIndex == "" && isAdded == true ) {
                        //this.importMapping[tLength].Requirements.push({
                            this.importMapping[0].Requirements.push({
                            RequirementText: this.tblArr.Requirements[0].RequirementText,
                            RequirementPlanText: this.tblArr.Requirements[0].RequirementPlanText,
                            RequirementIndex: this.tblArr.Requirements[0].RequirementIndex,
                            ResponseText: this.tblArr.Requirements[0].ResponseText,
                            ResponseIndex: this.tblArr.Requirements[0].ResponseIndex,
                            IdText: this.tblArr.Requirements[0].IdText,
                            IdIndex: this.tblArr.Requirements[0].IdIndex,
                            LimitText: this.tblArr.Requirements[0].LimitText,
                            LimitIndex: this.tblArr.Requirements[0].LimitIndex,
                            ScoreText: this.tblArr.Requirements[0].ScoreText,
                            ScoreIndex: this.tblArr.Requirements[0].ScoreIndex,
                            StatusText: this.tblArr.Requirements[0].StatusText,
                            StatusIndex: this.tblArr.Requirements[0].StatusIndex
                        })
                    }
                    else {
                        if (isAdded == true) {
                            this.importMapping.push(this.tblArr);
                            this.tblArr = {
                                SectionIndex: "",
                                SectionText: "",
                                OpportunityId: this.recordId,
                                BidId: this.bidId,
                                Requirements: [{
                                    RequirementText: "", RequirementPlanText: "", RequirementIndex: "",
                                    ResponseText: "", ResponseIndex: "", IdText: "", IdIndex: "",
                                    LimitText: "", LimitIndex: "", ScoreText: "", ScoreIndex: "",
                                    StatusText: "", StatusIndex: ""
                                }]
                            };
                        }
                    }
                }

            });
            this.importMapping.forEach(ele => {
                if (ele.SectionIndex && ele.SectionIndex == '') {
                    this.isError = true;
                    return false;
                }
            });
            if (this.isError) {
                this.showToast('Section is required', 'Section is required for some requirements.');
                this.isLoading = false;
                return false;
            }
            console.log(this.importMapping);
            
            responseCreate({ responses: JSON.stringify(this.importMapping) }).then(result => {
                if (result) {
                    console.log("inserted");
                    //window.location = '/' + this.recordId;
                }
                this.isLoading = false;
            }).catch(error => {
                console.log("err: " + error);
            });
        } catch (Exception) {
            console.log("err: " + Exception);
            this.isLoading = false;
        }
        /*let pClicked = this.template.querySelectorAll("p.clicked");
        //let liClicked = this.template.querySelectorAll("li.clicked");
        let pClickedData = [];
        var currnt = 0;
        var next = 0;
        for(var i = 0; i < pClicked.length; i++){
            if(pClicked[i].innerHTML.trim() != ''){
                pClickedData.push(pClicked[i].innerHTML);
                let cur = parseInt(pClicked[i].dataset.ind);
                let nxt = 0;
                if(i+1 >= pClicked.length){
                    nxt = parseInt(pClicked[i+1].dataset.ind); 
                }
                //for()
            }
            
        }
        pClicked.forEach(ele => {
            
        });
        liClicked.forEach(ele => {
            if(ele.innerHTML.trim() != ''){
                pClickedData.push(ele.innerHTML);
            }
            
        });
        /*createResponse({responses: pClickedData}).then(result => {

        }).catch(error => {

        });*/
        //console.log(pClickedData);
    }
    showToast(title, message) {
        const event = new ShowToastEvent({
            title: title,
            message:
                message,
            variant: "error"
        });
        this.dispatchEvent(event);
    }
    removeSelectedClass(e) {
        jEle = $(e.currentTarget);
        this.classNameList.forEach((className) => {
            jEle.removeClass(className);
        });
    }
    isClassExist(e) {
        const jEleClassList = $(e.currentTarget)[0].className;
        return jEleClassList.includes(this.className);
    }
    classNameList = ['section-clicked', 'clicked', 'clicked-question', 'clicked-response', 'clicked-id', 'clicked-limit', 'clicked-score', 'clicked-status'];
    selectedButton = 'sec';
    className = 'section-clicked';
    clickedSection(e) {
        this.selectedButton = 'sec';
        this.className = 'section-clicked';
        this.removeClass("import-btn", "active");
        e.currentTarget.className += " active";
    }
    clickedQuestion(e) {
        this.selectedButton = 'que';
        this.className = 'clicked-question';
        this.removeClass("import-btn", "active");
        e.currentTarget.className += " active";
    }
    clickedResponse(e) {
        this.selectedButton = 'res';
        this.className = 'clicked-response';
        this.removeClass("import-btn", "active");
        e.currentTarget.className += " active";
    }
    clickedID(e) {
        this.selectedButton = 'id';
        this.className = 'clicked-id';
        this.removeClass("import-btn", "active");
        e.currentTarget.className += " active";
    }
    clickedLimit(e) {
        this.selectedButton = 'lim';
        this.className = 'clicked-limit';
        this.removeClass("import-btn", "active");
        e.currentTarget.className += " active";
    }
    clickedScore(e) {
        this.selectedButton = 'sco';
        this.className = 'clicked-score';
        this.removeClass("import-btn", "active");
        e.currentTarget.className += " active";
    }
    clickedStatus(e) {
        this.selectedButton = 'sta';
        this.className = 'clicked-status';
        this.removeClass("import-btn", "active");
        e.currentTarget.className += " active";
    }
    removeClass(selector, removeClass) {
        var elements = this.template.querySelectorAll('.' + selector);
        if (elements) {
            elements.forEach(element => {
                element.className = element.className.replace(removeClass, '');
            });
        }

    }
    b64toBlob(b64Data, contentType, sliceSize) {
        contentType = contentType || '';
        sliceSize = sliceSize || 512;
        var byteCharacters = atob(b64Data);
        var byteArrays = [];
        for (var offset = 0; offset < byteCharacters.length; offset += sliceSize) {
            var slice = byteCharacters.slice(offset, offset + sliceSize);
            var byteNumbers = new Array(slice.length);
            for (var i = 0; i < slice.length; i++) {
                byteNumbers[i] = slice.charCodeAt(i);
            }
            var byteArray = new Uint8Array(byteNumbers);
            byteArrays.push(byteArray);
        }

        var blob = new Blob(byteArrays, { type: contentType });
        return blob;
    }
    parseWordDocxFile(file) {
        //var files = inputElement.files || [];
        //if (!files.length) return;
        //var file = files[0];
        var result1 = this.template.querySelector('[data-id="file-div"]');// document.getElementById('file-div');
        console.time();
        var reader = new FileReader();
        reader.onloadend = function (event) {
            var arrayBuffer = reader.result;
            // debugger

            mammoth.convertToHtml({ arrayBuffer: arrayBuffer }).then(function (resultObject) {
                //result1.innerHTML = resultObject.value;
                result1.innerHTML = resultObject.value;
                console.log(resultObject.value);
                setTimeout(clickedSomething, 1000);
            })
            console.timeEnd();

            /*mammoth.extractRawText({arrayBuffer: arrayBuffer}).then(function (resultObject) {
              result2.innerHTML = resultObject.value
              console.log(resultObject.value)
            })
      
            mammoth.convertToMarkdown({arrayBuffer: arrayBuffer}).then(function (resultObject) {
              result3.innerHTML = resultObject.value
              console.log(resultObject.value)
            })*/
        };
        reader.readAsArrayBuffer(file);
    }
    handleClick(event) {
        if (event.target.name === 'confirmModal') {

            //when user clicks outside of the dialog area, the event is dispatched with detail value  as 1
            if (event.detail !== 1) {
                //gets the detail message published by the child component
                this.displayMessage = 'Status: ' + event.detail.status + '. Event detail: ' + JSON.stringify(event.detail.originalMessage) + '.';

                //you can do some custom logic here based on your scenario
                if (event.detail.status === 'confirm') {
                    //do something
                    $(this.confirmationFor).addClass(this.className);
                } else if (event.detail.status === 'cancel') {
                    //do something else
                }
            }
            this.confirmationFor = '';
            //hides the component
            this.isDialogVisible = false;
        }
    }

}