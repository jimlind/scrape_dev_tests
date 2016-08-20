#!/usr/bin/python
from bs4 import BeautifulSoup
from subprocess import call

import re
import time

from urllib import parse
from urllib.parse import urlparse
from urllib.parse import parse_qs

class ProductBuilder:

    def download(self, url):
        filename = '/tmp/clearance_product_' + str(int(time.time())) + '.html'
        call(["bash", "download.sh", url, filename, 'slow'])

        return self.parse(filename)

    def parse(self, filename):
        returnData = {}

        htmlFile = open(filename, 'r')
        htmlString = htmlFile.read()

        soup = BeautifulSoup(htmlString, 'html.parser')
        image = soup.select('img.ProductDetailImagesBlock-carousel-image');

        href = ''
        if 1 <= len(image):
            src = image[0]['src'];
            href = parse_qs(urlparse(src).query).get('u')[0]
        
        returnData['href'] = href

        productList = []
        for cell in soup.select('table.clearancewrap td'):
            description = cell.select('p.emphasis')[0].get_text().strip()
            descriptionClean = ' '.join(description.split())

            price = cell.select('div.discount_info.textbox')[0].get_text().strip()
            priceClean = price.split().pop()
	
            returnProduct = {}
            returnProduct['d'] = descriptionClean
            returnProduct['p'] = priceClean
            productList.append(returnProduct)

        returnData['list'] = productList
        
        return returnData
