localStorage.removeItem('user');
localStorage.removeItem('token');
localStorage.removeItem('device');
document.getElementById('login').textContent = "로그인";
document.getElementById('userForm').addEventListener('submit', function(event) {
    event.preventDefault();

    const userid   = document.getElementById('userid').value;
    const password = document.getElementById('password').value;

    fetch(window.location.protocol+"//"+window.location.host+"/user/login", {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            id:     userid,
            pass:   password
        })
    })
    .then(response => {
        if (response.status==400) {
            throw new Error('아이디 또는 비밀번호가 누락됐습니다.');
        }else if (response.status==403) {
            throw new Error('비밀번호가 다릅니다.');
        }else if (response.status==406) {
            throw new Error('아이디가 없습니다.');
        }
        return response.text(); // JSON 대신 텍스트로 응답을 읽습니다.
    })
    .then(data => {
        if (data != "nodata" && data != "password" && data != "userid") {
            localStorage.setItem('user', userid);
            localStorage.setItem('token', data);
            Swal.fire({
                position: "top",
                icon:   "success",
                title:  "어서 오세요.",
                showConfirmButton: false,
                timer:  1500
            }).then((result) => {
                window.location.href = '/web';
            });
        } else {
        }
    })
    .catch((error) => {
        console.error('Error:', error);
        Swal.fire({
            position: "top",
            icon:   "error",
            title:  '접속시도 중 오류가 발생했습니다.',
            text:   error,
            showConfirmButton: false,
            timer:  1500
        });
    });
});