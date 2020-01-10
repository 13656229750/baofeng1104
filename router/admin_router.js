const express = require('express');
const formidable = require('formidable');//处理含有文件上传的表单
const crypto = require('crypto'); //加密模块
const svgCaptcha = require('svg-captcha'); //生成验证码
const uuidv1 = require('uuid/v1');
const path = require('path');
const fs = require('fs')
const router = express.Router();

//引入操作mongodb数据库的类
let mongodbObj = require('../db/mongoose-class.js');
// 所有用户数据
// let  allUsers=require('../db/tables.json');


//设计路由

//推荐电影列表界面
router.get('/recmovielist', (req, res) => {


    //获取参数 input输入框name=title值
    let titles=req.query.title;
     console.log(titles);
    let str={};
    if(titles){
        // str ={"title":titles};//精确查询
        str["title"] = new RegExp(titles)//模糊查询
    }
    

    //第几页
    let curp = req.query.pid;
    if (!curp) {
        curp = 1;
    }

    //每页显示2条数据
    let limits = 2;

    //查询总个数
    mongodbObj.findCount('recmovie', str, (err, total) => {

        //计算总页数   Math.ceil(总条数/每页显示的条数)
        let pageNum = Math.ceil(total / limits);

        //计算skip值：(第几页-1)*limit值
        let skips = (curp - 1) * limits;
        console.log(skips, 8888);


        //查询推荐电影数据
        mongodbObj.finds('recmovie', str, {}, { limit: limits, skip: skips }, (err, data) => {
            // console.log(err, data, 2222);
            // console.log(pageNum)
            res.render('admin/recomovie-list.html', { curp, total, data, pageNum,titles });
        });
    })

});
//添加推荐电影数据的界面
router.get('/recmovieadd', (req, res) => {
    res.render('admin/recomovie-add.html')
})
//处理添加推荐电影的数据
router.post('/recmovieadd', (req, res) => {

    //使用fromidable中间件处理含有文件上传的表单
    var form = new formidable.IncomingForm();

    //上传成功的文件存放目录
    let fullPath = path.resolve(__dirname, '../uploads')
    //更改上传成功后的文件存放位置
    form.uploadDir = fullPath;

    form.parse(req, function (err, fields, files) {  //fields除文件上传其它表单项的值
        console.log(err, fields, files)


        //用户选择要上传的电影封面才处理文件才上传
        if (files.img.name != '') {
            //获取源文件的扩展名
            let oldFilesname = files.img.name;
            let extName = path.extname(oldFilesname);

            //上传成功后完整文件名
            let fullName = `${uuidv1()}${extName}`;

            //将上传成功后生成的临时文件名改成正式文件名
            fs.renameSync(files.img.path, `${fullPath}/${fullName}`);

            //将上传成功后文件名保存到数据库中
            fields.img = `../uploads/${fullName}`;

        }
        mongodbObj.inserts('recmovie', fields, (error) => {

            if (error) { //添加失败
                res.send("<script>alert('添加失败');location.href='/recmovieadd';</script>");
            } else { //添加成功
                res.send("<script>alert('添加成功');location.href='/recmovielist';</script>");
            }
        })
    })
})

//修改推荐电影的显示界面
router.get('/recmovieupdata', (req, res) => {

    //要修改的电影id
    let curId = req.query.mid;

    //查询要修改的电影数据
    mongodbObj.finds('recmovie', { '_id': curId }, {}, {}, (err, data) => {

        res.render('admin/recomovie-updata.html', { data })
    })
})
//处理修改推荐电影的信息
router.post('/recmovieupdata', (req, res) => {

    //使用fromidable中间件处理含有文件上传的表单
    var form = new formidable.IncomingForm();

    //上传成功的文件存放目录
    let fullPath = path.resolve(__dirname, '../uploads')

    //更改上传成功后的文件存放位置
    form.uploadDir = fullPath;

    form.parse(req, function (err, fields, files) {  //fields除文件上传其它表单项的值
        //    console.log(err, fields, files)

        //用户选择要上传的电影封面才处理文件才上传
        if (files.img.name != '') {
            //获取源文件的扩展名
            let oldFilesname = files.img.name;
            let extName = path.extname(oldFilesname);

            //上传成功后完整文件名
            let fullName = `${uuidv1()}${extName}`;

            //将上传成功后生成的临时文件名改成正式文件名
            fs.renameSync(files.img.path, `${fullPath}/${fullName}`);


            //将上传成功后文件名保存到数据库中
            fields.img = `../uploads/${fullName}`;

        }

        mongodbObj.updates('recmovie', { '_id': fields._id }, { $set: fields }, (error) => {

            if (error) { //修改失败
                res.send("<script>alert('修改失败');location.href='/recmovieupdata?mid=" + fields._id + "';</script>");
            } else { //修改成功
                res.send("<script>alert('修改成功');location.href='/recmovielist';</script>");
            }

        })
    })
})

//删除电影的信息
router.get('/recmoviedel', (req, res) => {
    //要删除的电影id
    let curid = req.query.mid;

    mongodbObj.deletes('recmovie', { _id: curid }, (error) => {
        if (error) {
            res.send({ "flag": false, "msg": "删除失败" });
        } else {
            res.send({ "flag": true, "msg": "删除成功" });
        }
    });
})


//后台用户登录界面
router.get('/login', (req, res) => {

    //接收参数(退出系统的动作标识)
    let curact = req.query.act;
    if(curact == 'logout'){
       delete req.session.USER;
    }

    //获取cookie(将记住的帐号读取出来)
    let usrs = req.cookies.USER;

    const secret = '123@lzsa';
    const hash = crypto.createHmac('sha256', secret)
        .update('pasw') //要加密的字符串 (密码)
        .digest('hex');

    console.log(hash);

    res.render('admin/login.html', { usrs })
})
//处理后台用户登录
router.post('/login', (req, res) => {

    var form = new formidable.IncomingForm();//处理含有文件上传的表单

    form.parse(req, function (err, fields, files) {
        let { usr, pwd, regcode, regusr = false } = fields;


        console.log(fields)

        //获取系统生成的验证码
        let sysCode = req.session.CODES;
        //判断验证码是否正确
        if (regcode.toLowerCase() != sysCode.toLowerCase()) {
            res.send("<script>alert('验证错误!');location.href='/login';</script>");
            return false;
        }



        //对用户输入的密码加密
        const secret = '123@lzsa' //密钥
        const hpwd = crypto.createHmac('sha256', secret)
            .update(pwd) //要加密的字符串
            .digest('hex');

        //  console.log(hash);

        //根据帐号查询用户信息
        mongodbObj.finds('user', { "usr": usr }, {}, {}, (err, data) => {
            // console.log(err,data,7777);
            if (data.length == 1) { //账号正确
                if (hpwd == data[0].pas) { //密码正确

                    //设置session
                    req.session.USER = usr;

                    //记住帐号
                    if (regusr) { //用户选择了记住帐号
                        //将帐号保存在cookie中
                        res.cookie('USER', usr, { maxAge: 60 * 60 * 24 * 7 * 1000 });
                    }


                    res.send("<script>alert('登录成功');location.href='/main';</script>");
                } else {
                    res.send("<script>alert('密码错误');location.href='/login';</script>");
                }
            } else { //账号错误
                res.send("<script>alert('帐号错误');location.href='/login';</script>");
            }
        })
    });
})

//生成验证码
router.get('/regcode', (req, res) => {

    let svgcap = svgCaptcha.create({
        size: 4,
        noise: 3,
        color: true
    });

    //设置session
    req.session.CODES = svgcap.text;

    res.setHeader("content-type", "image/svg+xml");
    res.send(svgcap.data);

});

//后台主界面
router.get('/main', (req, res) => {

    //获取当前的账号
    let usr = req.session.USER;
    if (!usr) {
        res.send('<script>alert("请先登录");location.href="/login";</script>');
        return false;
    }

    // res.render('admin/main.html');
    res.sendFile(path.resolve(__dirname, "../views/admin/main.html"));
});

//顶部界面
router.get('/top', (req, res) => {

       //获取已登录的帐号
       let curusr = req.session.USER;

       res.render('admin/top.html', { curusr });


    //第二种写法
    //获取已登录的帐号
    // let curid = req.session.USER;
    // let contents = fs.readFileSync(path.resolve(__dirname, '../views/admin/top.html'))
    // contents = contents.toString();
    // contents = contents.replace('??', curid);
    // res.send(contents);
});

//左部界面
router.get('/left', (req, res) => {
    res.render('admin/left.html');
});

//右部界面
router.get('/right', (req, res) => {
    res.render('admin/right.html');
});



//用户管理界面
router.get('/userlist',(req,res)=>{
   
      //第几页
      let curp = req.query.pid;
      if (!curp) {
          curp = 1;
      }
  
      //每页显示2条数据
      let limits = 2;
  
      //查询总个数
      mongodbObj.findCount('user', {}, (err, total) => {
  
          //计算总页数   Math.ceil(总条数/每页显示的条数)
          let pageNum = Math.ceil(total / limits);
  
          //计算skip值：(第几页-1)*limit值
          let skips = (curp - 1) * limits;
        //   console.log(skips, 8888);
  
  
          //查询用户数据
          mongodbObj.finds('user', {}, {}, { limit: limits, skip: skips }, (err, data) => {
             //   console.log(err, data, 2222);
              // console.log(pageNum)
              res.render('../views/admin/user-list.html', { curp, total, data, pageNum });
          
          });
      })
  
    // res.render('../views/admin/user-list.html')
})
//添加用户界面
router.get('/useradd',(req,res)=>{
   
    res.render('../views/admin/user-add.html')
});
//处理添加用户的界面
router.post('/useradd',(req,res)=>{

   //使用fromidable中间件处理含有文件上传的表单
   var form = new formidable.IncomingForm();

   form.parse(req, function (err, fields, files) {  //fields除文件上传其它表单项的值
  
   mongodbObj.inserts('user', fields, (error) => {

   if (error) { //添加失败
       res.send("<script>alert('添加失败');location.href='/useradd';</script>");
   } else { //添加成功
       res.send("<script>alert('添加成功');location.href='/userlist';</script>");
   }
})
})

})

//修改用户信息的界面
router.get('/userupdata',(req,res)=>{

    //获取id
    let curid =req.query.mid;
     //查询要修改的用户数据
     mongodbObj.finds('user', { '_id': curid }, {}, {}, (err, data) => {
        res.render('admin/user-updata.html', { data })
    })

})
//处理修改用户信息
router.post('/userupdata',(req,res)=>{
    //使用fromidable中间件处理含有文件上传的表单
    var form = new formidable.IncomingForm();

    form.parse(req, function (err, fields, files) {  //fields除文件上传其它表单项的值
         
        mongodbObj.updates('user', { '_id': fields._id }, { $set: fields }, (error) => {

            if (error) { //修改失败
                res.send("<script>alert('修改失败');location.href='/userupdata?mid=" + fields._id + "';</script>");
            } else { //修改成功
                res.send("<script>alert('修改成功');location.href='/userlist';</script>");
            }

        })

    })

})

//删除用户的信息
router.get('/userdel',(req,res)=>{
  
    //获取删除数据的id
    let curid=req.query.mid;

    mongodbObj.deletes('user',{_id:curid},(error)=>{
      if(error){  //删除失败
        res.send({"flag":false,"msg":"删除失败"})
      }else{
        res.send({"flag":true,"msg":"删除成功"})
      }
        

    })
})

module.exports = router;