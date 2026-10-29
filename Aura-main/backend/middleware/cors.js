const cors = require('cors');

function getCorsMiddleware() {
  const defaultOrigins = [
    'http://localhost:5173',
    'http://127.0.0.1:5173',
    'http://localhost:3000',
    'http://127.0.0.1:3000'
  ];

  const baseUrl = process.env.APP_BASE_URL;
  if (baseUrl && !defaultOrigins.includes(baseUrl.trim())) {
    defaultOrigins.push(baseUrl.trim());
  }

  const customOrigins = process.env.CORS_ALLOWED_ORIGINS;
  if (customOrigins) {
    customOrigins.split(',').forEach((orig) => {
      const trimmed = orig.trim();
      if (trimmed && !defaultOrigins.includes(trimmed)) {
        defaultOrigins.push(trimmed);
      }
    });
  }

  return cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (e.g. mobile apps, curl, server-to-server)
      if (!origin) return callback(null, true);

      if (defaultOrigins.includes(origin)) {
        return callback(null, true);
      }

      // Check regex patterns for deployment domains
      const allowedPatterns = [
        /^https:\/\/.*\.vercel\.app$/,
        /^https:\/\/.*\.netlify\.app$/,
        /^https:\/\/.*\.onrender\.com$/,
        /^https:\/\/.*\.railway\.app$/,
        /^http:\/\/localhost:\d+$/,
        /^http:\/\/127\.0\.0\.1:\d+$/
      ];

      for (const pattern of allowedPatterns) {
        if (pattern.test(origin)) {
          return callback(null, true);
        }
      }

      callback(null, true); // Permissive in dev/fallback
    },
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: [
      'Authorization',
      'Content-Type',
      'X-Requested-With',
      'Accept',
      'Origin',
      'Access-Control-Request-Method',
      'Access-Control-Request-Headers'
    ],
    exposedHeaders: ['Authorization', 'Content-Disposition'],
    credentials: true,
    maxAge: 3600
  });
}

module.exports = getCorsMiddleware;
