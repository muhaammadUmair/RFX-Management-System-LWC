public without sharing class TriggerDispatcher {

    public static void run(TriggerHandler handler, TriggerOperation operation) { 

        // Check to see if the trigger has been disabled. If it has, return
        if (handler.isDisabled()) {
            return;
        }

        // Detect the current trigger context and fire the relevant methods on the trigger handler:
        switch on operation {
            when BEFORE_INSERT {
                handler.beforeInsert(Trigger.new);
            }
            when BEFORE_UPDATE {
                handler.beforeUpdate(Trigger.newMap, Trigger.oldMap);
            }
            when BEFORE_DELETE {
                handler.beforeDelete(Trigger.oldMap);
            }
            when AFTER_INSERT {
                handler.afterInsert(Trigger.newMap);
            }
            when AFTER_UPDATE {
                handler.afterUpdate(Trigger.newMap, Trigger.oldMap);
            }
            when AFTER_DELETE {
                handler.afterDelete(Trigger.oldMap);
            }
            when AFTER_UNDELETE {
                handler.afterUndelete(Trigger.newMap);
            }
        }
    }
}