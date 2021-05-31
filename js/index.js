new Vue({
	el: '#app',
	data: function () {
		return {
			canvas: null,
			scene: null,
			camera: null,
			renderer: null,
			model: null,
			width: 0,
			height: 0,
			background: 0xeeeeee,
			activeIndex: 0,
			color: '#000000',
			meshList: [],
			meshColorList: []
		};
	},
	mounted() {
		this.init();
		this.loadModel();
		this.update();
	},
	methods: {
		// 初始化
		init() {
			this.initEL();
			this.initSence();
			this.initLight();
			this.initCamera();
			this.initRenderer();
			this.render();
			this.initControls();
			this.root.appendChild(this.canvas);
		},
		// 获取渲染dom节点
		initEL() {
			this.root = document.getElementById('content');
			this.canvas = document.createElement('canvas');
			this.width = this.root.offsetWidth;
			this.height = this.root.offsetHeight;
			console.log(this.width, this.height);
		},
		// 初始化场景
		initSence() {
			this.scene = new THREE.Scene();
		},
		// 初始化光源
		initLight() {
			// 环境光
			const ambient = new THREE.AmbientLight(0xffffff, 0.9);
			// 点光源
			const point = new THREE.PointLight(0xcccccc, 0.1, 100);
			// 平行光
			const directional = new THREE.DirectionalLight(0xffffff, 0.5);
			this.scene.add(ambient);
			this.scene.add(point);
			this.scene.add(directional);
		},
		// 初始化相机
		initCamera() {
			const aspect = this.width / this.height;
			this.camera = new THREE.PerspectiveCamera(45, aspect, 1, 1000);
			this.camera.position.z = 15;
			this.camera.aspect = aspect;
			this.camera.updateProjectionMatrix();
		},
		// 初始化渲染
		initRenderer() {
			this.renderer = new THREE.WebGLRenderer({ antialias: true });
			this.renderer.setSize(this.width, this.height);
			this.renderer.setClearColor(0xeeeeee, 1);
			this.canvas = this.renderer.domElement;
		},
		// 初始化控制器
		initControls() {
			this.controls = new THREE.OrbitControls(this.camera, this.canvas);
			this.controls.minPolarAngle = (Math.PI * 1) / 6;
			this.controls.maxPolarAngle = (Math.PI * 3) / 4;

			this.controls.smooth = true;
			this.controls.smoothspeed = 0.95;
			this.controls.autoRotateSpeed = 2;
			this.controls.maxDistance = 20;
			this.controls.minDistance = 12;

			this.controls.update();
		},
		// 加载模型
		loadModel() {
			this.loader = new THREE.GLTFLoader();
			this.loader.load('./model/scene.gltf', (model) => {
				model.name = 'headphones';
				let index = 1;
				console.log(model);
				model.scene.traverse((child) => {
					if (child instanceof THREE.Mesh) {
						// 重置材质
						child.material.map = null;
						child.name = '模块' + index;
						index++;
						this.meshList.push(child);
						this.meshColorList.push('rgb(0, 0, 0)');
					}
					this.activeMesh = this.meshList[0];
				});
				this.scene.add(model.scene);
				this.renderer.render(this.scene, this.camera);
			});
		},
		// 渲染
		render() {
			this.camera.lookAt(this.scene.position);
			this.renderer.render(this.scene, this.camera);
		},
		// 更新模型
		update() {
			requestAnimationFrame(() => this.update());
			this.controls.update();
			this.render();
		},
		// 选择模型
		selectMesh(index) {
			let mesh = this.meshList[index];
			this.activeMesh = mesh;
			this.activeIndex = index;
			this.color = this.meshColorList[index];
			this.setSelectColor(this.color);
		},
		// 设置颜色
		setSelectColor(value) {
			let rgb = value.replace(/[rgb]|[(]|[)]|\s/g, '').split(',');
			let text = this.setTexture(rgb);
			this.activeMesh.material = text;
			this.activeMesh.material.map.needsUpdate = true;
			this.activeMesh.material.needsUpdate = true;
			this.meshColorList[this.activeIndex] = value;
		},
		// 设置材质
		setTexture(rgb) {
			var size = 200 * 200;
			var data = new Uint8Array(3 * size);
			for (var i = 0; i < size; i++) {
				var stride = i * 3;
				data[stride] = Number(rgb[0]);
				data[stride + 1] = Number(rgb[1]);
				data[stride + 2] = Number(rgb[2]);
			}
			var texture = new THREE.DataTexture(data, 100, 100, THREE.RGBFormat);
			texture.needsUpdate = true;
			return new THREE.MeshPhongMaterial({ map: texture });
		}
	}
});
