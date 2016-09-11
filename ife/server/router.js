var path = require("path");

function route(handle, pathname, response) {
  //console.log("About to route a request for " + pathname);

  var handlerIndex = undefined;
  var ext = path.extname(pathname);

  if(pathname === "/" || !(ext === "")){
  	handlerIndex = "/";
  }

  if(typeof handle[handlerIndex] === 'function'){
    handle[handlerIndex](pathname, response);
  }
  else{
    //console.log("No request handler found for " + pathname);
    response.writeHead(404, {"Content-Type": "text/plain"});
    response.write("404 Not found");
    response.end();
  }
}

exports.route = route;