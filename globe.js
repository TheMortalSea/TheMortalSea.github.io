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

    // --- Globe Elements (will be populated later) ---
    const sphere = svg.append("path").attr("class", "sphere");
    const graticule = svg.append("path").attr("class", "graticule");
    let land, point;

    // --- Drag Behavior ---
    const drag = d3.drag()
        .on("start", dragstarted)
        .on("drag", dragged);

    svg.call(drag);

    // --- Drag Functions ---
    function dragstarted() {
        // This function is required to initialize the drag gesture, but we don't need to store state here anymore.
    }

    function dragged(event) {
        const current_rotation = projection.rotate(); // Get the globe's current rotation
        const k = 0.5; // Drag sensitivity
        projection.rotate([
            current_rotation[0] + event.dx * k, // Add the change in X to the current rotation
            current_rotation[1] - event.dy * k  // Add the change in Y to the current rotation
        ]);
        updateGlobe();
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
            .attr("fill", "#b0c4b1")
            .attr("stroke", "#666")
            .attr("stroke-width", 0.5)
            .attr("d", path);

        // Draw Nepal Point
        point = svg.append("path")
            .datum(nepalPoint)
            .attr("class", "point-nepal")
            .attr("d", path.pointRadius(6))
            .on("click", (event, d) => {
                const gdistance = d3.geoDistance(d.coordinates, [-projection.rotate()[0], -projection.rotate()[1]]);
                if (gdistance < Math.PI / 2) {
                    window.location.href = d.url;
                }
            });

        // Initial render
        updateGlobe();
    });

    // --- Update Function ---
    function updateGlobe() {
        land.attr("d", path);
        graticule.attr("d", path);
        point.attr("d", path.pointRadius(6));
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