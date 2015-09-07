import csv, sys, urllib, urllib2, json, re
import traceback
import time

POSTCODE_FILE = 'postcode_all.csv'
DISTRICT_FILE = 'district.csv'

district_map = dict()
district_ok = dict()
with open(DISTRICT_FILE, "rb") as district_file:
    reader = csv.reader(district_file)
    header = reader.next()
    for row in reader:
        sectors = row[1].split(", ")
        district = row[0]
        district_ok[district] = False
        for s in sectors:
            district_map[s] = district

with open(POSTCODE_FILE, "rb") as postcode_file:
    reader = csv.reader(postcode_file) # read rows into a dictionary format
    for row in reader: # read a row as {column1: value1, column2: value2,...}
        postcode = row[0]
        key = postcode[0:2]
        if key in district_map:
            district_ok[district_map[key]] = True

for k, v in district_ok.items():
    if not v:
        print k


