/**
 * A simple framework that animates parametric equations
 * by gradually changing one parameter
 * 
 * Author: Daniel (DanielZFLiu)
 */

// ==============================
// Pipeline (generate data points -> generate path data)
// ==============================

/**
 * generates data points for a parametric equation
 */
export function generateData(param: number,
    xyGenerator: (proportion: number, param: number) => { x: number; y: number },
    numPoints: number = 2000): { x: number; y: number }[] {
    const data = [];
    for (let i = 0; i <= numPoints; i++) {
        let proportion = i / numPoints;
        data.push(
            xyGenerator(proportion, param)
        );
    }
    return data;
}

/**
 * Transforms an array of points into svg path string
 */
export function generatePathData(data: { x: number; y: number }[]): string {
    // acc to accumulate the path data
    // M to move to the first point
    // L to draw a line to the next point
    return data.reduce((acc, point, index) => {
        const command = index === 0 ? 'M' : 'L';
        return `${acc} ${command} ${point.x},${point.y}`;
    }, '');
}

// ==============================
// Generator Functions & Animation Metadata
// ==============================

function flowerGenerator(proportion: number, param: number): { x: number; y: number } {
    let partialParam = param * proportion;
    return {
        x: 8 * Math.cos(partialParam) - 6 * Math.cos((8 * partialParam) / 3),
        y: 8 * Math.sin(partialParam) - 6 * Math.sin((8 * partialParam) / 3)
    }
}

export let flower = {
    generator: flowerGenerator,
    viewBox: "-25 -25 50 50"
}

function roseCurveGenerator(proportion: number, param: number): { x: number; y: number } {
    let theta = proportion * 4 * Math.PI;
    let r = Math.sin((param / 5) * theta);
    return {
        x: r * Math.cos(theta),
        y: r * Math.sin(theta)
    }
}

export let roseCurve = {
    generator: roseCurveGenerator,
    viewBox: "-2 -2 4 4"
}

// TODO: add generator for r = exp(sin(t)) - 2cos(4t) + sin^5((4t - pi)/24)