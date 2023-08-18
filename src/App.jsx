import { Canvas, useLoader } from "@react-three/fiber";
import { OrbitControls, Sky } from "@react-three/drei";
import { Perf } from "r3f-perf";
import "./App.css";
import { DoubleSide, TextureLoader } from "three";

function App() {
  const height = useLoader(TextureLoader, './height.jpg');
  const normal = useLoader(TextureLoader, './NormalMap.jpg');

  return (
  <Canvas>
    <color attach="background" args={[0, 0, 0]} />

    <Perf position="top-left" />

    <OrbitControls makeDefault />
    <Sky />

    <mesh position={[0, 0, 0]}>
      <icosahedronGeometry args={[1, 256]} />
      <meshStandardMaterial flatShading displacementMap={height} displacementScale={0.2} side={DoubleSide} color="#b2f507" />
    </mesh>
    <mesh position={[0, 0, 0]}>
      <sphereGeometry args={[1.054, 128, 128]} />
      <meshStandardMaterial color="#07a2f5" transparent opacity={0.85} />
    </mesh>

    <ambientLight intensity={1.2} />
    <directionalLight position={[4, 5, 6]} />
    <directionalLight position={[-4, -5, -6]} />
  </Canvas>
  );
}

export default App;
