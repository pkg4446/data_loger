const express   = require('express');
const router    = express.Router();

const web       = require('./web');
const device    = require('./device');
const admin     = require('./admin');
const user      = require('./user');
const request    = require('./request');

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
router.use('/device',device);
router.use('/admin',admin);
router.use('/user',user);
router.use('/request',request);

module.exports  = router;