var grpc = require("@grpc/grpc-js")
var protoLoader = require("@grpc/proto-loader")
var PROTO_PATH = __dirname + "/protos/employee.proto"
var packageDefinition = protoLoader.loadSync(
  PROTO_PATH
)
var employee_proto = grpc.loadPackageDefinition(packageDefinition).SmartSchedule;

var template_employee = {
  name: "John Doe",
  employeeID: "0138",
  startDate: "23/02/2015",
  level: "3"
}

let employee_list = [template_employee];


function getEmployees(call, callback){
  var fil1 = parseInt(call.request.minDurationDays);
  var fil2 = parseInt(call.request.minLevel);
  var currDate = new Date();
  for(let i=0; i<employee_list.length; i++){
    var date2 = new Date(employee_list[i].startDate);
    var duration = currDate-date2;
    if(fil1<duration&&fil2<employee_list[i].level){
      call.write({
        emplyeeName: employee_list[j].name,
        employeeID: employee_list[j].employeeID,
        employeeStartDate: employee_list[j].startDate,
        employeeLevel: employee_list[j].level
      })
    }
  }
  call.end();
}



var server = new grpc.Server();
server.addService(employee_proto.EmployeeService.service, {getEmployees: getEmployees});
server.bindAsync("0.0.0.0:39237", grpc.ServerCredentials.createInsecure(), function() {
  server.start()
})
