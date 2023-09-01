import { useFrame } from '@react-three/fiber';
import React, { useEffect, useRef, useState } from 'react';
import { Vector3 } from 'three';
import * as BufferGeometryUtils from 'three/examples/jsm/utils/BufferGeometryUtils.js';
import {generateGeometries} from '../utils/generateGeometries';
import {generateCubePoints} from '../utils/generateCubePoints';

const points = generateGeometries(generateCubePoints());

const Custom = () => {

  const [mergedGeometry, setMergedGeometry] = useState(null);
  const [planes, setPlanes] = useState([]);

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
        }, 500);
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
            
            {/* {points.map((p, i) => (
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
