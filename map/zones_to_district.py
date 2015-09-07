import json, csv, sys
from shapely.geometry import shape, Point

LATLNG_FILE = 'latlng.csv'
ZONES_FILE = 'zones.geojson'
OUT_FILE = 'district_out2.csv'
ZONES_OUT_FILE = 'zones_out2.geojson'

with open(ZONES_FILE, 'r') as f:
	js = json.load(f)

cached_postcodes = set()
polygons = dict()
zones = dict()
for feature in js['features']:
	polygon = shape(feature['geometry'])
	code = feature['properties']['SZZCD']
	polygons[code] = polygon

with open(LATLNG_FILE, "rb") as f, open(OUT_FILE, "wb") as o:
	reader = csv.reader(f)
	writer = csv.writer(o)
	writer.writerow(['postcode', 'szzcd', 'district'])

	header = reader.next()
	for row in reader:
		postcode = row[0]
		district = row[3]
		if postcode not in cached_postcodes:
			cached_postcodes.add(postcode)
			lat, lng = float(row[1]), float(row[2])
			if lat != -1 and lng != -1:
				point = Point(lng, lat)
				for code, polygon in polygons.iteritems():
					if polygon.contains(point):
						writer.writerow([postcode, code, district])
						zones[code] = district

for feature in js['features']:
	code = feature['properties']['SZZCD']
	if code in zones:
		district = zones[code]
		feature['properties'].update({"DISTRICT": district})

with open(ZONES_OUT_FILE, "w") as f:
	f.write(json.dumps(js))
