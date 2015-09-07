import json, csv, sys
from shapely.geometry import shape, Point

LATLNG_FILE = 'latlng3.csv'
ZONES_FILE = 'zones_modified.geojson'
SUBZONES_FILE = 'subzones.geojson'
OUT_FILE = 'district_subzones_out.csv'
SUBZONES_OUT_FILE = 'subzones_out.geojson'

with open(ZONES_FILE, 'r') as f:
	zonejs = json.load(f)

szzcd_to_district = dict()

for feature in zonejs['features']:
	code = feature['properties']['SZZCD']
	district = feature['properties']['DISTRICT']
	szzcd_to_district[code] = district

with open(SUBZONES_FILE, 'r') as f:
	js = json.load(f)

cached_postcodes = set()
polygons = dict()
zones = dict()
szzcd = dict()
for feature in js['features']:
	polygon = shape(feature['geometry'])
	code = feature['properties']['DGPSZ_CODE']
	zone_code = feature['properties']['SZZCD']
	polygons[code] = [zone_code, polygon]

with open(LATLNG_FILE, "rb") as f, open(OUT_FILE, "wb") as o:
	reader = csv.reader(f)
	writer = csv.writer(o)
	writer.writerow(['postcode', 'subzone', 'district'])

	header = reader.next()
	for row in reader:
		postcode = row[0]
		district = row[3]
		if postcode not in cached_postcodes:
			cached_postcodes.add(postcode)
			lat, lng = float(row[1]), float(row[2])
			if lat != -1 and lng != -1:
				point = Point(lng, lat)
				for code, data in polygons.iteritems():
					zone_code = data[0]
					polygon = data[1]
					if polygon.contains(point):
						writer.writerow([postcode, code, district])
						zones[code] = district
						szzcd[zone_code] = district

for feature in js['features']:
	code = feature['properties']['DGPSZ_CODE']
	zone_code = feature['properties']['SZZCD']
	if code in zones:
		district = zones[code]
		# if zone_code in szzcd and szzcd[zone_code] != district:
			# feature['properties'].update({"DISTRICT": szzcd[zone_code]})
		# else:
		feature['properties'].update({"DISTRICT": district})
	elif zone_code in szzcd:
		district = szzcd[zone_code]
		feature['properties'].update({"DISTRICT": district})
	elif zone_code in szzcd_to_district:
		district = szzcd_to_district[zone_code]
		feature['properties'].update({"DISTRICT": district})
	else:
		print "Not found for ", code

with open(SUBZONES_OUT_FILE, "w") as f:
	f.write(json.dumps(js))
