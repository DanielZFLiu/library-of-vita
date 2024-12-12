/**
 * A simple framework that animate parametric equations by gradually changing one parameter
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
    xyGenerator: (progression: number, param: number) => { x: number; y: number },
    numPoints: number = 2000): { x: number; y: number }[] {
    const data = [];
    for (let i = 0; i <= numPoints; i++) {
        let progression = i / numPoints;
        data.push(
            xyGenerator(progression, param)
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

function flowerGenerator(progression: number, param: number): { x: number; y: number } {
    let theta = param * progression;
    return {
        x: 8 * Math.cos(theta) - 6 * Math.cos((8 * theta) / 3),
        y: 8 * Math.sin(theta) - 6 * Math.sin((8 * theta) / 3)
    }
}

function roseCurveGenerator(progression: number, param: number): { x: number; y: number } {
    let theta = progression * 4 * Math.PI;
    let r = Math.sin((param / 5) * theta);
    return {
        x: r * Math.cos(theta),
        y: r * Math.sin(theta)
    }
}

function butterflyGenerator(progression: number, param: number): { x: number; y: number } {
    let theta = progression * param;
    let r = Math.exp(Math.sin(theta)) - 2 * Math.cos(4 * theta) + Math.pow(Math.sin((2 * theta - Math.PI) / 24), 5);
    return {
        x: r * Math.cos(theta),
        y: -r * Math.sin(theta)
    }
}

function portalGenerator(progression: number, param: number): { x: number; y: number } {
    let theta = progression * param;
    let r = 20 * (Math.tan(17 * theta) + 1 / (Math.tan(17 * theta) + 1e-10));
    return {
        x: r * Math.cos(theta),
        y: r * Math.sin(theta)
    }
}

function donutGenerator(progression: number, param: number): { x: number; y: number } {
    let theta = progression * param;
    let r = 4 * Math.sin(24 * theta / 25) + 10;
    return {
        x: r * Math.cos(theta),
        y: r * Math.sin(theta)
    }
}

function darknessGenerator(progression: number, param: number): { x: number; y: number } {
    let t = progression * param;
    let r = Math.cos(26 * t);
    let theta = 26 * Math.sin(26 * t);
    return {
        x: r * Math.cos(theta),
        y: r * Math.sin(theta)
    }
}

function radiantBookGenerator(progression: number, param: number): { x: number; y: number } {
    let theta = progression * param;
    let r = Math.exp(Math.sin(theta)) - 2 * Math.cos(4 * theta) + Math.pow(Math.sin((4 * theta - Math.PI) / 24), 5);
    return {
        x: r * Math.cos(progression * Math.PI),
        y: -r * Math.sin(progression * Math.PI)
    }
}

export let animationMetadata = {
    flower: {
        generator: flowerGenerator,
        viewBox: "-25 -25 50 50"
    },
    roseCurve: {
        generator: roseCurveGenerator,
        viewBox: "-1.5 -1.5 3 3"
    },
    butterfly: {
        generator: butterflyGenerator,
        viewBox: "-5 -5 10 10"
    },
    portal: {
        generator: portalGenerator,
        viewBox: "-5 -5 10 10"
    },
    donut: {
        generator: donutGenerator,
        viewBox: "-17.5 -17.5 35 35"
    },
    darkness: {
        generator: darknessGenerator,
        viewBox: "-1 -1 2 2"
    },
    radiantBook: {
        generator: radiantBookGenerator,
        viewBox: "-5 -5 10 10"
    }
}
