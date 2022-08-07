import multer from 'multer';

//파일 저장위치와 파일이름 설정
var storage = multer.diskStorage({
  destination: function(req, file, cb) {
    //파일이 이미지 파일이면
    if (
      file.mimetype == 'image/jpeg' ||
      file.mimetype == 'image/jpg' ||
      file.mimetype == 'image/png'
    ) {
      console.log('이미지 파일이네요');
      cb(null, 'uploads/images');
      //텍스트 파일이면
    } else if (
      file.mimetype == 'application/pdf' ||
      file.mimetype == 'application/txt' ||
      file.mimetype == 'application/octet-stream'
    ) {
      console.log('텍스트 파일이네요');
      cb(null, 'uploads/texts');
    }
  },
  //파일이름 설정
  filename: function(req, file, cb) {
    cb(null, Date.now() + '-' + file.originalname);
  },
});
//파일 업로드 모듈
var upload = multer({ storage: storage });

//파일 업로드 및 디비에 위치 저장
router.post('/upload_images', upload.single('fileupload'), function(req, res) {
  console.log('post');
  console.log(req.file);
  console.log(req.file.path);
  console.log(upload);
  console.log(upload.storage.getFilename);

  //파일 위치를 mysql 서버에 저장
  getConnection().query(
    'insert into myfile(name) values (?)',
    [req.file.path],
    function() {
      res.redirect('/filepage');
    },
  );
});

//파일 페이지 보여주기
router.get('/filepage', function(req, res) {
  console.log('파일 페이지 나와라');

  //파일 가져올 위치
  var path = __dirname + '/../' + 'uploads/images/';

  fs.readFile('file.html', 'utf-8', function(error, data) {
    var queryString = 'select * from myfile';
    getConnection().query(queryString, function(error, result) {
      if (error) {
        console.log('파일가져올때 에러 발생' + error);
        return;
      }
      res.send(
        ejs.render(data, {
          data: result,
        }),
      );
    });
  });
});

//파일 다운로드 눌렀을 때 작동
router.get('/download/uploads/images/:name', function(req, res) {
  var filename = req.params.name;

  var file = __dirname + '/../uploads/images/' + filename;
  console.log(__dirname);
  console.log(req.path);
  console.log(file);
  res.download(file); // Set disposition and send it.
});
