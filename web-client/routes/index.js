var express = require('express');
var router = express.Router();
var grpc = require('@grpc/grpc-js');
var protoLoader = require('@grpc/proto-loader');
var PROTO_PATH = __dirname + '/../protos/employee.proto';
var packageDefinition = protoLoader.loadSync(PROTO_PATH);
var employee_proto = grpc.loadPackageDefinition(packageDefinition).SmartSchedule;
var client = new employee_proto.EmployeeService('0.0.0.0:39237', grpc.credentials.createInsecure());

let receivedlist = [];


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
    var initdays = req.query.daysValue || 0;
    var initlevel = req.query.levelValue || 0;
    client.getEmployees({minDurationDays: initdays, minLevel: initlevel}, function (error, response){
      try{
        res.render('employee', {
          title: 'Employees',
          result: response.employee,
          shown: response.provided,
          filtout: response.total-response.provided,
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

router.get('/create-employee', function(req, res, next) {
  if(req.query.id!=undefined)
    try{
      console.log(req.query.id);
      var initid = req.query.id;
      var initname = req.query.name;
      var initstartdate = req.query.startdate;
      var initlevel = req.query.level;
      client.giveEmployee({employee: {employeeID: initid, employeeName: initname, employeeStartDate: initstartdate, employeeLevel: initlevel}}, function (error, response){
        try{
          res.render('create-employee', {
            title: 'Create Employee',
            result: response.employeeResult
          })
        }
        catch(e){
          console.log(e);
        }
      })
    }
    catch(e){
      console.log(e);
    }
  else{
    try{
      res.render('create-employee', {
        title: 'Create Employee',
        result: 'Please enter details...'
      })
    }
    catch(e){
      console.log(e);
    }
  }
});


module.exports = router;
