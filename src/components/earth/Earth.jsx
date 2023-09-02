import { Vector3, TextureLoader, Vector2, Matrix4, Quaternion, AdditiveBlending } from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'
import { useLoader, useFrame } from "@react-three/fiber";
import { useKeyboardControls } from '@react-three/drei';
import { useEffect, useRef } from "react";
import earthVertex from '../../shaders/earth/vertex.glsl';
import earthFragment from '../../shaders/earth/fragment.glsl';
import cloudsVertex from '../../shaders/clouds/vertex.glsl';
import cloudsFragment from '../../shaders/clouds/fragment.glsl';
import { pointOnSphereToUV } from '../../utils/pointOnSphereToUV';

const segs = 821;
const fh = 2.15;

function Earth() {
  const flightModel = useLoader(GLTFLoader, './biplan.glb');
  const displacementMap = useLoader(TextureLoader, './displacement.jpg');
  // const textureMap = useLoader(TextureLoader, './colored.jpg');
  const textureMap = useLoader(TextureLoader, './colored-borders.jpg');
  const lightMap = useLoader(TextureLoader, './lightMap.png');
  const waterNormalA = useLoader(TextureLoader, './wave-a.png');
  const waterNormalB = useLoader(TextureLoader, './wave-b.png');
  const waterNormalC = useLoader(TextureLoader, './wave-c.png');
  const lakesMap = useLoader(TextureLoader, './lakes.jpg');
  const earthBWMap = useLoader(TextureLoader, './earthbw.png');
  const landDistanceMap = useLoader(TextureLoader, './land-distance.png');
  const countriesColorsMap = useLoader(TextureLoader, './countries-colored.png');

  const flightCoord = useRef(new Vector3(0, 0, 1).multiplyScalar(fh));
  const matrix = useRef(new Matrix4());
  const basisY = useRef(new Vector3(0, 1, 0));
  const basisZ = useRef(new Vector3(0, 0, 1));
  const flightRef = useRef(null);
  const earthMaterial = useRef(null);
  const cloudsMaterial = useRef(null);

  const [_, getKeys] = useKeyboardControls();

  useFrame((state, delta) => {
    const { left, right } = getKeys();
    if (left) {
      matrix.current.makeRotationAxis(basisZ.current.normalize(), delta * 2);
      basisY.current.applyMatrix4(matrix.current);
      flightRef.current.rotateZ(delta * 2);
    }
    if (right) {
      matrix.current.makeRotationAxis(basisZ.current.normalize(), -delta * 2);
      basisY.current.applyMatrix4(matrix.current);
      flightRef.current.rotateZ(-delta * 2);
    }
    if (earthMaterial.current && flightRef.current && flightModel.scene) {
      matrix.current.makeRotationAxis(basisY.current.normalize(), delta / 15);
      basisZ.current.applyMatrix4(matrix.current);
      flightCoord.current.applyMatrix4(matrix.current);
      flightRef.current.rotateY(delta / 15);
      state.camera.position.copy(flightCoord.current).multiplyScalar(1.35);
      earthMaterial.current.uniforms.uFlightCoord.value = pointOnSphereToUV(flightCoord.current);
      earthMaterial.current.uniforms.uTime.value = state.clock.elapsedTime;
      flightModel.nodes.vint?.rotateZ(delta * 25);
    }
    if (cloudsMaterial.current) {
      cloudsMaterial.current.uniforms.uFlightCoord.value = pointOnSphereToUV(flightCoord.current);
      cloudsMaterial.current.uniforms.uTime.value = state.clock.elapsedTime;
    }
  });

  useEffect(() => {
    flightModel.scene.rotateY(Math.PI / 2);
    flightModel.scene.rotateZ(Math.PI / 2);
  }, [flightModel])

  return (
    <>
      <mesh position={[0, 0, 0]} scale={2} material={earthMaterial} receiveShadow>
        <boxGeometry args={[1, 1, 1, segs, segs, segs]} attach="geometry" />
        <shaderMaterial
          ref={earthMaterial}
          vertexShader={earthVertex}
          fragmentShader={earthFragment}
          uniforms={{
            uTime: {value: 0},
            uFlightCoord: {value: new Vector2()},
            displacementMap: {value: displacementMap},
            textureMap: {value: textureMap},
            lightMap: {value: lightMap},
            waterNormalA: {value: waterNormalA},
            waterNormalB: {value: waterNormalB},
            waterNormalC: {value: waterNormalC},
            lakesMap: {value: lakesMap},
            earthBWMap: {value: earthBWMap},
            landDistanceMap: {value: landDistanceMap},
            countriesColorsMap: {value: countriesColorsMap}
          }}
        />
      </mesh>
      <group castShadow ref={flightRef} position={[0, 0, 0]}>
        <primitive object={flightModel.scene} position={[0, 0, 2.14]} scale={0.005} />
      </group>
      <points>
        <icosahedronGeometry args={[fh, 150]} />
        <shaderMaterial
          ref={cloudsMaterial}
          vertexShader={cloudsVertex}
          fragmentShader={cloudsFragment}
          transparent
          depthWrite={false}
          uniforms={{
            uTime: {value: 0},
            uFlightCoord: {value: new Vector2()},
          }}
        />
      </points>
    </>
  );
}

export default Earth;
