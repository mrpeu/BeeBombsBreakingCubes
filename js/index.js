var GP = GP || {};


(function() {

    'use strict';


    if (!Detector.webgl) Detector.addGetWebGLMessage();

    GP.Universe = function(container, config) {

        config = config || {};
        this.config.antialias = config.antialias || false;

        this.container = container;

        var init = function(container) {

            var scene, camera, cameraAnchor, lights = [],
                floor, renderer;

            // scene

            scene = new THREE.Scene();
            //scene.fog = new THREE.Fog(0xeeeeee, 1000, 3000);


            // camera

            camera = new THREE.PerspectiveCamera(45, container.innerWidth / container.innerHeight, 1, 3000);
            camera.translateX(0);
            camera.translateY(0);
            camera.translateZ(100);

            cameraAnchor = new THREE.Object3D();
            cameraAnchor.add(camera);

            scene.add(cameraAnchor);



            // lights

            // lights.push(new THREE.HemisphereLight(0xffffff, 0.9));
            // lights[0].position.set(1, 1, 5);
            // scene.add(lights[0]);
            lights.push(new THREE.PointLight(0xffffff, 0.9));
            lights[0].position.set(5, 5, 0);
            scene.add(lights[0]);



            // TEST

            // Sorry. This is the parent node of the axis of the boxes
            this.boxesAxisAxis = new THREE.Object3D();
            scene.add(this.boxesAxisAxis);

            this.boxes = new Array(4);
            this.boxesAxis = new Array(4);
            this.boxesWidth = 10;

            // size of boxes
            var w = this.boxesWidth, // width
                h = w, // height
                d = w; //depth

            var colors = [
                0xffffff,
                // 0x999999,
                // 0x444444,
                // 0,
            ];

            for (var i = 0, box, axis; i < this.boxes.length; i++) {

                box = new THREE.Mesh(
                    new THREE.BoxGeometry(w, h, d),
                    new THREE.MeshPhongMaterial({
                        color: colors[i % colors.length]
                    })
                );
                box.position.set(w / 2, h / 2, -d / 2);

                axis = new THREE.Object3D();
                axis.position.set(w / 2, h / 2, 0);
                axis.rotateZ(i * -Math.PI / 2 + Math.PI); // + Math.PI is just to have the first one in the middle
                // axis.add(new THREE.AxisHelper(12));
                this.boxesAxisAxis.add(axis);

                this.boxes[i] = box;
                this.boxesAxis[i] = axis;

                axis.add(box);
            }



            // renderer

            renderer = (function initRenderer(scene) {

                var renderer = new THREE.WebGLRenderer({
                    antialias: config.antialias,
                    alpha: true
                });

                // renderer.setClearColor(scene.fog.color, 1);

                renderer.setSize(container.clientWidth, container.clientHeight);

                return renderer;

            })(scene);



            this.scene = scene;
            this.camera = camera;
            this.cameraAnchor = cameraAnchor;
            this.lights = lights;
            this.floor = floor;
            this.renderer = renderer;

            container.appendChild(this.canvas = renderer.domElement);

            onCanvasResize.call(this, this.canvas.clientWidth, this.canvas.clientHeight);

        };

        var onCanvasResize = function(w, h) {

            this.canvas.width = w;
            this.canvas.height = h;

            this.camera.aspect = w / h;
            this.camera.updateProjectionMatrix();

            this.renderer.setSize(w, h);
        };

        this.startDate = Date.now();

        this.loopDuration = 1500;
        this.loopStart = undefined;
        this.loopStatus = 0; // 0-1

        this.encore = 3;

        this.animate = function(time, delta) {

            if (!this.loopStart) this.loopStart = time;

            this.loopStatus = 1 / this.loopDuration * ~~(time - this.loopStart);

            var reset = (time - this.loopStart) >= this.loopDuration,
                val,
                i, box, axis;

            if (reset) {

                val = this.boxesWidth / 2;

                for (i = 1, box; i < this.boxes.length; i++) {

                    box = this.boxes[i];

                    box.position.setX(val);
                    box.position.setY(val);
                }

                this.loopStart = time;

                this.camera.position.set(0, 0, 50);

                // this.encore--;

            } else if (this.encore > 0) {

                for (i = 1, box; i < this.boxes.length; i++) {

                    box = this.boxes[i];

                    if (this.loopStatus > (i - 1) / this.boxes.length) {

                        val = this.loopStatus * 0.75;

                        box.translateX(val);
                        box.translateY(val);
                    }

                }

                val = -2.5 * this.loopStatus;
                this.camera.position.set(val, val, 25 + 25 * (1 - this.loopStatus));
            }

            this.camera.rotation.z = time / 1000;
        };

        var lastTime = 0;

        this.render = (function() {

            var time = Date.now() - this.startDate,
                w = this.canvas.clientWidth,
                h = this.canvas.clientHeight;

            if (this.canvas.width != w || this.canvas.height != h) {
                onCanvasResize.call(this, w, h);
            }

            this.renderer.render(this.scene, this.camera);

            this.animate(time, time - lastTime);

            lastTime = time;

            requestAnimationFrame(this.render);

        }).bind(this);


        init.call(this, container);

        return this;
    };

    GP.Universe.prototype = {

        constructor: GP.Universe,

        config: {},

        container: null,
        canvas: null,

        camera: null,
        cameraAnchor: null,
        scene: null,
        renderer: null,

        floor: null,
        lights: null,

        startDate: null,
        render: null
    };



})();

var uni = new GP.Universe(document.getElementById('container'));
uni.render();
