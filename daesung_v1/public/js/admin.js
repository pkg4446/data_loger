admin_check();
////-------------------////
async function admin_check() {
    if(localStorage.getItem('manager')==null){
        admin_authority();
    }else{
        const response = await fetchData("admin/check",{token:localStorage.getItem('manager')});
        if (response.status==400) {admin_authority();}
        else{window.location.href="/web/sudo"}
    }
}
////-------------------////
function admin_authority() {
    Swal.fire({
        position: "top",
        icon:   "question",
        title:  "관리자 로그인",
        input: "text",
        inputPlaceholder: "관리자 KEY를 입력하세요."
    }).then(async (result)=>{
        if(result.value != "" && result.value != undefined){
            const response = await fetchData("admin/authority",{key:result.value});
            try {
                if (response.status==400) {
                    throw new Error('관리자 KEY가 누락됐습니다.');
                }else if (response.status==403) {
                    throw new Error('KEY가 다릅니다.');
                }else if (response.status==202) {
                    throw new Error("관리자 KEY가 변경되었습니다.");
                }else{
                    const data = await response.text();
                    if (data != "key" && data != "fail" && data != "new") {
                        localStorage.setItem('manager', data);
                        Swal.fire({
                            position: "top",
                            icon:   "success",
                            title:  "관리자로 접속 되었습니다.",
                            showConfirmButton: false,
                            timer:  1500
                        });
                        window.location.href="/web/sudo"
                    }
                }
            } catch (error) {
                console.error('Error:', error);
                Swal.fire({
                    position: "top",
                    icon:   "error",
                    title:  '관리자 접속 오류가 발생했습니다.',
                    text:   error,
                    showConfirmButton: false,
                    timer:  1500
                }).then(() => {
                    admin_authority();
                });
            }
        }else{
            history.back();
        }
    });
}
////-------------------////