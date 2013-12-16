
var extend = require('extend');
var Emitter = require('events').EventEmitter;
var inherit = require('util').inherits;
var Query = require('./query');
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



Worksheet.prototype.query = function () {
  return new Query(this);
};


Worksheet.prototype.update = function () {
  return new Update(this);
};

