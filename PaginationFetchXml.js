//---------------------------------------------PAGINATION---------------------------------------------
var scriptAlreadyLoaded = false;
var advancedFindElement = null;
var organizationUrl = null;

function calculateCountPaging() {
    var globalContext = Xrm.Utility.getGlobalContext();
    organizationUrl = globalContext.getClientUrl();
    advancedFindElement = document.getElementById("fetchXml").attributes.value.value;
    if (advancedFindElement == null) {
        return;
    }
    var entityName = advancedFindElement.substr(advancedFindElement.indexOf("entity name=") + 13);
    entityName = entityName.substr(0, entityName.indexOf("><attribute") - 1);
    entityName = entityName.replace(/y$/, "ie").replace(/s$/, "se");
    var count = 1;
    var resultTotal = 0;
    var pagingCookies = null;
    advancedFindElement = advancedFindElement.substr(0, advancedFindElement.match("\<attribute.*?\>").index) + `<attribute name="${entityName}id"/>` +
        advancedFindElement.slice(advancedFindElement.match("\<order.*?").index);
    getRecordsPaging(entityName, advancedFindElement, resultTotal, count, pagingCookies);
}

function getRecordsPaging(entityName, advancedFindElement, resultTotal, count, pagingCookies) {
    debugger;
    Xrm.Utility.showProgressIndicator("Counting records...");
    var advancedFindElementToken = advancedFindElement;
    pagingCookies = `page= "${count}" `;
    advancedFindElementToken = advancedFindElement.substr(0, advancedFindElement.indexOf('distinct="false"') + 16) + " " + pagingCookies +
        advancedFindElement.slice(advancedFindElement.indexOf('distinct="false"') + 16);
    var fetchXml = "?fetchXml=" + encodeURIComponent(advancedFindElementToken);
    var url = `${organizationUrl}/api/data/v9.0/${entityName}s${fetchXml}`;
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
                    if (result.value.length == 5000) {
                        resultTotal += result.value.length;
                        getRecordsPaging(entityName, advancedFindElement, resultTotal, ++count, pagingCookies);
                    } else {
                        resultTotal += result.value.length;
                        returnResult(resultTotal);
                    }
                }
            }
        }
    };
    req.send();
}

function calculateCount() {
    var globalContext = Xrm.Utility.getGlobalContext();
    organizationUrl = globalContext.getClientUrl();
    advancedFindElement = document.getElementById("fetchXml").attributes.value.value;
    if (advancedFindElement == null) {
        return;
    }
    var entityName = advancedFindElement.substr(advancedFindElement.indexOf("entity name=") + 13);
    entityName = entityName.substr(0, entityName.indexOf("><attribute") - 1);
    entityName = entityName.replace(/y$/, "ie").replace(/s$/, "se");
    if (advancedFindElement.match("\<filter.*?")) {
        advancedFindElement = `<fetch version="1.0" mapping="logical" aggregate="true">` +
            `<entity name="${entityName}">` +
            `<attribute name="${entityName}id" aggregate="count" alias="count" />` + advancedFindElement.slice(advancedFindElement.match("\<filter.*?").index);
    } else {
        advancedFindElement = `<fetch version="1.0" mapping="logical" aggregate="true">` +
            `<entity name="${entityName}">` +
            `<attribute name="${entityName}id" aggregate="count" alias="count" />` + advancedFindElement.slice(advancedFindElement.match("\</entity.*?").index);
    }
    getRecords(entityName, advancedFindElement);
}


function getRecords(entityName, advancedFindElement) {
    debugger;
    var resultTotal = 0;
    Xrm.Utility.showProgressIndicator("Counting records...");
    var advancedFindElementToken = advancedFindElement;
    advancedFindElementToken = advancedFindElement.substr(0, advancedFindElement.indexOf('aggregate="true"') + 16) + " " +
        advancedFindElement.slice(advancedFindElement.indexOf('aggregate="true"') + 16);
    var fetchXml = "?fetchXml=" + encodeURIComponent(advancedFindElementToken);
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
                    resultTotal += result.value[0].count;
                    returnResult(resultTotal);
                }
            } else {
                calculateCountPaging();
            }
        }
    };
    req.send();
}
function returnResult(resultTotal) {
    Xrm.Utility.closeProgressIndicator();
    var alertStrings = { confirmButtonLabel: "OK", text: `Counting finished.\n  Total records count for requested view : ${resultTotal}` };
    var alertOptions = { height: 160, width: 430 };
    Xrm.Navigation.openAlertDialog(alertStrings, alertOptions);
}