const express   = require('express');
const html      = require('../api/html_viewer');
const router    = express.Router();

router.get('/', async function(req, res) {
    const css = html.css("common");
    const js  = html.js("fetch")+html.js("login_text");
    const web_page = await html.page("common",css,js);
    res.status(201).send(web_page);
});

router.get('/admin', async function(req, res) {
    const css = html.css("common")+html.css("admin");
    const js  = html.js("fetch")+html.js("login_text")+html.js("admin");
    const web_page = await html.page("admin",css,js);
    res.status(201).send(web_page);
});

router.get('/sudo', async function(req, res) {
    const css = html.css("common")+html.css("admin");
    const js  = html.js("fetch")+html.js("login_text")+html.js("sudo");
    const web_page = await html.page("admin",css,js);
    res.status(201).send(web_page);
});

router.get('/login', async function(req, res) {
    const css = html.css("common")+html.css("write")+html.css("user");
    const js  = html.js("fetch")+html.js("login_text")+html.js("login");
    const web_page = await html.page("login",css,js);
    res.status(201).send(web_page);
});

router.get('/join', async function(req, res) {
    const css = html.css("common")+html.css("write")+html.css("user");
    const js  = html.js("fetch")+html.js("login_text")+html.js("join");
    const web_page = await html.page("join",css,js);
    res.status(201).send(web_page);
});

router.get('/info', async function(req, res) {
    const css = html.css("common");
    const js  = html.js("fetch")+html.js("login_text")+html.js("info");
    const web_page = await html.page("common",css,js);
    res.status(201).send(web_page);
});

router.get('/connect', async function(req, res) {
    const css = html.css("common")+html.css("write")+html.css("user");
    const js  = html.js("fetch")+html.js("login_text")+html.js("device_reg");
    const web_page = await html.page("common",css,js);
    res.status(201).send(web_page);
});

module.exports = router;