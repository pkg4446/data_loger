localStorage.removeItem('user');
localStorage.removeItem('token');
document.getElementById('userForm').addEventListener('submit', async function(event) {
    event.preventDefault();

    const send_data = {
        id:     document.getElementById('userid').value,
        pass:   document.getElementById('password').value
    }
    const response = await fetchData("user/login",send_data);
    try {
        if (response.status==400) {
            throw new Error('아이디 또는 비밀번호가 누락됐습니다.');
        }else if (response.status==403) {
            throw new Error('비밀번호가 다릅니다.');
        }else if (response.status==406) {
            throw new Error('아이디가 없습니다.');
        }
    } catch (error) {
        console.error('Error:', error);
        Swal.fire({
            position: "top",
            icon:   "error",
            title:  '접속시도 중 오류가 발생했습니다.',
            text:   error,
            showConfirmButton: false,
            timer:  1500
        });
    } finally {
        const data = await response.text();
        if (data != "nodata" && data != "password" && data != "userid") {
            localStorage.setItem('user',  send_data.id);
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
    }
});