# ArtVis

ArtVis is a project designed to visualize and interact with art-related data. This guide will walk you through the steps to set up and run ArtVis on your local machine.

## Getting Started

Follow these steps to set up and run the ArtVis project locally.

### Prerequisites

Make sure you have the following software installed:

- **Node.js** (v14 or higher)
- **npm** (v6 or higher)

### Installation

1. **Clone the repository:**

   Open a terminal and clone the repository to your local machine:

   ```bash
   git clone https://github.com/yourusername/ArtVis.git
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
