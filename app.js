var http = require('http');
var app = http.createServer(function (req, res) {
	/*if (err) {
		res.writeHead(500);
		return res.end('Error loading index.html');
	}*/
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify({ 'app': 'remote' }));
});
app.listen(3000);

var mongo = require('mongodb');
var MongoClient = mongo.MongoClient;

var io = require('socket.io')(app);

MongoClient.connect('mongodb://127.0.0.1:27017/remote', function(err, db) {
	if (err) throw err;
	var ts = (new Date()).getTime();
	var collection = db.collection('mousemove');
	io.on('connection', function (socket) {
		
		socket.on('log', function(data){
			//console.log(data);
			var row = data;
			row['ts'] = (new Date()).getTime();
			collection.insert(row, function(err, docs) {
				//
			});
		});
		
		socket.on('control', function(data){
			if (data['clear'])
			{
				db.dropDatabase(function(err, done){});
			}
		});
		
		setInterval(function(){
			collection.find({'ts': {'$gt': ts}}, {'x': 1, 'y': 1, 'ts': 1, '_id': 0}).sort({'ts': 1}).toArray(function(err, items) {
				ts = (new Date()).getTime();
				if (items.length < 1) return;
				socket.emit('mirror', items);
			});
		}, 5000);
		
		io.emit('log', 'init client');
		
	});

});
