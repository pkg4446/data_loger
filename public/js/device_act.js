init();
function init() {
    const today = new Date();
    graph();
}
async function graph() {
    const sendData = {
        id:     localStorage.getItem('user'),
        token:  localStorage.getItem('token'),
        type:   "act",
        dvid:   window.location.pathname.split("act/")[1]
    };
    const root  = ReactDOM.createRoot(document.getElementById("root"));
    console.log(sendData);
}