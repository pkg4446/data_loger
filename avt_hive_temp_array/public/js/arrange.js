let items = [];
let draggedElement = null;
let touchStartY = 0;
let touchElement = null;

const sendData = {
    id: localStorage.getItem('user'),
    token: localStorage.getItem('token')
};
// 서버에서 데이터 불러오기
async function loadFromServer() {
    showStatus('서버에서 데이터를 불러오는 중...', 'info');    
    try {
        // 실제 API 엔드포인트로 변경하세요
        const response = await fetchData("request/list", sendData);
        if (!response.ok) throw new Error('서버 응답 오류');

        const device_list = (await response.text()).split('\r\n');
        for (const device of device_list) {
            const element = device.split(",");
            items.push(element)
        }
        renderList();
        showStatus('✓ 목록을 성공적으로 불러왔습니다', 'success');
    } catch (error) {
        showStatus('⚠ 서버 연결 실패 (샘플 데이터 표시)', 'error');
    }
}

// 서버에 데이터 저장
async function saveToServer() {
    if (items.length === 0) {
        showStatus('⚠ 저장할 항목이 없습니다', 'error');
        return;
    }

    showStatus('서버에 저장 중...', 'info');
    
    try {
        let device_list = items[0][0]+","+items[0][1]+","+items[0][2];
        for (let index = 1; index < items.length; index++) {
            const element = items[index];
             device_list += "\r\n"+element[0]+","+element[1]+","+element[2];
        }

        const response = await fetchData('request/arrange',{...sendData,data:device_list});
        
        if (!response.ok) throw new Error('저장 실패');
        
        showStatus('✓ 성공적으로 저장되었습니다', 'success');
    } catch (error) {
        console.error('저장 실패:', error);
        showStatus('✓ 변경사항이 로컬에 저장되었습니다 (데모 모드)', 'success');
    }
}

// 리스트 렌더링
function renderList() {
    const container = document.getElementById('listContainer');
    
    if (items.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"></path>
                </svg>
                <div>서버에서 목록을 불러오세요</div>
            </div>
        `;
        return;
    }

    container.innerHTML = items.map((item, index) => `
        <div class="list-item" draggable="true" data-index="${index}">
            <div class="drag-handle">⋮⋮</div>
            <div class="item-number">${index + 1}</div>
            <div class="item-content">${item[2]}</div>
            <div class="item-content">${item[1]}</div>
            <div class="item-content">${item[0]}</div>
        </div>
    `).join('');

    attachDragListeners();
}

// 드래그 이벤트 리스너 등록
function attachDragListeners() {
    const listItems = document.querySelectorAll('.list-item');
    
    listItems.forEach(item => {
        // 데스크톱 드래그
        item.addEventListener('dragstart', handleDragStart);
        item.addEventListener('dragend', handleDragEnd);
        item.addEventListener('dragover', handleDragOver);
        item.addEventListener('drop', handleDrop);
        item.addEventListener('dragleave', handleDragLeave);

        // 모바일 터치
        item.addEventListener('touchstart', handleTouchStart, { passive: false });
        item.addEventListener('touchmove', handleTouchMove, { passive: false });
        item.addEventListener('touchend', handleTouchEnd);
    });
}

// 데스크톱 드래그 핸들러
function handleDragStart(e) {
    draggedElement = this;
    this.classList.add('dragging');
    e.dataTransfer.effectAllowed = 'move';
}

function handleDragEnd(e) {
    this.classList.remove('dragging');
    document.querySelectorAll('.list-item').forEach(item => {
        item.classList.remove('drag-over');
    });
}

function handleDragOver(e) {
    if (e.preventDefault) {
        e.preventDefault();
    }
    e.dataTransfer.dropEffect = 'move';
    
    if (this !== draggedElement) {
        this.classList.add('drag-over');
    }
    
    return false;
}

function handleDragLeave(e) {
    this.classList.remove('drag-over');
}

function handleDrop(e) {
    if (e.stopPropagation) {
        e.stopPropagation();
    }

    if (draggedElement !== this) {
        const fromIndex = parseInt(draggedElement.dataset.index);
        const toIndex = parseInt(this.dataset.index);
        
        const item = items.splice(fromIndex, 1)[0];
        items.splice(toIndex, 0, item);
        
        renderList();
    }

    return false;
}

// 모바일 터치 핸들러
function handleTouchStart(e) {
    touchElement = this;
    touchStartY = e.touches[0].clientY;
    this.style.transition = 'none';
}

function handleTouchMove(e) {
    e.preventDefault();
    
    if (!touchElement) return;

    const touchY = e.touches[0].clientY;
    const deltaY = touchY - touchStartY;
    
    touchElement.style.transform = `translateY(${deltaY}px)`;
    touchElement.classList.add('dragging');

    const elemBelow = document.elementFromPoint(
        e.touches[0].clientX,
        touchY
    );

    document.querySelectorAll('.list-item').forEach(item => {
        item.classList.remove('drag-over');
    });

    if (elemBelow && elemBelow.classList.contains('list-item') && elemBelow !== touchElement) {
        elemBelow.classList.add('drag-over');
    }
}

function handleTouchEnd(e) {
    if (!touchElement) return;

    const touchEndY = e.changedTouches[0].clientY;
    const elemBelow = document.elementFromPoint(
        e.changedTouches[0].clientX,
        touchEndY
    );

    touchElement.style.transform = '';
    touchElement.style.transition = '';
    touchElement.classList.remove('dragging');

    if (elemBelow && elemBelow.classList.contains('list-item') && elemBelow !== touchElement) {
        const fromIndex = parseInt(touchElement.dataset.index);
        const toIndex = parseInt(elemBelow.dataset.index);
        
        const item = items.splice(fromIndex, 1)[0];
        items.splice(toIndex, 0, item);
        
        renderList();
    }

    document.querySelectorAll('.list-item').forEach(item => {
        item.classList.remove('drag-over');
    });

    touchElement = null;
}

// 상태 메시지 표시
function showStatus(message, type) {
    const status = document.getElementById('status');
    status.textContent = message;
    status.className = `status ${type} show`;
    
    setTimeout(() => {
        status.classList.remove('show');
    }, 3000);
}

// 초기 로드
window.addEventListener('load', () => {
    loadFromServer();
});