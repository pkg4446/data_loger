import * as THREE from "three"; // importmap에서 "three" 경로를 참조합니다.
import { OrbitControls } from "https://unpkg.com/three@0.165.0/examples/jsm/controls/OrbitControls.js"; // OrbitControls CDN 경로

const divide_number = 15;

class App {
    constructor() {
        this._setupThreeJs();
        this._setCamera();
        this._setLight();
        this._setBackground();
        this._setModel_box();
        this._setControls();
        this._setupEvents();
        this._setupResize(); 
        this.hive = []; // hive 초기화
    }

    _setupThreeJs() {
        const divContainer = document.querySelector("#webgl-container");
        this._divContainer = divContainer;

        const renderer = new THREE.WebGLRenderer({ antialias: true });
        renderer.setPixelRatio(window.devicePixelRatio);
        divContainer.appendChild(renderer.domElement);
        this._renderer = renderer;

        renderer.outputEncoding = THREE.sRGBEncoding;
        renderer.toneMappingExposure = 2.5;

        const scene = new THREE.Scene();
        this._scene = scene;
    }

    _setupResize() {
        window.onresize = this.resize.bind(this);
        this.resize();

        this._clock = new THREE.Clock();
        requestAnimationFrame(this.render.bind(this));
    }

    _setBackground(){
        this._scene.background = new THREE.Color(0xffffff);
    }

    _setCamera() {
        const width  = this._divContainer.clientWidth;
        const height = this._divContainer.clientHeight;
        const camera = new THREE.PerspectiveCamera(
            75,
            width/height,
            0.1,
            100
        );
        camera.position.z = 2;
        this._camera = camera;
    }

    _setLight() {
        const color = 0xffffff;
        const intensity = 1;
        const light = new THREE.DirectionalLight(color,intensity);
        light.position.set(-1,2,4);
        this._scene.add(light);
    }

    _setupEvents() {
        this._raycaster = new THREE.Raycaster();
        this._raycaster._clickedPosition = new THREE.Vector2();
        this._raycaster._selectedMesh = null;

        window.addEventListener("click", (event) => {
            const rect = this._divContainer.getBoundingClientRect();

            this._raycaster._clickedPosition.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
            this._raycaster._clickedPosition.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
            
            this._raycaster.setFromCamera(this._raycaster._clickedPosition, this._camera);
            const found = this._raycaster.intersectObjects(this._scene.children);

            if(found.length > 0) {
                const clickedObj = found[0].object;
                if(clickedObj.geometry.type == "BoxGeometry"){
                    console.log("Box");
                } else {
                    const hive_data = clickedObj.name.split('_');
                    if(hive_data[0] == "honeycomb"){
                        const hive_index = parseInt(hive_data[1]);
                        const oldSelectedIndex = this._raycaster._selectedMesh;
                        this._raycaster._selectedMesh = hive_index;
                        if(oldSelectedIndex !== this._raycaster._selectedMesh) {
                            let honeycomb_hight = 0;
                            for (let index = 0; index < this.hive[hive_index].length; index++) {
                                if(index % divide_number == 0) honeycomb_hight += 1;
                                gsap.to(this.hive[hive_index][index].position, { y: 1 - honeycomb_hight / divide_number, duration: 1 });
                                gsap.to(this.hive[hive_index][index].rotation, { y: Math.PI * 2, duration: 1 });
                            }
                        } else {
                            this._raycaster._selectedMesh = null;
                        }     
                        if(oldSelectedIndex != null) {
                            let honeycomb_hight = 0;
                            for (let index = 0; index < this.hive[oldSelectedIndex].length; index++) {
                                if(index % divide_number == 0) honeycomb_hight += 1;
                                gsap.to(this.hive[oldSelectedIndex][index].position, { y: 0.3 - honeycomb_hight / divide_number, duration: 1 });
                                gsap.to(this.hive[oldSelectedIndex][index].rotation, { y: -Math.PI * 2, duration: 1 });
                            }
                        }
                    }
                }
            }
        });
    }

    _setModel_box() {
        const material_glass = new THREE.MeshPhysicalMaterial({
            color: 0xE8DCD2,
            metalness: 0.1,
            roughness: 0.1,
            ior: 1,
            thickness: 0.05,
            transmission: 1.2,
            side: THREE.DoubleSide
        });
        
        const geometry_bottom = new THREE.BoxGeometry(1.4, 0.05,1.2);
        const geometry_front  = new THREE.BoxGeometry(0.05,0.5, 1.2);
        const geometry_back   = new THREE.BoxGeometry(0.05,0.6, 1.2);
        const geometry_side   = new THREE.BoxGeometry(1.2, 0.6, 0.05);
        
        const bottom = new THREE.Mesh(geometry_bottom,material_glass);
        const front = new THREE.Mesh(geometry_front,material_glass);
        const back  = new THREE.Mesh(geometry_back,material_glass);
        const side_left  = new THREE.Mesh(geometry_side,material_glass);
        const side_right = new THREE.Mesh(geometry_side,material_glass);
        bottom.position.set(0.05, -0.3, 0);
        back.position.set(-0.625, 0,   0);
        front.position.set(  0.625, 0.05,0);
        side_left.position.set( 0, 0, 0.575);
        side_right.position.set(0, 0,   -0.575);
        this._scene.add(bottom);
        this._scene.add(side_left);
        this._scene.add(side_right);
        this._scene.add(front);
        this._scene.add(back);
    }

    // 기존의 모든 벌집을 제거하고 새롭게 생성합니다.
    _setModel_hive(num, hiveData) { // hiveData 인자 추가
        // 기존 벌집 제거
        this.hive.forEach(honeycombArray => {
            honeycombArray.forEach(honeycomb => {
                this._scene.remove(honeycomb);
                honeycomb.geometry.dispose();
                honeycomb.material.dispose();
            });
        });
        this.hive = []; // 벌집 배열 초기화

        const data_number = 120;
        let geometry = new THREE.CylinderGeometry( 0.2, 0.2, 0.1, 6 )
        
        for (let index = 0; index < num; index++) {
            let honeycomb = [];
            let honeycomb_hight = 0;
            const currentHiveTemps = hiveData[index] || []; // 해당 벌집의 온도 데이터
            for (let honeycomb_index = 0; honeycomb_index < data_number; honeycomb_index++) {
                if(honeycomb_index%divide_number == 0) honeycomb_hight += 1;
                
                // 온도 데이터를 기반으로 색상 설정
                const temp = currentHiveTemps[honeycomb_index % currentHiveTemps.length]/100; // 데이터가 부족할 경우를 대비
                const color = getColor(temp !== undefined ? temp : 25); // 온도 데이터가 없으면 기본값 25 사용
                
                let material = new THREE.MeshBasicMaterial( {
                    color: color, // getColor 함수로 설정
                    side: THREE.BackSide
                });
                
                honeycomb.push(new THREE.Mesh( geometry, material));
                honeycomb[honeycomb_index].scale.multiplyScalar(0.18);
                honeycomb[honeycomb_index].rotation.set(Math.PI/2,0,0);
                honeycomb[honeycomb_index].position.set(honeycomb_index%divide_number/14 - 0.525 + honeycomb_hight%2*0.035, 0.3-honeycomb_hight/divide_number, 0.45 - index/8);
                honeycomb[honeycomb_index].name = "honeycomb_"+index;
            }
            this.hive.push(honeycomb);
            this.hive[index].forEach(element => {
                this._scene.add(element);
            });
        }
    }

    _setControls() {
        new OrbitControls(this._camera, this._divContainer)
    }

    resize() {
        const width  = this._divContainer.clientWidth;
        const height = this._divContainer.clientHeight;

        this._camera.aspect = width/height;
        this._camera.updateProjectionMatrix();

        this._renderer.setSize(width, height);
    }

    render(time) {
        this._renderer.render(this._scene, this._camera);
        requestAnimationFrame(this.render.bind(this));
    }
}

function EquipmentManager() {
    const [arrayDevices, setArrayDevices] = React.useState([]);
    const [hiveData, setHiveData] = React.useState([]); // 벌집 데이터 상태 추가
    const appRef = React.useRef(null); // App 클래스 인스턴스를 참조하기 위한 ref

    React.useEffect(() => {
        loadDevices();
        // App 클래스의 인스턴스를 생성하고 ref에 할당
        if (!appRef.current) {
            appRef.current = new App();
            appRef.current._setModel_hive(hiveData.length, hiveData); // 초기 벌집 생성 시 hiveData 전달
        }
    }, []);

    // hiveData가 변경될 때마다 _setModel_hive 호출
    React.useEffect(() => {
        if (appRef.current) {
            appRef.current._setModel_hive(hiveData.length, hiveData); // 변경된 hiveData 전달
        }
    }, [hiveData]); // 의존성 배열에 hiveData 추가

    const loadDevices = async () => {
        const sendData = {
            id: localStorage.getItem('user'),
            token: localStorage.getItem('token')
        };

        const response = await fetchData("request/list", sendData);
        const device_list = (await response.text()).split('\r\n');        
        const tempArrayDevices = [];

        for (const device of device_list) {
            const status = device.split(',');
            tempArrayDevices.push(status);
        }
        setArrayDevices(tempArrayDevices);
    };

    const renderArrayDevices = () => {
        return arrayDevices.map((status, index) => (
            React.createElement("div", { key: status[0], className: "equipment-card" }, [
                React.createElement("div", { className: "equipment-name" }, status[2]),
                React.createElement("div", { className: "honeycomb-id" }, status[0].replaceAll("_", ":")),
                React.createElement("div", { 
                    className: "add-to-honeycomb",
                    onClick: async ()=>{
                        const date_now = new Date();
                        const sendData = {
                            id:      localStorage.getItem('user'),
                            token:   localStorage.getItem('token'),
                            type:    "array",
                            dvid:    status[0],
                            date:    [date_now.getFullYear(), date_now.getMonth(), date_now.getDate()]
                        };
                        const response = await(await fetchData("request/log", sendData)).json();

                        let temperatures = [];
                        let times        = [];

                        if(response.length>0){
                            for (let index = 0; index < response.length; index++) {
                                let rawdata = [];
                                const json = response[index];
                                times.push(json.date);
                                for (const key in json) {
                                    if(key != "date" && key != "lipo"){
                                        const element = json[key];
                                        rawdata.push(element);
                                    }
                                }
                                let temperature = [];
                                
                                for (let row = 0; row < rawdata[0].length; row++) {
                                    let temperature_array = [];
                                    for (let column = rawdata.length-1; column >= 0; column--) {
                                        if(temperature_array.length!=0)temperature_array.push((rawdata[row][column]+temperature_array[temperature_array.length-1])/2);
                                        temperature_array.push(rawdata[row][column]);
                                    }
                                    temperature.push(temperature_array);
                                }
                                temperatures.push(temperature);
                            }
                        }else{
                            temperatures    = [[]];
                            times           = [date_now];
                        }
                        
                        let data_array = [];
                        for (let i = 0; i < temperatures.length; i++) { // 'index' 대신 'i' 사용
                            const element = temperatures[i];
                            let datas = [];
                            for (const temps of element) {
                                for (const temp of temps) {
                                    datas.push(temp);
                                }        
                            }
                            data_array.push(datas);
                        }                        
                        // 받아온 data_array를 hiveData에 추가
                        setHiveData(prevHiveData => [...prevHiveData, data_array[0]]); // 첫 번째 데이터 배열만 추가 (필요에 따라 수정)
                    }
                }, "추가"),
            ])
        ));
    };

    return React.createElement("div", {className:"equipment-grid"}, renderArrayDevices());
}

function initEquipment() {
    const root = ReactDOM.createRoot(document.getElementById("root"));
    root.render(React.createElement(EquipmentManager));
}


function getColor(temp) {
    const minTemp = 0;
    const maxTemp = 50;
    const normalizedTemp = (temp - minTemp) / (maxTemp - minTemp);
    let r, g, b;
    if (normalizedTemp < 0.25) {
        b = 255 * (1 - normalizedTemp * 4);
        g = 255 * normalizedTemp * 4;
        r = 0;
    } else if (normalizedTemp < 0.5) {
        b = 0;
        g = 255;
        r = 255 * (normalizedTemp - 0.25) * 4;
    } else if (normalizedTemp < 0.75) {
        b = 0;
        g = 255 * (1 - (normalizedTemp - 0.5) * 4);
        r = 255;
    } else {
        b = 0;
        g = 0;
        r = 255;
    }
    return `rgb(${Math.round(r)}, ${Math.round(g)}, ${Math.round(b)})`;
}

// React와 ReactDOM을 import합니다.
window.onload = function() {
    initEquipment();
}