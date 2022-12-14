var express = require('express');
var router = express.Router();
var grpc = require('@grpc/grpc-js');
var protoLoader = require('@grpc/proto-loader');
var PROTO_PATH_1 = __dirname + '/../protos/employee.proto';
var PROTO_PATH_2 = __dirname + '/../protos/project.proto';
var PROTO_PATH_3 = __dirname + '/../protos/schedule.proto';
var packageDefinition1 = protoLoader.loadSync(PROTO_PATH_1);
var packageDefinition2 = protoLoader.loadSync(PROTO_PATH_2);
var packageDefinition3 = protoLoader.loadSync(PROTO_PATH_3);
var employee_proto = grpc.loadPackageDefinition(packageDefinition1).SmartSchedule;
var project_proto = grpc.loadPackageDefinition(packageDefinition2).SmartScheduleProject;
var schedule_proto = grpc.loadPackageDefinition(packageDefinition3).SmartScheduleMain;
var client = new employee_proto.EmployeeService('0.0.0.0:39237', grpc.credentials.createInsecure());
var projectClient = new project_proto.ProjectService('0.0.0.0:39237', grpc.credentials.createInsecure());
var scheduleClient = new schedule_proto.ScheduleService('0.0.0.0:39237', grpc.credentials.createInsecure());

let receivedlist = [];
let preceivedlist=[];
let showSchedule=[];
let temps = [];
let daylist = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"];

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

router.get('/schedule', function(req, res, next) {
  try{
    showSchedule = [];
    var eres = [];
    var pres = [];
    var sres = [];
    client.getEmployees({minDurationDays: 0, minLevel: 0}, function (error, response){
      eres = response.employee;
      //console.log(eres);
      projectClient.getProject({daysToDeadline: 5000}, function (error, response){
        pres = response.project;
        scheduleClient.getSchedule(null, function(error, response){
          sres = response.schedule;
          for(let j=0; j<eres.length; j++){
            temps=[];
            //console.log(1);
            temps.push(eres[j].employeeName);
            for(let g=0; g<daylist.length; g++){
              //console.log(2);
              for(let k=0; k<sres.length; k++){
                //console.log(3);
                if(eres[j].employeeName===sres[k].employeeName&&sres[k].scheduleDay===daylist[g]){
                  temps.push(sres[k].projectName);
                }
                else{
                  temps.push("Available");
                }
              }
            }
            showSchedule.push(temps);
          }
          try{
            res.render('schedule', {
              title: 'Schedule',
              pres: pres,
              eres: eres,
              sres: showSchedule
            })
          }
          catch(e){
            console.log(e);
          }
        })
      })
    })
  }
  catch(error){
    console.log(error);
  }
});

router.get('/make-schedule', function(req, res, next) {
  if(req.query.selectproject!=undefined)
    try{
      var initselectemp = req.query.selectemployee;
      var initselectproj = req.query.selectproject;
      var initselectday = req.query.selectday;
      scheduleClient.giveSchedule({scheduleDay: initselectday, scheduleEmployee: initselectemp,scheduleProject: initselectproj}, function (error, response){
        eres = response.employee;
        pres = response.project;
        sres = response.schedule;
        var eres = [];
        var pres = [];
        var sres = [];
        showSchedule = [];
        client.getEmployees({minDurationDays: 0, minLevel: 0}, function (error, response){
          eres = response.employee;
          projectClient.getProject({daysToDeadline: 5000}, function (error, response){
            pres = response.project;
            scheduleClient.getSchedule(null, function(error, response){
              sres = response.schedule;
              try{
                res.render('schedule', {
                  title: 'Schedule',
                  pres: pres,
                  eres: eres,
                  sres: showSchedule
                })
              }
              catch(e){
                console.log(e);
              }
            })
          })
        })
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
          filtout: response.total-response.provided
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

router.get('/project', function(req, res, next) {
  try{
    pdisplaylist=[];
    var initdead = req.query.deadValue || 600;
    projectClient.getProject({daysToDeadline: initdead}, function (error, response){
      try{
        res.render('project', {
          title: 'Projects',
          result: response.project,
          pshown: response.provided,
          pfiltout: response.total-response.provided,
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

router.get('/create-project', function(req, res, next) {
  if(req.query.projectid!=undefined)
    try{
      var initid = req.query.projectid;
      var initname = req.query.projectname;
      var initclient = req.query.clientname;
      var initdeadline = req.query.projectdeadline;
      projectClient.giveProject({project: {projectID: initid, projectName: initname, clientName: initclient, projectDeadline: initdeadline}}, function (error, response){
        try{
          res.render('create-project', {
            title: 'Create Project',
            result: response.projectResult
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
      res.render('create-project', {
        title: 'Create Project',
        result: 'Please enter details...'
      })
    }
    catch(e){
      console.log(e);
    }
  }
});


module.exports = router;
