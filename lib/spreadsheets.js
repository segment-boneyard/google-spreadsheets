
var Emitter = require('events').EventEmitter;
var inherit = require('util').inherits;
var Spreadsheet = require('./spreadsheet');
var ClientLogin = require('./clientLogin');


/**
 * Expose `Spreadsheets`.
 */

module.exports = Spreadsheets;


/**
 * Creates a Spreadsheets instance.
 */

function Spreadsheets () {
  if (!(this instanceof Spreadsheets)) return new Spreadsheets();
}


/**
 * Inherit from `Emitter`.
 */

inherit(Spreadsheets, Emitter);


/**
 * Logs into Google Spreadsheets service.
 *
 * @param {String} username
 * @param {String} password
 * @param {Function} callback
 */

Spreadsheets.prototype.login = function (username, password, callback) {
  this.username = username;
  this.password = password;

  var self = this;
  var auth = new ClientLogin(username, password);
  auth.login(function (err, res) {
    if (err) {
      self.emit('login error', err);
      if (callback) callback(err);
      return;
    }
    self.token = res.token;
    self.emit('login', self.token);
    if (callback) callback(null, self.token);
  });

  return this;
};


/**
 * Wait for the login to happen.
 *
 * @param {Function} callback
 */

Spreadsheets.prototype.waitForLogin = function (callback) {
  if (!this.password || this.token) return callback();
  this.on('login', function (token) { callback(null, token); });
  this.on('login error', function (err) { callback(err); });
};


/**
 * Create a new spreadsheet instance with the provided `id`.
 *
 * @param {String} id
 * @return {Spreadsheet}
 */

Spreadsheets.prototype.id = function (id) {
  return new Spreadsheet(this).id(id);
};


/**
 * Create a new spreadsheet instance with the provided `key`.
 *
 * @param {String} key
 * @return {Spreadsheet}
 */

Spreadsheets.prototype.key = function (key) {
  return new Spreadsheet(this).key(key);
};


/**
 * Create a new spreadsheet instance with the provided `name`.
 *
 * @param {String} name
 * @return {Spreadsheet}
 */

Spreadsheets.prototype.name = function (name) {
  return new Spreadsheet(this).name(name);
};