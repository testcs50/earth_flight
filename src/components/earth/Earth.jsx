import { Vector3, TextureLoader, ShaderMaterial, Vector2 } from 'three';
import * as BufferGeometryUtils from 'three/examples/jsm/utils/BufferGeometryUtils.js';
import { useLoader, useFrame } from "@react-three/fiber";
import { useRef, useState, useEffect } from "react";
import earthVertex from '../../shaders/earth/vertex.glsl';
import earthFragment from '../../shaders/earth/fragment.glsl';
import { generateCubePoints } from "../../utils/generateCubePoints";
import { pointOnSphereToUV } from '../../utils/pointOnSphereToUV';
import { generateGeometries } from '../../utils/generateGeometries';

const points = generateGeometries(generateCubePoints());

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
  // const [earthMaterial, setEarthMaterialRef] = useState();
  const displacementMap = useLoader(TextureLoader, './displacement.jpg');
  const textureMap = useLoader(TextureLoader, './colored.jpg');
  const lightMap = useLoader(TextureLoader, './lightMap.png');
  const waterNormalA = useLoader(TextureLoader, './wave-a.png');
  const waterNormalB = useLoader(TextureLoader, './wave-b.png');
  const waterNormalC = useLoader(TextureLoader, './wave-c.png');
  const lakesMap = useLoader(TextureLoader, './lakes.jpg');
  const earthBWMap = useLoader(TextureLoader, './earthbw.png');
  const landDistanceMap = useLoader(TextureLoader, './land-distance.png');
  const countriesColorsMap = useLoader(TextureLoader, './countries-colored.png');

  const [mergedGeometry, setMergedGeometry] = useState(null);
  const [planes, setPlanes] = useState([]);
  const flightCoord = useRef(new Vector3(0, 0, 1.5));
  const flightRef = useRef(null);

  useFrame((state) => {
    earthMaterial.uniforms.uTime.value = state.clock.elapsedTime;
    if (flightCoord.current && flightRef.current) {
        const time = state.clock.elapsedTime * 0.05;
        flightCoord.current.setX(Math.sin(time) * 2.15);
        flightCoord.current.setZ(Math.cos(time) * 2.15);
        flightRef.current.position.copy(flightCoord.current);
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

  useEffect(() => {
    const intervalId = setInterval(() => {
      const flightCoordCopy = flightCoord.current.clone().normalize();
      const geoms = [];
      for (const point of points) {
        const dist = point.p.distanceTo(flightCoordCopy);
        if (dist < 0.4) {
          geoms.push(point.bigGeom);
        }
        if (dist > 0.35 && dist < 0.8) {
          geoms.push(point.smallGeom);
        }
      }
      setPlanes(geoms);
    }, 1000);
    return () => {
      clearInterval(intervalId);
    };
  }, []);

  useEffect(() => {
    const callbackId = requestIdleCallback(() => {
      if (planes.length) {
        let mergedGeoms = BufferGeometryUtils.mergeGeometries(planes);
        setMergedGeometry(mergedGeoms);
      }
    });
    return () => {
      if (mergedGeometry?.dispose) mergedGeometry.dispose();
      cancelIdleCallback(callbackId);
    }
  }, [planes]);

  return (
    <>
      <mesh position={[0, 0, 0]} scale={2} geometry={mergedGeometry || undefined} material={earthMaterial} />
      <mesh ref={flightRef} scale={0.01} position={flightCoord.current} >
        <sphereGeometry/>
        <meshBasicMaterial color="red" />
      </mesh>

      {/* <mesh position={[0, 0, 0]}>
        <icosahedronGeometry args={[1, 256]} />
        <meshStandardMaterial
          ref={mat}
          flatShading
          displacementMap={height}
          displacementScale={0.2}
          side={DoubleSide}
          color="#b2f507"
        />
      </mesh>

      <mesh position={[0, 0, 0]}>
        <sphereGeometry args={[1.054, 256, 256]} />
        <shaderMaterial
          ref={seaMaterial}
          vertexShader={seaVertexShader}
          fragmentShader={seaFragmentShader}
          uniforms={{
            uTime: {value: 0}
          }}
          transparent
        />
      </mesh> */}
    </>
  );
}

export default Earth;
