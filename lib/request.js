// TODO: replace with superagent
var request = require('request');
var url = require('url');
var parser = require('xml2json');
var debug = require('debug')('google-spreadsheets:request');


/**
 * Expose `Request`.
 */

module.exports = Request;


/**
 * Create a new Request instance.
 */

function Request () {
  if (!(this instanceof Request)) return new Request();
  this.protocol = 'https';
  this.options = {};
  this.headers = {
    'Content-Type': 'application/atom+xml',
    'GData-Version': '3.0',
    'If-Match': '*'
  };
}


/**
 * Set the request protocol.
 *
 * @param {String} protocol
 * @return {Request}
 */

Request.prototype.protocol = function (protocol) {
  this.protocol = protocol;
  return this;
};


/**
 * Set a request header.
 *
 * @param {String} header
 * @param {String} val
 * @returns {Request}
 */

Request.prototype.set = function (header, val) {
  this.headers[header] = val;
  return this;
};


/**
 * Set the Google Client Login authorization token in the request headers.
 * @param {String} token
 *
 * @return {Request}
 */

Request.prototype.token = function (token) {
  return this.set('Authorization', 'GoogleLogin auth=' + token);
};


/**
 * Set the spreadsheet `id`.
 *
 * @param {String} id
 * @return {Request}
 */

Request.prototype.spreadsheetId = function (id) {
  this.options.spreadsheetId = id;
  return this;
};


/**
 * Set the worksheet `id`.
 *
 * @param {String} id
 * @return {Request}
 */

Request.prototype.worksheetId = function (id) {
  this.options.worksheetId = id;
  return this;
};



/**
 * Return the base url for Google Spreadsheet requests.
 *
 * @return {String}
 */

Request.prototype.base = function () {
  return this.protocol + '://spreadsheets.google.com';
};


/**
 * Return the cell url for Google Spreadsheet update / query requests.
 *
 * @return {String}
 */

Request.prototype.cell = function () {
  return this.base() + '/feeds/cells/' + this.options.spreadsheetId +
    '/' + this.options.worksheetId + '/private/full';
};



/**
 * Get a list of spreadsheets for this user.
 * @param {Function} callback
 */

Request.prototype.spreadsheets = function (callback) {
  var href =  this.base() + '/feeds/spreadsheets/private/full?alt=json';
  request.get({ url: href, headers: this.headers }, function (err, res, body) {
    if (err) return callback(err);
    var result = JSON.parse(body);
    var entries = (result.feed.entry || []).map(function (entry) {
      var result = {
        name: entry.title.$t,
        id: entry.id.$t.match(/[^\/]+$/)[0]
      };
      var key = null;
      entry.link.forEach(function (link) {
        var parsed = url.parse(link.href, true);
        if (parsed.query.key) key = parsed.query.key;
      });
      if (key) result.key = key;
      return result;
    });
    return callback(null, entries);
  });
  return this;
};


/**
 * Get a spreadsheets worksheet metadata.
 *
 * @param {String} id
 * @param {Function} callback
 */

Request.prototype.worksheets = function (id, callback) {
  var url =  this.base() + '/feeds/worksheets/' + id + '/private/full?alt=json';
  request.get({ url: url, headers: this.headers }, function (err, res, body) {
    if (err) return callback(err);
    var result = JSON.parse(body);
    var sheets = result.feed.entry.map(function (entry) {
      var parsed = {
        updated: new Date(entry.updated.$t),
        name: entry.title.$t,
        id: entry.id.$t.match(/[^\/]+$/)[0],
        rowCount: parseInt(entry.gs$rowCount.$t, 10),
        columnCount: parseInt(entry.gs$colCount.$t, 10)
      };
      return parsed;
    });
    return callback(null, sheets);
  });
  return this;
};


/**
 * Update a spreadsheet.
 *
 * @param {Array|Object} updates
 * @param {Function} callback
 * @return {Request}
 */
Request.prototype.update = function (updates, callback) {
  var body = this.batchBody(this.updateEntries(updates));
  var href = this.cell() + '/batch';
  var req = { url: href, headers: this.headers, body: body };
  request.post(req, function (err, res, body) {
    if (err) return callback(err);
    return callback();
  });
  return this;
};


/**
 * Query a spreadsheet.
 *
 * @param {Array|Object} queries
 * @param {Function} callback
 * @return {Request}
 */
Request.prototype.query = function (queries, callback) {
  var body = this.batchBody(this.queryEntries(queries));
  var href = this.cell() + '/batch?alt=json';
  debug('sending query request of %s chars ..', body.length);
  var req = { url: href, headers: this.headers, body: body };
  request.post(req, function (err, res, body) {
    if (err) return callback(err);
    var json = parser.toJson(body, { object: true });
    var entries = json.feed.entry;
    // Google response for a single cell isn't an array
    if (queries.length === 1) entries = [entries];
    var cells = entries.map(function (entry) {
      var cell = entry['gs:cell'];
      return {
        row: cell.row,
        column: cell.col,
        value: cell.inputValue,
        numeric: cell.numericValue,
        text: cell.$t
      };
    });
    return callback(null, cells);
  });
  return this;
};


/**
 * Render a batch request body with the provided `entries`.
 *
 * @param {String} entries
 * @return {String}
 */

Request.prototype.batchBody = function (entries) {
  return(
    '<feed xmlns="http://www.w3.org/2005/Atom"\n' +
      '  xmlns:batch="http://schemas.google.com/gdata/batch"\n' +
      '  xmlns:gs="http://schemas.google.com/spreadsheets/2006">\n' +
      '<id>' + this.cell() + '</id>\n' +
      entries + '\n' +
      '</feed>\n');
};


/**
 * Generate a query batch string.
 *
 * @param {Array|Object} queries
 * @return {String}
 */

Request.prototype.queryEntries = function (queries) {
  var self = this;
  queries = queries.map(function (query) {
    return self.batchEntry('query', query.row, query.column);
  });
  return queries.join('\n');
};


/**
 * Generate an update batch string.
 *
 * @param {Array|Object} updates
 * @return {String}
 */

Request.prototype.updateEntries = function (updates) {
  var self = this;
  updates = updates.map(function (update) {
    return self.batchEntry('update', update.row, update.column, update.value);
  });
  return updates.join('\n');
};


/**
 * Generate an update batch entry for a cell update.
 *
 * @param {String} operation
 * @param {Number} row
 * @param {Number} column
 * @param {String} value
 * @return {String}
 */

Request.prototype.batchEntry = function (operation, row, column, value) {
  var cell = this.cell();
  return (
    '<entry>\n' +
      '  <batch:id>R' + row + 'C' + column + '</batch:id>\n' +
      '  <batch:operation type="' + operation + '"/>\n' +
      '  <id>' + cell + '/R' + row + 'C' + column + '</id>\n' +
      '  <link rel="edit" type="application/atom+xml"\n' +
      '  href="' + cell + '/R' + row + 'C' + column + '"/>\n' +
      '  <gs:cell row="' + row + '" col="' + column + '" ' + (value ? ('inputValue=\'' + value + '\'') : '') + '/>\n' +
      '</entry>\n');
};
