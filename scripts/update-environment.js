const fs = require('fs');
const path = require('path');

// Read .env file
const envPath = path.join(__dirname, '../.env');
const environmentsPath = path.join(__dirname, '../src/environments');

if (!fs.existsSync(envPath)) {
  console.error('❌ .env file not found');
  process.exit(1);
}

// Parse .env file
const envContent = fs.readFileSync(envPath, 'utf8');
const envVars = {};

envContent.split('\n').forEach(line => {
  const [key, ...valueParts] = line.split('=');
  if (key && valueParts.length > 0) {
    envVars[key.trim()] = valueParts.join('=').trim();
  }
});

// Create environment configuration
const environmentConfig = {
  production: false,
  googleDrive: {
    clientId: envVars.GOOGLE_CLIENT_ID || '',
    clientSecret: envVars.GOOGLE_CLIENT_SECRET || '',
    refreshToken: envVars.GOOGLE_REFRESH_TOKEN || '',
    apiKey: envVars.GOOGLE_API_KEY || '',
    uploadEndpoint: 'https://www.googleapis.com/upload/drive/v3/files'
  },
  app: {
    name: envVars.APP_NAME || 'Family Moments',
    url: envVars.APP_URL || 'http://localhost:4200'
  },
  auth: {
    salt: envVars.VITE_PASS_SALT || '',
    hash: envVars.VITE_PASS_HASH || ''
  }
};

// Create development environment file
const devEnvironmentContent = `// This file is auto-generated from .env
// Do not edit manually - run 'npm run update-env' instead

export const environment = ${JSON.stringify({...environmentConfig, production: false}, null, 2)};
`;

// Create production environment file  
const prodEnvironmentContent = `// This file is auto-generated from .env
// Do not edit manually - run 'npm run update-env' instead

export const environment = ${JSON.stringify({...environmentConfig, production: true}, null, 2)};
`;

// Write environment files
if (!fs.existsSync(environmentsPath)) {
  fs.mkdirSync(environmentsPath, { recursive: true });
}

fs.writeFileSync(path.join(environmentsPath, 'environment.ts'), devEnvironmentContent);
fs.writeFileSync(path.join(environmentsPath, 'environment.prod.ts'), prodEnvironmentContent);

console.log('✅ Environment files updated from .env');
console.log(`📍 Updated: ${path.join(environmentsPath, 'environment.ts')}`);
console.log(`📍 Updated: ${path.join(environmentsPath, 'environment.prod.ts')}`);