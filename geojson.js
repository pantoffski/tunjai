//resampling province & district geojson
var digits = 3;
var fs = require("fs");
var turf = require("@turf/turf");
var prov = JSON.parse(fs.readFileSync("./geojson/province_.geojson"));
var dist = JSON.parse(fs.readFileSync("./geojson/district_.geojson"));
prov.features.forEach(aProv => {
  var ADM1_PCODE = aProv.properties.ADM1_PCODE;
  var polys = [];
  dist.features
    .filter(v => v.properties.ADM1_PCODE == ADM1_PCODE)
    .map(v => v.geometry.coordinates.map(vv => polys.push(turf.polygon(vv))));
  var res = turf.cleanCoords(turf.union(...polys), true);
  var bbox = turf.bbox(res);
  aProv.properties.w = (bbox[2] - bbox[0]).toFixed(digits);
  var cm = turf.centerOfMass(res).geometry.coordinates;
  cm[0] = cm[0].toFixed(digits);
  cm[1] = cm[1].toFixed(digits);
  aProv.properties.cm = [cm[1], cm[0]];
  aProv.geometry.coordinates =
    res.geometry.coordinates.length == 1 ? [res.geometry.coordinates] : res.geometry.coordinates;
});
// reduce precision
prov.features.forEach(vvv => {
  delete vvv.properties.ADM1_EN;
  vvv.properties.ADM1_PCODE = vvv.properties.ADM1_PCODE.replace("TH", "");
  vvv.geometry.coordinates.forEach(vv =>
    vv[0].forEach(v => {
      v[0] = v[0].toFixed(digits) * 1;
      v[1] = v[1].toFixed(digits) * 1;
    })
  );
});
dist.features.forEach(vvv => {
  delete vvv.properties.ADM1_EN;
  delete vvv.properties.ADM2_EN;
  vvv.properties.ADM1_PCODE = vvv.properties.ADM1_PCODE.replace("TH", "");
  vvv.properties.ADM2_PCODE = vvv.properties.ADM2_PCODE.replace("TH", "");
  var res = turf.polygon(vvv.geometry.coordinates[0]);
  var bbox = turf.bbox(res);
  vvv.properties.w = (bbox[2] - bbox[0]).toFixed(digits);
  var cm = turf.centerOfMass(res).geometry.coordinates;
  cm[0] = cm[0].toFixed(digits);
  cm[1] = cm[1].toFixed(digits);
  vvv.properties.cm = [cm[1], cm[0]];
  vvv.geometry.coordinates.forEach(vv =>
    vv[0].forEach(v => {
      v[0] = v[0].toFixed(digits) * 1;
      v[1] = v[1].toFixed(digits) * 1;
    })
  );
});
fs.writeFileSync("./public/province.geojson", JSON.stringify(prov));
fs.writeFileSync("./public/district.geojson", JSON.stringify(dist));
