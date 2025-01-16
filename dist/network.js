async function createNetwork() {
    try {
        // Initial setup
        const container = document.getElementById("network-container");
        container.innerHTML = '<div class="alert alert-info">Loading visualization...</div>';

        // Dimensions and colors
        const width = window.innerWidth * 1;
        const height = window.innerHeight * 1;
        const nationalityColor = d3.scaleOrdinal();

        // Filter state
        let yearFilter;
        let nationalityFilter;

        // Load data
        let allData = await d3.csv("http://localhost:8081/src/data/artvis_dump_NEW.csv");
        const artistsMap = new Map();
        const venueMap = new Map();

        // Data Validation and Cleaning
        const requiredFields = ['a_id', 'a_firstname', 'a_lastname', 'e_id', 'e_title', 'e_venue', 'e_startdate'];
        allData = allData.filter(d => requiredFields.every(field => d[field]));

        if (allData.length === 0) {
            container.innerHTML = `<div class="alert alert-warning">No valid data available to display.</div>`;
            return;
        }

        // Process data
        allData.forEach(d => {
            if (!artistsMap.has(d.a_id)) {
                artistsMap.set(d.a_id, {
                    id: d.a_id,
                    name: `${d.a_firstname} ${d.a_lastname}`,
                    nationality: d.a_nationality,
                    birthdate: d.a_birthdate,
                    venues: new Set(),
                    connections: new Set(),
                    exhibitions: new Set()
                });
            }
            const artist = artistsMap.get(d.a_id);
            artist.venues.add(d.e_venue);
            artist.exhibitions.add({
                id: d.e_id,
                title: d.e_title,
                venue: d.e_venue,
                year: d.e_startdate.substring(0, 4)
            });

            if (!venueMap.has(d.e_venue)) {
                venueMap.set(d.e_venue, {
                    artists: new Set(),
                    exhibitions: new Set()
                });
            }
            venueMap.get(d.e_venue).artists.add(d.a_id);
            venueMap.get(d.e_venue).exhibitions.add(d.e_id);
        });

        // Process venue-based connections
        venueMap.forEach(venue => {
            const artists = Array.from(venue.artists);
            for (let i = 0; i < artists.length; i++) {
                for (let j = i + 1; j < artists.length; j++) {
                    artistsMap.get(artists[i]).connections.add(artists[j]);
                    artistsMap.get(artists[j]).connections.add(artists[i]);
                }
            }
        });

        // Initialize SVG
        container.innerHTML = '';
        const svg = d3.select("#network-container")
            .append("svg")
            .attr("viewBox", [0, 0, width, height])
            .attr("width", "100%")
            .attr("height", "100%")
            .attr("aria-labelledby", "networkTitle")
            .attr("role", "img");

        const g = svg.append("g");
        let simulation = null;

        // Setup filters with debounced event listeners
        function setupFilters() {
            const years = [...new Set(allData.map(d => d.e_startdate.substring(0, 4)))].sort();
            const nationalities = [...new Set(allData.map(d => d.a_nationality))].sort();

            // Set default filters
            const defaultYear = '1916';
            const defaultNationality = 'RU';

            if (!years.includes(defaultYear)) {
                console.warn(`Default year ${defaultYear} not found in data. Falling back to first available year.`);
            }

            if (!nationalities.includes(defaultNationality)) {
                console.warn(`Default nationality ${defaultNationality} not found in data. Falling back to first available nationality.`);
            }

            yearFilter = years.includes(defaultYear) ? defaultYear : years[0];
            nationalityFilter = nationalities.includes(defaultNationality) ? defaultNationality : nationalities[0];

            // Generate a unique color for each nationality using d3.interpolateRainbow
            nationalityColor
                .domain(nationalities)
                .range(nationalities.map((_, i) => d3.interpolateRainbow(i / nationalities.length)));

            document.getElementById('year-filter').innerHTML = `
                ${years.map(year => `<option value="${year}" ${year === yearFilter ? 'selected' : ''}>${year}</option>`).join('')}
            `;

            document.getElementById('nationality-filter').innerHTML = `
                ${nationalities.map(nat => `<option value="${nat}" ${nat === nationalityFilter ? 'selected' : ''}>${nat}</option>`).join('')}
            `;

            // Debounce function to limit the rate of filter updates
            function debounce(func, wait) {
                let timeout;
                return function(...args) {
                    clearTimeout(timeout);
                    timeout = setTimeout(() => func.apply(this, args), wait);
                };
            }

            const debouncedUpdateNetwork = debounce(updateNetwork, 300);

            document.getElementById('year-filter').addEventListener('change', e => {
                yearFilter = e.target.value;
                debouncedUpdateNetwork();
            });

            document.getElementById('nationality-filter').addEventListener('change', e => {
                nationalityFilter = e.target.value;
                debouncedUpdateNetwork();
            });
        }

        // Track displayed elements
        let displayedArtists = new Set();
        let activeNodes = [];
        let activeEdges = [];

        function meetsFilters(artist) {
            const meetsNationality = nationalityFilter ? artist.nationality === nationalityFilter : true;
            const meetsYear = yearFilter ? Array.from(artist.exhibitions).some(exhibition => exhibition.year === yearFilter) : true;
            return meetsNationality && meetsYear;
        }

        function expandNetwork(artistId) {
            const artist = artistsMap.get(artistId);
            if (!displayedArtists.has(artistId) && meetsFilters(artist)) {
                displayedArtists.add(artistId);
                activeNodes.push({
                    id: artist.id,
                    name: artist.name,
                    nationality: artist.nationality,
                    birthdate: artist.birthdate,
                    exhibitions: artist.exhibitions.size
                });

                artist.connections.forEach(connectedId => {
                    const connected = artistsMap.get(connectedId);
                    if (meetsFilters(connected)) {
                        if (!displayedArtists.has(connectedId)) {
                            displayedArtists.add(connectedId);
                            activeNodes.push({
                                id: connected.id,
                                name: connected.name,
                                nationality: connected.nationality,
                                birthdate: connected.birthdate,
                                exhibitions: connected.exhibitions.size
                            });
                        }
                        activeEdges.push({ source: artist.id, target: connected.id });
                    }
                });
            }
        }

        function updateNetwork() {
            displayedArtists.clear();
            activeNodes = [];
            activeEdges = [];

            const filteredArtists = Array.from(artistsMap.values()).filter(meetsFilters);
            if (filteredArtists.length > 0) {
                expandNetwork(filteredArtists[0].id);
            }

            // Populate activeEdges based on connections between activeNodes
            const nodeIds = new Set(activeNodes.map(node => node.id));
            artistsMap.forEach(artist => {
                if (nodeIds.has(artist.id)) {
                    artist.connections.forEach(connId => {
                        if (nodeIds.has(connId)) {
                            const edgeKey = [artist.id, connId].sort().join('-');
                            if (!activeEdges.find(edge => `${edge.source}-${edge.target}` === edgeKey)) {
                                activeEdges.push({ source: artist.id, target: connId });
                            }
                        }
                    });
                }
            });

            updateVisualization();
        }

        function updateVisualization() {
            const linksGroup = g.selectAll("g.links").data([null]).join("g").attr("class", "links");
            const nodesGroup = g.selectAll("g.nodes").data([null]).join("g").attr("class", "nodes");

            // Bind data to links
            const link = linksGroup.selectAll("line")
                .data(activeEdges, d => `${d.source}-${d.target}`)
                .join(
                    enter => enter.append("line").attr("class", "link"),
                    update => update,
                    exit => exit.remove()
                );

            // Bind data to nodes with accessibility features
            const node = nodesGroup.selectAll("circle")
                .data(activeNodes, d => d.id)
                .join(
                    enter => enter.append("circle")
                        .attr("r", d => 5 + Math.sqrt(d.exhibitions))
                        .attr("fill", d => nationalityColor(d.nationality))
                        .attr("class", "node")
                        .attr("tabindex", 0) 
                        .attr("aria-label", d => `Artist: ${d.name}, Nationality: ${d.nationality}, Exhibitions: ${d.exhibitions}`)
                        .on("click", (event, d) => {
                            expandNetwork(d.id);
                            showArtistInfo(event, d);
                        })
                        .on("focus", (event, d) => {
                            showArtistInfo(event, d);
                        })
                        .on("mouseover", (event, d) => {
                            showTooltip(event, d);
                        })
                        .on("mouseout", hideTooltip)
                        .call(drag),
                    update => update,
                    exit => exit.remove()
                );

            // Add Labels to Nodes
            const labels = nodesGroup.selectAll("text")
                .data(activeNodes, d => d.id)
                .join(
                    enter => enter.append("text")
                        .attr("x", 6)
                        .attr("y", 3)
                        .text(d => d.name)
                        .attr("font-size", "10px")
                        .attr("fill", "#555"),
                    update => update,
                    exit => exit.remove()
                );

            // Initialize Tooltip
            const tooltip = d3.select("body").append("div")
                .attr("class", "tooltip")
                .style("position", "absolute")
                .style("padding", "8px")
                .style("background", "rgba(0,0,0,0.6)")
                .style("color", "#fff")
                .style("border-radius", "4px")
                .style("pointer-events", "none")
                .style("opacity", 0);

            function showTooltip(event, d) {
                tooltip.transition().duration(200).style("opacity", 0.9);
                tooltip.html(`
                    <strong>${d.name}</strong><br/>
                    Nationality: ${d.nationality}<br/>
                    Birth: ${d.birthdate}<br/>
                    Exhibitions: ${d.exhibitions}
                `)
                .style("left", (event.pageX + 10) + "px")
                .style("top", (event.pageY - 28) + "px");
            }

            function hideTooltip() {
                tooltip.transition().duration(500).style("opacity", 0);
            }

            // Stop existing simulation
            simulation?.stop();

            // Initialize force simulation
            simulation = d3.forceSimulation(activeNodes)
                .force("link", d3.forceLink(activeEdges).id(d => d.id).distance(100))
                .force("charge", d3.forceManyBody().strength(-300))
                .force("center", d3.forceCenter(width / 2, height / 2))
                .force("collision", d3.forceCollide().radius(d => 5 + Math.sqrt(d.exhibitions) + 5))
                .on("tick", () => {
                    link
                        .attr("x1", d => d.source.x)
                        .attr("y1", d => d.source.y)
                        .attr("x2", d => d.target.x)
                        .attr("y2", d => d.target.y);

                    node
                        .attr("cx", d => d.x)
                        .attr("cy", d => d.y);

                    labels
                        .attr("x", d => d.x + 5)
                        .attr("y", d => d.y + 3);
                });

            // Accessibility: Keyboard navigation
            node.on("keydown", (event, d) => {
                if (event.key === "Enter" || event.key === " ") {
                    expandNetwork(d.id);
                    showArtistInfo(event, d);
                }
            });

            // Clean up tooltip on exit
            nodesGroup.selectAll("circle").on("remove", hideTooltip);
        }

        function showArtistInfo(event, d) {
            const artist = artistsMap.get(d.id);
            const artistInfo = document.getElementById("artist-info");
            if (artistInfo) {
                artistInfo.innerHTML = `
                    <div class="card-body">
                        <h4>${d.name}</h4>
                        <p>Nationality: ${d.nationality}</p>
                        <p>Birth: ${d.birthdate}</p>
                        <h5>Exhibitions (${artist.exhibitions}):</h5>
                        <ul>
                            ${Array.from(artist.exhibitions)
                                .map(e => `<li>${e.title} (${e.year}) at ${e.venue}</li>`)
                                .join('')}
                        </ul>
                    </div>
                `;
            }
        }

        // Initialize drag behavior
        const drag = d3.drag()
            .on("start", (event, d) => {
                if (!event.active) simulation?.alphaTarget(0.3).restart();
                d.fx = d.x;
                d.fy = d.y;
            })
            .on("drag", (event, d) => {
                d.fx = event.x;
                d.fy = event.y;
            })
            .on("end", (event, d) => {
                if (!event.active) simulation?.alphaTarget(0);
                d.fx = null;
                d.fy = null;
            });

        // Setup zoom with optimized settings
        const zoom = d3.zoom()
            .scaleExtent([0.3, 10])
            .on("zoom", (event) => g.attr("transform", event.transform));
        svg.call(zoom)
           .on("dblclick.zoom", null); 

        // Initialize the network based on default filters
        setupFilters();
        updateNetwork();

        // Debounced resize handling to optimize performance
        function debounce(func, wait) {
            let timeout;
            return function(...args) {
                clearTimeout(timeout);
                timeout = setTimeout(() => func.apply(this, args), wait);
            };
        }

        window.addEventListener('resize', debounce(() => {
            const newWidth = window.innerWidth * 1;
            const newHeight = window.innerHeight * 1;

            svg.attr("viewBox", [0, 0, newWidth, newHeight])
               .attr("width", "100%")
               .attr("height", "100%");

            simulation.force("center", d3.forceCenter(newWidth / 2, newHeight / 2));
            simulation.alpha(0.3).restart();
        }, 200));
        // Ensure high contrast for nodes and links
        d3.selectAll(".node")
            .attr("stroke", "#ffffff")
            .attr("stroke-width", "1px");

        // Ensure tooltips are accessible
        svg.attr("aria-label", "Art Exhibition Network Visualization")
           .attr("role", "img");

    } catch (error) {
        console.error("Error:", error);
        const container = document.getElementById("network-container");
        container.innerHTML = `<div class="alert alert-danger">Error: ${error.message}</div>`;
    }
}

createNetwork();
