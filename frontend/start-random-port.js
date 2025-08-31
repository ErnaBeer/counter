const net = require('net');
const { spawn } = require('child_process');

// Function to find a random available port
function findAvailablePort(startPort = 3000, maxPort = 9000) {
  return new Promise((resolve, reject) => {
    const port = Math.floor(Math.random() * (maxPort - startPort)) + startPort;
    const server = net.createServer();
    
    server.listen(port, (err) => {
      if (err) {
        server.close();
        if (port < maxPort) {
          resolve(findAvailablePort(startPort, maxPort));
        } else {
          reject(new Error('No available ports found'));
        }
      } else {
        server.close();
        resolve(port);
      }
    });
    
    server.on('error', (err) => {
      if (err.code === 'EADDRINUSE') {
        if (port < maxPort) {
          resolve(findAvailablePort(startPort, maxPort));
        } else {
          reject(new Error('No available ports found'));
        }
      } else {
        reject(err);
      }
    });
  });
}

async function startFrontend() {
  try {
    console.log('🔍 Finding available port...');
    const port = await findAvailablePort();
    
    console.log(`✅ Found available port: ${port}`);
    console.log(`🚀 Starting frontend on http://localhost:${port}`);
    
    // Set environment variables for React
    const env = {
      ...process.env,
      PORT: port.toString(),
      BROWSER: 'none', // Don't auto-open browser
      SKIP_PREFLIGHT_CHECK: 'true',
      DANGEROUSLY_DISABLE_HOST_CHECK: 'true',
      GENERATE_SOURCEMAP: 'false'
    };
    
    // Start the React development server
    const child = spawn('npm', ['start'], {
      cwd: process.cwd(),
      env: env,
      stdio: 'inherit',
      shell: true
    });
    
    // Handle process termination
    process.on('SIGINT', () => {
      console.log('\n🛑 Shutting down frontend server...');
      child.kill('SIGINT');
      process.exit(0);
    });
    
    process.on('SIGTERM', () => {
      console.log('\n🛑 Shutting down frontend server...');
      child.kill('SIGTERM');
      process.exit(0);
    });
    
    child.on('exit', (code) => {
      console.log(`\n📊 Frontend server exited with code ${code}`);
      process.exit(code);
    });
    
    // Open browser after a short delay
    setTimeout(() => {
      const { exec } = require('child_process');
      const url = `http://localhost:${port}`;
      console.log(`\n🌐 Opening browser at: ${url}`);
      
      // Cross-platform browser opening
      let cmd;
      switch (process.platform) {
        case 'darwin': // macOS
          cmd = `open "${url}"`;
          break;
        case 'win32': // Windows
          cmd = `start "" "${url}"`;
          break;
        default: // Linux and others
          cmd = `xdg-open "${url}"`;
          break;
      }
      
      exec(cmd, (error) => {
        if (error) {
          console.log(`⚠️  Could not open browser automatically. Please visit: ${url}`);
        }
      });
    }, 3000); // 3 second delay to ensure server is ready
    
  } catch (error) {
    console.error('❌ Failed to start frontend:', error);
    process.exit(1);
  }
}

// Start the frontend
startFrontend();