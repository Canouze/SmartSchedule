//require necessary packages
var grpc = require("@grpc/grpc-js")
var protoLoader = require("@grpc/proto-loader")
//define paths to proto files
var PROTO_PATH_1 = __dirname + "/protos/employee.proto"
var PROTO_PATH_2 = __dirname + "/protos/project.proto"
var PROTO_PATH_3 = __dirname + "/protos/schedule.proto"
//load protos to variables
var packageDefinition1 = protoLoader.loadSync(PROTO_PATH_1)
var packageDefinition2 = protoLoader.loadSync(PROTO_PATH_2)
var packageDefinition3 = protoLoader.loadSync(PROTO_PATH_3)
//associate to grpc
var employee_proto = grpc.loadPackageDefinition(packageDefinition1).SmartSchedule;
var project_proto = grpc.loadPackageDefinition(packageDefinition2).SmartScheduleProject;
var schedule_proto = grpc.loadPackageDefinition(packageDefinition3).SmartScheduleMain;

//require mysql package
var mysql = require('mysql');

//connect to mysql database
var con = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "password",
  database: "smart_schedule_db"
});

//initiate conection to mysql database and log success message if succeeded
con.connect(function(err) {
  if (err) throw err;
  console.log("Connected to database!");
});

//empty arrays required to house data sent from server and to reset items displayed by web-client on page reload
let employee_list = [];
let displaylist = [];

let project_list=[];
let pdisplaylist=[];

let schedule_list=[];

//arrays to load when there is no data to display for employee and project lists

let placeholder = {
  employeeID: "No data",
  emplyeeName: "No data",
  emplyeeStartDate: "No data",
  emplyeeName: "No data",
}

let placeholder2 = {
  projectID: "No data",
  projectName: "No data",
  clientName: "No data",
  projectDeadline: "No data",
}

/*  This function connects to the mysql database and creates a 2D array with each of the employees in the database with their respective attributes.
    Next the filter values for minimum number of days employed and minimum employee level are received from the client.
    Using this information we loop through the employees and check if their attribute values conform with the filter requirements.
    If they conform, they are added to the displaylist array.
    We check if the displaylist is empty and if so we send back our placeholder aray indicating no data.
    Otherwise we send back the displaylist to the client via callback.
    We also send back information regarding the number of records that have been filtered out during this process
*/
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


/*
    In this function the client will send employee attributes entered by the user for creating a new employee record.
    We assign these values to attributes and assign theses values to a string intended for acting as a mysql command.
    Next a mysql query is made with this string. We log a success message if successful.
*/
function giveEmployee(call, callback){
  try{
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


/*  This function connects to the mysql database and creates a 2D array with each of the projects in the database with their respective attributes.
    Next the filter values for number of days to deadline is received from the client.
    Using this information we loop through the projects and check if the deadline attribute adheres to the filter requirement.
    If it conforms, it is added to the displaylist array.
    We check if the displaylist is empty and if so we send back our placeholder aray indicating no data.
    Otherwise we send back the displaylist to the client via callback.
    We also send back information regarding the number of records that have been filtered out during this process
*/
function getProject(call, callback){
  try{
    project_list=[];
    pdisplaylist=[];
    con.query("SELECT * FROM projects", function (err, result, fields) {
      if (err) throw err;
      for(let i=0; i<result.length; i++){
        temp_project = {
          projectID: result[i].project_id,
          projectName: result[i].project_name,
          clientName: result[i].client_name,
          projectDeadline: result[i].deadline
        };
        project_list.push(temp_project);
      }
      var pfil1 = parseInt(call.request.daysToDeadline);
      var currDate = new Date();
      for(let i=0; i<project_list.length; i++){
        var pdate = new Date(project_list[i].projectDeadline);
        var pdur = (pdate.getTime()-currDate.getTime())/86400000;
        if(pfil1>=pdur){
          pdisplaylist.push(project_list[i]);
        }
      }
      if(pdisplaylist.length===0){
        pdisplaylist.push(placeholder2);
        callback(null, {project: pdisplaylist, total: project_list.length, provided: 0})
      }
      else{
        callback(null, {project: pdisplaylist, total: project_list.length, provided: pdisplaylist.length})
      }
    });
  }
  catch(e){
    callback(null, {
      message: "An error occurred"
    })
  }
}


/*
    In this function the client will send project attributes entered by the user for creating a new project record.
    We assign these values to attributes and assign theses values to a string intended for acting as a mysql command.
    Next a mysql query is made with this string. We log a success message if successful.
*/
function giveProject(call, callback){
  try{
    var received_id=call.request.project.projectID;
    var received_name=call.request.project.projectName;
    var received_startdate=call.request.project.clientName;
    var received_level=call.request.project.projectDeadline;
    var sql_instruct = "INSERT INTO projects (project_id, project_name, client_name, deadline) VALUES ('"+received_id+"', '"+received_name+"', '"+received_startdate+"', '"+received_level+"');";
    con.query(sql_instruct, function (err, result) {
      if (err) throw err;
      console.log("Project record created successfully");
      callback(null, {
        projectResult: "Project Created Successfully."
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

/*
    In this function we firstly query our mysql database for all the existing schedule records.
    Next we add all of the returned data to a 2D array of schedule records with their respective attributes.
    This array is returned to the client via callback.
*/
function getSchedule(call, callback){
  schedule_list=[];
  try{
    con.query("SELECT * FROM schedule", function (err, result, fields) {
      if (err) throw err;
      for(let i=0; i<result.length; i++){
        temp_schedule=[];
        temp_schedule = {
          scheduleID: result[i].schedule_id,
          scheduleDay: result[i].schedule_day,
          employeeName: result[i].employee_name,
          projectName: result[i].project_name,
        };
        schedule_list.push(temp_schedule);
      }
      console.log(schedule_list);
      callback(null, {schedule: schedule_list})
    })
  }
  catch(e){
    callback(null, {
      message: "An error occurred"
    })
  }
}

/*
    In this function the client will send schedule attributes entered by the user for creating a new schedule record.
    We assign these values to attributes and assign theses values to a string intended for acting as a mysql command.
    Next a mysql query is made with this string. We log a success message if successful.
*/
function giveSchedule(call, callback){
  schedule_list=[];
  try{
    var received_sday=call.request.scheduleDay;
    var received_empname=call.request.scheduleEmployee;
    var received_projname=call.request.scheduleProject;
    var sql_instruct = "INSERT INTO schedule (schedule_day, employee_name, project_name) VALUES ('"+received_sday+"', '"+received_empname+"', '"+received_projname+"');";
    con.query(sql_instruct, function (err, result) {
      if (err) throw err;
      console.log("Schedule record created successfully");
    });
    con.query("SELECT * FROM schedule", function (err, result, fields) {
      if (err) throw err;
      for(let i=0; i<result.length; i++){
        temp_array = {
          scheduleID: result[i].schedule_id,
          scheduleDay: result[i].schedule_day,
          employeeName: result[i].employee_name,
          projectName: result[i].project_name,
        };
        schedule_list.push(temp_array);
      }
      callback(null,
        {scheduleResult: "Assignment Added Successfully."
      })
    })
  }
  catch(e){
    console.log(e);
    callback(null, {
      message: "An error occurred"
    })
  }
}

//create server variable
var server = new grpc.Server();

//Adding the various services to the server. As we have three seperate proto files we need to do this for each.
server.addService(employee_proto.EmployeeService.service, {
  getEmployees: getEmployees,
  giveEmployee: giveEmployee
});
server.addService(project_proto.ProjectService.service, {
  getProject: getProject,
  giveProject: giveProject
});
server.addService(schedule_proto.ScheduleService.service, {
  getSchedule: getSchedule,
  giveSchedule: giveSchedule
});

//Associate the server with a port
server.bindAsync("0.0.0.0:39237", grpc.ServerCredentials.createInsecure(), function() {
  server.start()
})
