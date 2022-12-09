var grpc = require("@grpc/grpc-js")
var protoLoader = require("@grpc/proto-loader")
var PROTO_PATH = __dirname + "/protos/employee.proto"
var packageDefinition = protoLoader.loadSync(
  PROTO_PATH
)
var employee_proto = grpc.loadPackageDefinition(packageDefinition).SmartSchedule;

var template_employee = {
  employeeName: "John Doe",
  employeeID: "0138",
  employeeStartDate: "23/02/2015",
  employeeLevel: "3"
}

let employee_list = [];

employee_list.push(template_employee);


function getEmployees(call, callback){
  try{
    callback(null, {
      employeeName: employee_list[0].employeeName,
      employeeID: employee_list[0].employeeID,
      employeeStartDate: employee_list[0].employeeStartDate,
      employeeLevel: employee_list[0].employeeeLevel
    })
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
