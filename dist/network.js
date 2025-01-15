async function createNetwork() {
    try {
        // Initial setup
        const container = document.getElementById("network-container");
        container.innerHTML = '<div class="alert alert-info">Loading visualization...</div>';

        // Dimensions and colors
        const width = window.innerWidth * 0.75;
        const height = window.innerHeight * 0.8;
        const nationalityColor = d3.scaleOrdinal(d3.schemeCategory10);

        // Filter state
        let yearFilter = 'all';
        let nationalityFilter = 'all';

        // Load data
        const allData = await d3.csv("http://localhost:8081/src/data/artvis_dump_NEW.csv");
        const artistsMap = new Map();
        const venueMap = new Map();

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

        // Setup filters
        function setupFilters() {
            const years = [...new Set(allData.map(d => d.e_startdate.substring(0, 4)))].sort();
            const nationalities = [...new Set(allData.map(d => d.a_nationality))].sort();

            document.getElementById('year-filter').innerHTML = `
                <option value="all">All Years</option>
                ${years.map(year => `<option value="${year}">${year}</option>`).join('')}
            `;

            document.getElementById('nationality-filter').innerHTML = `
                <option value="all">All Nationalities</option>
                ${nationalities.map(nat => `<option value="${nat}">${nat}</option>`).join('')}
            `;

            document.getElementById('year-filter').addEventListener('change', e => {
                yearFilter = e.target.value;
                updateNetwork();
            });

            document.getElementById('nationality-filter').addEventListener('change', e => {
                nationalityFilter = e.target.value;
                updateNetwork();
            });
        }

        // Track displayed elements
        let displayedArtists = new Set();
        let activeNodes = [];
        let activeEdges = [];

        function meetsFilters(artist) {
            const meetsNationality = nationalityFilter === 'all' || artist.nationality === nationalityFilter;
            const meetsYear = yearFilter === 'all' || 
                Array.from(artist.exhibitions)
                    .some(exhibition => exhibition.year === yearFilter);
            return meetsNationality && meetsYear;
        }

        function expandNetwork(artistId) {
            const artist = artistsMap.get(artistId);
            if (!displayedArtists.has(artistId) && meetsFilters(artist)) {
                displayedArtists.add(artistId);
                activeNodes.push({
                    id: artistId,
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
                                id: connectedId,
                                name: connected.name,
                                nationality: connected.nationality,
                                birthdate: connected.birthdate,
                                exhibitions: connected.exhibitions.size
                            });
                            activeEdges.push({ source: artistId, target: connectedId });
                        }
                    }
                });
                updateVisualization();
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
            updateVisualization();
        }

        function updateVisualization() {
            const link = g.selectAll("line")
                .data(activeEdges, d => `${d.source}-${d.target}`)
                .join(
                    enter => enter.append("line").attr("class", "link"),
                    update => update,
                    exit => exit.remove()
                );

            const node = g.selectAll("circle")
                .data(activeNodes, d => d.id)
                .join(
                    enter => enter.append("circle")
                        .attr("r", d => 5 + Math.sqrt(d.exhibitions))
                        .attr("fill", d => nationalityColor(d.nationality))
                        .attr("class", "node")
                        .on("click", (event, d) => {
                            expandNetwork(d.id);
                            showArtistInfo(event, d);
                        })
                        .call(drag),
                    update => update,
                    exit => exit.remove()
                );

            simulation?.stop();
            simulation = d3.forceSimulation(activeNodes)
                .force("link", d3.forceLink(activeEdges).id(d => d.id).distance(100))
                .force("charge", d3.forceManyBody().strength(-300))
                .force("center", d3.forceCenter(width / 2, height / 2))
                .on("tick", () => {
                    link
                        .attr("x1", d => d.source.x)
                        .attr("y1", d => d.source.y)
                        .attr("x2", d => d.target.x)
                        .attr("y2", d => d.target.y);

                    node
                        .attr("cx", d => d.x)
                        .attr("cy", d => d.y);
                });
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
                        <h5>Exhibitions (${artist.exhibitions.size}):</h5>
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

        // Setup SVG after data is loaded and processed
        container.innerHTML = '';
        const svg = d3.select("#network-container")
            .append("svg")
            .attr("viewBox", [0, 0, width, height])
            .attr("width", "100%")
            .attr("height", "100%");

        const g = svg.append("g");
        let simulation = null;

        // Setup zoom
        const zoom = d3.zoom()
            .extent([[0, 0], [width, height]])
            .scaleExtent([0.1, 8])
            .on("zoom", (event) => g.attr("transform", event.transform));
        svg.call(zoom);

        // Initialize
        setupFilters();
        const firstArtistId = Array.from(artistsMap.keys())[0];
        expandNetwork(firstArtistId);
        updateVisualization();

    } catch (error) {
        console.error("Error:", error);
        const container = document.getElementById("network-container");
        container.innerHTML = `<div class="alert alert-danger">Error: ${error.message}</div>`;
    }
}

createNetwork();