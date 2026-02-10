// Config validation script
const requiredEnvVars = [
  'NODE_ENV',
  'PORT'
];

const optionalEnvVars = [
  'FRONTEND_URL',
  'RATE_LIMIT',
  'MAX_FILE_SIZE',
  'API_BASE_URL'
];

function validateConfig() {
  console.log('🔍 Validating configuration...\n');
  
  let hasError = false;
  
  // Check required variables
  for (const envVar of requiredEnvVars) {
    if (!process.env[envVar]) {
      console.error(`❌ Missing required environment variable: ${envVar}`);
      hasError = true;
    } else {
      console.log(`✅ ${envVar}: ${process.env[envVar]}`);
    }
  }
  
  // Check optional variables
  console.log('\n📋 Optional variables:');
  for (const envVar of optionalEnvVars) {
    const value = process.env[envVar] || 'not set';
    console.log(`ℹ️  ${envVar}: ${value}`);
  }
  
  if (hasError) {
    console.error('\n❌ Configuration validation failed!');
    process.exit(1);
  } else {
    console.log('\n✅ Configuration validation passed!');
    process.exit(0);
  }
}

validateConfig();
