#!/usr/bin/env node

/**
 * Setup script to help users create their .env file
 */

import fs from 'fs';
import readline from 'readline';

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

function question(prompt) {
  return new Promise((resolve) => {
    rl.question(prompt, resolve);
  });
}

async function setupEnvironment() {
  console.log('🔧 Story Rewriter Environment Setup\n');
  
  // Check if .env already exists
  if (fs.existsSync('.env')) {
    const overwrite = await question('.env file already exists. Overwrite? (y/N): ');
    if (overwrite.toLowerCase() !== 'y') {
      console.log('Setup cancelled.');
      rl.close();
      return;
    }
  }
  
  console.log('Please provide your OpenAI configuration:\n');
  
  const apiKey = await question('OpenAI API Key: ');
  const model = await question('Fine-tuned Model ID: ');
  const systemMessage = await question('System Message: ');
  
  const envContent = `# OpenAI API Configuration
VITE_OPENAI_API_KEY=${apiKey}
VITE_OPENAI_MODEL=${model}
VITE_SYSTEM_MESSAGE=${systemMessage}
`;
  
  try {
    fs.writeFileSync('.env', envContent);
    console.log('\n✅ .env file created successfully!');
    console.log('You can now run: npm run dev');
  } catch (error) {
    console.error('\n❌ Error creating .env file:', error.message);
  }
  
  rl.close();
}

setupEnvironment().catch(console.error);
