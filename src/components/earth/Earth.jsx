import { Vector3, TextureLoader, ShaderMaterial, Vector2, Matrix4 } from 'three';
import { useLoader, useFrame } from "@react-three/fiber";
import { useKeyboardControls } from '@react-three/drei';
import { useRef, useEffect } from "react";
import earthVertex from '../../shaders/earth/vertex.glsl';
import earthFragment from '../../shaders/earth/fragment.glsl';
import { pointOnSphereToUV } from '../../utils/pointOnSphereToUV';

const earthMaterial = new ShaderMaterial({
  vertexShader: earthVertex,
  fragmentShader: earthFragment,
  uniforms: {
    uTime: {value: 0},
    uFlightCoord: {value: new Vector2()},
    displacementMap: {value: null},
    textureMap: {value: null},
    lightMap: {value: null},
    waterNormalA: {value: null},
    waterNormalB: {value: null},
    waterNormalC: {value: null},
    lakesMap: {value: null},
    earthBWMap: {value: null},
    landDistanceMap: {value: null},
    countriesColorsMap: {value: null}
  }
})

function Earth() {
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

  const flightCoord = useRef(new Vector3(0, 0, 1).multiplyScalar(2.15));
  const matrix = useRef(new Matrix4());
  const basisY = useRef(new Vector3(0, 1, 0));
  const basisZ = useRef(new Vector3(0, 0, 1));
  const flightRef = useRef(null);

  const [_, getKeys] = useKeyboardControls();

  useFrame((state, delta) => {
    earthMaterial.uniforms.uTime.value = state.clock.elapsedTime;
    const { left, right } = getKeys();
    if (left) {
      matrix.current.makeRotationAxis(basisZ.current.normalize(), delta * 2);
      basisY.current.applyMatrix4(matrix.current);
    }
    if (right) {
      matrix.current.makeRotationAxis(basisZ.current.normalize(), -delta * 2);
      basisY.current.applyMatrix4(matrix.current);
    }
    if (flightRef.current) {
      matrix.current.makeRotationAxis(basisY.current.normalize(), delta / 15);
      basisZ.current.applyMatrix4(matrix.current);
      flightCoord.current.applyMatrix4(matrix.current);
      flightRef.current.position.copy(flightCoord.current);
      state.camera.position.copy(flightCoord.current).multiplyScalar(1.35);
      earthMaterial.uniforms.uFlightCoord.value = pointOnSphereToUV(flightCoord.current);
    }
  });

  useEffect(() => {
    if (!earthMaterial.uniforms.displacementMap.value) {
      earthMaterial.uniforms.displacementMap.value = displacementMap;
    }
    if (!earthMaterial.uniforms.textureMap.value) {
      earthMaterial.uniforms.textureMap.value = textureMap;
    }
    if (!earthMaterial.uniforms.lightMap.value) {
      earthMaterial.uniforms.lightMap.value = lightMap;
    }
    if (!earthMaterial.uniforms.waterNormalA.value) {
      earthMaterial.uniforms.waterNormalA.value = waterNormalA;
    }
    if (!earthMaterial.uniforms.waterNormalB.value) {
      earthMaterial.uniforms.waterNormalB.value = waterNormalB;
    }
    if (!earthMaterial.uniforms.waterNormalC.value) {
      earthMaterial.uniforms.waterNormalC.value = waterNormalC;
    }
    if (!earthMaterial.uniforms.lakesMap.value) {
      earthMaterial.uniforms.lakesMap.value = lakesMap;
    }
    if (!earthMaterial.uniforms.earthBWMap.value) {
      earthMaterial.uniforms.earthBWMap.value = earthBWMap;
    }
    if (!earthMaterial.uniforms.landDistanceMap.value) {
      earthMaterial.uniforms.landDistanceMap.value = landDistanceMap;
    }
    if (!earthMaterial.uniforms.countriesColorsMap.value) {
      earthMaterial.uniforms.countriesColorsMap.value = countriesColorsMap;
    }
  }, [
    displacementMap,
    textureMap,
    lightMap,
    waterNormalA,
    waterNormalB,
    waterNormalC,
    lakesMap,
    earthBWMap,
    landDistanceMap,
    countriesColorsMap
  ]);

  return (
    <>
      <mesh position={[0, 0, 0]} scale={2} material={earthMaterial}>
        <boxGeometry args={[1,1,1, 901, 901, 901]} attach="geometry" />
      </mesh>
      <mesh ref={flightRef} scale={0.01} position={flightCoord.current} >
        <sphereGeometry/>
        <meshBasicMaterial color="red" />
      </mesh>
    </>
  );
}

export default Earth;
