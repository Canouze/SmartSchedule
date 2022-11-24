var grpc = require("@grpc/grpc-js")
var protoLoader = require("@grpc/proto-loader")
var PROTO_PATH = __dirname + "/protos/scheduler.proto"
var packageDefinition = protoLoader.loadSync(
  PROTO_PATH
)
var proto = grpc.loadPackageDefinition(packageDefinition).package_name



var server = new grpc.Server()
server.bindAsync("0.0.0.0:40000", grpc.ServerCredentials.createInsecure(), function() {
  server.start()
})
