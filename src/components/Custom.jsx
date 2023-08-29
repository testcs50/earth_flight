import { useFrame } from '@react-three/fiber';
import React, { useEffect, useRef, useState } from 'react';
import { PlaneGeometry, Vector3, Matrix4 } from 'three';
import * as BufferGeometryUtils from 'three/examples/jsm/utils/BufferGeometryUtils.js'
import { generateCubePoints } from '../utils/generateCubePoints';
import { CUBE_WIDTH, PLANE_SEGMENTS, SEGMENTS } from '../consts';

const points = generateCubePoints();

const g = new PlaneGeometry(CUBE_WIDTH / SEGMENTS, CUBE_WIDTH / SEGMENTS, PLANE_SEGMENTS, PLANE_SEGMENTS);

const Custom = () => {

    const [pointsState, setPointsState] = useState(points);
    const [mergedGeometry, setMergedGeometry] = useState(null);

    const flightCoord = useRef(new Vector3(0, 0, 1.5));
    const flightRef = useRef(null);

    useFrame((state, delta) => {
        if (flightCoord.current && flightRef.current) {
            const time = state.clock.elapsedTime * 0.1;
            flightCoord.current.setX(Math.sin(time) * 1.1);
            flightCoord.current.setZ(Math.cos(time) * 1.1);
            flightRef.current.position.copy(flightCoord.current);
        }
    });

    useEffect(() => {
        const intervalId = setInterval(() => {
            const newPoints = points.filter((p) => p.p.distanceTo(flightCoord.current) < 0.5);
            const geoms = newPoints.map(({point, rotateX, rotateY}) => {
                const geom = g.clone();
                const translationMatrix = new Matrix4().makeTranslation(point);
                geom.applyMatrix4(translationMatrix);

                if (rotateX) {
                    const rotationMatrix = new Matrix4().makeRotationX(rotateX);
                    geom.applyMatrix4(rotationMatrix);
                }
                if (rotateY) {
                    const rotationMatrix = new Matrix4().makeRotationY(rotateY);
                    geom.applyMatrix4(rotationMatrix);
                }
                return geom;
            });
            const mergedGeoms = BufferGeometryUtils.mergeGeometries(geoms);
            setPointsState(newPoints);
            setMergedGeometry(mergedGeoms);
        }, 800);
        return () => clearInterval(intervalId);
    }, []);

    return (
        <>
            {/* <shaderMaterial
                uniforms={{
                    color: {value: new Color('#00ffff')}
                }}
                vertexShader={`
                void main() {
                    gl_Position = projectionMatrix * viewMatrix * modelMatrix * vec4(position, 1.0);
                }
                `}
                fragmentShader={`
                uniform vec3 color;
                void main() {
                    gl_FragColor = vec4(color, 1.0);
                }
                `}
                transparent
                side={THREE.DoubleSide}
            /> */}
            
            {/* {pointsState.map((p, i) => (
                <mesh key={Math.random()} scale={0.03} position={p.p} >
                    <sphereGeometry/>
                    <meshBasicMaterial color="white" />
                </mesh>
            ))} */}

            <mesh ref={flightRef} scale={0.03} position={flightCoord.current} >
                <sphereGeometry/>
                <meshBasicMaterial color="red" />
            </mesh>

            <mesh geometry={mergedGeometry}>
                <meshBasicMaterial color="yellow" />
            </mesh>
        </>
    );
};

export default Custom;
