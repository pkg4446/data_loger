const express   = require('express');
const html      = require('../api/html_viewer');
const router    = express.Router();

router.get('/', async function(req, res) {
    const css = html.css("main") + html.css("list");
    let js  = html.js("sweetalert2");
        js += html.js("login_text");
        js += html.js("device_list");
    let web_page = html.page("device_list",css,js);
    res.status(201).send(web_page);
});

router.get('/stats', async function(req, res) {
    const css = html.css("main") + html.css("stats");
    let js  = html.js("sweetalert2");
        js += html.js("login_text");
        js += html.js("stats");
    let web_page = html.page("stats",css,js);
    res.status(201).send(web_page);
});

router.get('/admin', async function(req, res) {
    const css = html.css("main") + html.css("admin");
    let js  = html.js("sweetalert2");
        js += html.js("login_text");
        js += html.js("admin");
    let web_page = html.page("admin",css,js);
    res.status(201).send(web_page);
});

router.get('/login', async function(req, res) {
    const css = html.css("main") + html.css("user");
    let js  = html.js("sweetalert2");
        js += html.js("login_text");
        js += html.js("logo");
        js += html.js("login");
    let web_page = html.page("login",css,js);
    res.status(201).send(web_page);
});

router.get('/join', async function(req, res) {
    const css = html.css("main") + html.css("user");
    let js  = html.js("sweetalert2");
        js += html.js("login_text");
        js += html.js("logo");
        js += html.js("join");
    let web_page = html.page("join",css,js);
    res.status(201).send(web_page);
});

router.get('/connect', async function(req, res) {
    const css = html.css("main") + html.css("user");
    let js  = html.js("sweetalert2");
        js += html.js("login_text");
        js += html.js("device_reg");
    let web_page = html.page("device_reg",css,js);
    res.status(201).send(web_page);
});

router.get('/select', async function(req, res) {
    const css = html.css("main") + html.css("log");
    let js  = `<script src="https://cdn.jsdelivr.net/npm/echarts@5.5.1/dist/echarts.min.js"></script>`;
        js += html.js("device_log");
        js += html.js("login_text");
    let web_page = html.page("device_log",css,js);
    res.status(201).send(web_page);
});

router.get('/pump_log', async function(req, res) {
    const css = html.css("main") + html.css("log");
    let js  = `<script src="https://cdn.jsdelivr.net/npm/echarts@5.5.1/dist/echarts.min.js"></script>`;
        js += html.js("pump_log");
        js += html.js("login_text");
    let web_page = html.page("pump_log",css,js);
    res.status(201).send(web_page);
});
module.exports = router;