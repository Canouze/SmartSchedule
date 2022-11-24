var express = require('express');

var router = express.Router();

var grpc = require('@grpc/grpc-js');

var protoLoader = require('@grpc/proto-loader');

var PROTO_PATH = __dirname + '/../protos/scheduler.proto';

var packageDefinition = protoLoader.loadSync(PROTO_PATH);

var calc_proto = grpc.loadPackageDefinition(packageDefinition).scheduler;

var client = new calc_proto.SchedulerService('0.0.0.0:39237', grpc.credentials.createInsecure());

/* GET home page. */
router.get('/', function(req, res, next) {
  try{
    res.render('scheduler', { title: 'Scheduler' });
  }
  catch(error){
    console.log(error);
  }
});

module.exports = router;
