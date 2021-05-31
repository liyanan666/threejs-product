## threejs 3D 实现商品切换动效

**在开始编写代码之前，我这边先阐述几个概念，以方便大家更好的理解**

## 概念讲解

### 场景(Sence)

**一切要素都在场景里面，所有绘制的元素都要添加到场景中**

```javascript
cosnt scene = new Three.Scene();
```

### 相机（camera）

摄像机就相当于人眼，有摄像机才可以看见场景里面的一切物体和光源。相机有正交投影相机和透视投影相机两种。透视投影跟人眼看到的世界是一样的，近大远小；正交投影则远近都是一样的大小，三维空间中平行的线，投影到二维空间也一定是平行的。大部分场景都适合使用透视投影相机，因为跟真实世界的观测效果一样；在制图、建模等场景适合使用正交投影相机，方便观察模型之间的大小比例。

**正交投影相机**

示景体是一个长方体，由 6 个参数确定：THREE.OrthographicCamera(left, right, top, bottom, near, far)，这 6 个参数规定了相机示景体的左、右、上、下、前、后六个面的位置。

![image.png](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/a8f78e4a02c74d8db0ee5a7d79a86861~tplv-k3u1fbpfcp-watermark.image)

**透视投影相机**

透视摄像机是最常用的摄像机类型，模拟人眼的视觉，近大远小（透视）。Fov 表示的是视角，Fov 越大，表示眼睛睁得越大，离得越远，看得更多。如果是需要模拟现实，基本都是用这个相机，由四个参数确定：THREE.PerspectiveCamera(fov, aspect, near, far)

![image.png](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/e710b839edce412dbea5391049b76314~tplv-k3u1fbpfcp-watermark.image)

### 灯光（light）

光源主要是以下几种：  
1、环境光，所有角度看到的亮度一样，通常用来为整个场景指定一个基础亮度，没有明确光源位置；  
2、点光源，一个点发出的光源，照到不同物体表面的亮度线性递减；  
3、平行光，亮度与光源和物体之间的距离无关，只与平行光的角度和物体所在平面有关；  
4、聚光灯，投射出的是类似圆锥形的光线。

**聚光灯（图 1）、平行光（图 2）、点光源（图 3）**

![image.png](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/0c906654f8794ecf8914737577290f95~tplv-k3u1fbpfcp-watermark.image)

### 材质（material）

一个物体很多的物理性质，取决于其材料，材料也决定了几何体的外表。Threejs 提供了几种比较有代表性的材质，常用的有基础材质、镜面高光材质，除了 Threejs 提供的材质外还可以引入外部图片，贴到物体表面，称为纹理贴图。

![image.png](https://p9-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/e665f06ca2c1467299079d32cc21ca87~tplv-k3u1fbpfcp-watermark.image)

### 渲染器（renderer）

Threejs 绘制的东西，最终需要在屏幕一块矩形画布上显示出来。此时就需借助 WebGLRenderer 进行渲染

```javascript
const renderer = new Three.WebGLRenderer();
```

## 代码编写

**JS 框架使用的是 Vue**  
**UI 框架为 element-ui**

### 初始化 dom 节点

```html
<div id="app">
	<div id="content" style="height: 500px"></div>
	<div class="selct">
		<div class="title">部分选择</div>
		<ul class="list">
			<li v-for="(item, index) in meshList" @click="selectMesh(index)" :class="activeIndex == index ? 'active' : ''">{{item.name}}</li>
		</ul>
		<div class="title">颜色选择</div>
		<el-color-picker v-model="color" color-format="rgb" @change="setSelectColor"></el-color-picker>
	</div>
</div>
```

```javascript
initEL() {
    this.root = document.getElementById('content');
    this.canvas = document.createElement('canvas');
    this.width = this.root.offsetWidth;
    this.height = this.root.offsetHeight;
    console.log(this.width, this.height);
}
```

### 初始化场景值

```javascript
initSence() {
    this.scene = new THREE.Scene();
}
```

### 初始化光源

```javascript
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
}
```

### 初始化相机

```javascript
initCamera() {
    const aspect = this.width / this.height;
    this.camera = new THREE.PerspectiveCamera(45, aspect, 1, 1000);
    this.camera.position.z = 15;
    this.camera.aspect = aspect;
    this.camera.updateProjectionMatrix();
}
```

### 初始化渲染器

```javascript
initRenderer() {
    this.renderer = new THREE.WebGLRenderer({ antialias: true });
    this.renderer.setSize(this.width, this.height);
    this.renderer.setClearColor(0xeeeeee, 1);
    this.canvas = this.renderer.domElement;
}
```

### 初始化控制器

```javascript
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
}
```

### 进行画布渲染

```javascript
render() {
    this.camera.lookAt(this.scene.position);
    this.renderer.render(this.scene, this.camera);
}
```

### 加载模型

```javascript
loadModel() {
    this.loader = new THREE.GLTFLoader();
    this.loader.load('./model/scene.gltf', (model) => {
        let index = 1;
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
}
```

### 选择模块/颜色

```javascript
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
```

### 更新渲染器

```javascript
update() {
    requestAnimationFrame(() => this.update());
    this.controls.update();
    this.render();
}
```
