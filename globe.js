document.addEventListener('DOMContentLoaded', () => {
    const container = document.getElementById('globe-container');
    if (!container) return;

    const width = container.offsetWidth;
    const height = container.offsetHeight;

    // --- Projection and Path Generator ---
    const projection = d3.geoOrthographic()
        .scale(Math.min(width, height) / 2 - 20)
        .translate([width / 2, height / 2])
        .clipAngle(90); // Only show the front hemisphere

    const path = d3.geoPath().projection(projection);

    // --- SVG Setup ---
    const svg = d3.select(container).append("svg")
        .attr("width", width)
        .attr("height", height);

    // --- Data for Nepal ---
    // GeoJSON Point format: [longitude, latitude]
    const nepalCoordinates = [85.3240, 27.7172]; 
    const nepalPoint = {
        type: "Point",
        coordinates: nepalCoordinates,
        url: "nepal.html"
    };

    // --- Globe Elements (will be populated later) ---
    const sphere = svg.append("path").attr("class", "sphere");
    const graticule = svg.append("path").attr("class", "graticule");
    let land, point;

    // --- Drag Behavior ---
    const drag = d3.drag()
        .on("start", dragstarted)
        .on("drag", dragged)
        .on("end", dragended);

    svg.call(drag);

    let rotation_start;
    let rotation_velocity = { x: 0, y: 0 };
    let autorotate;

    function startAutorotation() {
        autorotate = d3.interval(() => {
            const current_rotation = projection.rotate();
            projection.rotate([current_rotation[0] + 0.2, current_rotation[1]]); // Adjust speed here
            updateGlobe();
        }, 50);
    }
    
    function stopAutorotation() {
        if (autorotate) autorotate.stop();
        autorotate = null;
    }

    // --- Drag Functions ---
    function dragstarted() {
        stopAutorotation();
        rotation_start = projection.rotate();
    }

    function dragged(event) {
        const k = 0.5; // Sensitivity of dragging
        projection.rotate([
            rotation_start[0] + event.dx * k,
            rotation_start[1] - event.dy * k
        ]);
        updateGlobe();
    }
    
    function dragended() {
        // Optional: restart autorotation after a delay
        setTimeout(startAutorotation, 2000);
    }


    // --- Load Data and Draw ---
    const worldUrl = "https://unpkg.com/world-atlas@2/countries-110m.json";

    d3.json(worldUrl).then(world => {
        // Draw Sphere (water)
        sphere.datum({ type: "Sphere" }).attr("d", path);
        
        // Draw Graticule (grid lines)
        graticule.datum(d3.geoGraticule10()).attr("d", path);
        
        // Draw Land
        land = svg.append("g")
            .selectAll("path")
            .data(topojson.feature(world, world.objects.countries).features)
            .enter().append("path")
            .attr("class", "land")
            .attr("d", path);

        // Draw Nepal Point
        point = svg.append("path")
            .datum(nepalPoint)
            .attr("class", "point-nepal")
            .attr("d", path.pointRadius(6)) // Initial radius of the point
            .on("click", (event, d) => {
                // Check if the point is visible before navigating
                const [x, y] = projection(d.coordinates);
                const gdistance = d3.geoDistance(d.coordinates, [-projection.rotate()[0], -projection.rotate()[1]]);
                
                if (gdistance < Math.PI / 2) {
                    window.location.href = d.url;
                }
            });

        // Initial render and start rotation
        updateGlobe();
        startAutorotation();
    });

    // --- Update Function ---
    // This function redraws elements that change on rotation
    function updateGlobe() {
        land.attr("d", path);
        graticule.attr("d", path);
        point.attr("d", path.pointRadius(6));

        // Hide the point if it's on the far side of the globe
        const gdistance = d3.geoDistance(nepalPoint.coordinates, [-projection.rotate()[0], -projection.rotate()[1]]);
        point.style("display", gdistance > Math.PI / 2 ? "none" : "inline");
    }

    // Handle window resizing
    window.addEventListener('resize', () => {
        const newWidth = container.offsetWidth;
        const newHeight = container.offsetHeight;
        projection.scale(Math.min(newWidth, newHeight) / 2 - 20)
                  .translate([newWidth / 2, newHeight / 2]);
        svg.attr('width', newWidth).attr('height', newHeight);
        sphere.attr('d', path);
        updateGlobe();
    });
});