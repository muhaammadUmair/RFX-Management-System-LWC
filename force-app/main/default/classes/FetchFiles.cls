public class FetchFiles {
    @AuraEnabled(continuation = true)
    public static List<ContentVersion> getFiles(String recordId){
        if(String.isEmpty(recordId)){
            return null;
        }
        List<ContentDocumentLink> contentDocumentList = [SELECT ContentDocumentId, LinkedEntityId 
                                                            FROM   ContentDocumentLink 
                                                            WHERE  LinkedEntityId =: recordId];
        Set<Id> contentDocumentId = new Set<Id>();
            
        for(ContentDocumentLink cdl : contentDocumentList){
            contentDocumentId.add(cdl.ContentDocumentId);
        }
            
        List<ContentVersion> contentVersionList = [SELECT Id, VersionData, FileType, Title, FileExtension,
                                                    ContentDocument.CreatedBy.Name, ContentDocument.ContentSize,
                                                    CreatedDate, ContentDocumentId, ContentDocument.FileType
                                                    FROM   ContentVersion 
                                                    WHERE  ContentDocumentId IN : contentDocumentId];
        return contentVersionList;                
    }
    
    @AuraEnabled(continuation = true)
    public static List<Bid__c> getBids(String recordId){
        if(String.isEmpty(recordId)){
            return null;
        }
        List<Bid__c> bidList = [SELECT Id, Name, Clarification_Questions_Due__c,Primary_Contact__c, Primary_Contact__r.Name,Status__c 
                             FROM Bid__c WHERE Opportunity__c =: recordId];

        return bidList;                             
    }
}