import http from 'http';

// ✅ Keep Render app alive - ping every 14 minutes
export function startKeepAlive() {
  setInterval(() => {
    const url = process.env.RENDER_EXTERNAL_URL || 'http://localhost:3000';
    
    http.get(url, (res) => {
      console.log(`🔄 Keep-alive ping sent | Status: ${res.statusCode}`);
    }).on('error', (err) => {
      console.log(`⚠️  Keep-alive ping failed: ${err.message}`);
    });
  }, 14 * 60 * 1000); // Every 14 minutes (Render sleeps after 15 min)

  console.log('✅ Keep-alive service activated - App will stay awake!');
}
