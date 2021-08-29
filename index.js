/*
*
*Primary start point for the application
*
*/

//Dependecies
var http =  require('http');
var https = require('https');
var url  =  require('url');
var StringDecoder = require('string_decoder').StringDecoder;
var configs = require('./config');
var fs = require('fs');
var handlers = require('./lib/handlers');
var helpers =  require("./lib/helpers");



//create http server

var httpServer = http.createServer(function(req,res){
	//pass request and response to universal server function
	universalServer(req,res);

});

//Set server to listen

httpServer.listen(configs.httpPort,function(){
		console.log("server is listening on port "+ configs.httpPort +" with "+configs.envName+" enviroment");
});

//create https server
var httpsServerOptions = {
	key : fs.readFileSync('./https/key.pem') ,
	cert : fs.readFileSync('./https/cert.pem')
};
var httpsServer = https.createServer(httpsServerOptions,function(req,res){
	universalServer(res,req);
});
httpsServer.listen(configs.httpsPort,function(){
		console.log("server is listening on port "+ configs.httpsPort +" with "+configs.envName+" enviroment");
});

var universalServer = function(req,res){
	//parse the url form the request object
	var parsedUrl = url.parse(req.url,true);
	//get the path
	var path = parsedUrl.pathname;
	var trimmedPath = path.replace(/^\/+|\/+$/g,'');
	//get request method
	var method = req.method.toLowerCase();
	//parsing querystring
	var querystringObject = parsedUrl.query;

	//parsing headers
	var headers = req.headers;
	//respond to the request
	var decoder = new StringDecoder('utf-8');
	var buffer = '';
	// check if url has data
	req.on('data',function(data){
		buffer += decoder.write(data);
	});
	req.on('end',function(){
		buffer += decoder.end();
		//choose handler for request
		var chosenHandler = typeof(router[trimmedPath]) !== "undefined" ? router[trimmedPath] : handlers.NotFound ;

		var data = {
			'path': path ,
			'method' : method,
			'querystringObject' :querystringObject,
			'headers': headers,
			'payload' : helpers.parseJsonToObject(buffer)
		};
		chosenHandler(data,function(statusCode, payload){
			//choose default statusCode or  set default status code
			statusCode = typeof(statusCode) == 'number' ? statusCode : 200 ;
			//set to payload set by handler or set to empty object
			payload = typeof(payload) == 'object' ? payload : {};
			//cover payload to string
			var payloadString = JSON.stringify(payload);

				//return a string after "end" event
				res.setHeader('Content-type','application/json');
				res.writeHead(statusCode);
				res.end(payloadString);
				//log the trimmed  path
				console.log("status code:" , statusCode , payload , trimmedPath);
		});


	});

};



//create router object with routes
var router = {
	'': handlers.landing,
	'ping': handlers.ping,
	'users': handlers.users,
	"tokens" : handlers.tokens
};
