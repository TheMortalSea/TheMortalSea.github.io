document.addEventListener('DOMContentLoaded', () => {
    const container = document.getElementById('globe-container');
    if (!container) return;

    const width = container.offsetWidth;
    const height = container.offsetHeight;

    // --- Projection and Path Generator ---
    const projection = d3.geoOrthographic()
        .scale((Math.min(width, height) / 2 - 20) * 0.6)
        .translate([width / 2, height / 2])
        .clipAngle(90);

    const path = d3.geoPath().projection(projection);

    // --- SVG Setup ---
    const svg = d3.select(container).append("svg")
        .attr("width", width)
        .attr("height", height);

    // --- Data for Nepal ---
    const nepalCoordinates = [85.3240, 27.7172]; 
    const nepalPoint = {
        type: "Point",
        coordinates: nepalCoordinates,
        url: "nepal.html"
    };

    // --- Globe Elements ---
    const sphere = svg.append("path").attr("class", "sphere");
    const graticule = svg.append("path").attr("class", "graticule");
    let land, point;

    // --- Drag Behavior ---
    const drag = d3.drag()
        .on("start", dragstarted)
        .on("drag", dragged);

    svg.call(drag);

    // --- Zoom Behavior ---
    const zoom = d3.zoom()
        .scaleExtent([0.5, 2]) // Set zoom limits (50% to 200% of original scale)
        .on("zoom", zoomed);

    svg.call(zoom);

    function zoomed(event) {
        const newScale = event.transform.k * ((Math.min(width, height) / 2 - 20) * 0.6);
        projection.scale(newScale);
        updateGlobe();
    }

    // --- Drag Functions ---
    function dragstarted() {
        // Initialize drag gesture
    }

    function dragged(event) {
        const current_rotation = projection.rotate();
        const k = 0.5; // Drag sensitivity
        projection.rotate([
            current_rotation[0] + event.dx * k,
            current_rotation[1] - event.dy * k
        ]);
        updateGlobe();
    }

    // --- Update Globe Rendering ---
    function updateGlobe() {
        sphere.attr("d", path({ type: "Sphere" }));
        graticule.attr("d", path(d3.geoGraticule()()));
        if (land) land.attr("d", path);
        if (point) point.attr("d", path);
    }

    updateGlobe(); // Initial rendering
});

