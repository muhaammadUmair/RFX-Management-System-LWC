public virtual without sharing class TriggerHandler {

    public virtual void beforeInsert(List<SObject> newItems) {
    }

    public virtual void beforeUpdate(Map<Id, SObject> newItems, Map<Id, SObject> oldItems) {
    }

    public virtual void beforeDelete(Map<Id, SObject> oldItems) {
    }

    public virtual void afterInsert(Map<Id, SObject> newItems) {
    }

    public virtual void afterUpdate(Map<Id, SObject> newItems, Map<Id, SObject> oldItems) {
    }

    public virtual void afterDelete(Map<Id, SObject> oldItems) {
    }

    public virtual void afterUndelete(Map<Id, SObject> oldItems) {
    }

    public virtual Boolean isDisabled() {
        return false;
    }
}