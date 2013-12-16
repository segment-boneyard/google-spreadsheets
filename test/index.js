
var assert = require('assert');
var spreadsheets = require('..');


describe('google-spreadsheets', function () {
  this.timeout(0);

  var username = 'node.sheets.test.100@gmail.com';
  var password = 'helloHELLO123';

  it('should be able to login', function (done) {
    spreadsheets()
      .login(username, password, done);
  });

  it('should be able to open a spreadsheet', function (done) {
    var self = this;
    spreadsheets()
      .login(username, password)
      .key('0ApywX_tWC_56dHFRMWJwZDJMWUNyOGpUNXlyaE9wYmc')
      .open(function (err, spreadsheet) {
        if (err) return done(err);
        assert(spreadsheet);
        self.spreadsheet = spreadsheet;
        done();
      });
  });

  var cells = [
    [1, 1, '1,1'],
    [1, 2, '1,2'],
    [2, 1, '2,1']
  ];

  it('should be able set a cells', function (done) {
    var spreadsheet = this.spreadsheet;
    var worksheets = spreadsheet.worksheets;
    var update = spreadsheet
      .select(worksheets[0].id)
      .update();
    cells.forEach(function (cell) { update.cell(cell[0], cell[1], cell[2]); });
    update.send(done);
  });

  it('should be able get the cells', function (done) {
    var spreadsheet = this.spreadsheet;
    var worksheets = spreadsheet.worksheets;
    var query = spreadsheet
      .select(worksheets[0].id)
      .query();
    cells.forEach(function (cell) { query.cell(cell[0], cell[1]); });
    query.get(function (err, results) {
        if (err) return done(err);
        assert(results.length === cells.length);
        for (var i = 0; i < results.length; i += 1) {
          var got = results[i];
          var expected = cells[i];
          assert(got.value === expected[2]);
        }
        done();
      });
  });
});