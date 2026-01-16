import { LightningElement, api } from 'lwc';
import xlsxSrc from '@salesforce/resourceUrl/xlsx'
import exceljsSrc from '@salesforce/resourceUrl/exceljs'
import getFileBlob from "@salesforce/apexContinuation/ResponseController.getFileBlob";

// import getRequirements from "@salesforce/apexContinuation/ResponseController.getRequirements";
import { loadStyle, loadScript } from 'lightning/platformResourceLoader';

export default class Responses_summary extends LightningElement {
    @api recordId;
    table_elt;
    isExport= false;
    clickedtype = "exportType";
    items = [{ src: "https://nadiazheng.com/wp-content/uploads/2015/12/Montreal-personal-branding-linkedin-profile-professional-headshot-by-nadia-zheng-800x1000.jpg", fallbackIconName: "standard:user", alternativeText: "User avatar" }, { src: "https://linkedinriches.com/wp-content/uploads/2013/12/Nemo-Headshot-2.jpg", fallbackIconName: "standard:user", alternativeText: "User avatar" }, { src: "https://source.unsplash.com/Dj5HnHMtkH0/200x200" }];

    connectedCallback() {

        console.log(this.recordId);
    }
    openResponsePage() {
        window.location = '/lightning/n/Response_Editor?c__recId=' + this.recordId;
    }
    exportData() {
        loadScript(this, exceljsSrc)
            .then(() => {
                getFileBlob({ ContentDocumentId: "0697Q000001WBgoQAG" }).then((result) => {
                    const workbook = new ExcelJS.Workbook();
                    workbook.xlsx.load(result);
                })
            }).catch(error => {
                console.log('Failed to load the JQuery : ' + error);
            });

        // getRequirements({ recordId: this.recordId }).then((result) => {
        //     if (result) {
        //         // Acquire Data (reference to the HTML table)
        //         this.table_elt = new DOMParser().parseFromString(result, "text/xml");
        //         /*loadScript(this, xlsxSrc)
        //             .then(() => {
        //                 // Extract Data (create a workbook object from the table)
        //                 var workbook = XLSX.utils.table_to_book(this.table_elt);

        //                 // Process Data (add a new row)
        //                 var ws = workbook.Sheets["Sheet1"];
        //                 XLSX.utils.sheet_add_aoa(ws, [["Created " + new Date().toISOString()]], { origin: -1 });

        //                 // Package and Release Data (`writeFile` tries to write and save an XLSB file)
        //                 XLSX.writeFile(workbook, "Report.xlsb");
        //             })
        //             .catch(error => {
        //                 console.log('Failed to load the JQuery : ' + error);
        //             });*/
        //     }
        // })
        console.log('this.table_elt ', this.table_elt);
        this.isExport = true;
        console.log(this.isExport);

    }
    closeModal(){
        this.isExport = false;
    }
}