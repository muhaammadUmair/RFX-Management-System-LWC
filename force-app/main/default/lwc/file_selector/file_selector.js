import { LightningElement, api } from 'lwc';

export default class File_selector extends LightningElement {
    @api recordId;
    isBid = false;
    disabled = 'disabled';
    clickedtype = "importType";
    renderedCallback() {
        if(this.recordId){
            console.log("recordID  : " + this.recordId);
        
            /*if(this.isBid == true){
                this.loadBids()
            }
            else{
            this.loadUploadedFiles()
            }*/
            this.loadUploadedFiles()
        }
    }

    connectedCallback(){
        console.log("recordID  : " + this.recordId);
        
    }
    loadUploadedFiles(){
        this.template.querySelector('c-uploaded_file_selector').getFiles(this.recordId);
    }

    loadBids(){
        this.template.querySelector('c-bid_selector').getBids(this.recordId, this.docId);
    }
    bidId;
    handleClick(e){
        
        var url = 'https://rfxwin-dev-ed.lightning.force.com/lightning/n/Generate_Response?c__recId='+this.recordId+ '&c__fId='+this.docId+'&c__bidId='+this.bidId; // get from processing apex response
        window.open(url, "_blank");
        
        //this.loadUploadedFiles();
    }
    backClicked(e){
        this.isBid = false;
    }
    enableNext(e){
        this.disabled = false;
        this.bidId = e.detail;
        
    }
    disableNext(){
        this.disabled = 'disabled';
        this.bidId = '';
    }
    docId;
    clickedNext(event){
        this.docId = event.detail;
        this.isBid = true;
        setTimeout(function(){
            this.loadBids();
        }.bind(this),1000);
        
        
    }
}