
var Request = require('./request');


/**
 * Expose `Update`.
 */

module.exports = Update;


/**
 * Create an update operation on a `worksheet`.
 * @param {Sheet} worksheet
 */

function Update (worksheet) {
  this.worksheet = worksheet;
  this.updates = [];
}


/**
 * Add a batched update to cell `row`/`column` with `value`.
 *
 * @param {Number} row
 * @param {Number} column
 * @param {String} value
 * @return {Update}
 */

Update.prototype.cell = function (row, column, value) {
  if (!value) value = ''; // blank out the value
  this.updates.push({ row: row, column: column, value: value });
  return this;
};


/**
 * Send the batched update command to Google Spreadsheets.
 *
 * @param {Function} callback
 * @return {Update}
 */

Update.prototype.send = function (callback) {
  if (!this.updates.length) return process.nextTick(callback);
  var worksheet = this.worksheet;
  var spreadsheet = worksheet.spreadsheet;
  var spreadsheets = spreadsheet.spreadsheets;
  Request()
    .token(spreadsheets.token)
    .spreadsheetId(spreadsheet.id)
    .worksheetId(this.worksheet.id)
    .update(this.updates, callback);
  return this;
};