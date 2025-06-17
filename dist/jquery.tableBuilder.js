/**
 * jquery-datatable-simply-builder - Dynamically construct tables
 * @date Fri Jun 13 2025 14:29:41 GMT+0800 (CST)
 * @version v1.0.0
 * @author jozhliu@jozhcloud.com
 */
(function($) {
  /**
   * TableBuilder jQuery Plugin with serial number column control
   *
   * @example
   * $('.container').tableBuilder({
   *     dataSet: [...]
   * });
   */
  $.fn.tableBuilder = function(options) {
    // Default settings with style options
    const defaults = {
      title: '',
      thSet: [],
      dataSet: [],
      parameters: {
        page: 1,
        pageSize: 10,
        sort: {}
      },
      loadingPageDataFunName: '',
      serialColText: '#'
    };

    const settings = $.extend(true, {}, defaults, options);

    // Build the table
    const tableHtml = buildTable(settings);

    // Append to each selected element
    return this.each(function() {
      $(this).html(tableHtml);

      bindTableEvents(settings);
    });
  };

  /**
   * Construct table HTML with serial number column control
   */
  function buildTable(settings) {
    const { title, thSet, dataSet, parameters, serialColText } = settings;

    let result = $('<div>');
    if (!isEmpty(title)) {
      $('<div class="table-head">').text(title).appendTo(result);
    }

    // Mini table with resizable support
    let table = $('<table class="table">').attr('width', '100%').appendTo(result);

    // Set table header
    if (isEmpty(thSet) && !isEmpty(dataSet)) {
      Object.entries(dataSet[0]).forEach(([field, value]) => {
        thSet.push({
          text: field,
          field: field,
          resizable: value.length > 500
        });
      });
    }
    let thead = $('<thead>').appendTo(table);
    let headerRow = $('<tr>').appendTo(thead);

    // Add serial number column if enabled
    thSet.unshift({
      width: 50,
      text: serialColText
    });

    // Create header cells with custom classes
    thSet.forEach(th => {
      let thElement = $(`<th${th.resizable ? ' class="resizable"' : ''}${th.width ? ' style="width: ' + th.width + 'px"' : ''}${th.field ? ' data-field=' + th.field : ''}>`)
      .text(th.text);
      if (th.sortable && th.field) {
        let sort_value = parameters.sort[th.field] || '';
        thElement.addClass('csr-pointer').attr('data-sort', sort_value).append(`<span class="sort-icon">
            <svg viewBox="0 0 100 100" class="sort-indicator">
              <polygon points="50,20 90,70 10,70" class="sort-asc"/>
              <polygon points="50,80 90,30 10,30" class="sort-desc"/>
            </svg>
      </span>`);
      }

      if (th.className) {
        thElement.addClass(th.className);
      }

      thElement.appendTo(headerRow);
    });

    // Set table data with row styling
    let tbody = $('<tbody>').appendTo(table);
    if (!isEmpty(dataSet)) {
      let currentNo = (parameters.page - 1) * parameters.pageSize + 1;

      dataSet.forEach((itemInfo, index) => {
        // Apply alternating row classes
        let rowClass = index % 2 === 0 ? 'even-row' : 'odd-row';
        let tr = $('<tr>').addClass(rowClass).appendTo(tbody);

        // Set fields
        thSet.forEach((th, k) => {
          if (k === 0) {
            // Set serial number item with custom class
            $('<td>').text(currentNo).appendTo(tr);
          } else {
            // Get table content (field has higher priority than options)
            if (th.field) {
              let td = $('<td>').text(itemInfo[th.field]);

              // Whether copying is allowed
              if (th.copiable && itemInfo[th.field] && typeof itemInfo[th.field] === 'string') {
                td.addClass('copiable').append(`<span class="copy-icon"><svg viewBox="0 0 24 24" class="copy-indicator">
                  <rect x="7" y="7" width="12" height="12" rx="1" stroke="currentColor" stroke-width="2"/>
                  <path d="M5 15H4C3.44772 15 3 14.5523 3 14V4C3 3.44772 3.44772 3 4 3H14C14.5523 3 15 3.44772 15 4V5" stroke="currentColor" stroke-width="2"/>
              </svg></span>`);
              }

              // Whether to set alignment
              if (th.align) {
                td.css('text-align', th.align || 'center');
              }

              td.appendTo(tr);
            } else if (th.options) {
              $('<td>').html(getLabelHtml(th.options, itemInfo)).appendTo(tr);
            }
          }
        });

        currentNo++;
      });
    } else {
      const colspan = isEmpty(thSet) ? 1 : thSet.length;
      $(`<tr class="no-data"><td colspan="${colspan}">`)
      .text('No Data')
      .appendTo(tbody);
    }

    return result.html();
  }

  /**
   * Bind table events
   */
  function bindTableEvents(settings) {
    // Copy
    $(document)
    .off('click', '.copiable span')
    .on('click', '.copiable span', function () {
      const text = $(this).parent().text().trim();

      let textarea = document.createElement('textarea');
      textarea.value = text;
      document.body.appendChild(textarea);
      textarea.select();

      const successful = document.execCommand('copy');
      document.body.removeChild(textarea);
      if (successful) {
        $('.table td.copiable .copy-indicator').each(function () {
          $(this).removeClass('copied');
        });
        $(this).find('svg').addClass('copied');
        alert('Copied');
      }
    });

    // Sort (desc -> asc -> reset)
    let parameters = settings.parameters;
    const loadingPageDataFunName = settings.loadingPageDataFunName;
    $(document)
    .off('click', 'th[data-sort]')
    .on('click', 'th[data-sort]', function() {
      // Get the current sorting status
      const curr_field = $(this).data('field') || '';
      let curr_sort = $(this).data('sort') || '';

      // Set new status
      if (curr_sort==='desc') {
        curr_sort = 'asc';
      } else if (curr_sort==='asc') {
        curr_sort = '';
      } else {
        curr_sort = 'desc';
      }
      $(this).data('sort', curr_sort);
      parameters.sort[curr_field] = curr_sort;

      // Rebuild the table
      if (!isEmpty(loadingPageDataFunName) && !isEmpty(window[loadingPageDataFunName])) {
        window[loadingPageDataFunName](parameters);
      }
    });
  }

  /**
   * Get label HTML
   */
  function getLabelHtml(options, info) {
    let html = '';

    // Return empty if options are empty
    if (isEmpty(options)) return html;

    let voidElements = ['br', 'hr', 'img', 'input']; // Common self-closing tags

    options.forEach(option => {
      if (!isEmpty(option.label)) {
        // Has label setting
        let label = '';
        label += `<${option.label}`;
        if (!isEmpty(option.attr)) {
          $.each(option.attr, function (name, value) {
            // Replace quotes to prevent truncation
            value = value.replace(/"/g, '&quot;');
            // Replace dynamic fields
            const match = value.match(/__(\w+)__/);
            if (match) {
              const field = match[1];
              const reg = new RegExp('__' + field + '__');
              value = value.replace(reg, info[field]);
            }
            label += ` ${name}="${value}"`;
          });
        }
        if ($.inArray(option.label, voidElements)!==-1) {
          label += ' />';
        } else {
          label += `>${option.text}</${option.label}>`;
        }
        html += label;
      } else {
        html += option.text || ('Configuration error in \'thSet\'：' + JSON.stringify(option));
      }
    });

    return html;
  }

  /**
   * Check if value is empty
   */
  function isEmpty(value) {
    return value === undefined || value === null ||
    (typeof value === 'string' && value.trim() === '') ||
    (Array.isArray(value) && value.length === 0) ||
    (typeof value === 'object' && Object.keys(value).length === 0);
  }
})(jQuery);