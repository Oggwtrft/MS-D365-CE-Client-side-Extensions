function setXml(executionContext) {
    if (executionContext.getFormContext().ui) {
        formContext = executionContext.getFormContext();
    }
    var id = getEntityId(formContext);
    var gridContext = formContext.getControl("subgridname");
    var fetchXml ="custom fetch with dynamic value";

    var fetchXmlGrid = 'current fetch of your subgrid';

    var filter = '<filter type="and">' +
        '<filter type="or">' +
        '</filter></filter>';

    fetchXml = "?fetchXml=" + encodeURIComponent(fetchXml);

    Xrm.WebApi.retrieveMultipleRecords("entityname", fetchXml).then(
        function success(entityname) {
            if (entityname != null && entityname.entities != null && entityname.entities.length != 0) {
                for (var i = 0; i < entityname.entities.length; i++) {
                    filter = filter.substr(0, 37) + '<condition attribute="entitynameid" operator="eq" value="' + entityname.entities[i].entitynameid + '" />' + filter.substr(37);
                }
                fetchXmlGrid = fetchXmlGrid.substr(0, fetchXmlGrid.length - 17) + filter + fetchXmlGrid.substr(fetchXmlGrid.length - 17);
                debugger;
                gridContext.setFilterXml(fetchXmlGrid);
                gridContext.removeOnLoad(setXml);
                gridContext.refresh();
            }
            else {
                setEmptySubgrid(gridContext);
                gridContext.removeOnLoad(setXml);
                gridContext.refresh();
                return;
            }
        },
        function error() {

        });
}