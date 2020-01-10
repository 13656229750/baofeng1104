//创建web路由
const express =require('express');
const cookieSession=require('cookie-session');
const cookieParser=require('cookie-parser');
const path=require('path');

const app=express();

app.listen(3030,(req,res)=>{
 console.log('3030端口监听成功')
})



//设置模板引擎为ejs
app.set('view engine', 'ejs');
//设置模板文件存放目录
app.set('views', [path.resolve(__dirname, 'views')]);
//告诉express html以ejs模板引擎去渲染
app.engine('html', require('ejs').__express);

//静态资源托管
app.use(express.static(path.resolve(__dirname,'./static')));
app.use('/uploads',express.static(path.resolve(__dirname,'./uploads')));


// 使用中间件cookie-session设置session
app.use(cookieSession({
    name:"cookie-session",//名称
    keys:['ah@aaa','ajbw@sss']//密钥
}));


//使用中间件[cookie-parser]来获取cookie
app.use(cookieParser());

//引入前台路由文件
let frontRouter = require('./router/front_router.js');
app.use(frontRouter);


//引入后台路由文件
let adminRouter = require('./router/admin_router.js');
app.use(adminRouter);