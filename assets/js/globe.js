// Set up the globe visualization
const width = window.innerWidth;
const height = window.innerHeight;
const sensitivity = 75;

// Create the SVG container
const svg = d3.select('#globeViz')
    .append('svg')
    .attr('width', width)
    .attr('height', height);

// Create a group for the globe
const g = svg.append('g');

const tooltip = d3.select('body')
    .append('div')
    .attr('class', 'country-tooltip')
    .style('position', 'absolute')
    .style('background', 'rgba(0,0,0,0.7)')
    .style('color', 'white')
    .style('padding', '5px 10px')
    .style('border-radius', '5px')
    .style('display', 'none');

// Set up the projection
const projection = d3.geoOrthographic()
    .scale(250)
    .center([0, 0])
    .rotate([0, -30])
    .translate([width / 2, height / 2]);

// Set up the path generator
const path = d3.geoPath().projection(projection);

// Create the background circle (ocean)
g.append('circle')
    .attr('class', 'sphere')
    .attr('cx', width / 2)
    .attr('cy', height / 2)
    .attr('r', projection.scale());

// Load world data
d3.json('https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json')
    .then(data => {
        // Convert TopoJSON to GeoJSON
        const countries = topojson.feature(data, data.objects.countries);

        // Draw the countries
        const countryPaths = g.selectAll('path')
        .data(countries.features)
        .enter()
        .append('path')
        .attr('class', 'country')
        .attr('d', path)
        .on('mouseover', function(event, d) {
            // Highlight the country
            d3.select(this).attr('class', 'country hover');
            
            // Show tooltip with country name
            tooltip.style('display', 'block')
                .html(d.properties.name || 'Unknown')
                .style('left', (event.pageX + 10) + 'px')
                .style('top', (event.pageY + 10) + 'px');
        })
        .on('mouseout', function() {
            // Remove highlight
            d3.select(this).attr('class', 'country');
            
            // Hide tooltip
            tooltip.style('display', 'none');
        })
        .on('click', function(event, d) {
            // Optional: Additional action on country click
            console.log('Selected country:', d.properties.name);
        });

        // Enable rotation
        svg.call(d3.drag()
            .on('drag', (event) => {
                const rotate = projection.rotate();
                const k = sensitivity / projection.scale();
                projection.rotate([
                    rotate[0] + event.dx * k,
                    rotate[1] - event.dy * k
                ]);
                // Update all paths
                svg.selectAll('path').attr('d', path);
            }))
            .call(d3.zoom()
                .on('zoom', (event) => {
                    if (event.transform.k > 0.3) {
                        projection.scale(250 * event.transform.k);
                        // Update sphere and all paths
                        svg.selectAll('circle').attr('r', projection.scale());
                        svg.selectAll('path').attr('d', path);
                    }
                }));
    });

// Handle window resize
window.addEventListener('resize', () => {
    const width = window.innerWidth;
    const height = window.innerHeight;
    
    svg.attr('width', width)
        .attr('height', height);
        
    projection.translate([width / 2, height / 2]);
    
    // Update all paths
    svg.selectAll('path').attr('d', path);
    svg.selectAll('circle')
        .attr('cx', width / 2)
        .attr('cy', height / 2);
});