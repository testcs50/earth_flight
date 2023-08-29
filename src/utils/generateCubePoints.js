import { Vector3 } from "three";
import { CUBE_WIDTH, SEGMENTS } from "../consts";
import { cubeCoordToSphere } from "./cubeCoordToSphere";

export const generateCubePoints = () => {
    const segmentWidth = CUBE_WIDTH / SEGMENTS;
    const start = -CUBE_WIDTH / 2;
    const front = [];
    for (let y = start + segmentWidth / 2; y < CUBE_WIDTH / 2; y += segmentWidth) {
        for (let x = start + segmentWidth / 2; x < CUBE_WIDTH / 2; x += segmentWidth) {
            const z = 1;
            const point = new Vector3(x, y, z);
            front.push({
                point,
                p: cubeCoordToSphere(point.clone()),
                rotateX: false,
                rotateY: false
            });
        }
    }

    const top = [];
    let axis = new Vector3(1, 0, 0);
    let angle = -Math.PI / 2;
    front.forEach((pData) => {
        const newPoint = cubeCoordToSphere(pData.point.clone().applyAxisAngle(axis, angle));
        top.push({
            ...pData,
            p: newPoint,
            rotateX: angle,
        });
    });

    const bottom = [];
    axis = new Vector3(1, 0, 0);
    angle = Math.PI / 2;
    front.forEach((pData) => {
        const newPoint = cubeCoordToSphere(pData.point.clone().applyAxisAngle(axis, angle));
        bottom.push({
            ...pData,
            p: newPoint,
            rotateX: angle,
        });
    });

    const back = [];
    axis = new Vector3(1, 0, 0);
    angle = Math.PI;
    front.forEach((pData) => {
        const newPoint = cubeCoordToSphere(pData.point.clone().applyAxisAngle(axis, angle));
        back.push({
            ...pData,
            p: newPoint,
            rotateX: angle,
        });
    });

    const left = [];
    axis = new Vector3(0, 1, 0);
    angle = -Math.PI / 2;
    front.forEach((pData) => {
        const newPoint = cubeCoordToSphere(pData.point.clone().applyAxisAngle(axis, angle));
        left.push({
            ...pData,
            p: newPoint,
            rotateY: angle,
        });
    });

    const right = [];
    axis = new Vector3(0, 1, 0);
    angle = Math.PI / 2;
    front.forEach((pData) => {
        const newPoint = cubeCoordToSphere(pData.point.clone().applyAxisAngle(axis, angle));
        right.push({
            ...pData,
            p: newPoint,
            rotateY: angle,
        });
    });
    
    return [...front, ...top, ...bottom, ...back, ...left, ...right];
}