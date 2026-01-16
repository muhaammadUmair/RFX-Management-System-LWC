public with sharing class ResponseCreateController {
    public ResponseCreateController() {

    }
    @AuraEnabled(Continuation=true)
    public static String create(string responses){
        List<ResponseWrapper> responseList = (List<ResponseWrapper>) System.JSON.deserialize(responses, List<ResponseWrapper>.class);
        system.debug('responses ' + responses);
        system.debug('responseList' + responseList);
        List<Section__c> sectionsList = new List<Section__c>();
        Section__c tempSection;
        List<String> tempSectionListEX = new List<String>();
        List<Requirement__c> requirementsList = new List<Requirement__c>();
        List<Requirement__c> tempReqList;
        Map<String, List<Requirement__c>> requirementsMap = new Map<String, List<Requirement__c>>();
        Requirement__c tempRequirement;
        String oppId = '';
        Id currentUserId = UserInfo.getUserId();
        for(ResponseWrapper response: responseList){
            tempSection = new Section__c();
            tempSection.File_Index__c = response.SectionIndex;
            tempSection.Name = (response.SectionIndex == '-1' ? response.SectionIndex : response.SectionText);
            tempSection.Opportunity__c = response.OpportunityId;
            tempSection.Bid__c = response.BidId;
            tempSection.External_ID__c = tempSection.Name + '-' + response.BidId;
            oppId = response.OpportunityId;
            if (tempSection.File_Index__c != '-1' && !tempSectionListEX.contains(tempSection.External_ID__c)) {
                sectionsList.add(tempSection);
                tempSectionListEX.add(tempSection.External_ID__c);
            }
            tempReqList = requirementsMap.get(tempSection.Name);
            if (tempReqList == null) {
                tempReqList = new List<Requirement__c>();
            }
            for(ResponseWrapper.Requirements req: response.Requirements){
                if( String.isEmpty(req.RequirementText)){
                    continue;
                }
                String status = req.StatusText;
                tempRequirement = new Requirement__c();
                tempRequirement.Requirement__c = req.RequirementText;
                tempRequirement.Requirement_Plan_Text__c = req.RequirementPlanText;
                tempRequirement.Requirement_Index__c = req.RequirementIndex;
                tempRequirement.Response__c = req.ResponseText;
                tempRequirement.Response_Index__c = req.ResponseIndex;
                tempRequirement.Customer_Requirement_ID__c = req.IdText;
                tempRequirement.Customer_Requirement_ID_Index__c = req.IdIndex;
                tempRequirement.Response_Limit__c = req.LimitText;
                tempRequirement.Response_Limit_Index__c = req.LimitIndex;
                tempRequirement.Requirement_Status__c = status;
                tempRequirement.Status_Index__c = req.StatusIndex;
                tempRequirement.Section_Index__c = response.SectionIndex;
                tempRequirement.Assign_to__c = currentUserId;
                tempRequirement.File_ID__c = req.fileID;
                tempReqList.add(tempRequirement);
            }
            //requirementsMap.put(response.SectionIndex, tempReqList);
            requirementsMap.put((response.SectionIndex == '-1' ? response.SectionIndex : response.SectionText), tempReqList);
        }
        system.debug(' requirementsMap.keySet() ' + requirementsMap.keySet());
        try{
            Bid__c tempBidRec = [Select Id, (Select Id FROM Sections__r Where Name = 'Default' LIMIT 1) From Bid__c Where Opportunity__c = : oppId AND Name = 'Default' LIMIT 1];
            if(sectionsList.size() > 0){
                upsert sectionsList External_ID__c;
                String sId;
                for(String keyVal: requirementsMap.keySet()){
                    sId = '';
                    if(keyVal == '-1'){
                        sId = tempBidRec.Sections__r[0].Id;
                    }else{
                        for(Section__c s: sectionsList){
                            if(s.Name == keyVal){
                                sId = s.Id;
                                //break;
                            }
                        }
                    }
                    if(sId == ''){
                        sId = tempBidRec.Sections__r[0].Id;
                    }
                    for(Requirement__c r: requirementsMap.get(keyVal)){
                        r.Section__c = sId;
                        requirementsList.add(r);
                    }
                    
                    //requirementsList.addAll(requirementsMap.get(keyVal));
                }
                if(requirementsList.size() > 0){
                    insert requirementsList;
                    deleteExtraSections(sectionsList);
                }
            }
            System.debug('requirementsList'+requirementsList);
            return 'success';   
        }catch(Exception e){
            return e.getMessage() + ' ' + requirementsList.toString() + ' ' + sectionsList.toString();
        }
    }
    public static void deleteExtraSections(List<Section__c> sectionsList){
        Map<Id, Section__c> secMap = new Map<Id, Section__c>(sectionsList);
        sectionsList = [Select Id, (Select Id, Name From Requirements__r) From Section__c Where Id IN : secMap.keySet()];
        List<Section__c> tempSections = new List<Section__c>();
        system.debug('sectionsList == ' + sectionsList);
        Section__c tempSection = new Section__c();
        for(Section__c s : sectionsList){
            if(s.Requirements__r == null || s.Requirements__r.size() == 0){
                tempSection.Id = s.Id;
                tempSections.add(tempSection);
                tempSection = new Section__c();
            }
        }
        delete tempSections;
    }
    public static List<Section__c> getExistingSections(Set<String> sectionsName, String OppId){
        List<Bid__c> bidsList = new List<Bid__c>();
        try{
            bidsList = [Select Id, Name, (Select Id, Name From Sections__r Where Name IN : sectionsName) From Bid__c Where Opportunity__c =: OppId];
            List<Section__c> tempSections = new List<Section__c>();
            if(bidsList.size() > 0){
                for(bid__c b : bidsList){
                    tempSections.addAll(b.Sections__r);
                }
                return tempSections;
            }else{
                return null;
            }
        }catch(Exception ex){
            return null;
        }
    }

    public static List<Section__c> populateSectionId(List<Section__c> newSections, List<Section__c> oldSections){
        List<Section__c> tempSections = new List<Section__c>();
        Boolean isAdd = false;
        for(Section__c ns : newSections){
            isAdd = false;
            for(Section__c os : oldSections){
                if(ns.Name == os.Name){
                    ns.Id = os.Id;
                    tempSections.add(ns);
                    isAdd = true;
                }
            }
            if(!isAdd){
                tempSections.add(ns);
            }
        }
        return tempSections;
    }
    @AuraEnabled(continuation=true)
    public static List<Response_Library__c> getMatchingResponses(String RID){
        try {
            Requirement__c r = [Select Id, Requirement_Plan_Text__c From Requirement__c where Id =: RID];
            List<Response_Library__c> resLibList = [Select Id, Requirement_Name_Plan_Text__c, Requirement_Name__c, CreatedDate, Response__c From Response_Library__c];
            List<Response_Library__c> tempList = new List<Response_Library__c>();
            For(Response_Library__c rl: resLibList){
                if(!String.isEmpty(rl.Requirement_Name_Plan_Text__c) && rl.Requirement_Name_Plan_Text__c.contains(r.Requirement_Plan_Text__c)){
                    tempList.add(rl);
                } 
            }
            return tempList;
            
        } catch (Exception e) {
            throw new AuraHandledException(e.getMessage());
        }
    }
}