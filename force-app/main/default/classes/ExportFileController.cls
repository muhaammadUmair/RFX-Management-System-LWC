public with sharing class ExportFileController {
    public string fileData {get; set;} 
    public String requirementsList {get; set;} 
    public ExportFileController() {
        String fileID = System.currentPageReference().getParameters().get('fid');
        if( fileID != null ) {
            
        }
        FileWrapper fw = ResponseController.getFileBlob(fileID);//'0697Q000001WBgoQAG');
        fileData = fw.content;
        List<Requirement__c> tempRequirementsList = [Select Id, File_Id__c, Requirement_Index__c, Requirement__c, Response_Index__c, Response__c, Response_Limit_Index__c, Score_Index__c, Status_Index__c from Requirement__c where File_Id__c = '0697Q000001WBgoQAG'];
        requirementsList = JSON.serialize(tempRequirementsList);
    }
}