const express = require('express');
const app = express();
const db = require('./database.js');
const md5 = require("md5")

const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

const HTTP_PORT = 3333;

app.get('/api/users',(req,res,next) => {
    const sql = "select * from user";
    const params = [];

    db.all(sql, params, (err, rows) => {
        if(err){
            res.status(400).json({"error":err.message});
            return;
        }
        res.json({
            "message":"success",
            "data":rows
        })
    });
});

app.get("/api/users/:id", (req, res, next) => {
    var sql = "select * from user where id = ?"
    var params = [req.params.id]
    db.get(sql, params, (err, row) => {
        if (err) {
          res.status(400).json({"error":err.message});
          return;
        }
        res.json({
            "message":"success",
            "data":row
        })
      });
});

//cria novo usuário
app.post('/api/users/', (req,res,next) => {
    const errors = [];

    if(!req.body.password){
        errors.push("Senha não especificada");
    }
    if(!req.body.email){
        errors.push("Email não especificado");
    }
    if(errors.length){
        res.status(400).json({"error":errors.join(",")});
        return;
    }
    const data = {
        name: req.body.name,
        email: req.body.email,
        password: md5(req.body.password)
    }
    const sql = 'INSERT INTO user (name,email,password) VALUES (?,?,?)';

    const params = [data.name, data.email, data.password];

    db.run(sql,params,function (err,result){
        if(err){
            res.status(400).json({"error":err.message});
            return;
        }
        res.json({
            "message":"sucess",
            "data":data,
            "id": this.lastID
        })
    });
});

app.patch("/api/users/:id", (req, res, next) => {
    var data = {
        name: req.body.name,
        email: req.body.email,
        password : req.body.password ? md5(req.body.password) : null
    }
    db.run(
        `UPDATE user set 
           name = COALESCE(?,name), 
           email = COALESCE(?,email), 
           password = COALESCE(?,password) 
           WHERE id = ?`,
        [data.name, data.email, data.password, req.params.id],
        function (err, result) {
            if (err){
                res.status(400).json({"error": res.message})
                return;
            }
            res.json({
                message: "success",
                data: data,
                changes: this.changes
            })
    });
});

app.delete("/api/users/:id", (req, res, next) => {
    db.run(
        'DELETE FROM user WHERE id = ?',
        req.params.id,
        function (err, result) {
            if (err){
                res.status(400).json({"error": res.message})
                return;
            }
            res.json({"message":"deleted", changes: this.changes})
    });
});

//inicia o servidor
app.listen(HTTP_PORT, () => {
    console.log("Servidor rodando na porta %PORT%".replace("%PORT%",HTTP_PORT));
});

app.get("/",(req,res,next) => {
    res.json({"message":"OK"})
});

app.use(function(req, res){
    res.status(404);
});