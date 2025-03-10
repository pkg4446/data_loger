const fs = require('fs').promises;
const fsSync = require('fs');

module.exports = {

    Sync_check:  function(FOLDER){
        const PATH  = FOLDER;
        const CHECK = fsSync.existsSync(PATH, 'utf8');
        return CHECK;
    },
    
    Sync_folderMK: function(PATH){  
        const path_forder = PATH.split("/")
        let   response = false;
        if(path_forder[0]=="."){
            response = true;
            let path_make = ".";
            for (let index = 1; index < path_forder.length; index++) {
                path_make += "/"+path_forder[index];
                console.log(path_make);
                if(!fsSync.existsSync(path_make, 'utf8'))fsSync.mkdirSync(path_make);
            }
        }
        return response;
    },

    Dir: async function(FOLDER) {
        try {
            const PATH = FOLDER + "/";
            const dir = await fs.readdir(PATH);
            return dir;
        } catch (error) {
            return false;
        }
    },

    check: async function(FOLDER) {
        try {
            const PATH = FOLDER;
            const CHECK = await fs.access(PATH);
            return true;
        } catch (error) {
            return false;
        }
    },

    move: async function(TARGET, MOVE) {
        try {
            await fs.rename(TARGET, MOVE);
            return true;
        } catch (error) {
            return false;
        }
    },

    folderDel: async function(FOLDER) {
        const PATH = FOLDER + "/";
        try {
            await fs.rm(PATH, { recursive: true, force: true });
            return true;
        } catch (error) {
            console.error(`${FOLDER} 폴더가 삭제되지 않았습니다.`);
            return false;
        }
    },

    folderMK: async function(PATH) {
        const path_forder = PATH.split("/");
        let response = false;
        if (path_forder[0] == ".") {
            response = true;
            let path_make = ".";
            for (let index = 1; index < path_forder.length; index++) {
                path_make += "/" + path_forder[index];
                console.log(path_make);
                try {
                    await fs.mkdir(path_make, { recursive: true });
                } catch (error) {
                    return false;
                }
            }
        }
        return response;
    },

    fileRead: async function(FOLDER, FILE) {
        try {
            const data = await fs.readFile(`${FOLDER}/${FILE}`, 'utf8');
            return data;
        } catch (error) {
            return null;
        }
    },

    fileRead_raw: async function(FOLDER, FILE) {
        try {
            const data = await fs.readFile(`${FOLDER}/${FILE}`);
            return data;
        } catch (error) {
            return null;
        }
    },

    fileMK: async function(FOLDER, DATA, FILE) {
        try {
            await fs.writeFile(`${FOLDER}/${FILE}`, DATA);
            return true;
        } catch (error) {
            return false;
        }
    },

    fileADD: async function(FOLDER, DATA, FILE) {
        try {
            await fs.appendFile(`${FOLDER}/${FILE}`, DATA);
            return true;
        } catch (error) {
            return false;
        }
    },

    fileDel: async function(FOLDER, FILE) {
        const PATH = FOLDER + "/";
        try {
            await fs.readdir(PATH);  // Check if directory exists
            try {
                await fs.unlink(PATH + FILE);  // Delete file
                return FILE;
            } catch (error) {
                return false;
            }
        } catch (error) {
            try {
                await fs.mkdir(PATH);  // Create the folder if it doesn't exist
            } catch (error) {
                return false;
            }
            return false;
        }
    },
};
