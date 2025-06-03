// generative-background-worklet.js

/**
 * @class GenerativeBackgroundPainter
 * A Houdini Paint API worklet class to draw a generative background pattern.
 * This example draws random circles on a solid background color.
 */
class GenerativeBackgroundPainter {
    /**
     * Defines the CSS custom properties that this worklet accepts as input.
     * @returns {string[]} An array of CSS custom property names.
     */
    static get inputProperties() {
        return [
            '--background-color', // The background color of the canvas
            '--circle-color',     // The color of the circles
            '--circle-size'       // A base size factor for the circles
        ];
    }

    /**
     * The main paint method called by the browser's rendering engine.
     * @param {CanvasRenderingContext2D} ctx - The 2D rendering context for the paint canvas.
     * @param {object} size - An object containing the width and height of the area to paint.
     * @param {StylePropertyMapReadOnly} props - A map-like object to access the resolved values of the input properties.
     */
    paint(ctx, size, props) {
        // Retrieve custom property values, providing defaults if not set
        const bgColor = props.get('--background-color').toString().trim() || '#f0f0f0';
        const circleColor = props.get('--circle-color').toString().trim() || '#3498db';
        // Ensure circleSize is an integer; use a default if parsing fails or property is missing
        const circleSize = parseInt(props.get('--circle-size').toString(), 10) || 5;

        // Step 1: Fill the background
        ctx.fillStyle = bgColor;
        ctx.fillRect(0, 0, size.width, size.height);

        // Step 2: Draw a pattern of random circles
        const numCircles = 50; // Define the number of circles to draw (density)
        for (let i = 0; i < numCircles; i++) {
            // Generate random positions and sizes for each circle
            const x = Math.random() * size.width; // Random x-coordinate within the canvas width
            const y = Math.random() * size.height; // Random y-coordinate within the canvas height
            // Random radius for each circle, influenced by --circle-size, with a minimum of 2
            const radius = (Math.random() * Math.max(1, circleSize)) + 2;

            ctx.beginPath(); // Start a new path for the circle
            ctx.arc(x, y, radius, 0, 2 * Math.PI); // Define the circle (x, y, radius, startAngle, endAngle)
            ctx.fillStyle = circleColor; // Set the fill color for the circle
            ctx.fill(); // Fill the circle
        }
    }
}

// Register the paint worklet with the browser
try {
    // `registerPaint` is a global function available in the PaintWorkletGlobalScope
    if (typeof registerPaint !== 'undefined') {
        registerPaint('generative-background', GenerativeBackgroundPainter);
    } else {
        // This warning helps if the script is loaded in a context where registerPaint is not available
        console.warn('`registerPaint` is not defined. This script is intended to be loaded as a Paint Worklet via `CSS.paintWorklet.addModule()`.');
    }
} catch (e) {
    console.error('Exception during paint worklet registration:', e);
}
