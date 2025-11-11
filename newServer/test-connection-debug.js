import 'dotenv/config';
import pg from 'pg';

const { Client } = pg;

console.log('DATABASE_URL from env:', process.env.DATABASE_URL);
console.log('DATABASE_URL length:', process.env.DATABASE_URL?.length);

// Parse the URL
const url = process.env.DATABASE_URL;
if (!url) {
  console.error('❌ DATABASE_URL is not set!');
  process.exit(1);
}

// Try to parse it
try {
  const urlObj = new URL(url);
  console.log('Parsed URL:');
  console.log('  Protocol:', urlObj.protocol);
  console.log('  Host:', urlObj.host);
  console.log('  Hostname:', urlObj.hostname);
  console.log('  Port:', urlObj.port);
  console.log('  Pathname:', urlObj.pathname);
  console.log('  Username:', urlObj.username);
  console.log('  Password length:', urlObj.password?.length || 0);
  console.log('  Password (first 10 chars):', urlObj.password?.substring(0, 10) || 'none');
  console.log('  Password bytes:', Buffer.from(urlObj.password || '', 'utf8').length);
  console.log('  Password hex (first 20):', Buffer.from(urlObj.password || '', 'utf8').toString('hex').substring(0, 20));
  console.log('  Search params:', urlObj.search);
  
  // Check if password needs URL encoding
  const decodedPassword = decodeURIComponent(urlObj.password || '');
  console.log('  Decoded password:', decodedPassword);
  console.log('  Password needs encoding?', urlObj.password !== encodeURIComponent(decodedPassword));
} catch (e) {
  console.error('Error parsing URL:', e.message);
}

// Try direct connection with original URL
const client = new Client({
  connectionString: process.env.DATABASE_URL,
});

// Try with explicit parameters (might help on Windows)
let clientExplicit = null;
try {
  const urlObj = new URL(process.env.DATABASE_URL);
  clientExplicit = new Client({
    host: urlObj.hostname,
    port: parseInt(urlObj.port) || 5432,
    database: urlObj.pathname.replace(/^\//, ''),
    user: urlObj.username,
    password: urlObj.password,
  });
  console.log('\nCreated explicit parameter client');
} catch (e) {
  console.log('Could not create explicit parameter client:', e.message);
}

async function testDirectConnection() {
  try {
    console.log('\nTesting direct pg connection...');
    await client.connect();
    console.log('✅ Direct connection successful!');
    
    const result = await client.query('SELECT 1 as test, current_database(), current_user');
    console.log('✅ Query result:', result.rows[0]);
    
    const countResult = await client.query('SELECT COUNT(*) FROM jobs');
    console.log('✅ Jobs count:', countResult.rows[0].count);
    
    await client.end();
  } catch (error) {
    console.error('❌ Direct connection error:', error.message);
    console.error('Error code:', error.code);
    
    // Try with explicit parameters
    if (clientExplicit) {
      try {
        console.log('\nTrying connection with explicit parameters...');
        await clientExplicit.connect();
        console.log('✅ Connection with explicit parameters successful!');
        
        const result = await clientExplicit.query('SELECT 1 as test, current_database(), current_user, version()');
        console.log('✅ Query result:', result.rows[0]);
        console.log('✅ PostgreSQL version:', result.rows[0].version);
        
        const countResult = await clientExplicit.query('SELECT COUNT(*) FROM jobs');
        console.log('✅ Jobs count:', countResult.rows[0].count);
        
        await clientExplicit.end();
        return; // Success!
      } catch (error2) {
        console.error('❌ Explicit parameter connection also failed:', error2.message);
        console.error('Error code:', error2.code);
      }
    }
    
    // Check if it's a connection issue (wrong host/port) or auth issue
    if (error.code === '28P01') {
      console.error('\n⚠️  This is an AUTHENTICATION error (wrong password or user).');
      console.error('   Possible causes:');
      console.error('   1. Connecting to LOCAL PostgreSQL instead of Docker container');
      console.error('   2. Local PostgreSQL has different credentials');
      console.error('   3. Docker container is not accessible on 127.0.0.1:5432');
      console.error('\n   Try: Check if you have local PostgreSQL running on port 5432');
      console.error('   Or: Change DATABASE_URL to use different port for Docker');
    }
  }
}

testDirectConnection();
