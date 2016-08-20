#!/usr/bin/python
from bs4 import BeautifulSoup
from subprocess import call
from urllib import parse
from urllib.parse import urlparse
from urllib.parse import parse_qs

class CategoryBuilder:

    database = None

    def __init__(self, database):
        self.database = database

    def download(self, index, slower):
        url = 'http://www.store.com/clearance?page=' + str(index)
        filename = '/tmp/clearance_take_' + str(index) + '.html'
        speed = 'slow' if slower else ''
        call(["bash", "download.sh", url, filename, speed])

        return (0 < self.parse(filename))

    def parse(self, filename):
        htmlFile = open(filename, 'r')
        htmlString = htmlFile.read()

        soup = BeautifulSoup(htmlString, 'html.parser')
        linkList = soup.find_all('a', class_='productbox')
        linkCount = 0

        for link in linkList:
            urlTuple = urlparse(link.get('href'))
            href = parse_qs(urlTuple.query).get('u')[0]
            if href.endswith('clearance=true'):
                linkCount += 1
                self.process(href, link)        

        return linkCount

    def process(self, href, link):
        self.database.upsertItem(link.get('data-sku'), href)
