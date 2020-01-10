const express = require('express');
const router = express.Router();

//引入操作mongodb数据库类
let mongodbObj = require('../db/mongoose-class.js');

//查询首页中的推荐电影及热映电影的数据
function getdata(callback) {


    //查询推荐电影的数据
    let prm1 = new Promise((resolve, rejected) => {
        mongodbObj.finds('recmovie', {}, {}, { limit: 20 }, (err, data) => {

            resolve(data)
        })
    });

    //查询热映电影的数据
    let prm2 = new Promise((resolve, rejected) => {
        mongodbObj.finds('hotmovie', {}, {}, { limit: 20 }, (err, data) => {

            resolve(data)
        })
    });


    //查询最近更新电影的数据
    let prm3 = new Promise((resolved, rejected) => {
        mongodbObj.finds('upmovie', {}, {}, { limit: 20 }, (error, data) => {
            resolved(data);
        })
    });

    //查询最受欢迎的数据
    let prm4 = new Promise((resolved, rejected) => {
        mongodbObj.finds('favmovie', {}, {}, { limit: 20 }, (error, data) => {
            resolved(data);
        })
    });

    //查询首页轮播图
    let prm5 = new Promise((resolved, rejected) => {
        mongodbObj.finds('banner', {}, {}, { limit: 20 }, (error, data) => {
            resolved(data);
        });
    });

    //promise并发
    Promise.all([prm1, prm2, prm3, prm4, prm5]).then((ndata) => {

        callback(ndata)
    }).catch(() => {
        callback(null)
    })

}

function getdata2(callback) {

    //查询猜你喜欢电影的数据
    let prm1 = new Promise((resolved, rejected) => {
        mongodbObj.finds('gu', {}, {}, { limit: 20 }, (error, data) => {
            resolved(data);
        })
    });

    //查询推荐电影的数据
    let prm2 = new Promise((resolve, rejected) => {
        mongodbObj.finds('hotrec', {}, {}, { limit: 20 }, (err, data) => {

            resolve(data)
        })
    });

    //promise并发
    Promise.all([prm1, prm2]).then((ndata) => {
        callback(ndata)
    }).catch(() => {
        callback(null)
    })


}



//设计路由

//首页
router.get('/', (req, res) => {

    getdata((ndata) => {
        res.render('index.html', { "recArr": ndata[0], "hotArr": ndata[1], "lunArr": ndata[4] })
    })

})

//列表页
router.get('/list', (req, res) => {

    getdata((mdata) => {

        res.render('list.html', { "upArr": mdata[2], "favArr": mdata[3] });
    });

});


//播放页面
router.get('/video', (req, res) => {
    //接收电影标题
    let tname = req.query.tname;

    // res.render('video.html', { tname });

    getdata2((mdata) => {

        res.render('video.html', {  tname,"gueArr": mdata[0], "hotrecArr": mdata[1] });
    });

});

//登录界面
// router.get('/login',(req,res)=>{
//    res.render('../views/login.html')
// })
module.exports = router;