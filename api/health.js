export default function handler(req, res) {
  res.status(200).json({
    status: 'healthy',
    service: 'ici-ca-pousse-api',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'production',
    version: '1.0.0'
  });
}
