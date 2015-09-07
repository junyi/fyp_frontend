import csv, sys, urllib, urllib2, json, re
import traceback
import time

def RateLimited(maxPerSecond):
    minInterval = 1.0 / float(maxPerSecond)
    def decorate(func):
        lastTimeCalled = [0.0]
        def rateLimitedFunction(*args,**kargs):
            elapsed = time.clock() - lastTimeCalled[0]
            leftToWait = minInterval - elapsed
            if leftToWait>0:
                time.sleep(leftToWait)
            ret = func(*args,**kargs)
            lastTimeCalled[0] = time.clock()
            return ret
        return rateLimitedFunction
    return decorate

old_results = dict()
with open('latlng.csv', "rb") as f:
    reader = csv.reader(f)
    header = reader.next()
    for row in reader:
        postcode = row[0]
        key = postcode[0:4]
        old_results[key] = row[1:]

POSTCODE_FILE = 'postcode_all.csv'
DISTRICT_FILE = 'district.csv'
OUT_FILE = 'latlng3.csv'
GOOGLE_URL = 'https://maps.googleapis.com/maps/api/geocode/json?address={0}&region=SG'

district_map = dict()
cached_postcode = dict()
with open(DISTRICT_FILE, "rb") as district_file:
    reader = csv.reader(district_file)
    header = reader.next()
    for row in reader:
        sectors = row[1].split(", ")
        district = row[0]
        for s in sectors:
            district_map[s] = district

@RateLimited(0.5)
def network_call(url):
    response = urllib2.urlopen(url).read()
    return response

def postcode_to_latlng(postcode):
    key = postcode[0:4]
    if key not in cached_postcode and key not in old_results:
        district = district_map[postcode[0:2]]
        try:
            url = GOOGLE_URL.format(urllib.quote(postcode))
            response = network_call(url)

            json_resp = json.loads(response)
            results = json_resp['results']
            if len(results) > 0:
                location = results[0]['geometry']['location']
                lat, lng = location['lat'], location['lng']
                data = [lat, lng, district]
                cached_postcode[key] = data
            else:
                lat, lng = "-1", "-1"
                print "No results for ", postcode
                data = [lat, lng, district]

        except Exception, e:
            print(traceback.format_exc())
    else:
        if key in cached_postcode:
            data = cached_postcode[key]
        else:
            data = old_results[key]

    return data

start_postcode = '437370'
start = False

with open(POSTCODE_FILE, "rb") as postcode_file, open(OUT_FILE, "ab") as out_file:
    reader = csv.reader(postcode_file) # read rows into a dictionary format

    fieldnames = ['postcode', 'lat', 'lng', 'district']
    writer = csv.writer(out_file) # read rows into a dictionary format
    writer.writerow(fieldnames)
    count = 0
    for row in reader: # read a row as {column1: value1, column2: value2,...}
        postcode = row[0]
        print count, postcode
        if postcode == start_postcode:
            start = True
            
        if start:
            data = postcode_to_latlng(postcode)
            writer.writerow([postcode] + data)
        count += 1

