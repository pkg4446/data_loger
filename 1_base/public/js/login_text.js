const user_info  = document.getElementById("user");
if(window.location.pathname == "/web/login" || window.location.pathname == "/web/join"){
    ReactDOM.render(tag_a("/web/login",React.createElement("div",null,"로그인")), user_info);
}else if(localStorage.getItem('user')==null || localStorage.getItem('token')==null){
    window.location.replace('/web/login');
}else{
    const category = {
        "login"     : "로 그 아 웃",
        "list"      : "장 비 목 록",
        "connect"   : "장 비 등 록",
        "info"      : "사용자 정보",
    }
    const user_menu = [];
    for (const key in category) {
        user_menu.push(tag_a("/web/"+key,React.createElement("div",null,category[key])));
    }
    ReactDOM.render(user_menu, user_info);
}
function tag_a(link,text) {
    return React.createElement("a",{href:link},text);
}