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
    displaylist=[];
    var initdays = "1";
    var initlevel = "1";
    client.getEmployees({minDurationDays: initdays, minLevel: initlevel}, function (error, response){
      console.log(response.employeeLevel);
      try{
        res.render('employee', {
          title: 'Employees',
          employeeName: response.employeeName,
          employeeID: response.employeeID,
          employeeStartDate: response.employeeStartDate,
          employeeLevel: response.employeeLevel
        })
      }
      catch(e){
        console.log(error);
      }
  })
}
  catch(error){
    console.log(error);
  }
});

module.exports = router;
