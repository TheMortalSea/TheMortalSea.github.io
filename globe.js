// document.addEventListener('DOMContentLoaded', () => {
//     const container = document.getElementById('globe-container');
//     if (!container) return;

//     const width = container.offsetWidth;
//     const height = container.offsetHeight;

//     // --- Projection and Path Generator ---
//     const projection = d3.geoOrthographic()
//         .scale((Math.min(width, height) / 2 - 20) * 0.6)
//         .translate([width / 2, height / 2])
//         .clipAngle(90);

//     const path = d3.geoPath().projection(projection);

//     // --- SVG Setup ---
//     const svg = d3.select(container).append("svg")
//         .attr("width", width)
//         .attr("height", height);

//     // --- Data for Nepal ---
//     const nepalCoordinates = [85.3240, 27.7172]; 
//     const nepalPoint = {
//         type: "Point",
//         coordinates: nepalCoordinates,
//         url: "nepal.html"
//     };

//     // --- Globe Elements ---
//     const sphere = svg.append("path").attr("class", "sphere");
//     const graticule = svg.append("path").attr("class", "graticule");
//     let land, point;

//     d3.json("./land-110m.json").then(world => {
//         land = topojson.feature(world, world.objects.land);
    
//         // Draw land on the globe
//         svg.append("path")
//             .datum(land)
//             .attr("class", "land")
//             .attr("d", path);
//     });

//     // --- Drag Behavior ---
//     const drag = d3.drag()
//         .on("start", dragstarted)
//         .on("drag", dragged);

//     svg.call(drag);

//     // --- Zoom Behavior ---
//     const zoom = d3.zoom()
//         .scaleExtent([0.5, 2]) // Set zoom limits (50% to 200% of original scale)
//         .on("zoom", zoomed);

//     svg.call(zoom);

//     function zoomed(event) {
//         const newScale = event.transform.k * ((Math.min(width, height) / 2 - 20) * 0.6);
//         projection.scale(newScale);
//         updateGlobe();
//     }

//     // --- Drag Functions ---
//     function dragstarted() {
//         // Initialize drag gesture
//     }

//     function dragged(event) {
//         const current_rotation = projection.rotate();
//         const k = 0.5; // Drag sensitivity
//         projection.rotate([
//             current_rotation[0] + event.dx * k,
//             current_rotation[1] - event.dy * k
//         ]);
//         updateGlobe();
//     }

//     // --- Update Globe Rendering ---
//     function updateGlobe() {
//         sphere.attr("d", path({ type: "Sphere" }));
//         graticule.attr("d", path(d3.geoGraticule()()));
//         if (land) land.attr("d", path);
//         if (point) point.attr("d", path);
//     }

//     updateGlobe(); // Initial rendering
// });

// function _1(md){return(
//     md`<div style="color: grey; font: 13px/25.5px var(--sans-serif); text-transform: uppercase;"><h1 style="display: none;">World tour</h1><a href="https://d3js.org/">D3</a> › <a href="/@d3/gallery">Gallery</a></div>
    
//     # World tour
    
//     This animation uses [d3.geoInterpolate](https://d3js.org/d3-geo/math#geoInterpolate) to interpolate a path along great arcs, and [spherical linear interpolation](https://en.wikipedia.org/wiki/Slerp) to rotate the [orthographic](/@d3/orthographic) projection.`
//     )}
    
//     function _2(html,name){return(
//     html`<b style="display:block;text-align:center;line-height:33px;">${name}`
//     )}
    
//     async function* _canvas(width,d3,land,borders,countries,$0,Versor)
//     {
//       // Specify the chart’s dimensions.
//       const height = Math.min(width, 720); // Observable sets a responsive *width*
    
//       // Prepare a canvas.
//       const dpr = window.devicePixelRatio ?? 1;
//       const canvas = d3.create("canvas")
//           .attr("width", dpr * width)
//           .attr("height", dpr * height)
//           .style("width", `${width}px`);
//       const context = canvas.node().getContext("2d");
//       context.scale(dpr, dpr);
    
//       // Create a projection and a path generator.
//       const projection = d3.geoOrthographic().fitExtent([[10, 10], [width - 10, height - 10]], {type: "Sphere"});
//       const path = d3.geoPath(projection, context);
//       const tilt = 20;
    
//       function render(country, arc) {
//         context.clearRect(0, 0, width, height);
//         context.beginPath(), path(land), context.fillStyle = "#ccc", context.fill();
//         context.beginPath(), path(country), context.fillStyle = "#f00", context.fill();
//         context.beginPath(), path(borders), context.strokeStyle = "#fff", context.lineWidth = 0.5, context.stroke();
//         context.beginPath(), path({type: "Sphere"}), context.strokeStyle = "#000", context.lineWidth = 1.5, context.stroke();
//         context.beginPath(), path(arc), context.stroke();
//         return context.canvas;
//       }
    
//       let p1, p2 = [0, 0], r1, r2 = [0, 0, 0];
//       for (const country of countries) {
//         $0.value = country.properties.name;
//         yield render(country);
    
//         p1 = p2, p2 = d3.geoCentroid(country);
//         r1 = r2, r2 = [-p2[0], tilt - p2[1], 0];
//         const ip = d3.geoInterpolate(p1, p2);
//         const iv = Versor.interpolateAngles(r1, r2);
    
//         await d3.transition()
//             .duration(1250)
//             .tween("render", () => t => {
//               projection.rotate(iv(t));
//               render(country, {type: "LineString", coordinates: [p1, ip(t)]});
//             })
//           .transition()
//             .tween("render", () => t => {
//               render(country, {type: "LineString", coordinates: [ip(t), p2]});
//             })
//           .end();
//       }
//     }
    
        document.addEventListener('DOMContentLoaded', () => {
            const container = document.getElementById('globe-container');
            if (!container) return;

            const width = container.offsetWidth;
            const height = container.offsetHeight;

            // --- Projection and Path Generator ---
            const projection = d3.geoOrthographic()
                .scale(Math.min(width, height) / 2 - 40)
                .translate([width / 2, height / 2])
                .clipAngle(90);

            const path = d3.geoPath().projection(projection);

            // --- SVG Setup ---
            const svg = d3.select(container).append("svg")
                .attr("width", width)
                .attr("height", height);

            // --- Globe Elements ---
            const globe = svg.append("g");
            
            // Add sphere (ocean)
            const sphere = globe.append("path")
                .datum({type: "Sphere"})
                .attr("class", "sphere")
                .attr("d", path);

            // Add graticule
            const graticule = globe.append("path")
                .datum(d3.geoGraticule())
                .attr("class", "graticule")
                .attr("d", path);

            // --- Sample world data (simplified) ---
            // Using a simple world outline since external JSON might not be available
            const sampleWorld = {
                "type": "FeatureCollection",
                "features": [
                    {
                        "type": "Feature",
                        "properties": {"name": "Sample Land"},
                        "geometry": {
                            "type": "Polygon",
                            "coordinates": [[
                                [-180, -60], [-180, 60], [180, 60], [180, -60], [-180, -60]
                            ]]
                        }
                    }
                ]
            };

            // Create continents data
            const continents = [
                // North America
                {
                    "type": "Feature",
                    "geometry": {
                        "type": "Polygon",
                        "coordinates": [[
                            [-170, 70], [-50, 70], [-50, 15], [-170, 15], [-170, 70]
                        ]]
                    }
                },
                // South America
                {
                    "type": "Feature", 
                    "geometry": {
                        "type": "Polygon",
                        "coordinates": [[
                            [-85, 15], [-30, 15], [-30, -60], [-85, -60], [-85, 15]
                        ]]
                    }
                },
                // Europe
                {
                    "type": "Feature",
                    "geometry": {
                        "type": "Polygon", 
                        "coordinates": [[
                            [-15, 70], [50, 70], [50, 35], [-15, 35], [-15, 70]
                        ]]
                    }
                },
                // Africa
                {
                    "type": "Feature",
                    "geometry": {
                        "type": "Polygon",
                        "coordinates": [[
                            [-20, 35], [55, 35], [55, -35], [-20, -35], [-20, 35]
                        ]]
                    }
                },
                // Asia
                {
                    "type": "Feature",
                    "geometry": {
                        "type": "Polygon",
                        "coordinates": [[
                            [50, 80], [180, 80], [180, 10], [50, 10], [50, 80]
                        ]]
                    }
                },
                // Australia
                {
                    "type": "Feature",
                    "geometry": {
                        "type": "Polygon",
                        "coordinates": [[
                            [110, -10], [160, -10], [160, -45], [110, -45], [110, -10]
                        ]]
                    }
                }
            ];

            // Add land masses
            const land = globe.selectAll(".land")
                .data(continents)
                .enter().append("path")
                .attr("class", "land")
                .attr("d", path);

            // --- Nepal Point ---
            const nepalCoordinates = [85.3240, 27.7172]; 
            const nepalPoint = {
                type: "Point",
                coordinates: nepalCoordinates
            };

            const point = globe.append("path")
                .datum(nepalPoint)
                .attr("class", "point")
                .attr("d", path.pointRadius(5));

            // --- Drag Behavior ---
            let rotation = [0, 0];
            
            const drag = d3.drag()
                .on("start", dragstarted)
                .on("drag", dragged);

            svg.call(drag);

            // --- Zoom Behavior ---
            const initialScale = Math.min(width, height) / 2 - 40;
            
            const zoom = d3.zoom()
                .scaleExtent([0.5, 3])
                .on("zoom", zoomed);

            svg.call(zoom);

            function zoomed(event) {
                const newScale = event.transform.k * initialScale;
                projection.scale(newScale);
                updateGlobe();
            }

            // --- Drag Functions ---
            function dragstarted(event) {
                // Store initial rotation
                rotation = projection.rotate();
            }

            function dragged(event) {
                const k = 0.75; // Drag sensitivity
                const newRotation = [
                    rotation[0] + event.dx * k,
                    Math.max(-90, Math.min(90, rotation[1] - event.dy * k))
                ];
                projection.rotate(newRotation);
                updateGlobe();
            }

            // --- Update Globe Rendering ---
            function updateGlobe() {
                sphere.attr("d", path);
                graticule.attr("d", path);
                land.attr("d", path);
                point.attr("d", path.pointRadius(5));
            }

            // Try to load real world data if available
            d3.json("https://cdn.jsdelivr.net/npm/world-atlas@2/land-110m.json")
                .then(world => {
                    // Remove sample continents
                    land.remove();
                    
                    // Add real world data
                    const realLand = topojson.feature(world, world.objects.land);
                    
                    globe.append("path")
                        .datum(realLand)
                        .attr("class", "land")
                        .attr("d", path);
                    
                    updateGlobe();
                })
                .catch(error => {
                    console.log("Using sample world data (real data unavailable)");
                    // Keep using the sample continents we already added
                });

            // Initial rendering
            updateGlobe();
        });
    