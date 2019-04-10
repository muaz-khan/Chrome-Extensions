function querySelectorAll(selector, element) {
  element = element || document;
  return Array.prototype.slice.call(element.querySelectorAll(selector));
}

var elements_ids = querySelectorAll('input, select').map(function(item) {
  return item.id;
});

var loading = document.getElementById('loading');

chrome.storage.sync.get(null, function(items) {
  elements_ids.forEach(function(id) {
    if (!items[id]) return;

    var element = document.getElementById(id);
    if (items[id]) {
      if (element.type === 'checkbox') {
        element.checked = items[id] === 'true';
      } else {
        element.value = items[id];
      }
    } else {
      var item = {};
      item[element.id] = element.type === 'checkbox' ?
        (element.checked === true ? 'true' : 'false') :
        element.value;

      try {
        chrome.storage.sync.set(item);
      }
      catch(e) {
        location.reload();
      }
    }
  });
  setTimeout(function() {
    loading.setAttribute('hidden', '');
  }, 600);
});

elements_ids.forEach(function(id) {
  var element = document.getElementById(id);
  element.onchange = function(e) {
    e && e.stopPropagation();
    element.disabled = true;

    loading.querySelector('span').innerHTML = 'Saving changes';
    loading.removeAttribute('hidden');

    var item = {};
    item[element.id] = element.type === 'checkbox' ?
      (element.checked === true ? 'true' : 'false') :
      element.value;

    try {
      chrome.storage.sync.set(item, function() {
        element.disabled = false;
        setTimeout(function() {
          loading.setAttribute('hidden', '');
        }, 600);
      });
    }
    catch(e) {
      location.reload();
    }
  };

  if (element.type) {
    element.parentNode.onclick = function() {
      if (element.type !== 'checkbox') {
        element.focus();
      } else {
        element.checked = !element.checked;
      }
    };

    element.onclick = element.onfocus = function(e) {
      e && e.stopPropagation();
    };
  }

  document.getElementById('done-button').onclick = function(e) {
    e.preventDefault();
    location.href = this.href;
  };
});