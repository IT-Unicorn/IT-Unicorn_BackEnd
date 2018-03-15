var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var session = require('express-session');
//express的消息提示中间件,用于传递登录失败的一些信息
var flash = require('express-flash');
//passport
var passport = require('passport');
//passport 本地验证策略 //详情可以看官网
//http://passportjs.org/
var LocalStrategy = require('passport-local').Strategy;


var index = require('./routes/index');
var users = require('./routes/users');

var app = express();


app.all('*', function (req, res, next) {
  res.header('Access-Control-Allow-Headers', 'Content-Type, Content-Length, Authorization, Accept, X-Requested-With , yourHeaderFeild');
  res.header('Access-Control-Allow-Methods', 'PUT, POST, GET, DELETE, OPTIONS');
  res.header("Access-Control-Allow-Credentials", "true");
  res.header("Access-Control-Allow-Origin", "http://localhost:8080");
  if (req.method == 'OPTIONS') {
      /*让options请求快速返回*/
      res.send(200);
  }
  else {
    /*防止异步造成多次响应，出现错误*/
    var _send = res.send;
        var sent = false;
        res.send = function (data) {
            if (sent) return;
            _send.bind(res)(data);
            sent = true;
        };
      next();
  }
});

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));



//这里周期只设置为20秒，为了方便测试
//secret在正式用的时候务必修改
//express中间件顺序要和下面一致
app.use(session({secret: 'test',cookie: {maxAge :300000}}));
app.use(passport.initialize());
app.use(passport.session());
app.use(flash());

/**
 * 本地验证，暂时用固定的账号密码
 * 之后替换为的MongoDB之类的数据库查询
 * passport官网例子 链接http://passportjs.org/docs
 */

 passport.use('local',new LocalStrategy(
   function(username,password,done){
     var user = {
        id: '1' ,
        username: 'admin',
        password: '111111',
     };
     if(username !== user.username){
       return done(null,false,{message: '请正确输入用户名'});
     }
     if(password !== user.password){
      return done(null, false, { message: '请正确输入密码' });
     }
     return done(null,user);
   }
 ));

//保存user对象
passport.serializeUser(function (user, done) {
  done(null, user);
});
//删除user对象
passport.deserializeUser(function (user, done) {
  done(null, user);
});

app.use('/', index);
app.use('/users', users);




// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
