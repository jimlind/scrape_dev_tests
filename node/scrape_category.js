var exec = require('child_process').exec;
var fs = require('fs');
var cheerio = require('cheerio');

//var dblite = require('dblite');
//var database = dblite('/root/scrape_html/file.sqlite');

var telegramBotClient = require('telegram-bot-client');
var chat = new telegramBotClient('QWERTY');
var chatId = 1234;

var timestamp = Math.floor(new Date() / 1000);
var index = 1;

var events = require('events');
var eventEmitter = new events.EventEmitter();
eventEmitter.on('download', function(){
    console.log(index);
    download(index);
    index++;
});
eventEmitter.emit('download');

//setupDatabase();

function setupDatabase() {
    var create = 'CREATE TABLE IF NOT EXISTS catalog ' +
        '( ' +
            'sku TEXT, ' +
            'url TEXT, ' +
            'latest_time NUM, ' +
            'previous_time NUM, ' +
            'PRIMARY KEY (sku) ' +
            'ON CONFLICT REPLACE ' +
        ') ';
    database.query(create);

    var update = 'UPDATE catalog SET previous_time = latest_time';
    database.query(update);
}

function download(index) {
    var url = `http://www.store.com/clearance?page=${index}`
    var filePath = `/tmp/clearance_${index}.html`;
    var callback = downloadComplete.bind(null, index, filePath);
    exec(`bash download.sh "${url}" "${filePath}"`, callback);
}

function downloadComplete(index, filePath, error, stdout, stderr) {
    //var callback = readComplete.bind(null, index, filePath);
    //var data = fs.readFileSync(filePath, 'utf-8');
    
   /*
    var fileName = filePath;

    fs.stat(fileName, function (error, stats) {
        fs.open(fileName, "r", function (error, fd) {
            var buffer = new Buffer(stats.size);
            fs.read(fd, buffer, 0, buffer.length, null, function (error, bytesRead, buffer) {
                var data = buffer.toString("utf8", 0, buffer.length);
                console.log(data);
                fs.close(fd);
            });
        });
    });
    */

var fd = fs.openSync(filePath, 'r');
var bufferSize = 1024;
var buffer = new Buffer(bufferSize);

var leftOver = '';
var read, line, idxStart, idx;
while ((read = fs.readSync(fd, buffer, 0, bufferSize, null)) !== 0) {
  leftOver += buffer.toString('utf8', 0, read);
  idxStart = 0
  while ((idx = leftOver.indexOf("\n", idxStart)) !== -1) {
    line = leftOver.substring(idxStart, idx);
    console.log("one line read: " + line);
    idxStart = idx + 1;
  }
  leftOver = leftOver.substring(idxStart);
}


    var now = Math.floor(new Date() / 1000);
    console.log('download complete. minutes: ' +  (now - timestamp) / 60);

    // clear it out?!?!?
    //var data = null;

    //exec(`rm ${filePath}`);
    /*
    var $cheerio = cheerio.load(data);

    var nextAnchor = $cheerio('.js-next-page').first();
    //console.log(nextAnchor.length);
    
    if (nextAnchor.length === 0) {
        report();
    } else {
        eventEmitter.emit('download');
    }   

    var productList = $cheerio('a.productbox');
    productList.each(readProduct);
    */
    var now = Math.floor(new Date() / 1000);
    console.log('reading complete. minutes: ' +  (now - timestamp) / 60);

    eventEmitter.emit('download');

    /*
    var nextAnchor = $('.js-next-page').first();
    if (nextAnchor.length === 0) {
        continueDownloadLoop = false;       
        report();
    }
    */
}

function readProduct(index, product) {
    var upsert = 'INSERT INTO catalog ' +
        '(sku, url, latest_time, previous_time) ' +
        'VALUES ' +
        '( ' +
            '?, ' +
            '?, ' + 
            '?, ' +
            '(SELECT latest_time FROM catalog WHERE sku = ?) ' +
        ') ';

    var valueList = [
        product['attribs']['data-sku'],
        product['attribs']['href'],
        timestamp,
        product['attribs']['data-sku'],
    ];

    //database.query(upsert, valueList);
}

function report() {
    var count = 'SELECT ' +
        '(SELECT  ' +
            'COUNT(sku) FROM catalog ' +
            'WHERE previous_time IS NULL ' +
        ') AS new_count, ' +
        '(SELECT ' +
            'COUNT(sku) FROM catalog ' + 
            'WHERE latest_time = (SELECT MAX(latest_time) FROM catalog) ' +
        ') AS current_count, ' + 
        '(SELECT  ' +
            'COUNT(sku) FROM catalog ' +
            'WHERE latest_time = previous_time ' +
	') AS old_count';

    /*
    database.query(
        count, 
        ['new', 'current', 'old'],
        reportComplete
    );
    */
}

function reportComplete(rows) {
    var row = rows[0];
    var message = 'Category Scrape Complete\n' +
        `We currently have ${row['current']} SKUs after adding ${row['new']} and removing ${row['old']}`;
    chat.sendMessage(chatId, message);

    cleanUp();
}

function cleanUp() {
    var remove = 'DELETE FROM catalog ' +
         'WHERE latest_time = previous_time';
    //database.query(remove, database.close);
    //database.close();
}
