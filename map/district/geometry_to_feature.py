import json

with open('district.geojson', 'r') as f:
	js = json.load(f)

with open('district_feature.geojson', 'w') as f:
	all_features = js['features'][0]['geometry']['geometries']

	out_dict = dict()
	out_dict['type'] = 'FeatureCollection'
	new_features = []

	count = 1
	for feature in all_features:
		new_feature = dict()
		new_feature['type'] = 'Feature'

		geometry = dict()
		geometry['type'] = 'MultiPolygon'
		geometry['coordinates'] = [feature['coordinates']]

		new_feature['geometry'] = geometry
		new_feature['properties'] = {"DISTRICT": count}
		count += 1

		new_features.append(new_feature)

	out_dict['features'] = new_features

	f.write(json.dumps(out_dict))