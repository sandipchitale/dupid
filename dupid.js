(function () {
  chrome.devtools.panels.elements.createSidebarPane('Duplicate IDs',
    function (sidebar) {
      sidebar.setPage('dupidsp.html');
      sidebar.setHeight('50em');
    });
})();
