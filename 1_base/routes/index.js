const express   = require('express');
const router    = express.Router();

const web       = require('./web');
const log       = require('./log');
const admin     = require('./admin');
const user      = require('./user');
const device    = require('./device');

router.route("/")
    .get(async function(req, res) {
        res.redirect("web/");
    })
    .post(async function(req, res) {
        const response = {header:req.headers,body:req.body}
        console.log(response);
        res.status(201).send(response);
    });
router.use('/web',web);
router.use('/log',log);
router.use('/admin',admin);
router.use('/user',user);
router.use('/device',device);

module.exports  = router;