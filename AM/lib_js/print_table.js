function table2csv(oTable, exportmode, tableElm) {
    var csv = '',
        headers = [],
        rows = [];

    // Get header names
    $(tableElm + ' thead').find('th').each(function () {
        var $th = $(this),
            text = $th.text(),
            header = '"' + text + '"';
        // headers.push(header); // original code
        if (text !== "")
            headers.push(header); // actually datatables seems to copy my original headers so there ist an amount of TH cells which are empty
    });
    csv += headers.join(' \t ') + "\n";

    // get table data

    if (exportmode === "full") { // total data
        var total = oTable.fnSettings().fnRecordsTotal();
        for (i = 0; i < total; i++) {
            var row = oTable.fnGetData(i);
            match_headers(row, headers);
            row = strip_tags(row).replace(/,/g, '\t');
            rows.push(row);
        }
    } else { // visible rows only
        $(tableElm + ' tbody tr:visible').each(function (index) {
            var row = oTable.fnGetData(this);
            match_headers(row, headers);
            row = strip_tags(row).replace(/,/g, '\t');
            rows.push(row);
        });
    }
    csv += rows.join("\n");


    // if a csv div is already open, delete it
    if ($('.csv-data').length)
        $('.csv-data').remove();
    // open a div with a download link
    window.location.href = 'data:application/vnd.ms-excel;charset=UTF-8,'
    + encodeURIComponent(csv);
}

function strip_tags(html) {
    var tmp = document.createElement("div");
    var array = $.map(html, function (value, index) {
        return [value.replace(/,/g, ".").replace(/(\r\n|\n|\r)/gm," ").replace(/\s+/g," ")];
    });
    tmp.innerHTML = array;
    return tmp.textContent || tmp.innerText;
}


function match_headers(row, header) {
    while (row.length > header.length) {
        row.pop();
    }
}
