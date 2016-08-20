#!/usr/bin/env python
from lib.category_builder import CategoryBuilder
from lib.product_builder import ProductBuilder
from lib.database import Database
from telegram import Bot

database = Database('/var/local/clearance.sqlite')
database.updateTime()

categoryBuilder = CategoryBuilder(database)
telegramBot = Bot(token='QWERTY')

chatId = 1234
index = 60
slower = False

while True:
    # Try to download
    complete = categoryBuilder.download(index, slower) 

    # Couldn't complete even though slow. Consider things complete.
    if (slower and not complete):
        break

    # Update index and speed
    if (complete):
        # It worked. Incrememnt and continue.
        index += 1
        slower = False
    else:
        # It didn't work. Try it slower.
        slower = True
   
reportData = database.report()

message = 'Scrape Complete!\n'
message += str(reportData[0]) + ' New Products Found\n'
message += str(reportData[1]) + ' Products Avaiable\n'
message += str(reportData[2]) + ' Products Eliglble for Delete'

if message:
    telegramBot.sendMessage(chat_id=chatId, text=message)

productBuilder = ProductBuilder()
for data in database.getNewUrlList():
    url = data[0]
    product = productBuilder.download(url)
    if ('href' in product and product['href']):
    	telegramBot.sendPhoto(chat_id=chatId, photo=product['href'])
    
    message = url + '\n\n'
    for item in product['list']:
        message += item['p'] + ' :: ' + item['d'] + '\n'
 
    if message:
        telegramBot.sendMessage(chat_id=chatId, text=message)
