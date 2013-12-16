
var GoogleClientLogin = require('googleclientlogin').GoogleClientLogin;
var Emitter = require('events').EventEmitter;
var inherit = require('util').inherits;


/**
 * Expose `ClientLogin`.
 */

module.exports = ClientLogin;


/**
 * Create a new ClientLogin.
 *
 * @param {String} username
 * @param {String} password
 */

function ClientLogin (username, password) {
  if (!(this instanceof ClientLogin)) return new ClientLogins(username, password);
  this.username = username;
  this.password = password;
}


/**
 * Inherit from `Emitter`.
 */

inherit(ClientLogin, Emitter);


/**
 * Log into Google Spreadsheets via Client Login.
 *
 * @param {Function} callback
 */

ClientLogin.prototype.login = function (callback) {
  var auth = new GoogleClientLogin({
    email: this.username,
    password: this.password,
    service: 'spreadsheets',
    accountType: GoogleClientLogin.accountTypes.google
  });

  auth.on(GoogleClientLogin.events.error, function(e) {
    callback(new Error('Google Client Login Error: ' + e.message));
  });

  auth.on(GoogleClientLogin.events.login, function() {
    callback(null, { type : 'GoogleLogin', token : auth.getAuthId() });
  });

  auth.login();

  return this;
};