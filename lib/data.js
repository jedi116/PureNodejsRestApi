//library to write data in file system

//dependencies
var fs = require('fs');
var path = require('path');
var helpers = require('./helpers.js');

var lib = {};

lib.baseDir= path.join(__dirname,"/../.data/");

//create a lib for writing into files
lib.create = function(dir,file,data,callback){
	fs.open(lib.baseDir+ dir +'/'+file+'.json','wx',function(err,fileDescriptor){
		if(!err && fileDescriptor){
			var StringData = JSON.stringify(data);
			fs.write(fileDescriptor, StringData ,function(err){
				if(!err){
					fs.close(fileDescriptor,function(err){
						if(!err){
							callback(false);
						}
						else{
							callback('could not close file');
						}
					});
				}else{
					callback('can not write to file');
				}


			});
		}else{
			callback('could do not be created');
		}
	});
};
//create a lib to read from files
lib.read = function(dir,file,callback){
	fs.readFile(lib.baseDir+dir+'/'+file+'.json','utf8',function(err,data){
      if(!err && data){
        var parsedData = helpers.parseJsonToObject(data);
        callback(false,parsedData);
      }else{
        callback(err,data);
      }



	});
};
//create a lib for updating data in files

lib.update = function(dir,file,data,callback){

	fs.open(lib.baseDir+dir+'/'+file+'.json','r+',function(err,fileDescriptor){
			if (!err && fileDescriptor){
				var stringData = JSON.stringify(data);
				fs.ftruncate(fileDescriptor,function(err){
					if(!err){
						fs.write(fileDescriptor,stringData,function(err){
							if(!err){
								fs.close(fileDescriptor,function(err){
									if(!err){
										callback(false);
									}
									else{
										callback('error closing file');
									}

								});
							}
							else{
								callback('error writing to file');
							}

						});
					}else{
						callback('error deleting previous file data');
					}
				});
			}
			else{
				callback('error opening file');
			}
	});
};

//create a lib for deleting file
lib.delete = function(dir,file,callback){
	fs.unlink(lib.baseDir+dir+'/'+file+'.json',function(err){
		if(!err){
			callback(false);
		}
		else{
			callback('error deleting file');
		}
	});
};
module.exports = lib;
