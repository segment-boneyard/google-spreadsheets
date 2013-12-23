
var Emitter = require('events').EventEmitter;
var extend = require('extend');
var inherit = require('util').inherits;
var Query = require('./query');
var Request = require('./request');
var Update = require('./update');

/**
 * Expose `Worksheet`.
 */

module.exports = Worksheet;


/**
 * Create a new `Worksheet` instance.
 *
 * @param {Spreadsheet} spreadsheet
 * @param {Object} worksheet
 */

function Worksheet (spreadsheet, worksheet) {
  this.spreadsheet = spreadsheet;
  extend(this, worksheet);
}


/**
 * Inherit from `Emitter`.
 */

inherit(Worksheet, Emitter);

/**
 * Fetch worksheet metadata.
 *
 * @param {Function} callback
 */

Worksheet.prototype.metadata = function (callback) {
  var self = this;
  var spreadsheet = this.spreadsheet;
  var spreadsheets = spreadsheet.spreadsheets;
  Request()
    .token(spreadsheets.token)
    .worksheets(spreadsheet.id, function (err, worksheets) {
      if (err) {
        if (callback) return callback(err);
        return;
      }
      var worksheet = worksheets.filter(function (worksheet) {
        return worksheet.id === self.id;
      })[0];
      extend(self, worksheet);
      self.emit('metadata', worksheet);
      if (callback) callback(null, worksheet);
  });
  return this;
};

/**
 * Create new worksheet query.
 *
 * @return {WorksheetQuery}
 */

Worksheet.prototype.query = function () {
  return new Query(this);
};

/**
 * Create new worksheet update batch.
 *
 * @return {Update}
 */

Worksheet.prototype.update = function () {
  return new Update(this);
};

