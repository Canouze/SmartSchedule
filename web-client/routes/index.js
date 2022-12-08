var readlineSync = require('readline-sync')
var express = require('express');
var router = express.Router();
var grpc = require('@grpc/grpc-js');
var protoLoader = require('@grpc/proto-loader');
var PROTO_PATH = __dirname + '/../protos/employee.proto';
var packageDefinition = protoLoader.loadSync(PROTO_PATH);
var employee_proto = grpc.loadPackageDefinition(packageDefinition).SmartSchedule;
var client = new employee_proto.EmployeeService('0.0.0.0:39237', grpc.credentials.createInsecure());
let displaylist = [];


/* GET home page. */
router.get('/', function(req, res, next) {
  try{
    res.render('index', {
      title: 'SmartSchedule'
    });
  }
  catch(error){
    console.log(error);
  }
});

router.get('/employee', function(req, res, next) {
  try{
    employeeRunner();
    res.render('employee', {
    title: 'Employees',
    employeeName:'hhhh',
    employeeID: '',
    employeeStartDate: '',
    employeeLevel: ''
  });
  }
  catch(error){
    console.log(error);
  }
});

module.exports = router;


function employeeRunner(){
  displaylist=[];
  var initdays = "5000";
  var initlevel = "1";
  var temp_employee = {
    name: "",
    employeeID: "",
    startDate: "",
    level: ""
  }
  client.getEmployees({minDurationDays: initdays, minLevel: initlevel}, function (error, response){
    call.on('data', function(request){
      temp_employee.name = request.employeeName;
      temp_employee.employeeID = request.employeeID;
      temp_employee.startDate = request.employeeStartDate;
      temp_employee.level = request.employeeLevel;
      displaylist.push(temp_employee);
    })
    call.on('end', function(){
      res.render('employee', {
        title: 'Employees',
        employeeName: displaylist[i].name,
        employeeID: displaylist[i].employeeID,
        employeestartDate: displaylist[i].startDate,
        employeeLevel: displaylist[i].level,
      });
    })
    call.on('error', function(e) {
      console.log("An error occurred")
    })
  })
}

//this function updates price slider value
function filterone(){
	daysfilval.innerHTML=daysfil.value;
}

//this function updates calorie slider value
function filtertwo(){
	levelfilval.innerHTML=levelfil.value;
}
