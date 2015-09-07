import shapefile
import csv
CSV_FILE = 'area_postcodes.csv'

csvfile = open(CSV_FILE, "rb")
reader = csv.DictReader(csvfile)
r = shapefile.Reader("area.shp")
w = shapefile.Writer()

w.fields = list(r.fields)

w.field("DISTRICT", "N", "2", 0)

fields = r.fields[1:] 
field_names = [field[0] for field in fields] 
objectid_index = field_names.index('OBJECTID')
print "Index: ", objectid_index
# Loop through each record, add a column.  We'll
# insert our sample data but you could also just
# insert a blank string or NULL DATA number
# as a place holder
for rec in r.records():
	row = reader.next()
	if rec[objectid_index] == int(row['OBJECTID']):
		print rec[objectid_index], int(row['OBJECTID']), int(row['DISTRICT'])
		rec.append(int(row['DISTRICT']))
		w.records.append(rec)

# Copy over the geometry without any changes
w._shapes.extend(r.shapes())

# Save as a new shapefile (or write over the old one)
w.save("area2.shp")


# for rec in db:
# 	row = reader.next()
# 	print rec['OBJECTID'], row['OBJECTID']
# 	if rec['OBJECTID'] == row['OBJECTID']:
# 		rec['DISTRICT'] = int(row['DISTRICT'])
# 		rec.store()
csvfile.close()