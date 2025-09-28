# ArtVis

## Project Overview
- Interactive exploration of roughly 14k modernist art exhibitions (1905-1915) sourced from the ArtVis dataset.
- Focuses on revealing where and when artists exhibited, gender representation, and how venues connected artists across Europe and beyond.

## Visual Features
- **Map view:** Leaflet-powered bubble map with a dual-handle year slider, highlighting exhibition hotspots and surfacing up to 150 detailed records per location.
- **Artist network:** D3 force-directed graph that links artists who shared venues, filterable by exhibition year and artist nationality.
- **At-a-glance feedback:** Contextual list and tooltips update live so users can compare places and collaborations without leaving the page.

## Dataset Notes
- Core fields include artist demographics, exhibition metadata, geocoordinates, and counts of exhibited works.
- Cleaning addressed incomplete birth/death dates, missing coordinates, and sparse categorical values to keep interactions responsive.

## Repository Layout
- `src/`: source modules for the map, slider, data utilities, and network logic.
- `dist/`: built HTML/JS assets for quick demos.
- `data/`: cleaned CSV plus notebook used for preprocessing.
- `docs/`: full project reports that document analysis decisions.
- `notebooks/`: exploratory data analysis in Jupyter format.

## Getting Started

This guide will walk you through the steps to set up and run ArtVis. Follow these steps to set up and run the ArtVis project locally.

### Accessing the demo deployment

You can access the demo on ngrok of our ArtVis project at https://mouse-assured-tiger.ngrok-free.app/.
In case there are technical issues with it, please follow the steps below.

### Prerequisites

Make sure you have the following software installed:

- **Node.js** (v14 or higher)
- **npm** (v6 or higher)

### Installation

1. **Clone the repository:**

   Open a terminal and clone the repository to your local machine:

   ```bash
   git clone https://github.com/AhmedSabanovic/ArtVis.git
   ```

2. **Navigate into the project directory:**

   ```bash
   cd ArtVis
   ```

3. **Install project dependencies:**

   Install the required dependencies using npm:

   ```bash
   npm install
   ```

4. **Install Webpack and Webpack CLI locally:**

   These tools are needed for bundling the project:

   ```bash
   npm install --save-dev webpack webpack-cli
   ```

### Running the Project

1. **Build the project:**

   To build the project, run the following command:

   ```bash
   npm run build
   ```

2. **Start a local HTTP server with CORS enabled:**

   Open a terminal and start an HTTP server with CORS enabled to run on port 8081:

   ```bash
   npx http-server --cors -p 8081
   ```

3. **Start the Webpack development server:**

   In a separate terminal, run the Webpack development server on port 8080:

   ```bash
   npm start
   ```
4. **Access the application:**

   Open your browser and navigate to [http://localhost:8080](http://localhost:8080) to view the application running.

5. **Starting ngrok (for demo only):**

   Open a terminal and start ngrok to run on port 8080 (you may have to change the hostname and host header, based on your own settings):

   ```bash
   ngrok http 8080 --hostname=mouse-assured-tiger.ngrok-free.app --host-header="localhost:8080"
   ```

## Further Reading
- `docs/report1.pdf`: deep dive into exploratory analysis, data quality, and design rationale.
- `docs/report2.pdf`: assignment write-up detailing user tasks, interaction design, and implementation notes.
