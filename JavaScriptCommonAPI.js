if (typeof (ClientAPI) == "undefined")
   { 
       var executionContext;
       var formContext;
       ClientAPI = {};
    }
   // Create Namespace container for functions in this library;
ClientAPI.Navigation = {
    AlertDialog: function (confirmLabel, textMessage, height = 220, width = 340) {
        var alertStrings = { confirmButtonLabel: confirmLabel, text: textMessage };
        var alertOptions = { height: height, width: width };
        Xrm.Navigation.openAlertDialog(alertStrings, alertOptions);
     },
    ErrorDialog: function(errorText) {
        Xrm.Navigation.openErrorDialog({ message: errorText }).then(
            function success(result) {
               console.log("Dialog closed");
         },
         function (error) {
               console.log(error.message);
         }
        );
     },
    ConfirmDialog: function(confirmationText, title,callbackOnOk, callbackOnCancel, height = 220, width = 340){
        var confirmStrings = { text: confirmationText, title: title };
        var confirmOptions = { height: height, width: width };
        Xrm.Navigation.openConfirmDialog(confirmStrings, confirmOptions).then(
        function (success) {    
            if (success.confirmed){
                console.log("Dialog closed using OK button.");
                callbackOnOk();
            }
            else{
                console.log("Dialog closed using Cancel button or X.");
                callbackOnCancel();
            }
        });
    },

    OpenExistingForm: function(entityName, recordId, successCallback, errorCallback){
        var entityFormOptions = {};
        entityFormOptions["entityName"] = entityName;
        entityFormOptions["entityId"] = recordId;
        // Open the form.
        Xrm.Navigation.openForm(entityFormOptions).then(
            function (success) {
              console.log(success);
              successCallback();
         },
         function (error) {
             console.log(error);
              errorCallback();
         });
    },

    OpenNewForm: function(entityName, formParameters, useQuickCreateForm, successCallback, errorCallback){
        var entityFormOptions = {};
        entityFormOptions["entityName"] = entityName;
     entityFormOptions["useQuickCreateForm"] = useQuickCreateForm;
        // Set default values for the Contact form   
        // var formParameters = {};
        // formParameters["firstname"] = "Sample";
        // formParameters["lastname"] = "Contact";
        // formParameters["fullname"] = "Sample Contact";
        // formParameters["emailaddress1"] = "contact@adventure-works.com";
        // formParameters["jobtitle"] = "Sr. Marketing Manager";
        // formParameters["donotemail"] = "1";
        // formParameters["description"] = "Default values for this record were set programmatically.";
        Xrm.Navigation.openForm(entityFormOptions, formParameters).then(
            function (success) {
             console.log(success);
             successCallback();
         },
         function (error) {
                console.log(error);
               errorCallback();
            });
    }
};

ClientAPI.Client = {
    GetEntityId: function(formContext){
        return formContext.data.entity.getId();
    },
    GetEntityName: function(formContext){
        return formContext.data.entity.getEntityName();
    },
    GetUserId: function(){
        return Xrm.Utility.getGlobalContext().userSettings.userId;
    }
};

ClientAPI.FormAttribures = {
    GetAttribute: function(formContext, attributeName){
        return formContext.getAttribute(attributeName);
    },
    GetControl: function(formContext, attributeName){
        return formContext.getControl(attributeName);
    },
    SetNotification: function(attributeControl, message, notificationLevel, actionCollection, notificationId) {
        ///Notification Level: ERROR or RECOMMENDATION
        return attributeControl.setNotification(
            {
                messages: message,
                notificationLevel: notificationLevel,
                uniqueId: notificationId,
                actions: [actionCollection]
            }
        );
    },
    ClearNotification: function(attributeControl, notificationId){
        return attributeControl.clearNotification(notificationId);
    }
};

ClientAPI.Common = {
    GetNewGuid: function (){
        var guid = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
            var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
             return v.toString(16);
        }).toUpperCase();
        return '{' + guid + '}';
    }
};

ClientAPI.WebAPI = {
    CreateRecord: function(entityName, data, successCallback, errorCallback){
        return Xrm.WebApi.createRecord(entityName, data).then(
            function success(result) {
                successCallback(result);
            },
            function (error) {
                console.log(error.message);
                errorCallback(error.message);
            }
        );
    },
    DeleteRecord: function(entityName, recordId, successCallback, errorCallback){
        return Xrm.WebApi.deleteRecord(entityName, recordId).then(
            function success(result) {
                successCallback(result);
            },
            function (error) {
                console.log(error.message);
                errorCallback(error.message);
            }
        );
    },
    RetrieveMultipleRecords: function(entityName, fetchXml, successCallback, errorCallback){
        fetchXml = "?fetchXml=" + encodeURIComponent(fetchXml);
        return Xrm.WebApi.retrieveMultipleRecords(entityName, fetchXml).then(
            function success(result) {
                successCallback(result);                
            },
            function (error) {
                console.log(error.message);
                errorCallback(error);
            }
        );
    },
    ExecuteRequest: function(organizationUrl, entityName, fetchXml, successCallback){
        var url = `${organizationUrl}/api/data/v8.1/${entityName}s${fetchXml}`;
        var req = new XMLHttpRequest();
        req.open("GET", url, true);
        req.setRequestHeader("Accept", "application/json");
        req.setRequestHeader("Content-Type", "application/json; charset=utf-8");
        req.setRequestHeader("OData-MaxVersion", "4.0");
        req.setRequestHeader("OData-Version", "4.0");
        req.onreadystatechange = function () {
            if (this.readyState == 4) {
                req.onreadystatechange = null;
                if (this.status == 200) {
                    var result = JSON.parse(this.response);
                    if (result.value.length !== 0) {
                       successCallback(result);
                    } else  {
                        errorCallback(result)
                    }
                }
            }
        };
        req.send();
    },
    ExecuteCustomAction: function(formContext, actionName, inputParameters, anotherEntityIdToRun, anotherEntityNameToRun) {
        if (formContext.ui) {
            var notificationId = getNewGuid();
            formContext.ui.setFormNotification("Process started.",
                "INFO",
                notificationId);
        } else {
            Xrm.Utility.showProgressIndicator("Processing...");
        }
        var outputMassage = "";
        var globalContext = Xrm.Utility.getGlobalContext();
        var organizationUrl = globalContext.getClientUrl();
        var entityId;
        var entityName;
        if (anotherEntityIdToRun && anotherEntityNameToRun) {
            entityId = anotherEntityIdToRun.slice(1, -1);
            entityName = anotherEntityNameToRun.replace(/y$/, "ie").replace(/s$/, "se");
        }
        else if (formContext.data) {
            entityId = getEntityId(formContext);
            entityId = entityId.slice(1, -1);
            entityName = getEntityName(formContext);
            entityName = entityName.replace(/y$/, "ie").replace(/s$/, "se");
        }
        else {
            entityId = getUserId();
            entityId = entityId.slice(1, -1);
            entityName = "systemuser";
            entityName = entityName.replace(/y$/, "ie").replace(/s$/, "se");
        }
    
        var data = {};
        if (inputParameters)
            data = inputParameters;
        debugger;
        var query = `${entityName}s(${entityId})/Microsoft.Dynamics.CRM.${actionName}`;
    
    
        var req = new XMLHttpRequest();
        req.open("POST", `${organizationUrl}/api/data/v9.0/${query}`, true);
        req.setRequestHeader("Accept", "application/json");
        req.setRequestHeader("Content-Type", "application/json; charset=utf-8");
        req.setRequestHeader("OData-MaxVersion", "4.0");
        req.setRequestHeader("OData-Version", "4.0");
    
        req.onreadystatechange = function () {
            if (this.readyState == 4) {
                req.onreadystatechange = null;
                if (this.status == 200) {
                    result = JSON.parse(this.response);
                    if (result.ExecutionStatus) {
                        outputMassage = `Process finished.`;
                        this.RunExecutionDialog(formContext, notificationId, outputMassage);
                    } else {
                        outputMassage = `Execution Status: ${result.ExecutionStatus}\nError: ${result.ErrorHandler}`;
                        this.RunExecutionDialog(formContext, notificationId, outputMassage);
                    }
                } else {
                    var error = JSON.parse(this.response).error;
                    outputMassage = `Error while executing Action:\n${error.message}`;
                    this.RunExecutionDialog(formContext, notificationId, outputMassage);
                }
            }
        }
        req.send(window.JSON.stringify(data));
    }, 
    ExecuteWorkflowActivity: function(entityId, WorkflowId, successMessage) {
        var entity = {
            "EntityId": entityId
        };
        var req = new XMLHttpRequest();
	req.open("POST", `${Xrm.Page.context.getClientUrl()}/api/data/v9.0/workflows(${WorkflowId})/Microsoft.Dynamics.CRM.ExecuteWorkflow`, true);
        req.setRequestHeader("OData-MaxVersion", "4.0");
        req.setRequestHeader("OData-Version", "4.0");
        req.setRequestHeader("Accept", "application/json");
        req.setRequestHeader("Content-Type", "application/json; charset=utf-8");
        req.onreadystatechange = function () {
            if (this.readyState === 4) {
                req.onreadystatechange = null;
                if (this.status === 200) {
                    ClientAPI.Navigation.alertDialog("OK", successMessage);
                } else {
                    var error = JSON.parse(this.response).error;
                    ClientAPI.Navigation.ErrorDialog(`Error while executing Workflow:\n${error.message}`);
                }
            }
        };
        req.send(JSON.stringify(entity));
    },
    RunExecutionDialog: function(formContext, notificationId, outputMassage) {
        var dialogExec = new Promise(function (resolve, reject) {
            if (formContext.ui) {
                setTimeout((function () {
                    resolve(formContext.ui.clearFormNotification(notificationId));
                }),
                    2500);
            } else {
                setTimeout((function () {
                    resolve(Xrm.Utility.closeProgressIndicator());
                }),
                    1000);
            }
        });
        dialogExec.then(
            setTimeout(function () {
                if (outputMassage.includes('Error')) {
                    alertDialog("OK", outputMassage);
                    if (!formContext.data) {
                        Xrm.Utility.closeProgressIndicator();
                    }
                } else {
                    if (!formContext.data) {
                        Xrm.Utility.closeProgressIndicator();
                        parent.location.reload(true);
                    } else {
                        alertDialog("OK", outputMassage).then(
                            function success(result) {
                                formContext.data.refresh(true);
                            });
                    }
                }
            }, 500));
    }
}
