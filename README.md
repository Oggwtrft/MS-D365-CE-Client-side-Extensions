# MS D365 CE Cliet-side Extensions
Extensions for D365 CE v 9.0 

###### JavaScriptCommonAPI.js
Contains basic execution context methods for extending Client-side functionality.
In addition contains workflow and action caller.
  


###### PaginationFetchXml.js
To count or retrieve more than 5k records (50k for counting) we need to use a some kind of workaround.
Using paging cookies we can control the page number count and use it for retrievement of more than 50k records.
  


###### SetCustomFetch.js
In D365 v9.0 there is no way to set or change FetchXml directly from JS or via customizations, but it is possible to set a filter!
**This way is based on WebAPI ID retrievment -- > setting filter by ID on a subgrid.**
