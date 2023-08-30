import { PlaneGeometry, Matrix4 } from 'three';
import { CUBE_WIDTH, PLANE_SEGMENTS, SEGMENTS } from '../consts';

export const generateGeometries = (points) => {
    const g = new PlaneGeometry(
        CUBE_WIDTH / SEGMENTS,
        CUBE_WIDTH / SEGMENTS,
        PLANE_SEGMENTS + 1,
        PLANE_SEGMENTS + 1
    );
    const g2 = new PlaneGeometry(
        CUBE_WIDTH / SEGMENTS,
        CUBE_WIDTH / SEGMENTS,
        10,
        10
    );
    const newPoints = points.map((p) => {
        const bigGeom = g.clone();
        const smallGeom = g2.clone();
        const translationMatrix = new Matrix4().makeTranslation(p.point);
        bigGeom.applyMatrix4(translationMatrix);
        smallGeom.applyMatrix4(translationMatrix);
        if (p.rotateX) {
            const rotationMatrix = new Matrix4().makeRotationX(p.rotateX);
            bigGeom.applyMatrix4(rotationMatrix);
            smallGeom.applyMatrix4(rotationMatrix);
        }
        if (p.rotateY) {
            const rotationMatrix = new Matrix4().makeRotationY(p.rotateY);
            bigGeom.applyMatrix4(rotationMatrix);
            smallGeom.applyMatrix4(rotationMatrix);
        }
        return {
            ...p,
            bigGeom,
            smallGeom
        };
    })
    g.dispose();
    g2.dispose();
    return newPoints;
}