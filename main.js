import { DEMVisualizer } from './DEMVisualizer.js';

document.addEventListener('DOMContentLoaded', () => {
    const visualizer = new DEMVisualizer('dem-container');
    
    // Replace this URL with the path to your DEM file
    // You can store the DEM file in your repository or use an external URL
    visualizer.loadDEM('./path/to/your/dem.tiff');
    
    window.addEventListener('resize', () => visualizer.onWindowResize());
});