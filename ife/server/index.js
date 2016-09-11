var server = require("./server");
var router = require("./router");
var handler = require("./handler");

var handle = {}
handle["/"] = handler.staticHandler;

server.start(router.route, handle);