const express   = require('express');
const html      = require('../html_viewer');
const router    = express.Router();

router.get('/', async function(req, res) {
    const css = html.css("/public/css/main");
    const js  = html.js("/public/js/main") + html.js("https://cdn.jsdelivr.net/npm/chart");
    const web_page = html.page("index",css,js);
    res.status(201).send(web_page);
});

router.get('/login', async function(req, res) {
    const css = html.css("/public/css/main") + html.css("/public/css/user");
    const js  = html.js("/public/js/login");
    let web_page = html.page("login",css,js);
    res.status(201).send(web_page);
});

router.get('/join', async function(req, res) {
    const css = html.css("/public/css/main") + html.css("/public/css/user");
    const js  = html.js("/public/js/join");
    let web_page = html.page("join",css,js);
    res.status(201).send(web_page);
});

router.get('/connect', async function(req, res) {
    const css = html.css("/public/css/main") + html.css("/public/css/user");
    const js  = html.js("/public/js/device_reg");
    let web_page = html.page("device_reg",css,js);
    res.status(201).send(web_page);
});

router.get('/select', async function(req, res) {
    const css = html.css("/public/css/main") + html.css("/public/css/list");
    const js  = html.js("/public/js/device_list");
    let web_page = html.page("list",css,js);
    res.status(201).send(web_page);
});

router.get('/control', async function(req, res) {
    const css = html.css("/public/css/main") + html.css("/public/css/control");
    const js  = html.js("/public/js/control");
    let web_page = html.page("control",css,js);
    res.status(201).send(web_page);
});
module.exports = router;