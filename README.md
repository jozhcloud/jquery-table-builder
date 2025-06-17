jquery-table-builder
=======================

#### Dependencies
- jQuery
- [jquery-resizable-columns.js](https://github.com/dobtco/jquery-resizable-columns/) Not necessary, only used when resizing column width.
- [jquery-pagination.js](https://github.com/jozhcloud/jquery-pagination/) Not necessary, only used when resizing column width.

#### Simple Usage
  
```
<div id="simple-container"></div>

<script>
  $(function(){
    $("#simple-container").tableBuilder({
      dataSet: [
        {"id": 1, "name": "jozh", "country": "China", "age": 17},
        {"id": 2, "name": "yearly", "country": "China", "age": 18},
      ]
    });
  });
</script>
```

#### Resize Columns
```
<link rel="stylesheet" href="./jquery.resizableColumns.css">

<div id="resiable-container"></div>

<script src="./jquery.resizableColumns.min.js"></script>
<script>
  $(function(){
    let tableContainer = $("#resiable-container");
    tableContainer.tableBuilder({
      thSet: [
        {text: "Name", field: "name", copiable: true},
        {text: "Age", field: "age", sortable: true},
        {text: "Address", field: "address", resizable: true},
      ],
      dataSet: [
        {"id": 1, "name": "jozh", "address": "Country Province City Street Building Floor Room", "age": 17},
        {"id": 2, "name": "yearly", "address": "Country Province City Street Building Floor Room", "age": 18},
      ]
    });

    tableContainer.resizableColumns({
      selector: "th.resizable"
    });
  });
</script>
```

#### Pagination Table
```
<div id="pagination-container"></div>

<script>
  $(function(){
    getDataAsync();
  });

  function getDataAsync(params = {}) {
    params.page = params.page || 1;
    params.pageSize = params.pageSize || 10;
    params.sort = params.sort || {};

    // fetch or ajax
    yourAsyncFunc(url, params, function (d) {
      let tableContainer = $("#pagination-container");

      tableContainer.tableBuilder({
        total: d.data,
        parameters: params,
        loadingPageDataFunName: 'getDataAsync',
      });

      tableContainer.pagination({
        total: d.total,
        parameters: params,
        loadingPageDataFunName: 'getDataAsync',
        position: 'append'
      });
    });
  }
</script>
```
