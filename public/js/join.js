document.getElementById('userForm').addEventListener('submit', async function(event) {
    event.preventDefault();
    const send_data = {
        id:     document.getElementById('userid').value,
        pass:   document.getElementById('password').value,
        check:  document.getElementById('passcheck').value,
        name:   document.getElementById('username').value,
        tel:    document.getElementById('userphone').value,
        farm:   document.getElementById('farmname').value,
        addr:   document.getElementById('farmaddr').value
    };
    const response = await fetchData("user/join",send_data);
    try {
        if (response.status==400) {
            throw new Error('아이디 또는 비밀번호가 누락됐습니다.');
        }else if (response.status==403) {
            throw new Error('비밀번호가 다릅니다.');
        }else if (response.status==406) {
            throw new Error('이미 가입된 아이디 입니다.');
        }else{
            Swal.fire({
                position: "top",
                icon:   "info",
                title:  "회원으로 가입되었습니다.",
                showConfirmButton: false,
                timer:  1500
            }).then((result) => {
                window.location.href = '/web/login';
            });
        }
    } catch (error) {
        console.error('Error:', error);
        Swal.fire({
            position: "top",
            icon:   "error",
            title:  '회원가입 중 오류가 발생했습니다.',
            text:   error,
            showConfirmButton: false,
            timer:  1500
        });
    }
});