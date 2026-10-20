import urllib.request
import json
import os
from shapely.geometry import shape, mapping
from shapely.ops import unary_union

print("Fetching 33-district GeoJSON...")
dist_url = "https://raw.githubusercontent.com/datta07/INDIAN-SHAPEFILES/master/STATES/GUJARAT/GUJARAT_DISTRICTS.geojson"
req1 = urllib.request.Request(dist_url, headers={"User-Agent": "Mozilla/5.0"})
with urllib.request.urlopen(req1) as resp:
    dist_data = json.loads(resp.read().decode("utf-8"))

print("Fetching subdistricts GeoJSON to carve Vav-Tharad...")
subdist_url = "https://raw.githubusercontent.com/datta07/INDIAN-SHAPEFILES/master/STATES/GUJARAT/GUJARAT_SUBDISTRICTS.geojson"
req2 = urllib.request.Request(subdist_url, headers={"User-Agent": "Mozilla/5.0"})
with urllib.request.urlopen(req2) as resp:
    subdist_data = json.loads(resp.read().decode("utf-8"))

# Identify Vav-Tharad talukas: Vav, Tharad, Bhabhar
vav_tharad_talukas = ["vav", "tharad", "bhabhar"]
banas_other_geoms = []
vav_tharad_geoms = []

for f in subdist_data["features"]:
    props = f["properties"]
    if "banas" in str(props.get("dtname", "")).lower():
        sdt = str(props.get("sdtname", "")).strip().lower()
        geom = shape(f["geometry"])
        if sdt in vav_tharad_talukas:
            vav_tharad_geoms.append(geom)
        else:
            banas_other_geoms.append(geom)

vav_tharad_union = unary_union(vav_tharad_geoms)
banas_union = unary_union(banas_other_geoms)

NAME_MAP = {
    "Ahmadabad": "Ahmedabad",
    "Chota Udaipur": "Chhota Udaipur",
    "Dohad": "Dahod",
    "Kachchh": "Kutch",
    "Mahesana": "Mehsana",
    "Panch Mahals": "Panchmahal",
    "Sabar Kantha": "Sabarkantha",
    "The Dangs": "Dang",
    "Banas Kantha": "Banaskantha"
}

new_features = []
for f in dist_data["features"]:
    orig_name = f["properties"].get("dtname", "").strip()
    if orig_name == "Banas Kantha":
        continue
    std_name = NAME_MAP.get(orig_name, orig_name)
    geom = shape(f["geometry"]).simplify(0.002, preserve_topology=True)
    rep_pt = geom.representative_point()
    new_features.append({
        "type": "Feature",
        "id": std_name,
        "properties": {
            "district": std_name,
            "name": std_name,
            "lat": round(rep_pt.y, 5),
            "lng": round(rep_pt.x, 5)
        },
        "geometry": mapping(geom)
    })

# Add Banaskantha
bk_geom = banas_union.simplify(0.002, preserve_topology=True)
bk_pt = bk_geom.representative_point()
new_features.append({
    "type": "Feature",
    "id": "Banaskantha",
    "properties": {
        "district": "Banaskantha",
        "name": "Banaskantha",
        "lat": round(bk_pt.y, 5),
        "lng": round(bk_pt.x, 5)
    },
    "geometry": mapping(bk_geom)
})

# Add Vav-Tharad (34th District formed 2 Oct 2025)
vt_geom = vav_tharad_union.simplify(0.002, preserve_topology=True)
vt_pt = vt_geom.representative_point()
new_features.append({
    "type": "Feature",
    "id": "Vav-Tharad",
    "properties": {
        "district": "Vav-Tharad",
        "name": "Vav-Tharad",
        "lat": round(vt_pt.y, 5),
        "lng": round(vt_pt.x, 5)
    },
    "geometry": mapping(vt_geom)
})

new_features.sort(key=lambda x: x["properties"]["district"])

out_geojson = {
    "type": "FeatureCollection",
    "features": new_features
}

out_path = os.path.join("client", "src", "assets", "gujarat_districts_34.json")
with open(out_path, "w", encoding="utf-8") as out_f:
    json.dump(out_geojson, out_f, separators=(",", ":"))

print(f"Generated {len(new_features)} districts into {out_path}!")
size_kb = os.path.getsize(out_path) / 1024
print(f"File size: {size_kb:.2f} KB")
