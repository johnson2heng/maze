class Module {
    constructor(main){
        this.main = main;

        let Prim = require("./prim");
        this.prim = new Prim();
    }

    update(data){
        let that = this;
        that._createWallpaper(data);
        that._createMonster(data.monster);
        that._updateBorn(data.born);
    }

    //更新当前视角的位置
    _updateBorn(born){
        let that = this;
        let main = that.main;
        let controls = main.three.controls;

        controls.getObject().position.x = born[0];
        controls.getObject().position.y = born[1];
        controls.getObject().position.z = born[2];
    }

    //生成墙壁
    _createWallpaper(data){
        let that = this;
        let main = that.main;
        let scene = main.three.scene;
        let clock = main.three.clock;

        let level = data.level+2;
        let arr = this.prim.generate(level,level,[1,1],[(level)*2-1, (level)*2-1]);
        let image = data.image.wallpaper;

        let bsp;
        let map = new THREE.TextureLoader().load(image);
        let material = new THREE.MeshLambertMaterial({map:map, side:THREE.DoubleSide});

        that._updateEnd({x:(level)*2-1, y:0, z:(level)*2-1});
        //that._updateBorn([(level+5)*2-1,0.5, (level+5)*2-1]);

        //首先判断当前是否有mesh，有就删除掉
        if(that.mesh){
            that.mesh.geometry.dispose();
            scene.remove(that.mesh);
        }

        for(let i =0; i<arr.length; i++){
            let position = arr[i];
            let geometry = new THREE.CubeGeometry(1, 1, 1);
            let mesh = new THREE.Mesh(geometry, material);
            mesh.position.set(position.x, position.y+0.5, position.z);
            //scene.add(mesh);

            let geometryBsp = new ThreeBSP(mesh);

            if(i === 0){
                bsp = geometryBsp;
            }
            else{
                bsp = bsp.union(geometryBsp);
            }
        }

        //从BSP对象内获取到处理完后的mesh模型数据
        that.mesh = bsp.toMesh();
        //更新模型的面和顶点的数据
        that.mesh.geometry.computeFaceNormals();
        that.mesh.geometry.computeVertexNormals();

        that.mesh.material = material;
        that.mesh.name = "wallpaper";

        scene.add(that.mesh);

        clock.getDelta();

        document.getElementById("text").innerText = `第 ${data.level} 关`;
    }

    //生成怪物
    _createMonster(){

    }

    //添加终点模型
    _updateEnd(end){
        let that = this;
        if(!this.end){
            let main = that.main;
            let scene = main.three.scene;
            that.end = new THREE.Mesh(new THREE.OctahedronGeometry( .3, 0 ), new THREE.MeshPhongMaterial({color:0x00ffff}));
            scene.add(that.end);
        }

        that.end.position.set(end.x, end.y+0.3, end.z);
    }
}

module.exports = Module;