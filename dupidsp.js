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

                sortedIdsArray.forEach(id => {
                    let code = document.createElement('code');
                    code.innerHTML = `<a class="inspect" title="${id}">&#128269;</a> ${id}${1 === idCounts[id] ? '' : ' ( ' + idCounts[id] + ' )' }\n`;
                    allIdsPre.appendChild(code);
                    if (idCounts[id] && idCounts[id] > 1) {
                        code = document.createElement('code');
                        code.innerHTML = `<a class="inspect" title="${id}">&#128269;</a> ${id}\n`;
                        duplicateIdsPre.appendChild(code);
                    }
                });

                let inspectAnchors = document.querySelectorAll('.inspect');
                // Convert buttons NodeList to an array
                let inspectAnchorArray = Array.prototype.slice.call(inspectAnchors);
                inspectAnchorArray.forEach((inspectAnchor) => {
                    inspectAnchor.onclick = inspect.bind(inspectAnchor, inspectAnchor.getAttribute('title'));
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

    function inspect(target) {
        const inspectExpression = `inspect(document.querySelector('#${target}'))`;
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
