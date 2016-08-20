#!/usr/bin/python
import sqlite3
import time
from subprocess import call

class Database:

    connection = None
    cursor = None
    time = None

    def __init__(self, filename):
        call(["touch", filename])

        self.connection = sqlite3.connect(filename)
        self.cursor = self.connection.cursor()
        self.create()

        self.time = int(time.time());

    def create(self):
        command = """CREATE TABLE IF NOT EXISTS catalog
            (
                sku TEXT,
                url TEXT,
                latest_time NUM,
                previous_time NUM,
                PRIMARY KEY (sku)
                ON CONFLICT REPLACE
            )"""
        self.cursor.execute(command)

    def updateTime(self):
        command = """UPDATE catalog SET previous_time = latest_time"""
        self.cursor.execute(command)
        self.connection.commit()

    def upsertItem(self, sku, url):
        command = """INSERT INTO catalog
            (sku, url, latest_time, previous_time)
            VALUES
            (:sku, :url, :time, (SELECT previous_time FROM catalog WHERE sku = :sku))"""
        self.cursor.execute(command, {"sku": sku, "url": url, "time":self.time})
        self.connection.commit() 

    def getNewUrlList(self):
        select = "SELECT url FROM catalog WHERE previous_time IS NULL"
        self.cursor.execute(select)
        return self.cursor.fetchall()

    def report(self):
        command = """SELECT
            (SELECT COUNT(sku) FROM catalog WHERE previous_time IS NULL)
                AS new_count,
            (SELECT COUNT(sku) FROM catalog WHERE latest_time = (SELECT MAX(latest_time) FROM catalog))
                AS current_count,
            (SELECT COUNT(sku) FROM catalog WHERE latest_time = previous_time)
                AS old_count"""

        self.cursor.execute(command)
        return self.cursor.fetchone()
