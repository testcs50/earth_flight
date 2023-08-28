import { TextureLoader } from "three";
import { useLoader, useFrame } from "@react-three/fiber";
import { useRef } from "react";
import earthVertex from '../../shaders/earth/vertex.glsl';
import earthFragment from '../../shaders/earth/fragment.glsl';

const segs = 801; // It makes a bug with 2n number

function Earth() {
  const earthMaterial = useRef(null);
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

  useFrame((_, delta) => {
    if (earthMaterial.current) {
      earthMaterial.current.uniforms.uTime.value += delta;
    }
  });

  return (
    <>
      <mesh position={[0, 0, 0]} scale={2}>
        <boxGeometry args={[1,1,1, segs, segs, segs]} />
        <shaderMaterial
          ref={earthMaterial}
          vertexShader={earthVertex}
          fragmentShader={earthFragment}
          uniforms={{
            uTime: {value: 0},
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
