
var Request = require('./request');


/**
 * Expose `Query`.
 */

module.exports = Query;


/**
 * Create a new `Query` operation on a `worksheet`.
 *
 * @param {Sheet} worksheet
 */

function Query (worksheet) {
  this.worksheet = worksheet;
  this.queries = [];
}


/**
 * Add a query range lookup starting at `row`,`column` and extending for
 * `numRows` and `numColumns`.
 *
 * @param {Number} row
 * @param {Number} column
 * @param {Number} numRows
 * @param {Number} numColumns
 * @return {Query}
 */

Query.prototype.cell =
Query.prototype.range = function (row, column, numRows, numColumns) {
  if (!numRows) numRows = 1;
  if (!numColumns) numColumns = 1;
  for (var x = 0; x < numRows; x += 1) {
    for (var y = 0; y < numColumns; y += 1) {
      var r = row + x;
      var c = column + y;
      this.queries.push({ row: r, column: c });
    }
  }
  return this;
};


/**
 * Run the query operation against the Google Spreadsheet.
 *
 * @param {Function} callback
 * @return {Query}
 */

Query.prototype.get = function (callback) {
  if (!this.queries.length) return process.nextTick(callback);
  var worksheet = this.worksheet;
  var spreadsheet = worksheet.spreadsheet;
  var spreadsheets = spreadsheet.spreadsheets;
  Request()
    .token(spreadsheets.token)
    .spreadsheetId(spreadsheet.id)
    .worksheetId(this.worksheet.id)
    .query(this.queries, callback);
  return this;
};
