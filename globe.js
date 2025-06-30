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

    d3.json("./land-110m.json").then(world => {
        land = topojson.feature(world, world.objects.land);
    
        // Draw land on the globe
        svg.append("path")
            .datum(land)
            .attr("class", "land")
            .attr("d", path);
    });

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

function _1(md){return(
    md`<div style="color: grey; font: 13px/25.5px var(--sans-serif); text-transform: uppercase;"><h1 style="display: none;">World tour</h1><a href="https://d3js.org/">D3</a> › <a href="/@d3/gallery">Gallery</a></div>
    
    # World tour
    
    This animation uses [d3.geoInterpolate](https://d3js.org/d3-geo/math#geoInterpolate) to interpolate a path along great arcs, and [spherical linear interpolation](https://en.wikipedia.org/wiki/Slerp) to rotate the [orthographic](/@d3/orthographic) projection.`
    )}
    
    function _2(html,name){return(
    html`<b style="display:block;text-align:center;line-height:33px;">${name}`
    )}
    
    async function* _canvas(width,d3,land,borders,countries,$0,Versor)
    {
      // Specify the chart’s dimensions.
      const height = Math.min(width, 720); // Observable sets a responsive *width*
    
      // Prepare a canvas.
      const dpr = window.devicePixelRatio ?? 1;
      const canvas = d3.create("canvas")
          .attr("width", dpr * width)
          .attr("height", dpr * height)
          .style("width", `${width}px`);
      const context = canvas.node().getContext("2d");
      context.scale(dpr, dpr);
    
      // Create a projection and a path generator.
      const projection = d3.geoOrthographic().fitExtent([[10, 10], [width - 10, height - 10]], {type: "Sphere"});
      const path = d3.geoPath(projection, context);
      const tilt = 20;
    
      function render(country, arc) {
        context.clearRect(0, 0, width, height);
        context.beginPath(), path(land), context.fillStyle = "#ccc", context.fill();
        context.beginPath(), path(country), context.fillStyle = "#f00", context.fill();
        context.beginPath(), path(borders), context.strokeStyle = "#fff", context.lineWidth = 0.5, context.stroke();
        context.beginPath(), path({type: "Sphere"}), context.strokeStyle = "#000", context.lineWidth = 1.5, context.stroke();
        context.beginPath(), path(arc), context.stroke();
        return context.canvas;
      }
    
      let p1, p2 = [0, 0], r1, r2 = [0, 0, 0];
      for (const country of countries) {
        $0.value = country.properties.name;
        yield render(country);
    
        p1 = p2, p2 = d3.geoCentroid(country);
        r1 = r2, r2 = [-p2[0], tilt - p2[1], 0];
        const ip = d3.geoInterpolate(p1, p2);
        const iv = Versor.interpolateAngles(r1, r2);
    
        await d3.transition()
            .duration(1250)
            .tween("render", () => t => {
              projection.rotate(iv(t));
              render(country, {type: "LineString", coordinates: [p1, ip(t)]});
            })
          .transition()
            .tween("render", () => t => {
              render(country, {type: "LineString", coordinates: [ip(t), p2]});
            })
          .end();
      }
    }

    