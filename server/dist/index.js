"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const helmet_1 = __importDefault(require("helmet"));
const morgan_1 = __importDefault(require("morgan"));
const dotenv_1 = __importDefault(require("dotenv"));
const neo4j_1 = require("./config/neo4j");
// Import Routes
const auth_routes_1 = __importDefault(require("./routes/auth.routes"));
const developer_routes_1 = __importDefault(require("./routes/developer.routes"));
const company_routes_1 = __importDefault(require("./routes/company.routes"));
const job_routes_1 = __importDefault(require("./routes/job.routes"));
const recommendation_routes_1 = __importDefault(require("./routes/recommendation.routes"));
const graph_routes_1 = __importDefault(require("./routes/graph.routes"));
dotenv_1.default.config();
const app = (0, express_1.default)();
const PORT = process.env.PORT || 5000;
// Security Middlewares
app.use((0, helmet_1.default)());
app.use((0, cors_1.default)({
    origin: '*', // Allow all during demo, or configure specifically if needed
    credentials: true
}));
// Body Parsers & Loggers
app.use(express_1.default.json());
const sanitizer_1 = require("./middleware/sanitizer");
app.use(sanitizer_1.neo4jSanitizer);
app.use((0, morgan_1.default)('dev'));
// Health Check
app.get('/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date() });
});
// Register Api Routes
app.use('/api/auth', auth_routes_1.default);
app.use('/api/developers', developer_routes_1.default);
app.use('/api/companies', company_routes_1.default);
app.use('/api/jobs', job_routes_1.default);
app.use('/api/recommendations', recommendation_routes_1.default);
app.use('/api/graph', graph_routes_1.default);
// Global Error Handler
app.use((err, req, res, next) => {
    console.error('Unhandled error:', err);
    res.status(500).json({ error: err.message || 'Internal server error' });
});
// Start Server after DB validation
const startServer = async () => {
    const isConnected = await (0, neo4j_1.verifyConnection)();
    if (!isConnected) {
        console.warn('WARNING: Running backend without an active CognoDB/Neo4j connection database! Some endpoints will fail.');
    }
    app.listen(PORT, () => {
        console.log(`Backend server is running on http://localhost:${PORT}`);
    });
};
startServer();
