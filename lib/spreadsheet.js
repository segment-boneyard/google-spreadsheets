
var extend  = require('extend');
var Emitter = require('events').EventEmitter;
var inherit = require('util').inherits;
var Request = require('./request');
var Worksheet = require('./worksheet');

/**
 * Expose `Spreadsheet`.
 */

module.exports = Spreadsheet;


/**
 * Create a new Spreadsheet.
 *
 * @param {Spreadsheets} spreadsheets
 */

function Spreadsheet (spreadsheets) {
  if (!(this instanceof Spreadsheet)) return new Spreadsheets(spreadsheets);
  this.spreadsheets = spreadsheets;
  this.options = { sheets: [] };
}


/**
 * Inherit from `Emitter`.
 */

inherit(Spreadsheet, Emitter);



/**
 * Set the spreadsheet `id`.
 *
 * @param {String} id
 * @returns {Spreadsheet}
 */

Spreadsheet.prototype.id = function (id) {
  this.options.id = id;
  return this;
};


/**
 * Set the spreadsheet `key`.
 *
 * @param {String} key
 * @returns {Spreadsheet}
 */

Spreadsheet.prototype.key = function (key) {
  this.options.key = key;
  return this;
};


/**
 * Set the spreadsheet `name`.
 *
 * @param {String} name
 * @returns {Spreadsheet}
 */

Spreadsheet.prototype.name = function (name) {
  this.options.name = name;
  return this;
};


/**
 * Select and return a worksheet instance based on its `id`.
 *
 * @param {String} id
 * @returns {Worksheet}
 */

Spreadsheet.prototype.select = function (id) {
  var worksheets = this.worksheets.filter(function (worksheet) {
    return worksheet.id === id;
  });
  if (worksheets.length === 0) return null;
  return new Worksheet(this, worksheets[0]);
};


/**
 * Open the spreadsheet.
 *
 * @param {Function} callback
 * @returns {Spreadsheet}
 */

Spreadsheet.prototype.open = function (callback) {
  var self = this;
  this.spreadsheets.waitForLogin(function (err) {
    if (err) return callback(err);
    Request()
      .token(self.spreadsheets.token)
      .spreadsheets(function (err, entries) {
        if (err) return callback(err);
        entries = entries.filter(function (entry) {
          return entry.id === self.options.id ||
                 entry.name === self.options.name;
        });
        if (entries.length === 0) return callback(null, null);
        var entry = entries[0];
        Request()
          .token(self.spreadsheets.token)
          .worksheets(entry.id, function (err, worksheets) {
            if (err) return callback(err);
            entry.worksheets = worksheets;
            extend(self, entry);
            callback(null, self);
          });
      });
  });
  return this;
};
