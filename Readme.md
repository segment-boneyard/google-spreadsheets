# Google Spreadsheets

  A nicer Google Spreadsheets API for node.

## Installation

  $ npm install google-spreadsheets

## Examples

### Open Spreadsheet

```js
var spreadsheets = require('google-spreadsheets');

spreadsheets
  .login('username', 'password')
  .key('0AvP3ixW_RotVdHdnWDZvUHhnWWhHQy0xZFViN3hUSmc')
  .open(function (err, spreadsheet) {

  });
```

```js
spreadsheets.open()
  .login('username', 'password')
  .name('Segment.io Users')
  .open(function (err, spreadsheet) {
    
  });
```


### Select Worksheet

```js
var sheet = spreadsheet.select('id');
```

or full example:

```js
spreadsheets
  .login('username', 'password')
  .key('0AvP3ixW_RotVdHdnWDZvUHhnWWhHQy0xZFViN3hUSmc')
  .open(function (err, spreadsheet) {
    var worksheets = spreadsheet.worksheets;
    var worksheet = spreadsheet.select(worksheets[0].id);
  });
```

### Get Cells

```js
worksheet.query()
  .cell(1, 1)
  .cell(1, 2)
  .get(function (err, cells) {
    console.log(cells);
    // [
    //   {row: 1, column: 1, value: 'something'},
    //   {row: 1, column: 2, value: 'something else'}
    // ]
});
```

### Update Rows

```js
worksheet.update()
  .cell(1, 3, 'hello')
  .cell(1, 4, 'hello2')
  .send(function (err) {
    
});
```

## API

### Spreadsheets

#### .login(username, password)

  Adds a client-login authentication password for the Google Spreadsheets service.

#### .key(key)

  Creates an open query for a spreadsheet with `key`.

#### .name(name)

  Creates an open query for a spreadsheet with `name`.

#### .open(callback)

  Executes the spreadsheet open query.

### Spreadsheet

#### .worksheets

  An array of worksheets accessible on the spreadsheet.

#### .select(id)

  Return a worksheet with `id` within the spreadsheet.

#### .query()

  Creates a worksheet `CellQuery`.

#### .update()

  Creates a worksheet `UpdateQuery`.

### CellQuery

#### .cell(row, column)

  Adds a cell to lookup within the `CellQuery`.

#### .get(callback)

  Executes the `CellQuery`.

### UpdateQuery

#### .cell(row, column, val)

  Adds a cell to update to the batch update query.

#### .send(callback)

  Sends the cell update batch query.

## License

```
WWWWWW||WWWWWW
 W W W||W W W
      ||
    ( OO )__________
     /  |           \
    /o o|    MIT     \
    \___/||_||__||_|| *
         || ||  || ||
        _||_|| _||_||
       (__|__|(__|__|
```