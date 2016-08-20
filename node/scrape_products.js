var exec = require('child_process').exec
var fs = require('fs');
var cheerio = require('cheerio');
var dblite = require('dblite');
var database = dblite('/root/scrape_html/file.sqlite');

var telegram = require('telegram-bot-client');
var client = new telegram('QWERTY');
var chatId = 1234;

var rowList = [];
var rowIndex = 0;
var filePath = '';
var timestamp = Math.floor(new Date() / 1000);

setupDatabase();
startScrape();

function setupDatabase() {
    var create = 'CREATE TABLE IF NOT EXISTS products ' + 
        '(' +
            'sku TEXT, ' +
            'description TEXT, ' +
            'price NUM, ' +
            'time NUM, ' +
            'UNIQUE(sku, description) ' +
            'ON CONFLICT REPLACE' +
        ')';
    database.query(create);
}

function startScrape() {
    var select = 'SELECT * FROM catalog ' +
        'ORDER '
        'LIMIT 10';
    database.query(
        select,
        ['sku', 'time', 'url'],
        function (rows) {
            rows.each(download);
        }
   );
}

function download(row) {
    var row = rowList.shift();
    if (row) {
        var url = row['url'];
	if (-1 === url.indexOf('clearance=true')) {
	    download();
            return;
	}

        filePath = `/tmp/clearance_${row['sku']}.html`;
        var callback = downloadComplete.bind(null, url);
        exec(`bash download.sh "${url}" "${filePath}"`, callback);
    } else {
        database.close();
    }
}

function downloadComplete(url, error, stdout, stderr) {
    var callback = fileReadComplete.bind(null, url);
    fs.readFile(filePath, 'utf-8', callback);
}

function fileReadComplete(url, error, data) {
    $ = cheerio.load(data);
    var detailList = $('table.clearancewrap td');

    if (0 < detailList.length) {
        var imageSource = $('img.ProductDetailImagesBlock-carousel-image').attr('src');
        client.sendPhoto(chatId, imageSource);
    }

    var callback = readDetail.bind(null, url)
    detailList.each(callback);

    download();
}

function readDetail(url, index, detail) {
    var detail = $(detail);
    var description = detail.find('p').first();
    var descriptionText = description.text().replace(/\s\s+/g, ' ').trim();
    var discount = detail.find('.discount_info.textbox');
    var priceText = discount.text().trim().split(' ').pop().trim();
    var skuText = detail.find('input').val();

    var message = descriptionText + '\n';
    message += url + '\n';
    message += priceText;

    client
        .sendMessage(chatId, message)
        .catch(function(err){
            console.log(err);
        });

    var valueList = [
        skuText,
        descriptionText,
        priceText,
        timestamp,
    ];
    database.query('REPLACE INTO products VALUES(?, ?, ?, ?)', valueList);
}
