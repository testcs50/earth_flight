import { Vector2 } from "three";

export const pointOnSphereToUV = (point) => {
    const p = point.clone().normalize();

    const longitude = Math.atan2(p.x, p.z);
    const latitude = Math.asin(p.y);

    const u = (longitude / Math.PI + 1) / 2;
    const v = latitude / Math.PI + 0.5;

    return new Vector2(u, v);
}