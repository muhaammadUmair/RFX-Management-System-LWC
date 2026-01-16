import { LightningElement, api } from 'lwc';
import { NavigationMixin } from 'lightning/navigation';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';
import { loadStyle } from 'lightning/platformResourceLoader';
import popupSize from '@salesforce/resourceUrl/popupSize';
import uploadFile from '@salesforce/apexContinuation/FileUploaderClass.uploadFile'

export default class File_selector_option extends NavigationMixin( LightningElement ) {
    @api type;
    @api recordId;
    fileType = [];
    fileData

    renderedCallback() {
        
        Promise.all([
            loadStyle( this, popupSize )
            ]).then(() => {
                console.log( 'Files loaded' );
            })
            .catch(error => {
                console.log( error.body.message );
        });

    }

    fileTypeManager(){
        this.fileType = [];
        if(this.type == 'word'){
            this.fileType.word = true;
        }else if(this.type == 'excel'){
            this.fileType.excel = true;
        }else if(this.type == 'pdf'){
            this.fileType.pdf = true;
        }
        
    }
    connectedCallback() {
        // show selector based on type
        this.fileTypeManager();
    }

    get acceptedFormats() {
        if(this.type == 'word'){
            return ['.doc','.docx','.docm'];
        }else if(this.type == 'excel'){
            return ['.csv','.xls','.xlsx'];
        }else if(this.type == 'pdf'){
            return ['.pdf', '.xps'];
        }
        
    }

    handleUploadFinished(event) {
        
        var url = 'https://rfxwin-dev-ed.lightning.force.com/lightning/n/Generate_Response?c__recId='+this.recordId+ '&c__fId='+event.detail.files[0].documentId; // get from processing apex response
        /*this[ NavigationMixin.Navigate ]( {
            type: 'standard__navItemPage',
            attributes: {
                apiName: 'Generate_Response'
            },
            state: {
                c__recId: this.docId
            }
        } );*/
        //window.open(url, "_blank");
        /*this[ NavigationMixin.Navigate ]( {
            type: 'standard__navItemPage',
            attributes: {
                apiName: 'Generate_Response'
            },
            state: {
                c__recId: recordId
            }
        } );*/
        /*uploadFile({ base64, filename, recordId }).then(result=>{
            this.fileData = null
            let title = `${filename} uploaded successfully!!`
            this.toast(title)
        })*/
        const custEvent = new CustomEvent(
            'clickednext', {
                detail: event.detail.files[0].documentId 
            });
        this.dispatchEvent(custEvent);
    }
    
    toast(title){
        const toastEvent = new ShowToastEvent({
            title, 
            variant:"success"
        })
        this.dispatchEvent(toastEvent)
    }
}