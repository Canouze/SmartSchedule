var grpc = require("@grpc/grpc-js")
var protoLoader = require("@grpc/proto-loader")
var PROTO_PATH = __dirname + "/protos/employee.proto"
var packageDefinition = protoLoader.loadSync(PROTO_PATH)
var employee_proto = grpc.loadPackageDefinition(packageDefinition).SmartSchedule;

var mysql = require('mysql');

var con = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "password",
  database: "smart_schedule_db"
});

let employee_list = [];

con.connect(function(err) {
  if (err) throw err;
  console.log("Connected to database!");
  con.query("SELECT * FROM employees", function (err, result, fields) {
    if (err) throw err;
    for(let i=0; i<result.length; i++){
      temp_employee = {
        employeeID: result[i].employee_id,
        employeeName: result[i].employee_name,
        employeeStartDate: result[i].employee_startdate,
        employeeLevel: result[i].employee_level
      };
      employee_list.push(temp_employee);
    }
  });
});

let displaylist = [];

let placeholder = {
  employeeID: "No data",
  emplyeeName: "No data",
  emplyeeStartDate: "No data",
  emplyeeName: "No data",
}


function getEmployees(call, callback){
  try{
    displaylist=[];
    var fil1 = parseInt(call.request.minDurationDays);
    var fil2 = parseInt(call.request.minLevel);
    var currDate = new Date();
    for(let i=0; i<employee_list.length; i++){
      var date2 = new Date(employee_list[i].employeeStartDate);
      var duration = (currDate.getTime()-date2.getTime())/86400000;
      if(fil1<=duration&&fil2<=employee_list[i].employeeLevel){
        displaylist.push(employee_list[i]);
      }
    }
    if(displaylist.length==0){
      displaylist.push(placeholder);
      callback(null, {employee: displaylist, total: employee_list.length, provided: 0})
    }
    else{
      callback(null, {employee: displaylist, total: employee_list.length, provided: displaylist.length})
    }
  }
  catch(e){
    callback(null, {
      message: "An error occurred"
    })
  }
}

var server = new grpc.Server();
server.addService(employee_proto.EmployeeService.service, {getEmployees: getEmployees});
server.bindAsync("0.0.0.0:39237", grpc.ServerCredentials.createInsecure(), function() {
  server.start()
})
