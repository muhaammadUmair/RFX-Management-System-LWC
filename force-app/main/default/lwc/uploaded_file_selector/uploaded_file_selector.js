import { LightningElement, track, api } from 'lwc';
import { CloseActionScreenEvent } from 'lightning/actions';
import { NavigationMixin } from 'lightning/navigation';
import fetchFiles from "@salesforce/apexContinuation/FetchFiles.getFiles";

export default class Uploaded_file_selector extends NavigationMixin(LightningElement) {
    @api recordId;
    @api clickedtype;
    @track dataList;
    @track show = false;
    @track selectedFileId;
    @track disabled = true;
    fileCount = 0;
    icon;
    docId;
    renderedCallback() {

    }

    @api getFiles(recordId) {
        console.log("recordId", recordId);
        fetchFiles({
            recordId: recordId
        })
            .then(result => {
                this.fileCount = 'Uploaded Files (' + result.length + ')';
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

    connectedCallback() {
        console.log("Record Id  : " + this.recordId);
        console.log("Clicked From :  " + this.clickedtype);
        if (this.clickedtype == "importType") {
            this.show = true;
        }
        else {
            fetchFiles({
                recordId: this.recordId
            })
                .then(result => {
                    console.log("Uploaded Files: ");
                    console.log(result);

                    this.fileCount = 'Uploaded Files (' + result.length + ')';
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
                }).catch(error => {
                    console.error('**** error **** \n ', error)
                });
        }
    }

    exportOnClick() {
        var url = 'https://rfxwin-dev-ed.my.salesforce.com/apex/Excel_Export?fid='+this.selectedFileId; // get from processing apex response
        window.open(url, "_blank");
    }




    formatBytes(bytes, decimals = 2) {
        if (bytes === 0) return '0 Bytes';

        const k = 1024;
        const dm = decimals < 0 ? 0 : decimals;
        const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];

        const i = Math.floor(Math.log(bytes) / Math.log(k));

        return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
    }
    handleNextClick() {
        var url = 'https://rfxwin-dev-ed.lightning.force.com/lightning/n/Generate_Response?c__recId=' + this.recordId + '&c__fId=' + this.docId; // get from processing apex response
        /*this[ NavigationMixin.Navigate ]( {
            type: 'standard__navItemPage',
            attributes: {
                apiName: 'Generate_Response'
            },
            state: {
                c__recId: this.docId
            }
        } );*/
        //this.dispatchEvent(new CloseActionScreenEvent());
        //window.open(url, "_blank");
        const custEvent = new CustomEvent(
            'clickednext', {
            detail: this.docId
        });
        this.dispatchEvent(custEvent);
    }
    handleRadioClick(event) {
        var e = event.target.value;
        console.log(e);
        this.docId = this.dataList[parseInt(e)].ContentDocumentId;
        this.selectedFileId = event.target.dataset.id;
        console.log("Selected File ID : " + event.target.dataset.id);
        if(!this.selectedFileId){
            this.disabled = true;
        }
        else{
            this.disabled = false;
        }
    }
}