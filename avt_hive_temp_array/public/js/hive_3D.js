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
        this._setModel_hive(8);

        this._setControls();
        this._setupEvents();
        this._setupResize();  
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
        // this._scene.fog = new THREE.Fog(0xffffff, 0, 150);
        // this._scene.fog = new THREE.FogExp2(0xffffff, 0.02);
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
            // divContainer의 위치와 크기를 얻습니다.
            const rect = this._divContainer.getBoundingClientRect();

            // divContainer 내부에서의 클릭 위치를 계산합니다.
            this._raycaster._clickedPosition.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
            this._raycaster._clickedPosition.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
            
            this._raycaster.setFromCamera(this._raycaster._clickedPosition, this._camera);
            const found = this._raycaster.intersectObjects(this._scene.children);

            if(found.length > 0) {
                const clickedObj = found[0].object;
                if(clickedObj.geometry.type == "BoxGeometry"){
                    console.log("Box");
                }else{
                    const hive_data = clickedObj.name.split('_');
                    if(hive_data[0] == "honeycomb"){
                        const hive_index = parseInt(hive_data[1]);
                        const oldSelectedIndex = this._raycaster._selectedMesh;
                        this._raycaster._selectedMesh = hive_index;
                        if(oldSelectedIndex !== this._raycaster._selectedMesh) {
                            let honeycomb_hight = 0;
                            for (let index = 0; index < this.hive[hive_index].length; index++) {
                                if(index%divide_number == 0) honeycomb_hight += 1;
                                // gsap는 import 되어있다고 가정합니다.
                                gsap.to(this.hive[hive_index][index].position, { y: 1 - honeycomb_hight/divide_number, duration: 1 });
                                gsap.to(this.hive[hive_index][index].rotation, { y: Math.PI*2, duration: 1 });
                            }
                        } else {
                            this._raycaster._selectedMesh = null;
                        }           
                        if(oldSelectedIndex != null) {
                            let honeycomb_hight = 0;
                            for (let index = 0; index < this.hive[hive_index].length; index++) { // 여기서 hive_index 대신 oldSelectedIndex를 사용해야 합니다.
                                if(index%divide_number == 0) honeycomb_hight += 1;
                                gsap.to(this.hive[oldSelectedIndex][index].position, { y: 0.3 - honeycomb_hight/divide_number, duration: 1 });
                                gsap.to(this.hive[oldSelectedIndex][index].rotation, { y: -Math.PI*2, duration: 1 });
                            }
                        }
                    }
                }
            } else {
                // 아무것도 클릭되지 않았을 때 이전에 선택된 항목이 있다면 원래 위치로 돌려놓는 로직이 필요할 수 있습니다.
                // 현재 코드에서는 _selectedMesh가 null로만 설정됩니다.
                if (this._raycaster._selectedMesh !== null) {
                    let honeycomb_hight = 0;
                    for (let index = 0; index < this.hive[this._raycaster._selectedMesh].length; index++) {
                        if(index%divide_number == 0) honeycomb_hight += 1;
                        gsap.to(this.hive[this._raycaster._selectedMesh][index].position, { y: 0.3 - honeycomb_hight/divide_number, duration: 1 });
                        gsap.to(this.hive[this._raycaster._selectedMesh][index].rotation, { y: -Math.PI*2, duration: 1 });
                    }
                    this._raycaster._selectedMesh = null;
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
        // this._bottom = bottom;
    }

    
    _setModel_hive(num) {
        const data_number = 120;
        let geometry = new THREE.CylinderGeometry( 0.2, 0.2, 0.1, 6 )
        let hive = [];
        for (let index = 0; index < num; index++) {
            let honeycomb       = [];
            let honeycomb_hight = 0;
            for (let honeycomb_index = 0; honeycomb_index < data_number; honeycomb_index++) {
                if(honeycomb_index%divide_number == 0) honeycomb_hight += 1;
                let material = new THREE.MeshBasicMaterial( {
                    color: 'rgb(255,46,99)',
                    side: THREE.BackSide
                });
                material.color.g = Math.random()*0.5;
                material.color.b = Math.random()*0.8;
                honeycomb.push(new THREE.Mesh( geometry, material));
                honeycomb[honeycomb_index].scale.multiplyScalar(0.18);
                honeycomb[honeycomb_index].rotation.set(Math.PI/2,0,0);
                honeycomb[honeycomb_index].position.set(honeycomb_index%divide_number/14 - 0.525 + honeycomb_hight%2*0.035, 0.3-honeycomb_hight/divide_number, 0.45 - index/8);
                honeycomb[honeycomb_index].name = "honeycomb_"+index;
                // this._scene.add(honeycomb[honeycomb_index]);
            }
            hive.push(honeycomb);
            hive[index].forEach(element => {
                this._scene.add(element);
            });
        }
        this.hive = hive;
    }
///////////////////////////////////////////////////////////
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
        this.update(time);
        requestAnimationFrame(this.render.bind(this));
    }

    update(time){
        time *= 0.001; // second unitc
        //this._cube.rotation.x = time;
        //this._cube.rotation.y = time;
    }
}

//3js end

function EquipmentManager() {
  const [arrayDevices, setArrayDevices] = React.useState([]);

  React.useEffect(() => {
    loadDevices();
  }, []);

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
          onClick: () => { location.href = "/web/array/" + status[0] }
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


window.onload = function() {
    new App();
    initEquipment();
}
