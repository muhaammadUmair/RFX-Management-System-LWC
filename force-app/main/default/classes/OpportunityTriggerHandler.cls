global without sharing class OpportunityTriggerHandler extends TriggerHandler {

    public static Boolean disabledTrigger;

    /*public override Boolean isDisabled() {
        if (disabledTrigger != null) {
            return disabledTrigger;
        }

        // Consider using Custom Metadata Types if this better suites your case
        Triggers_Settings__c ts = Triggers_Settings__c.getInstance('AccountTrigger');
        if (ts == null) {
            return false;
        }

        return ts.Disabled__c;
    }*/

    global override void beforeInsert(List<SObject> newItems) {
    }

    global override void beforeUpdate(Map<Id, SObject> newItems, Map<Id, SObject> oldItems) {
    }

    global override void afterUpdate(Map<Id, SObject> newItems, Map<Id, SObject> oldItems) {
    }

    global override void afterInsert(Map<Id, SObject> newItems) {
        OpportunityService.createDefaultBid((Map<Id, Opportunity>) newItems);
    }

    global override void afterDelete(Map<Id, SObject> oldItems) {
    }
}