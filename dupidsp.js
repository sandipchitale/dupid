(function () {

    const body = document.body;
    const findDuplicateIdsButton = document.getElementById('find-duplicate-ids');
    const clearButton = document.getElementById('clear');
    const duplicateIdsPre = document.getElementById('duplicate-ids');
    const allIdsPre = document.getElementById('all-ids');

    const idsExpression = `
(function () {
    return Array.from(document.querySelectorAll('[id]')).map(e => e.id).sort();
})();
        `;

    function findDuplicateIds() {
        clear();
        body.classList.add('waiting');
        setTimeout(() => {
            body.classList.remove('waiting');
        }, 500);
        chrome.devtools.inspectedWindow.eval(idsExpression, {}, (sortedIdsArray, returnStatus) => {
            if (sortedIdsArray && sortedIdsArray.length) {
                const idCounts = sortedIdsArray.reduce((map, val) => {map[val] = (map[val] || 0)+1; return map}, {} );

                sortedIdsArray = Array.from(new Set(sortedIdsArray));

                sortedIdsArray.forEach(id => {
                    const count = idCounts[id];
                    for (let i = 0; i < count; i++) {
                        let code = document.createElement('code');
                        code.innerHTML = `( ${ordinal_suffix_of(i)} ) <a class="inspect" id-id="${id}" id-ordinal="${i}" title="${id}">&#128269;</a> ${id}${!idCounts[id] ? '' : ' ( ' + idCounts[id] + ' )' }\n`;
                        allIdsPre.appendChild(code);
                    }
                    if (count && count > 1) {
                        const count = idCounts[id];
                        for (let i = 0; i < count; i++) {
                            code = document.createElement('code');
                            code.innerHTML = `( ${ordinal_suffix_of(i)} ) <a class="inspect" id-id="${id}" id-ordinal="${i}" title="${id}">&#128269;</a> ${id} ( ${count} )\n`;
                            duplicateIdsPre.appendChild(code);
                        }
                    }
                });

                let inspectAnchors = document.querySelectorAll('.inspect');
                // Convert buttons NodeList to an array
                let inspectAnchorArray = Array.prototype.slice.call(inspectAnchors);
                inspectAnchorArray.forEach((inspectAnchor) => {
                    inspectAnchor.onclick = inspect.bind(inspectAnchor, inspectAnchor.getAttribute('id-id'), inspectAnchor.getAttribute('id-ordinal'));
                    inspectAnchor.onmouseenter = highlight.bind(inspectAnchor, inspectAnchor.getAttribute('id-id'), inspectAnchor.getAttribute('id-ordinal'));
                    inspectAnchor.onmouseleave = unhighlight.bind(inspectAnchor, inspectAnchor.getAttribute('id-id'), inspectAnchor.getAttribute('id-ordinal'));
                });
            }
        });
    }

    findDuplicateIdsButton.onclick = findDuplicateIds;

    function clear() {
        duplicateIdsPre.innerHTML = '';
        allIdsPre.innerHTML = '';
    }

    clearButton.onclick = clear;

    function highlight(id, ordinal) {
        const inspectExpression = `document.querySelectorAll('#${id}').item(${ordinal}).style.boxShadow = '0 0 20px red';`;
        chrome.devtools.inspectedWindow.eval(inspectExpression, {}, (returnedValue, returnStatus) => {
        });
    }

    function unhighlight(id, ordinal) {
        const inspectExpression = `document.querySelectorAll('#${id}').item(${ordinal}).style.boxShadow = 'inherit';`;
        chrome.devtools.inspectedWindow.eval(inspectExpression, {}, (returnedValue, returnStatus) => {
        });
    }

    function inspect(id, ordinal) {
        const inspectExpression = `inspect(document.querySelectorAll('#${id}').item(${ordinal}))`;
        chrome.devtools.inspectedWindow.eval(inspectExpression, {}, (returnedValue, returnStatus) => {
        });
    }

    function copyToClipboard (text) {
        // Create new element
        var el = document.createElement('textarea');
        // Set value (string to be copied)
        el.value = text;
        // Set non-editable to avoid focus and move outside of view
        el.setAttribute('readonly', '');
        el.style = {position: 'absolute', left: '-9999px'};
        document.body.appendChild(el);
        // Select text inside element
        el.select();
        // Copy text to clipboard
        document.execCommand('copy');
        // Remove temporary element
        document.body.removeChild(el);
    }

    function ordinal_suffix_of(i) {
        var j = i % 10,
            k = i % 100;
        if (j == 1 && k != 11) {
            return (i + 'st').padStart(6);
        }
        if (j == 2 && k != 12) {
            return (i + 'nd').padStart(6);
        }
        if (j == 3 && k != 13) {
            return (i + 'rd').padStart(6);
        }
        return (i + 'th').padStart(6);
    }

    chrome.tabs.onUpdated.addListener((tabId, changeInfo) => {
        if (tabId === chrome.devtools.inspectedWindow.tabId) {
            if (changeInfo.status === 'loading') {
                body.classList.add('waiting');
                clear();
            }
            if (changeInfo.status === 'complete') {
                body.classList.remove('waiting');
                findDuplicateIds();
            }
        }
    });

})();
