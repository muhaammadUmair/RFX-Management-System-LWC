public class OpportunityService {

    public static void createDefaultSection(List<Bid__c> newItems){
        List<Section__c> tenpSectionList = new List<Section__c>();
        Section__c tempSection = new Section__c();
        for (Bid__c bid : newItems) {
            tempSection.bid__c = bid.Id;
            tempSection.Name = 'Default';
            tenpSectionList.add(tempSection);
            tempSection = new Section__c();
        }
        try {
            if(tenpSectionList.size() > 0){
                insert tenpSectionList;
            }
        }catch(Exception ex){
            system.debug('Error on creating default sections: ' + ex.getMessage());
        }
        
	}
    public static void createDefaultBid(Map<Id, Opportunity> newItems){
        List<Bid__c> tempBidList = new List<Bid__c>();
        Bid__c tempBid = new Bid__c();
        for (Opportunity opp : newItems.values()){
            tempBid.Name = 'Default ' + opp.Name;
            tempBid.Opportunity__c = opp.Id;
            tempBidList.add(tempBid);
            tempBid = new Bid__c();
        }
        try {
            if(tempBidList.size() > 0){
                insert tempBidList;
                OpportunityService.createDefaultSection(tempBidList);
            }
        }catch(Exception ex){
            system.debug('Error on creating default bid: ' + ex.getMessage());
        }
	}
    
}