import { Canvas } from "@react-three/fiber";
import { OrbitControls, KeyboardControls } from "@react-three/drei";
import { Perf } from "r3f-perf";
import Earth from "./components/earth/Earth";
import "./App.css";

function App() {

  return (
  <Canvas flat>
    <color attach="background" args={[0.02, 0.02, 0.02]} />

    {/* <Perf position="top-left" /> */}

    <OrbitControls makeDefault />
    <KeyboardControls
      map={[
        { name: 'left', keys: [ 'ArrowLeft', 'KeyA' ] },
        { name: 'right', keys: [ 'ArrowRight', 'KeyD' ] },
      ]}
    >
      <Earth />
    </KeyboardControls>

    <ambientLight intensity={1.2} />
    <directionalLight position={[4, 5, 6]} />
    <directionalLight position={[-4, -5, -6]} />
  </Canvas>
  );
}

export default App;
