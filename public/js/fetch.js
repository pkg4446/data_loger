// fetch 함수 정의
async function fetchData(api,send_data) {
    try {
        const response = await fetch(window.location.protocol+"//"+window.location.host+"/"+api, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(send_data)
        });
        return response;
    } catch (error) {
        console.error('Error:', error);
        return {error:ture}
    }
}