const express = require("express");
const path = require("path");
const apiRoutes = require("./routes/api");

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static files from public directory
app.use(express.static(path.join(__dirname, "public")));

// API routes
app.use("/api", apiRoutes);

// Serve the main page
app.get("/", (req, res) => {
	res.sendFile(path.join(__dirname, "public", "index.html"));
});

// Health check endpoint
app.get("/health", (req, res) => {
	res.json({
		status: "OK",
		message: "Crowdfunding Scraper API is running",
		version: "2.0.0",
		timestamp: new Date().toISOString(),
	});
});

// 404 handler
app.use("*", (req, res) => {
	res.status(404).json({
		success: false,
		error: "Endpoint not found",
	});
});

// Error handler
app.use((err, req, res, next) => {
	console.error("Server error:", err);
	res.status(500).json({
		success: false,
		error: "Internal server error",
	});
});

app.listen(PORT, () => {
	console.log(
		`🚀 Crowdfunding Scraper Server running at http://localhost:${PORT}`
	);
	console.log(`📊 Web Interface: http://localhost:${PORT}`);
	console.log(`🔗 API Health Check: http://localhost:${PORT}/health`);
	console.log(`📋 Available Platforms: http://localhost:${PORT}/api/platforms`);
});

module.exports = app;
