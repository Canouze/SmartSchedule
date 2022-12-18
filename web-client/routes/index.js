//require necessary packages and initiate router variable
var express = require('express');
var router = express.Router();
var grpc = require('@grpc/grpc-js');
var protoLoader = require('@grpc/proto-loader');
//define paths to proto files (we have three seperate files)
var PROTO_PATH_1 = __dirname + '/../protos/employee.proto';
var PROTO_PATH_2 = __dirname + '/../protos/project.proto';
var PROTO_PATH_3 = __dirname + '/../protos/schedule.proto';
//load protos
var packageDefinition1 = protoLoader.loadSync(PROTO_PATH_1);
var packageDefinition2 = protoLoader.loadSync(PROTO_PATH_2);
var packageDefinition3 = protoLoader.loadSync(PROTO_PATH_3);
//assign proto package definitions to variables
var employee_proto = grpc.loadPackageDefinition(packageDefinition1).SmartSchedule;
var project_proto = grpc.loadPackageDefinition(packageDefinition2).SmartScheduleProject;
var schedule_proto = grpc.loadPackageDefinition(packageDefinition3).SmartScheduleMain;
//associate services within proto files with a variable
var client = new employee_proto.EmployeeService('54.217.7.41:39237', grpc.credentials.createInsecure());
var projectClient = new project_proto.ProjectService('54.217.7.41:39237', grpc.credentials.createInsecure());
var scheduleClient = new schedule_proto.ScheduleService('54.217.7.41:39237', grpc.credentials.createInsecure());
//initiate empty arrays required for reseting contents later in file
let receivedlist = [];
let preceivedlist=[];
let showSchedule=[];
let tempSchedule = [];

/*
    Index page acts as landing only
*/
router.get('/', function(req, res, next) {
  try{
    //render only with title for home page
    res.render('index', {
      title: 'SmartSchedule'
    });
  }
  catch(error){
    console.log(error);
  }
});

/*
    This paage will display the schedule
*/
router.get('/schedule', function(req, res, next) {
  try{
    showSchedule = [];
    //array of employees received from server
    var eres = [];
    //array of projects received from server
    var pres = [];
    //array of schedule records received from server
    var sres = [];
    /*
        To load this page we need all the information in our database i.e. info from employee, project and schedule tables within the database.
        To do this we firstly call to get employee details and then within that function we call to get project details and finally call within this function again to get schedule details i.e. calls are nested
    */
    client.getEmployees({minDurationDays: 0, minLevel: 0}, function (error, response){
      //get employee details
      eres = response.employee;
      projectClient.getProject({daysToDeadline: 5000}, function (error, response){
        //get project details
        pres = response.project;
        scheduleClient.getSchedule(null, function(error, response){
          //get schedule details
          sres = response.schedule;
          //loop through all of the employees and assign name of each to temp array followed by five instances of the string Available
          for(let i=0; i<eres.length; i++){
            //reset tempSchedule for new iteration
            tempSchedule=[];
            tempSchedule.push(eres[i].employeeName);
            tempSchedule.push("Available");
            tempSchedule.push("Available");
            tempSchedule.push("Available");
            tempSchedule.push("Available");
            tempSchedule.push("Available");
            //add temp array to showSchedule array
            showSchedule.push(tempSchedule);
          }
          //loop through the schedule array
          for(let j=0; j<sres.length; j++){
            //counter for day that needs to be altered
            let changer=0;
            //loop through schowSchedule array
            for(let k=0; k<showSchedule.length; k++){
              //if the employee name matches in schedule list and employee list that means we need to add a schedule record
              if(showSchedule[k][0]===sres[j].employeeName){
                //if the scheule record is for Monday assign the counter variable to 1 and so on
                if(sres[j].scheduleDay==="Monday"){
                  changer=1;
                }
                if(sres[j].scheduleDay==="Tuesday"){
                  changer=2;
                }
                if(sres[j].scheduleDay==="Wednesday"){
                  changer=3;
                }
                if(sres[j].scheduleDay==="Thursday"){
                  changer=4;
                }
                if(sres[j].scheduleDay==="Friday"){
                  changer=5;
                }
              }
              //if the counter variable is not zero then we have made a change
              if(changer>0){
                //change the Available string to the name of the project for that day
                showSchedule[k][changer]=sres[j].projectName;
              }
              //reset counter variable
              changer=0;
            }
          }
          //now we can attempt to render the page with the array we have created of all the employees and any assignments they have been scheduled for
          try{
            res.render('Schedule', {
              title: 'Schedule',
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


//this page will take in schedule attribute details entered by the user and send them to the server.
router.get('/create-schedule', function(req, res, next) {
  //if the select tag is not blank this means the user has made selections and clicked submit - so we continue with call to server
  if(req.query.selectproject!=undefined){
    try{
      //as previous we need to nest calls to get info on employees and projects so we can display them within the select tag drop down menus within the html
      //we are calling to these methods with filter variable set to the extremes so that all employees and projects will be returned and displayed
      client.getEmployees({minDurationDays: 0, minLevel: 0}, function (error, response){
        eres = response.employee;
        projectClient.getProject({daysToDeadline: 5000}, function (error, response){
          pres = response.project;
          //assign the slections entered by the users in the drop down menus to variables via a req.query method
          var initselectemp = req.query.selectemployee;
          var initselectproj = req.query.selectproject;
          var initselectday = req.query.selectday;
          //call the giveSchedule remote function from our server with the selection info from the user
          scheduleClient.giveSchedule({scheduleDay: initselectday, scheduleEmployee: initselectemp,scheduleProject: initselectproj}, function (error, response){
            //now we can attempt to render the page with the callback data sent from server - if successful a success message will be added to html and loaded
            try{
              res.render('create-schedule', {
                title: 'Create Schedule',
                result: response.scheduleResult
              })
            }
            catch(e){
              console.log(e);
            }
          })
        })
      })
    }
    catch(e){
      console.log(e);
    }
  }
  //if the selection tags are blnak it means ths user has not made a selection yet. We still need to load employee and project data to add options to the drop down menus so that the user can make their selections
  else{
    try{
      client.getEmployees({minDurationDays: 0, minLevel: 0}, function (error, response){
        eres = response.employee;
        projectClient.getProject({daysToDeadline: 5000}, function (error, response){
          pres = response.project;
          //render the page with a message asking for info to be added
          res.render('create-schedule', {
            title: 'Add Assignment',
            result: 'Please enter details...'
          })
        })
      })
    }
    catch(e){
      console.log(e);
    }
  }
});


//this page will display a list of employees and allow the user to filter the results displayed
router.get('/employee', function(req, res, next) {
  try{
    //reset array of employees to display
    displaylist=[];
    //get values for minimum number of days employed and minimum employee level via req.query or if not initiated set to zero so that we get all records back
    var initdays = req.query.daysValue || 0;
    var initlevel = req.query.levelValue || 0;
    //call getEmployee remote function with our filter values within the call
    client.getEmployees({minDurationDays: initdays, minLevel: initlevel}, function (error, response){
      try{
        //try to render the page with the callback info - includes list of employees that adhere to the filters entered by the user as well as info regarding number of employees that have been filtered out
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


//this page will display the projects in the database and allow for filtering by dproject deadline
router.get('/project', function(req, res, next) {
  try{
    //reset array of project records to display
    pdisplaylist=[];
    //get value for days to deadline for filter or if not initiated set to 600 (max which should show all records)
    var initdead = req.query.deadValue || 600;
    //make call to getProject remote function sending our filter value within the call
    projectClient.getProject({daysToDeadline: initdead}, function (error, response){
      //render the page with the callbcak info including projects that adhere to filter parameters give and the number of projects filtered out
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


//this page will allow for a new employee record to be created
router.get('/create-employee', function(req, res, next) {
  //if the if form is not blank then the user has entered information and clicked submit so we are attempting to make a new record
  if(req.query.id!=undefined)
    try{
      //get the attrbute values entered by the user into the forms using req.query
      var initid = req.query.id;
      var initname = req.query.name;
      var initstartdate = req.query.startdate;
      var initlevel = req.query.level;
      //make a call to the giveEmployee remote function providing the attributes entered by the user within the call
      client.giveEmployee({employee: {employeeID: initid, employeeName: initname, employeeStartDate: initstartdate, employeeLevel: initlevel}}, function (error, response){
        try{
          //render the page using the info provided by the callback - i.e. success message if record has been created successfully
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
    //if the form is blank then the page is being initiated so we simply render the page with a message asking for user input into the forms
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

//this page will allow for a new project record to be created
router.get('/create-project', function(req, res, next) {
  //if the if form is not blank then the user has entered information and clicked submit so we are attempting to make a new record
  if(req.query.projectid!=undefined)
    try{
      //get the attrbute values entered by the user into the forms using req.query
      var initid = req.query.projectid;
      var initname = req.query.projectname;
      var initclient = req.query.clientname;
      var initdeadline = req.query.projectdeadline;
      //make a call to the giveProject remote function providing the attributes entered by the user within the call
      projectClient.giveProject({project: {projectID: initid, projectName: initname, clientName: initclient, projectDeadline: initdeadline}}, function (error, response){
        //render the page using the info provided by the callback - i.e. success message if record has been created successfully
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
    //if the form is blank then the page is being initiated so we simply render the page with a message asking for user input into the forms
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

///export modules to the router variable created earlier
module.exports = router;
