from geopy.geocoders import GoogleV3 as G
import csv, sys, urllib, urllib2, json, re
import traceback

API_KEY = 'AIzaSyC-vbhJl2SFfFQRCIo0LhIkci13u7QaX9k'
CSV_FILE = 'area.csv'
CSV_OUT_FILE = 'area_postcodes.csv'
GOTHERE_LATLNG = "http://gothere.sg/maps/geo?callback=cb&output=json&q={0}%2C+{1}&client=&sensor=false"
GOTHERE_Q = "http://gothere.sg/maps/geo?callback=cb&output=json&q={0}&client=&sensor=false"
POSTCODE_REGEX = re.compile(r'Singapore ([0-9]{6})$')
ADDRESS = 'ADDRESS'
geocoder = G(API_KEY)

with open(CSV_FILE, "rb") as csvfile, open(CSV_OUT_FILE, "wb") as outfile:
    reader = csv.DictReader(csvfile) # read rows into a dictionary format

    fieldnames = list(reader.fieldnames)
    fieldnames.append(ADDRESS)

    writer = csv.DictWriter(outfile, fieldnames=fieldnames) # read rows into a dictionary format
    writer.writeheader()

    for row in reader: # read a row as {column1: value1, column2: value2,...}
        region_name = row["PLN_AREA_N"]
        components = {"country": "SG"}
        try:
            # location = geocoder.geocode(region_name, components=components)

            # latlng = location.raw['geometry']['location']
            # lat, lng = latlng['lat'], latlng['lng']
            print region_name
            url = GOTHERE_Q.format(urllib.quote(region_name))
            response = urllib2.urlopen(url).read()

            left_brace = response.find('{')
            right_brace = response.rfind('}')
            parsed_json = json.loads(response[left_brace: right_brace + 1])
            addresses = parsed_json['Placemark']
            collected_addresses = []
            for a in addresses:
                addr = a['address']
                groups = POSTCODE_REGEX.search(addr).groups()
                if groups is not None:
                    collected_addresses.append(groups[0][0:2])
                    break

            if collected_addresses is None:
                print "Empty for ", region_name

            row[ADDRESS] = ''.join(collected_addresses)
        except Exception, e:
            print(traceback.format_exc())
            row[ADDRESS] = ''
            print "Error for ", region_name

        writer.writerow(row)
        # sys.exit(0)




