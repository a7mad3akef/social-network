var http = require('http');
var formidable = require('formidable');
var fs = require('fs');
var path = require('path');


// const formidable = require('formidable')
// const path = require('path')
const uploadDir = path.join(__dirname, '/uploads/') //i made this  before the function because i use it multiple times for deleting later

// function uploadMedia (req, res, next) { // This is just for my Controller same as app.post(url, function(req,res,next) {....
//   var form = new formidable.IncomingForm()
//   form.multiples = true
//   form.keepExtensions = true
//   form.uploadDir = uploadDir
//   form.parse(req, (err, fields, files) => {
//     if (err) return res.status(500).json({ error: err })
//     res.status(200).json({ uploaded: true })
//   })
//   form.on('fileBegin', function (name, file) {
//     const [fileName, fileExt] = file.name.split('.')
//     file.path = path.join(uploadDir, `${fileName}_${new Date().getTime()}.${fileExt}`)
//   })
// }

// app.use('/static', express.static(path.join(__dirname, 'public')))

http.createServer(function (req, res) {
  if (req.url == '/fileupload') {
    var form = new formidable.IncomingForm();
    form.multiples = true
    form.keepExtensions = true
    form.uploadDir = uploadDir
    form.parse(req, (err, fields, files) => {
      if (err) return res.status(500).json({ error: err })
      res.write('File uploade successfully');
      res.end();
    })
    form.on('fileBegin', function (name, file) {
      const [fileName, fileExt] = file.name.split('.')
      var file_path = path.join(uploadDir, `${fileName}_${new Date().getTime()}.${fileExt}`)
      file.path = file_path
      console.log(file_path)
    })
  } else {
    res.writeHead(200, {'Content-Type': 'text/html'});
    res.write('<form action="fileupload" method="post" enctype="multipart/form-data">');
    res.write('<input type="file" name="filetoupload"><br>');
    res.write('<input type="submit">');
    res.write('</form>');
    return res.end();
  }
}).listen(9000);