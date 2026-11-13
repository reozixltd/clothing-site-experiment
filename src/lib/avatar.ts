/**
 * The 3D model of one look. Loads /models/<look id>/model.fbx plus its
 * textures and draws it on a canvas. Used twice:
 *  - Model3D.tsx: the rotatable model in the detail view
 *  - render.html: renders the flat line-up images in public/looks
 * Both use this camera and these lights, so the images and the live model match.
 *
 * Models: Microsoft Rocketbox avatars (MIT licence). See the README.
 */
import {
  DirectionalLight,
  DoubleSide,
  HemisphereLight,
  LoadingManager,
  MeshLambertMaterial,
  type Object3D,
  OrthographicCamera,
  Quaternion,
  Scene,
  type SkinnedMesh,
  SRGBColorSpace,
  Texture,
  TextureLoader,
  Vector3,
  WebGLRenderer,
} from 'three';
import { FBXLoader } from 'three/addons/loaders/FBXLoader.js';

/**
 * Metres of world the canvas shows, top to bottom. The camera has no
 * perspective, so a pin's x / y in percent of the picture is also its place
 * on the model. That is what lets the pins follow the model in plain CSS.
 */
const VIEW_H = 1.98;
const FLOOR = 0.03; // gap under the feet
const ARM_OUT = 0.15; // how far the hands hang out from the body. 0 = straight down

export interface Avatar {
  /** Turn the model. 0 faces the camera, positive turns it to its left. */
  draw: (yaw: number) => void;
  dispose: () => void;
}

export async function createAvatar(canvas: HTMLCanvasElement, lookId: string): Promise<Avatar> {
  const dir = `/models/${lookId}/`;

  // The FBX files point at the original TGA textures. We ship WebP instead,
  // so hand the loader an empty texture for those and assign ours below.
  const manager = new LoadingManager();
  manager.addHandler(/\.tga$/i, { load: () => new Texture(), setPath() { return this; } } as never);
  const model = await new FBXLoader(manager).loadAsync(`${dir}model.fbx`);

  const textures = new TextureLoader();
  const load = async (name: string) => {
    const map = await textures.loadAsync(`${dir}${name}.webp`);
    map.colorSpace = SRGBColorSpace;
    return map;
  };
  const used: { dispose: () => void }[] = [];

  // Each model has up to three materials: ..._body, ..._head and ..._opacity (hair, lashes).
  const jobs: Promise<void>[] = [];
  model.traverse((node) => {
    const mesh = node as SkinnedMesh;
    if (!mesh.isMesh) return;
    mesh.frustumCulled = false; // skinned bounds are wrong once the arms move
    used.push(mesh.geometry);
    const old = Array.isArray(mesh.material) ? mesh.material : [mesh.material];
    const next = old.map((m) => {
      const part = m.name.endsWith('_opacity') ? 'hair' : m.name.endsWith('_head') ? 'head' : 'body';
      const material = new MeshLambertMaterial(
        part === 'hair' ? { transparent: true, alphaTest: 0.35, side: DoubleSide } : {},
      );
      jobs.push(
        load(part).then((map) => {
          material.map = map;
          used.push(map, material);
        }),
      );
      return material;
    });
    mesh.material = Array.isArray(mesh.material) ? next : next[0];
  });
  await Promise.all(jobs);

  lowerArms(model);
  model.scale.setScalar(0.01); // the files are in centimetres

  const scene = new Scene();
  scene.add(model, new HemisphereLight(0xffffff, 0xb8b2a8, 2.1));
  const key = new DirectionalLight(0xffffff, 1.5);
  key.position.set(-1.5, 3, 4);
  scene.add(key);

  const halfW = (VIEW_H * 5) / 13 / 2; // the frame is 5:13, same as the line-up images
  const camera = new OrthographicCamera(-halfW, halfW, VIEW_H - FLOOR, -FLOOR, 0.1, 20);
  camera.position.z = 10;

  const renderer = new WebGLRenderer({ canvas, alpha: true, antialias: true });

  return {
    draw(yaw) {
      const w = canvas.clientWidth || canvas.width;
      const h = canvas.clientHeight || canvas.height;
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
      renderer.setSize(w, h, false);
      model.rotation.y = yaw;
      renderer.render(scene, camera);
    },
    dispose() {
      used.forEach((item) => item.dispose());
      renderer.dispose();
      renderer.forceContextLoss(); // hand the WebGL context back straight away
    },
  };
}

/** The models ship with their arms held out. Swing each upper arm down to the side. */
function lowerArms(model: Object3D) {
  model.updateWorldMatrix(true, true);
  const arms: Object3D[] = [];
  model.traverse((node) => {
    if (/UpperArm$/.test(node.name)) arms.push(node);
  });
  for (const arm of arms) {
    const forearm = arm.children.find((child) => /Forearm$/.test(child.name));
    if (!forearm) continue;
    const shoulder = arm.getWorldPosition(new Vector3());
    const from = forearm.getWorldPosition(new Vector3()).sub(shoulder).normalize();
    const to = new Vector3(Math.sign(from.x) * ARM_OUT, -1, 0.06).normalize();
    // Turn the bone in world space, then express that in its parent's space.
    const turn = new Quaternion().setFromUnitVectors(from, to);
    const parent = arm.parent!.getWorldQuaternion(new Quaternion());
    arm.quaternion.copy(parent.invert().multiply(turn).multiply(arm.getWorldQuaternion(new Quaternion())));
  }
}
