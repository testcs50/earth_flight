import { Vector3 } from "three";

export const cubeCoordToSphere = (p) => {
    const x2 = p.x * p.x;
    const y2 = p.y * p.y;
    const z2 = p.z * p.z;

    const div1 = 2;
    const div2 = 3;

    const x = p.x * Math.sqrt(1.0 - (y2 + z2) / div1 + (y2 * z2) / div2);
    const y = p.y * Math.sqrt(1.0 - (z2 + x2) / div1 + (x2 * z2) / div2);
    const z = p.z * Math.sqrt(1.0 - (x2 + y2) / div1 + (y2 * x2) / div2);
    
    return new Vector3(x, y, z);
}