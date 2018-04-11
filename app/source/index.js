class Main {
    constructor() {
        //固定的添加后不会修改的一些对象
        this.three = {
            renderer: new THREE.WebGLRenderer(),
            clock: new THREE.Clock(),
            camera: new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 1000),
            scene: new THREE.Scene(),
            light: new THREE.PointLight(0xffffff),
            stats: new Stats(),
            controls: null,
            blocker: document.getElementById('blocker'),
            instructions: document.getElementById('instructions')
        };

        //一些当前控制器状态的配置
        this.state = {
            controlsEnabled: false,
            moveForward: false,
            moveBackward: false,
            moveLeft: false,
            moveRight: false,
            canJump: false,
            spaceUp: true, //处理一直按着空格连续跳的问题
            velocity: new THREE.Vector3(), //移动速度变量
            direction: new THREE.Vector3(), //移动的方向变量
            rotation: new THREE.Vector3() //当前的相机朝向
        };

        //射线相关的变量
        this.ray = {
            upRaycaster: new THREE.Raycaster(new THREE.Vector3(), new THREE.Vector3(0, 1, 0), 0, 0.3),
            horizontalRaycaster: new THREE.Raycaster(new THREE.Vector3(), new THREE.Vector3(), 0, 0.3),
            downRaycaster: new THREE.Raycaster(new THREE.Vector3(), new THREE.Vector3(0, -1, 0), 0, 0.3)
        };

        //辅助线
        this.help = {
            up:new THREE.ArrowHelper(new THREE.Vector3(0, 1, 0), new THREE.Vector3(), 0.1, 0x00ff00),
            horizontal:new THREE.ArrowHelper(new THREE.Vector3(1, 0, 0), new THREE.Vector3(), 0.1, 0x00ffff),
            down:new THREE.ArrowHelper(new THREE.Vector3(0, -1, 0), new THREE.Vector3(), 0.1, 0xffff00),
            group:new THREE.Group()
        };

        //一些相关配置项
        this.settings = {
            speed: 40, //移动速度
            upSpeed: 0, //弹跳力
        };

        this.dop = new Dop();

        //初始化一些方法
        this._draw();
    }

    //初始化渲染器
    _initRender() {
        let three = this.three;
        let renderer = three.renderer;

        renderer.setPixelRatio(window.devicePixelRatio);
        renderer.setSize(window.innerWidth, window.innerHeight);
        //告诉渲染器需要阴影效果
        document.body.appendChild(renderer.domElement);
    }

    _initCamera() {
        let three = this.three;
        let camera = three.camera;
        //camera.position.set(0, 0, 0.5);
    }

    _initScene() {
        let three = this.three;
        let scene = three.scene;
    }

    _initLight() {
        let three = this.three;
        let scene = three.scene;

        scene.add(new THREE.AmbientLight(0x444444));

        let light = three.light;
        light.position.set(0, 50, 0);

        scene.add(light);
    }

    _initStats() {
        let three = this.three;
        let stats = three.stats;
        document.body.appendChild(stats.dom);
    }

    _initControls() {
        let that = this;
        let three = that.three;
        let scene = three.scene;
        let camera = three.camera;
        three.controls = new THREE.PointerLockControls(camera);
        let controls = three.controls;
        let state = that.state;
        let velocity = state.velocity;
        let settings = that.settings;

        scene.add(controls.getObject());
        let onKeyDown = function (event) {
            switch (event.keyCode) {
                case 38: // up
                case 87: // w
                    state.moveForward = true;
                    break;
                case 37: // left
                case 65: // a
                    state.moveLeft = true;
                    break;
                case 40: // down
                case 83: // s
                    state.moveBackward = true;
                    break;
                case 39: // right
                case 68: // d
                    state.moveRight = true;
                    break;
                case 32: // space
                    if (state.canJump && state.spaceUp) velocity.y += settings.upSpeed;
                    state.canJump = false;
                    state.spaceUp = false;
                    break;
            }
        };

        let onKeyUp = function (event) {
            switch (event.keyCode) {
                case 38: // up
                case 87: // w
                    state.moveForward = false;
                    break;
                case 37: // left
                case 65: // a
                    state.moveLeft = false;
                    break;
                case 40: // down
                case 83: // s
                    state.moveBackward = false;
                    break;
                case 39: // right
                case 68: // d
                    state.moveRight = false;
                    break;
                case 32: // space
                    state.spaceUp = true;
                    break;
            }
        };
        document.addEventListener('keydown', onKeyDown, false);
        document.addEventListener('keyup', onKeyUp, false);
    }

    _initModule(){

        let that = this;
        let help = that.help;
        let group = that.help.group;

        //辅助工具
        let helper = new THREE.AxesHelper(50);
        //this.three.scene.add(helper);

        group.add(help.up);
        group.add(help.horizontal);
        group.add(help.down);

        //that.three.scene.add(group);


        let Module = require("./module");
        this.module = new Module(this);

    }

    _initPointerLock() {
        let that = this;
        let three = that.three;
        let state = that.state;
        let blocker = three.blocker;
        let instructions = three.instructions;

        //实现鼠标锁定的教程地址 http://www.html5rocks.com/en/tutorials/pointerlock/intro/
        let havePointerLock = 'pointerLockElement' in document || 'mozPointerLockElement' in document || 'webkitPointerLockElement' in document;
        if (havePointerLock) {
            var element = document.body;
            var pointerlockchange = function (event) {
                if (document.pointerLockElement === element || document.mozPointerLockElement === element || document.webkitPointerLockElement === element) {
                    state.controlsEnabled = true;
                    three.controls.enabled = true;
                    blocker.style.display = 'none';
                } else {
                    //state.controlsEnabled = false;
                    three.controls.enabled = false;
                    blocker.style.display = 'block';
                    instructions.style.display = '';
                }
            };
            var pointerlockerror = function (event) {
                instructions.style.display = '';
            };
            // 监听变动事件
            document.addEventListener('pointerlockchange', pointerlockchange, false);
            document.addEventListener('mozpointerlockchange', pointerlockchange, false);
            document.addEventListener('webkitpointerlockchange', pointerlockchange, false);
            document.addEventListener('pointerlockerror', pointerlockerror, false);
            document.addEventListener('mozpointerlockerror', pointerlockerror, false);
            document.addEventListener('webkitpointerlockerror', pointerlockerror, false);
            instructions.addEventListener('click', function (event) {
                instructions.style.display = 'none';
                //全屏
                //launchFullScreen(renderer.domElement);
                // 锁定鼠标光标
                element.requestPointerLock = element.requestPointerLock || element.mozRequestPointerLock || element.webkitRequestPointerLock;
                element.requestPointerLock();
            }, false);
        }
        else {
            instructions.innerHTML = '你的浏览器不支持相关操作，请更换浏览器';
        }
    }

    _onWindowResize() {
        let that = this;
        let three = that.three;
        let camera = three.camera;
        let renderer = three.renderer;

        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(window.innerWidth, window.innerHeight);

    }

    _animate() {
        let that = this;
        let three = that.three;
        let stats = three.stats;
        let state = that.state;
        let camera = three.camera;
        let scene = three.scene;
        let renderer = three.renderer;
        let settings = that.settings;

        let module = that.module;

        let horizontalRaycaster = that.ray.horizontalRaycaster;
        let downRaycaster = that.ray.downRaycaster;

        let speed = settings.speed;

        //获取到控制器对象
        let control = three.controls.getObject();

        function _render() {

            let moveForward = state.moveForward;
            let moveBackward = state.moveBackward;
            let moveLeft = state.moveLeft;
            let moveRight = state.moveRight;
            let velocity = state.velocity;
            let direction = state.direction;
            let rotation = state.rotation;

            //获取刷新时间
            let delta = three.clock.getDelta();

            if (state.controlsEnabled) {
                //let group = that.help.group;
                //let up = that.help.up;
                //let horizontal = that.help.horizontal;
                //let down = that.help.down;

                //velocity每次的速度，为了保证有过渡
                velocity.x -= velocity.x * 30.0 * delta;
                velocity.z -= velocity.z * 30.0 * delta;
                velocity.y -= 9.8 * 1.0 * delta; // 默认下降的速度

                //获取当前按键的方向并获取朝哪个方向移动
                direction.z = Number(moveForward) - Number(moveBackward);
                direction.x = Number(moveLeft) - Number(moveRight);
                //将法向量的值归一化
                direction.normalize();

                //group.position.set(control.position.x,control.position.y,control.position.z);

                //判断是否接触到了模型
                rotation.copy(control.getWorldDirection().multiply(new THREE.Vector3(-1, 0, -1)));

                //判断鼠标按下的方向
                let m = new THREE.Matrix4();
                if (direction.z > 0) {
                    if (direction.x > 0) {
                        m.makeRotationY(Math.PI / 4);
                    }
                    else if (direction.x < 0) {
                        m.makeRotationY(-Math.PI / 4);
                    }
                    else {
                        m.makeRotationY(0);
                    }
                }
                else if (direction.z < 0) {
                    if (direction.x > 0) {
                        m.makeRotationY(Math.PI / 4 * 3);
                    }
                    else if (direction.x < 0) {
                        m.makeRotationY(-Math.PI / 4 * 3);
                    }
                    else {
                        m.makeRotationY(Math.PI);
                    }
                }
                else {
                    if (direction.x > 0) {
                        m.makeRotationY(Math.PI / 2);
                    }
                    else if (direction.x < 0) {
                        m.makeRotationY(-Math.PI / 2);
                    }
                }
                //给向量使用变换矩阵
                rotation.applyMatrix4(m);
                //horizontal.setDirection(rotation);
                horizontalRaycaster.set(control.position, rotation);
                let horOnObject = false;
                //判断射线是否和墙壁有接触
                if(module.mesh){
                    let horizontalIntersections = horizontalRaycaster.intersectObject(module.mesh);
                    horOnObject = horizontalIntersections.length > 0;
                }

                //判断是否和终点模型有接触
                if(module.end){
                    let section = horizontalRaycaster.intersectObject(module.end);
                    if(section.length > 0){
                        that.dop.msg("恭喜过关，等级+1！！！再接再厉");
                        that.data.level++;
                        module.update(that.data);
                    }
                }

                //判断移动方向修改速度方向
                if (!horOnObject) {
                    if (moveForward || moveBackward) velocity.z -= direction.z * speed * delta;
                    if (moveLeft || moveRight) velocity.x -= direction.x * speed * delta;
                }

                //复制相机的位置
                downRaycaster.ray.origin.copy(control.position);
                //获取相机靠下10的位置
                downRaycaster.ray.origin.y -= 0.1;
                //判断是否停留在了立方体上面
                let intersections = downRaycaster.intersectObjects(scene.children, true);
                let onObject = intersections.length > 0;
                //判断是否停在了立方体上面
                if (onObject === true) {
                    velocity.y = Math.max(0, velocity.y);
                    state.canJump = true;
                }
                //根据速度值移动控制器
                control.translateX(velocity.x * delta);
                control.translateY(velocity.y * delta);
                control.translateZ(velocity.z * delta);

                //保证控制器的y轴在10以上
                if (control.position.y < 0.1) {
                    velocity.y = 0;
                    control.position.y = 0.1;
                    state.canJump = true;
                }
            }
        }

        //更新控制器
        _render();

        //更新性能插件
        stats.update();

        renderer.render(scene, camera);

        requestAnimationFrame(function () {
            that._animate();
        });
    }

    _draw() {
        let that = this;
        //兼容性判断
        if (!Detector.webgl) Detector.addGetWebGLMessage();

        that._initPointerLock();
        that._initRender();
        that._initScene();
        that._initCamera();
        that._initLight();
        that._initControls();
        that._initStats();
        that._initModule();

        //添加第一关内容
        that.updateModule("./index.json");

        that._animate();
        window.onresize = function () {
            that._onWindowResize();
        };
    }

    launchFullScreen(element) {
        if (element.requestFullscreen) {
            element.requestFullscreen();
        }
        else if (element.mozRequestFullScreen) {
            element.mozRequestFullScreen();
        }
        else if (element.webkitRequestFullscreen) {
            element.webkitRequestFullscreen();
        }
        else if (element.msRequestFullscreen) {
            element.msRequestFullscreen();
        }
    }

    //切换场景
    updateModule(url){
        let that = this;
        let dop = that.dop;
        let module = that.module;
        dop.get(url, function (data) {
            that.data = JSON.parse(data);
            module.update(that.data);
        });
    }
}

new Main();