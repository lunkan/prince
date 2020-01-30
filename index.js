
const http = require('http');
const fs = require('fs');
const path = require('path');
const url = require('url');

const port = 3000;

const mimeTypes = {
	'.html': 'text/html',
	'.js': 'text/javascript'
};

const requestHandler = (req, res) => {
	const ext = path.extname(req.url);

	if (req.url === '/') {
		fs.readFile(__dirname + '/index.html', (err, data) => {
		    if (err) {
		      res.writeHead(404);
		      res.end(JSON.stringify(err));
		      return;
		    }

		    res.writeHead(200, {
		    	'Content-Type': mimeTypes['.html']
		    });
		    res.end(data);
		});

	} else if (ext && mimeTypes[ext]) {
		const subPath = ext === '.js' ? '/src' : '/resources';

		fs.readFile(__dirname + subPath + req.url, (err, data) => {
		    if (err) {
		      res.writeHead(404);
		      res.end(JSON.stringify(err));
		      return;
		    }

		    res.writeHead(200, {
		    	'Content-Type': mimeTypes[ext]
		    });
		    res.end(data);
		});
	}

	
  	

  	/*fs.readFile(__dirname + req.url, function (err,data) {
	    if (err) {
	      res.writeHead(404);
	      res.end(JSON.stringify(err));
	      return;
	    }
	    res.writeHead(200);
	    res.end(data);
	});*/
}

const server = http.createServer(requestHandler);

/*server.on('request', (req, res) => {

	//const parsedUrl = new URL(req.url)

	fs.readFile(__dirname + req.url, function (err,data) {
	    if (err) {
	      res.writeHead(404);
	      res.end(JSON.stringify(err));
	      return;
	    }
	    res.writeHead(200);
	    res.end(data);
	  });

});*/





server.listen(port, (err) => {
  if (err) {
    return console.log('something bad happened', err)
  }

  console.log(`server is listening on ${port}`)
});