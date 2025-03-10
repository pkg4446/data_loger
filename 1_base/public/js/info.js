page_init();
async function page_init() {
    const send_data = {
        id:     localStorage.getItem('user'),
        token:  localStorage.getItem('token')
    };
    const response = await(await fetchData("user/info",send_data)).json();
    const root = ReactDOM.createRoot(document.getElementById("root"));
    root.render(React.createElement(PersonalInfoManager,{initialUserData:response},null));
}

// React 컴포넌트 생성
function PersonalInfoManager({initialUserData}) {
    // 상태 생성
    const [userData, setUserData] = React.useState(initialUserData);
    const [editedData, setEditedData] = React.useState({...initialUserData});
    const [isEditMode, setIsEditMode] = React.useState(false);
    // 수정 모드 전환
    function toggleEditMode() {
      if (!isEditMode) {
        // 조회 모드 -> 수정 모드로 전환 시 현재 데이터 복사
        setEditedData({...userData});
      }
      setIsEditMode(!isEditMode);
    }
    // 입력 변경 핸들러
    function handleChange(field, value) {
      const newData = {...editedData};
      newData[field] = value;
      setEditedData(newData);
    }
    // 저장 핸들러
    async function handleSave() {
      setUserData({...editedData});
      setIsEditMode(false);
      const send_data = {
        id:     localStorage.getItem('user'),
        token:  localStorage.getItem('token'),
        info:   editedData
    };
        const response = await fetchData("user/info_modify",send_data);
        let swal_icon = "error";
        if(response.status == 200){swal_icon = "success"}
        Swal.fire({
            position: "top",
            icon:   swal_icon,
            title:  "개인정보 변경",
            showConfirmButton: false,
            timer:  1500
        });
        
    }
    // 취소 핸들러
    function handleCancel() {
      setEditedData({...userData});
      setIsEditMode(false);
    }
    // 폼 제출 방지
    function handleSubmit(e) {
      e.preventDefault();
      handleSave();
    }
    // 조회 모드 렌더링
    function renderViewMode() {
      return React.createElement('div', null,
        React.createElement('h1', null, '개인정보 조회'),
        React.createElement('div', { className: 'form-group' },
          React.createElement('label', null, '이름'),
          React.createElement('div', { className: 'info-display' }, userData.name)
        ),
        React.createElement('div', { className: 'form-group' },
          React.createElement('label', null, '주소'),
          React.createElement('div', { className: 'info-display' }, userData.addr)
        ),
        React.createElement('div', { className: 'form-group' },
          React.createElement('label', null, '주소지명칭'),
          React.createElement('div', { className: 'info-display' }, userData.farm)
        ),
        React.createElement('div', { className: 'form-group' },
          React.createElement('label', null, '전화번호'),
          React.createElement('div', { className: 'info-display' }, userData.tel)
        ),
        React.createElement('div', { className: 'button-group' },
          React.createElement('button', {
            type: 'button',
            className: 'edit-button',
            onClick: toggleEditMode
          }, '수정하기')
        )
      );
    }

    // 수정 모드 렌더링
    function renderEditMode() {
      return React.createElement('div', null,
        React.createElement('h1', null, '개인정보 수정'),
        React.createElement('form', { onSubmit: handleSubmit },
          // 이름 필드 (수정 불가)
          React.createElement('div', { className: 'form-group' },
            React.createElement('label', { htmlFor: 'name' }, '이름'),
            React.createElement('input', {
              type: 'text',
              id: 'name',
              value: editedData.name,
              disabled: true
            }),
            React.createElement('div', { className: 'readonly-info' }, '* 이름은 변경할 수 없습니다.')
          ),
          // 주소 필드
          React.createElement('div', { className: 'form-group' },
            React.createElement('label', { htmlFor: 'addr' }, '주소'),
            React.createElement('input', {
              type: 'text',
              id: 'addr',
              value: editedData.addr,
              onChange: (e) => handleChange('addr', e.target.value)
            })
          ),
          // 주소지명칭 필드
          React.createElement('div', { className: 'form-group' },
            React.createElement('label', { htmlFor: 'farm' }, '주소지명칭'),
            React.createElement('input', {
              type: 'text',
              id: 'farm',
              value: editedData.farm,
              onChange: (e) => handleChange('farm', e.target.value)
            })
          ),
          // 전화번호 필드
          React.createElement('div', { className: 'form-group' },
            React.createElement('label', { htmlFor: 'tel' }, '전화번호'),
            React.createElement('input', {
              type: 'tel',
              id: 'tel',
              value: editedData.tel,
              onChange: (e) => handleChange('tel', e.target.value)
            })
          ),
          // 버튼 그룹
          React.createElement('div', { className: 'button-group' },
            React.createElement('button', {
              type: 'button',
              className: 'cancel-button',
              onClick: handleCancel
            }, '취소'),
            React.createElement('button', {
              type: 'submit',
              className: 'save-button'
            }, '저장')
          )
        )
      );
    }
    // 컴포넌트 렌더링
    return React.createElement('div', { className: 'container' },
      isEditMode ? renderEditMode() : renderViewMode()
    );
}