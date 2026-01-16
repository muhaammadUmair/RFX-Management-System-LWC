public with sharing class ResponseController {
    @AuraEnabled(Continuation=true)
    public static FileWrapper getFileBlob(Id ContentDocumentId){
        
        ContentVersion cv = [SELECT VersionData, ContentBodyId, FileType FROM ContentVersion WHERE ContentDocumentId = :ContentDocumentId AND IsLatest = true limit 1];
        // Http h = new Http();
        // HttpRequest req = new HttpRequest();
        // req.setEndpoint(URL.getSalesforceBaseUrl().toExternalForm() + cv.VersionData); //'/services/data/v53.0/sobjects/ContentVersion/0687Q0000006RJmQAM/VersionData');
        // req.setMethod('GET');
        // req.setHeader('Authorization', 'OAuth ' + UserInfo.getSessionId());
        // req.setHeader('Content-Type', 'application/json');
        // //HttpResponse res = h.send(req);
        FileWrapper fw = new FileWrapper();
        fw.content = EncodingUtil.base64Encode(cv.VersionData);
        fw.fileType = cv.FileType; 
        return fw;//res.getBody();
    }
    @AuraEnabled(Continuation=true)
    public static void createResponse(List<String> responses){
        try {
            List<Requirement__c> reqList = new List<Requirement__c>();
            Requirement__c tempReq = new Requirement__c();
            for(String reqStr: responses){
                tempReq = new Requirement__c();
                tempReq.Requirement__c = reqStr;
                reqList.add(tempReq);
            }
            insert reqList;
        } catch (Exception e) {
            throw new AuraHandledException(e.getMessage());
        }
    }
    @AuraEnabled(Continuation=true)
    public static List<Section__c> getResonseSections(ID opportunityId){
        try {
            Map<Id, Bid__c> bidMap = new Map<ID, Bid__c>([Select id, name FROM Bid__c WHERE Opportunity__c =:opportunityId]);
            return [Select Id, Name, (Select Id, Name, Requirement__c, Status__c,Assign_to__c,Assign_to__r.smallPhotoURL, Response__c,Added_to_Library__c from Requirements__r) From Section__c Where bid__c =:bidMap.keySet()];
        } catch (Exception e) {
            throw new AuraHandledException(e.getMessage());
        }
    }
    @AuraEnabled(Continuation=true)
    public static List<Linked_Tag__c> getResponseTags(ID requirementId){
        try {
            return [Select Id, Name, Linked_Tags__r.Id, Linked_Tags__r.Name From Linked_Tag__c Where Linked_Requirement_to_Tags__c =:requirementId];
        } catch (Exception e) {
            throw new AuraHandledException(e.getMessage());
        }
    }
    @AuraEnabled(Continuation=true)
    public static string assignBulkUserToRequirements(String ids, String UserId){
        List<String> idsList = ids.split(', ');
        List<Requirement__c> reqlst = new List<Requirement__c>();
        Requirement__c tempReq;
        for(string rid: idsList){
            if(rid != ''){
                tempReq = new Requirement__c();
                tempReq.Id = rid;
                tempReq.OwnerId = UserId;
                tempReq.Assign_to__c = UserId;
                reqlst.add(tempReq);
            }
            
        }
        try{
            if(reqlst.size() > 0){
                update reqlst;
            }        
            return 'success';
        }catch(Exception e){
            return e.getMessage();
        }
        
    }
    @AuraEnabled(Continuation=true)
    public static string saveResponseTags(ID tagId, ID requirementId){
        try {
            Linked_Tag__c tags = new Linked_Tag__c();
            tags.Linked_Tags__c = tagId;
            tags.Linked_Requirement_to_Tags__c = requirementId;
            insert tags;
            return 'success';
        } catch (Exception e) {
            //throw new AuraHandledException(e.getMessage());
            return e.getMessage();
        }
    }
    @AuraEnabled(Continuation=true)
    public static string deleteResponseTags(ID tagId){
        try {
            List<Linked_Tag__c> tagList = 
            [Select Id From Linked_Tag__c Where Id =:tagId];
            delete tagList;
            return 'success';
        } catch (Exception e) {
            //throw new AuraHandledException(e.getMessage());
            return e.getMessage();
        }
    }
    
    @AuraEnabled(Continuation=true)
    public static List<Library__c> getLibraryData(){
        try {
            return [Select Description__c, Name From Library__c];
        } catch (Exception e) {
            throw new AuraHandledException(e.getMessage());
        }
    }
    @AuraEnabled(Continuation=true)
    public static List<Response_Library__c> getResponseLibrary(){
        try {
            return [Select Requirement__c, Requirement_Name__c From Response_Library__c];
        } catch (Exception e) {
            throw new AuraHandledException(e.getMessage());
        }
    }
    @AuraEnabled(Continuation=true)
    public static string addOrRemoveToLib(ID sectionId,ID reqId, Boolean ischecked, string RequirementName,string tags){
        try {
            string result = '';
            if(ischecked){
                Requirement__c r = [Select id, Requirement_Plan_Text__c, Response__c, Added_to_Library__c FROM Requirement__c Where Id =:reqId];
                Response_Library__c lib = new Response_Library__c();
                lib.Section__c = sectionId;
                lib.Requirement__c = reqId;
                lib.Requirement_Name__c = RequirementName;
                lib.Requirement_Name_Plan_Text__c = r.Requirement_Plan_Text__c;
                lib.Response__c = r.Response__c;
                lib.Tags__c = tags;
                
                insert lib;
                result = 'inserted checked';

                r.Added_to_Library__c = true;
                update r;
                result = 'updated checked';
            }
            else{
                List<Response_Library__c> libList =
                [Select Id From Response_Library__c Where Requirement__c =:reqId];
                delete libList;
                
                result = 'deleted';
                Requirement__c r = [Select id, Requirement_Plan_Text__c, Response__c, Added_to_Library__c FROM Requirement__c Where Id =:reqId];
                r.Added_to_Library__c = false;
                update r;
                result = 'updated';
            }
            return result;
        } catch (Exception e) {
            //throw new AuraHandledException(e.getMessage());
            return e.getMessage();
        }
    }

    @AuraEnabled(Continuation=true)
    public static string isInLibrary(ID requirementId){
        try{
            integer result = [Select COUNT() From Response_Library__c Where Requirement__c =:requirementId];
            return String.valueOf(result);
        }catch(Exception e){
            return 'error: ' + e.getMessage();
        }
    }
    @AuraEnabled(Continuation=true)
    public static List<Linked_tag__c> createTag(String tagText, String ResponsID){
        try{
            List<String> tagsNameList = new List<String>();
            List<Tag__c> tagsList = new List<Tag__c>(); 
            List<Tag__c> oldTagsList = new List<Tag__c>(); 
            if(tagText.contains(',')){
                tagsNameList = ResponseController.getNewTagList(tagText);
                oldTagsList = [Select Id, Name From Tag__c Where Name IN :tagText.split(',')];
            }else {
                tagsNameList.add(tagText);
            }
            Tag__c tag = new Tag__c();
            for (String s : tagsNameList){
                tag.Name = s;
                tagsList.add(tag);
                tag = new Tag__c();
            }
            system.debug('tagsList'+tagsList);
            insert tagsList;
            if(oldTagsList != null && oldTagsList.size() > 0){
                tagsList.addAll(oldTagsList);
            }
            List<Linked_tag__c> lTagList = new List<Linked_tag__c>();
            Linked_tag__c lTag = new Linked_tag__c();
            for (Tag__c t : tagsList){
                lTag.Linked_Tags__c = t.Id;
                lTag.Linked_Requirement_to_Tags__c = ResponsID;
                lTagList.add(lTag);
                lTag = new Linked_tag__c();
            }
            system.debug('lTagList'+lTagList);
            insert lTagList;
            return lTagList;
        }catch(exception e){
            return null;
            //system.debug(e.getMessage());
        }
        
    }
    public static List<String> getNewTagList(String tagText){
        List<String> tagStrList = tagText.split(',');
        List<String> tempList = new List<String>();
        List<Tag__c> tagsList = new List<Tag__c>();
        List<String> newTagsList = new List<String>();
        tagsList = [Select Id, Name From Tag__c Where Name IN :tagStrList];
        if(tagsList != null && tagsList.size() > 0){
            for (Tag__c t : tagsList) {
                tempList.add(t.Name);
            }
            for (String s : tagStrList) {
                if(!tempList.contains(s)){
                    newTagsList.add(s);        
                }
            }
            return newTagsList;
        }else {
            return tagStrList;
        }
        
    }
}