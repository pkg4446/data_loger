const { Worker } = require('worker_threads');
const path = require('path');

function runWorker(worker_path,worker_file,data) {
    return new Promise((resolve, reject) => {
        const worker = new Worker(path.join(__dirname, worker_path, worker_file + ".js"));
        worker.on('message', (message) => {
            resolve(message);
            // 작업 완료 후 워커 종료
            worker.terminate().catch((err) => {
                console.error('워커 종료 중 에러 발생:', err);
            });
        });
        worker.on('error', (error) => {
            reject(error);
            // 작업 완료 후 워커 종료
            worker.terminate().catch((err) => {
                console.error('워커 종료 중 에러 발생:', err);
            });
        });
        worker.on('exit', (code) => {
            if (code !== 0) {reject(new Error(`워커가 에러 코드 ${code}로 종료됨`));}
        });
        worker.postMessage(data);
    });
}

async function working(worker_path,worker_file,data) {
    let response = null;
    try {response = await runWorker(worker_path,worker_file,data);} 
    catch (error) {console.error('에러 발생:', error)}
    return response;
}

module.exports = {working};