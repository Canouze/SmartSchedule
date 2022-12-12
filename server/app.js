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

con.connect(function(err) {
  if (err) throw err;
  console.log("Connected to database!");
});

let employee_list = [];

let displaylist = [];

let placeholder = {
  employeeID: "No data",
  emplyeeName: "No data",
  emplyeeStartDate: "No data",
  emplyeeName: "No data",
}


function getEmployees(call, callback){
  try{
    employee_list=[];
    displaylist=[];
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
      if(displaylist.length===0){
        displaylist.push(placeholder);
        callback(null, {employee: displaylist, total: employee_list.length, provided: 0})
      }
      else{
        callback(null, {employee: displaylist, total: employee_list.length, provided: displaylist.length})
      }
    });
  }
  catch(e){
    callback(null, {
      message: "An error occurred"
    })
  }
}

function giveEmployee(call, callback){
  try{
    console.log(call.request.employee.employeeID);
    var received_id=call.request.employee.employeeID;
    var received_name=call.request.employee.employeeName;
    var received_startdate=call.request.employee.employeeStartDate;
    var received_level=call.request.employee.employeeLevel;
    var sql_instruct = "INSERT INTO employees (employee_id, employee_name, employee_startdate, employee_level) VALUES ('"+received_id+"', '"+received_name+"', '"+received_startdate+"', '"+received_level+"');";
    con.query(sql_instruct, function (err, result) {
      if (err) throw err;
      console.log("Employee record created successfully");
      callback(null, {
        employeeResult: "Employee Created Successfully."
      })
    });
  }
  catch(e){
    console.log(e);
    callback(null, {
      message: "An error occurred"
    })
  }
}

var server = new grpc.Server();
server.addService(employee_proto.EmployeeService.service, {
  getEmployees: getEmployees,
  giveEmployee: giveEmployee
});
server.bindAsync("0.0.0.0:39237", grpc.ServerCredentials.createInsecure(), function() {
  server.start()
})
