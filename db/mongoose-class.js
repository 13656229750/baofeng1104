const mongoose = require('mongoose');
const path = require('path');

//定义类(通过mongoose操作mongodb数据库)
class MongoDB {
    //属性
    constructor(host, port, dbname) {
        mongoose.connect(`mongodb://${host}:${port}/${dbname}`, { useNewUrlParser: true, useUnifiedTopology: true });

        this.curModelObj = {}; //当前表的模型
        this.models = {}; //存放已创建好的Model模型

        //获取所有表的表结构及约束
        this.tables = require(path.resolve(__dirname, './tables.json'));
        //console.log(this.tables);
    }

    //方法

    //定义Schema并根据Schema创建Model模型
    /**
     * 
     * @param String tname  表名
     */
    schemas(tname) {

        let modelObj = this.models[tname];

        //判断当前表模型是否创建
        if (!modelObj) { //当前表的Model模型未创建

            //定义Schema(作用：设计表结构、对表中数据进行约束)
            let schemas = new mongoose.Schema(this.tables[tname]);

            //根据Schema创建Model模型
            modelObj = mongoose.model(tname, schemas);
            //将创建的当前表模型存放到this.models中
            this.models[tname] = modelObj;
        }



        return modelObj;
    }

    //查询数据
    /**
     * 
     * @param String tables  表名
     * @param Object cond    查询条件
     * @param Object fields  要显示的属性
     * @param Object options  sort、limit、skip
     * @param Function callback 回调函数
     */
    finds(tables, cond, fields, options, callback) {
        //model模型
        this.curModelObj = this.schemas(tables);
        this.curModelObj.find(cond, fields, options, (err, data) => {
            // console.log(err, data, 6666);
            callback(err, data);
        })

    }

    //查询总个数
    /**
     * 
     * @param String tables  表名
     * @param Object cond    条件
     * @param Function callback  回调函数
     */
    findCount(tables, cond, callback) {
        //model模型
        this.curModelObj = this.schemas(tables);
        this.curModelObj.countDocuments(cond, (err, num) => {
            callback(err, num);
        });
    }

    //添加数据
    /**
     * 
     * @param String tables  表名
     * @param Object fields   要添加的数据
     * @param Function callback  回调函数
     */
    inserts(tables, fields, callback) {
        //model模型
        this.curModelObj = this.schemas(tables);
        this.curModelObj.create(fields, (err) => {
            callback(err);
        })
    }

    //修改数据
    /**
     * 
     * @param String tables  表名
     * @param Object cond    修改的条件
     * @param Object fields  修改后的对象
     * @param Function callback  回调函数
     */
    updates(tables, cond, fields, callback) {
        //model模型
        this.curModelObj = this.schemas(tables);
        this.curModelObj.updateMany(cond, fields, (err) => {
            callback(err);
        });
    }

    //删除数据
    deletes(tables, cond, callback) {
        //model模型
        // console.log(cond,tables)
        this.curModelObj = this.schemas(tables);
        this.curModelObj.deleteOne(cond, (err) => {
            callback(err);
        })
    }

}

//实例化类(对象)
module.exports = new MongoDB('localhost', 27017, 'baofeng1104');