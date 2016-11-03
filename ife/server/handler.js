var fs = require("fs");
var path = require("path");

function staticHandler(pathname, response){
	//console.log("Request handler 'staticHandler' was called.");

	var resourceDir = "";

	resourceDir += (".." + pathname);
	//console.log("Request for static resource " + resourceDir);

	fs.readFile(resourceDir, 'binary', function(error, data){
		var ext = path.extname(resourceDir);
		var type = getType(ext);
		if(error){
			response.writeHead(500, {'Content-Type': 'text/plain'});
			response.end("Server error: " + error);
		}
		else{
			response.writeHead(200, {'Content-Type': type});
			response.end(data, 'binary');
		}
	});
}

function getType(ext){
	ext = ext.toLowerCase();
    if (ext === '.htm' || ext === '.html'){
        return 'text/html';
    }
    else if (ext === '.js'){
        return 'application/x-javascript';
    }
    else if (ext === '.css'){
        return 'text/css';
    }
    else if (ext === '.jpe' || ext === '.jpeg' || ext === '.jpg'){
        return 'image/jpeg';
    }
    else if (ext === '.png'){
        return 'image/png';
    }
    else if (ext === '.ico'){
        return 'image/x-icon';
    }
    else if (ext === '.zip'){
        return 'application/zip';
    }
    else if (ext === '.doc'){
        return 'application/msword';
    }
    else{
        return 'text/plain';
    }
}

exports.staticHandler = staticHandler;