var stats, loader;
var meshes = [];
var camera, controls, scene, renderer, object;

init();
animate();

function init() {

    scene = new THREE.Scene();

    scene.fog = new THREE.FogExp2(0xcccccc, 0.5); //(color , intensity)

    renderer = new THREE.WebGLRenderer({
        antialias: true
    });
    renderer.setClearColor(scene.fog.color);
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize(window.innerWidth, window.innerHeight);


    var container = document.getElementById('body');
    container.appendChild(renderer.domElement);

    camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.set(-15, 15, 15); //(x, y, z)

    controls = new THREE.OrbitControls(camera, renderer.domElement);
    //controls.addEventListener( 'change', render ); // add this only if there is no animation loop (requestAnimationFrame)
    controls.enableDamping = true;
    controls.dampingFactor = 0.125;
    controls.enableZoom = true;
    controls.rotateSpeed = 0.2;
    controls.maxPolarAngle = Math.PI / 2;
    controls.minDistance = 15;
    controls.maxDistance = 40;

    // world
    //create a texture loader object for loading materials
    var textureLoader = new THREE.TextureLoader();

    //cube map
    var path = "cubemap/";
    var format = '.jpg';
    var urls = [
        path + 'sides' + format, path + 'sides' + format,
        path + 'sides' + format, path + 'sides' + format,
        path + 'sides' + format, path + 'sides' + format
    ];

    //standard cube map
    var reflectionCube = new THREE.CubeTextureLoader().load(urls);
    reflectionCube.format = THREE.RGBFormat;

    //refraction cube map
    var refractionCube = new THREE.CubeTextureLoader().load(urls);
    refractionCube.mapping = THREE.CubeRefractionMapping;
    refractionCube.format = THREE.RGBFormat;

    //make backround reflection cube map
    scene = new THREE.Scene();
    //scene.background = reflectionCube;

    //Materials list is pretty cool
    var textureLoader = new THREE.TextureLoader();

    //Aluminum Large texture
    var spotlight = new THREE.MeshPhongMaterial({
        color: 0xffffff,
        lightMap: textureLoader.load("env_lightmap.jpg"),
        lightMapIntensity: 1
    });
    var Alum_L = new THREE.MeshStandardMaterial({
        map: null,
        color: 0xffffff,
        metalness: 1.0,
        shading: THREE.SmoothShading,
        envMap: reflectionCube
    });

    //Geometry list
    object = new THREE.Mesh( new THREE.PlaneGeometry( 100, 100, 4, 4 ), spotlight );//(width, heigt, widthSegments, heightSegments)
				scene.add( object );

    loader = new THREE.CTMLoader();
    /* var meshes; */
    loader.load("camaro/Camaro.ctm", function(geometry) {

        var mesh = new THREE.Mesh(geometry, Alum_L);
        scene.add(mesh);
        meshes['camaro'] = mesh;
    });

    // LIGHTS

    //                                    sky color, ground color, intensity
    hemiLight = new THREE.HemisphereLight(0xffffff, 0xffffff, 0.6);
    scene.add(hemiLight);

    //var ambient = new THREE.AmbientLight(0xffffff);
    //scene.add(ambient);

    //pointLight = new THREE.PointLight(0xffffff, 2);
    //pointLight.position.set(1, 2, 5);
    //scene.add(pointLight);

    //

    stats = new Stats();
    container.appendChild(stats.dom);

    window.addEventListener('resize', onWindowResize, false);

}

function onWindowResize() {

    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();

    renderer.setSize(window.innerWidth, window.innerHeight);

}

function animate() {

    requestAnimationFrame(animate);

    controls.update(); // required if controls.enableDamping = true, or if controls.autoRotate = true

    stats.update();

    render();

}

function render() {

    renderer.render(scene, camera);

}
