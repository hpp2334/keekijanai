var apiUrl = '/api/keekijanai';
var getLink = (path, query) => apiUrl + '?' + new URLSearchParams(Object.assign(query ?? {}, { __route__: path }));

var $ = (sel) => {
  const result = document.querySelectorAll(sel);
  return result.length === 1 ? result[0] : result;
};