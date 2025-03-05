import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';

const scene = new THREE.Scene();

const camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 100);
camera.position.set(0, 0, -8);

const renderer = new THREE.WebGLRenderer();
renderer.setPixelRatio(window.devicePixelRatio);
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

const controls = new OrbitControls(camera, renderer.domElement);
controls.target.set(0, 0, 0);


class Texture_Rotate {
    vertexShader() {
        return `
        uniform sampler2D uTexture;
        varying vec2 vUv;
        varying vec3 vPosition;
        void main() {
            vUv = uv;
            vPosition = position;
            gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0);
        }
        `;
    }

    fragmentShader() {
        return `
        uniform sampler2D uTexture;
        uniform float animation_time;
        varying vec2 vUv;
        varying vec3 vPosition;
        const float PI = 3.141592653589793;
        void main() {    
            // Rotate the texture map around the center of each face at a rate of 8 rpm.
            float angle = animation_time * (4.0 * PI / 15.0);
            vec2 translated_vUv = vUv - vec2(0.5, 0.5);
            vec2 rotated_vUv = vec2(translated_vUv.x * cos(angle) + translated_vUv.y * sin(angle), translated_vUv.x * sin(angle) - translated_vUv.y * cos(angle));
            rotated_vUv += vec2(0.5, 0.5);

            // Load the texture color from the texture map
            // Hint: Use texture2D function to get the color of the texture at the current UV coordinates
            vec4 tex_color = texture2D(uTexture, rotated_vUv);
            
            // add the outline of a black square in the center of each texture that moves with the texture
            // Hint: Tell whether the current pixel is within the black square or not using the UV coordinates
            //       If the pixel is within the black square, set the tex_color to vec4(0.0, 0.0, 0.0, 1.0)
            
            float minEdge = 0.15;
            float maxEdge = 0.85;
            float border = 0.1;
            if (rotated_vUv.x > minEdge && rotated_vUv.x < maxEdge && rotated_vUv.y > minEdge && rotated_vUv.y < maxEdge){
                bool left = rotated_vUv.x < minEdge + border;
                bool right = rotated_vUv.x > maxEdge - border;
                bool bottom = rotated_vUv.y < minEdge + border;
                bool top = rotated_vUv.y > maxEdge - border;

                if (left || right || bottom || top){
                    tex_color = vec4(0.0, 0.0, 0.0, 1.0);
                }
            }
            

            gl_FragColor = tex_color;
        }
        `;
    }
}


class Texture_Scroll_X {
    vertexShader() {
        return `
        uniform sampler2D uTexture;
        varying vec2 vUv;
        varying vec3 vPosition;
        void main() {
            vUv = uv;
            vPosition = position;
            gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0);
        }
        `;
    }

    fragmentShader() {
        return `
        uniform sampler2D uTexture;
        uniform float animation_time;
        varying vec2 vUv;
        varying vec3 vPosition;
        void main() {
            // Shrink the texture by 50% so that the texture is repeated twice in each direction
            vec2 vUv_scaled = vUv * 2.0;

            // Translate the texture varying the s texture coordinate by 4 texture units per second, 
            vec2 vUv_translated_scaled = vec2(vUv_scaled.x - animation_time * 2.0, vUv_scaled.y);

            // Load the texture color from the texture map
            // Hint: Use texture2D function to get the color of the texture at the current UV coordinates
            vec4 tex_color = texture2D(uTexture, vUv_translated_scaled);
            

            // add the outline of a black square in the center of each texture that moves with the texture
            // Hint: Tell whether the current pixel is within the black square or not using the UV coordinates
            //       If the pixel is within the black square, set the tex_color to vec4(0.0, 0.0, 0.0, 1.0)

            vec2 repeatedUv = fract(vUv_translated_scaled); 
            float minEdge = 0.15;
            float maxEdge = 0.85;
            float border = 0.1;

            if (repeatedUv.x > minEdge && repeatedUv.x < maxEdge && repeatedUv.y > minEdge && repeatedUv.y < maxEdge) {
                bool left = repeatedUv.x < minEdge + border;
                bool right = repeatedUv.x > maxEdge - border;
                bool bottom = repeatedUv.y < minEdge + border;
                bool top = repeatedUv.y > maxEdge - border;

                if (left || right || bottom || top) {
                    tex_color = vec4(0.0, 0.0, 0.0, 1.0);
                }
            }

            gl_FragColor = tex_color;
        }
        `;
    }
}

let animation_time = 0.0;

const cube1_geometry = new THREE.BoxGeometry(2, 2, 2);

// Load texture map 
const cube1_texture = new THREE.TextureLoader().load('assets/stars.png');

// Apply Texture Filtering Techniques to Cube 1
// Nearest Neighbor Texture Filtering
cube1_texture.minFilter = THREE.NearestFilter;
cube1_texture.magFilter = THREE.NearestFilter;


// Enable texture repeat wrapping for Cube 1
cube1_texture.wrapS = THREE.RepeatWrapping;
cube1_texture.wrapT = THREE.RepeatWrapping;

const cube1_uniforms = {
    uTexture: { value: cube1_texture },
    animation_time: { value: animation_time }
};
const cube1_shader = new Texture_Rotate();
const cube1_material = new THREE.ShaderMaterial({
    uniforms: cube1_uniforms,
    vertexShader: cube1_shader.vertexShader(),
    fragmentShader: cube1_shader.fragmentShader(),
});

const cube1_mesh = new THREE.Mesh(cube1_geometry, cube1_material);
cube1_mesh.position.set(2, 0, 0)
scene.add(cube1_mesh);

const cube2_geometry = new THREE.BoxGeometry(2, 2, 2);

// Load texture map 
const cube2_texture = new THREE.TextureLoader().load('assets/earth.gif');

// Apply Texture Filtering Techniques to Cube 2
// Linear Mipmapping Texture Filtering
cube2_texture.minFilter = THREE.LinearMipMapLinearFilter;


// Enable texture repeat wrapping for Cube 2
cube2_texture.wrapS = THREE.RepeatWrapping;
cube2_texture.wrapT = THREE.RepeatWrapping;

const cube2_uniforms = {
    uTexture: { value: cube2_texture },
    animation_time: { value: animation_time }
};
const cube2_shader = new Texture_Scroll_X();
const cube2_material = new THREE.ShaderMaterial({
    uniforms: cube2_uniforms,
    vertexShader: cube2_shader.vertexShader(),
    fragmentShader: cube2_shader.fragmentShader(),
});

const cube2_mesh = new THREE.Mesh(cube2_geometry, cube2_material);
cube2_mesh.position.set(-2, 0, 0)
scene.add(cube2_mesh);

const clock = new THREE.Clock();

function animate() {
    controls.update();

    // Update uniform values
    let time = clock.getElapsedTime();
    cube1_uniforms.animation_time.value = time;
    cube2_uniforms.animation_time.value = time;

    // TODO: 2.e Rotate the cubes if the key 'c' is pressed to start the animation
    // Cube #1 should rotate around its own X-axis at a rate of 15 rpm.
    // Cube #2 should rotate around its own Y-axis at a rate of 40 rpm


    renderer.render(scene, camera);
}

renderer.setAnimationLoop(animate);

// TODO: 2.e Keyboard Event Listener
// Press 'c' to start and stop the rotating both cubes
window.addEventListener('keydown', onKeyPress);
function onKeyPress(event) {
    switch (event.key) {
        // ...
    }
}