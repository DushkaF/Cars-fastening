DB = undefined;

window.onload = function () {
  var request = new XMLHttpRequest();

  request.open("GET", "../data/table.xlsx", true);
  request.responseType = "arraybuffer";
  request.onload = function () {
    DB = GetDBFromExcel(new Uint8Array(request.response));
    show_select_list();
  };

  request.send(null);

  console.log(document.getElementsByName("radioForm"));
  document.getElementById("cars").addEventListener("input", calc);
  document.getElementById("way").addEventListener("change", calc);
  document.getElementById("formula").addEventListener("click", calc);
};

function GetDBFromExcel(data) {
  //Read the Excel File data in binary
  var workbook = XLSX.read(data, {
    type: "array",
  });

  console.log(workbook);
  return parse_json_to_DB(to_json(workbook)["Лист1"]);
}

var to_json = function to_json(workbook) {
  var result = {};
  workbook.SheetNames.forEach(function (sheetName) {
    var roa = XLSX.utils.sheet_to_json(workbook.Sheets[sheetName], {
      header: 1,
    });
    if (roa.length) result[sheetName] = roa;
  });
  return result;
};

function parse_json_to_DB(json) {
  var db = {};
  var cur_way = undefined;
  for (var i = 1; i < json.length; i++) {
    if (typeof json[i][0] != "undefined") {
      db[json[i][0]] = { 7: { "№1": {}, "№2": {} }, 8: { "№1": {}, "№2": {} } };
      cur_way = json[i][0];
      console.log(json[i][0]);
    }

    if (typeof json[i][2] != "undefined") {
      db[cur_way][json[i][1]]["№1"][json[i][2]] = Number(json[i][4]);
    }

    if (typeof json[i][3] != "undefined") {
      db[cur_way][json[i][1]]["№2"][json[i][3]] = Number(json[i][4]);
    }
  }
  console.log(db);
  return db;
}

function show_select_list() {
  var select = document.getElementById("way");
  ways = Object.keys(DB);
  for (let i = 0; i < ways.length; i++) {
    select.add(new Option(ways[i], ways[i]));
  }
}

function calc() {
  var way = document.getElementById("way").value;
  var formula = document.getElementsByName("radioForm")[0].checked
    ? "№1"
    : "№2";
  var cars = document.getElementById("cars");
  var axles = document.getElementById("axles");
  var all_count = document.getElementById("all-count");
  var honest_count = document.getElementById("honest-count");
  var odd_count = document.getElementById("odd-count");

  var h_count, o_count, a_count;

  console.log(way == "undefined", formula, cars.value, axles.value);
  if (way != "undefined" && parseInt(cars.value) != NaN) {
    axles.value = parseInt(cars.value) * 4;
    axles_value = parseInt(axles.value);
    

    near_value = [undefined, undefined];
    
    for (let post = 0; post < 2; post++) {
      var axles_points = Object.keys(DB[way][7+post][formula])
      .map(function (x) {
        return parseInt(x, 10);
      })
      axles_points = axles_points.sort(function(a,b){return a-b})

      for (let i = 0; i < axles_points.length; i++) {
        if (axles_points[i] >= axles_value) {
          near_value[post] = axles_points[i];
          break;
        }
      }
    }
    

    console.log("near", near_value);

    o_count = near_value != undefined ? DB[way][7][formula][near_value[0]] : 'err';
    h_count = near_value != undefined ? DB[way][8][formula][near_value[1]] : 'err';
    a_count = near_value != undefined ? o_count + h_count  : 'err';
    console.log(o_count, h_count);
    all_count.value = a_count;
    honest_count.value = h_count;
    odd_count.value = o_count;
  }
}
