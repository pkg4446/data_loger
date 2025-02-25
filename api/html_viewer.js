const fs = require('fs').promises;

module.exports = {
    
    page: async function(FILE,CSS,JS){ 
        let response = await fs.readFile(`./html/header.html`, 'utf8');
        response += CSS;
        response += await fs.readFile(`./html/nav.html`, 'utf8');
        try {
            response += await fs.readFile(`./html/body/${FILE}.html`, 'utf8');
        } catch (error) {}
        response += await fs.readFile(`./html/footer.html`, 'utf8');
        response += JS;
        response += await fs.readFile(`./html/script.html`, 'utf8');
        return response;
    },

    css:   function(CSS){ 
        const response = '<link href="/public/css/'+CSS+'.css" rel="stylesheet" type="text/css" />';
        return response;
    },

    js:   function(JS){ 
        const response = '<script src="/public/js/'+JS+'.js"></script>';
        return response;
    },
}