public class SummaryController {
    
    @AuraEnabled(continuation = true)    
    public static List<Section__c> getSection(String opportunityId){
         try{
             Set<Id> bidIds = new Set<Id>();
             List<Bid__c> bidList = [Select Id from Bid__c where Opportunity__c =: opportunityId];
             for(Bid__c b:bidList){
                bidIds.add(b.Id);
             }
           	 List<Section__c> sectionList = [Select Id,Name,(Select Id,Status__c,Effort_Level__c,Assign_to__c,Assign_to__r.smallPhotoURL from Requirements__r) from Section__c where Bid__c IN: bidIds ];
             return sectionList;
            
        }catch(Exception e){
            System.debug('Exception'+e);
        }
        return null;
    }
    
	@AuraEnabled(continuation = true)    
    public static Map<String,Integer> getResponseStatus(String opportunityId){
         try{
             Map<String,Integer> statusMap = new Map<String,Integer>();
             Integer In_Review = 0;
             Integer Expired = 0;
             Integer Live = 0;
             Map<Id, Section__c> sectionMap = new Map<Id, Section__c>([Select Id from Section__c where Opportunity__c =: opportunityId ]);
             List<Section__c> sectionList = [Select Id from Section__c where Opportunity__c =: opportunityId ];
             if(!sectionMap.isEmpty()){
                 List<Response_Library__c> responseList = [Select id,Status__c from Response_Library__c where Section__c IN: sectionMap.keySet()];
                 if(responseList != null && responseList.size() > 0){
                     for(Response_Library__c rl : responseList){
                         if(rl.Status__c == 'In Review'){
                             In_Review += 1;
                             statusMap.put(rl.Status__c,In_Review);
                         }
                         else if(rl.Status__c == 'Expired'){
                             In_Review += 1;
                             statusMap.put(rl.Status__c,Expired);
                         }
                         else if(rl.Status__c == 'Live'){
                             In_Review += 1;
                             statusMap.put(rl.Status__c,Live);
                         }
                     }
                     return statusMap;
                 }
                 else{
                     return null;
                 }
             	  
             }
             else{
                 return null;
             }
            
        }catch(Exception e){}
        return null;
    }

    @AuraEnabled(continuation = true)    
    public static List<Linked_Tag__c> getTags(String opportunityId){
         try{
            Set<Id> bidIds = new Set<Id>();
            Set<Id> sectionIds = new Set<Id>();
            Set<Id> requirementIds = new Set<Id>();
            List<Bid__c> bidList = [Select Id from Bid__c where Opportunity__c =: opportunityId];
            for(Bid__c b:bidList){
               bidIds.add(b.Id);
            }
            List<Section__c> sectionList = [Select Id from Section__c  where Bid__c IN: bidIds ];
            for(Section__c s: sectionList){
                sectionIds.add(s.Id);
            }
            List<Requirement__c> requirementList = [Select Id from Requirement__c  where Section__c IN: sectionIds ];
            for(Requirement__c r: requirementList){
                requirementIds.add(r.Id);
            }
            List<Linked_Tag__c> ltList = [Select Id,Linked_Tags__r.Name from Linked_Tag__c  where Linked_Requirement_to_Tags__c IN: requirementIds ];
            return ltList;
         }catch(Exception e){}
        return null;
    }
}