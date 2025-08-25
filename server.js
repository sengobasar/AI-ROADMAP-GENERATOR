import express from 'express';
import cors from 'cors';
import { GoogleGenerativeAI } from '@google/generative-ai';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware - CORS configuration
app.use(cors({
  origin: ['http://localhost:5173', 'http://127.0.0.1:5173'],
  credentials: true
}));

app.use(express.json());

// Initialize AI services
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const MISTRAL_API_KEY = process.env.MISTRAL_API_KEY;
console.log('🔑 Gemini API Key configured:', !!(GEMINI_API_KEY && GEMINI_API_KEY !== 'your-gemini-api-key-here'));
console.log('🔑 Mistral API Key configured:', !!(MISTRAL_API_KEY && MISTRAL_API_KEY !== 'your_mistral_api_key_here'));

let genAI = null;
if (GEMINI_API_KEY && GEMINI_API_KEY !== 'your-gemini-api-key-here') {
  genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
}

// Mistral API configuration
const MISTRAL_API_URL = 'https://api.mistral.ai/v1/chat/completions';
const mistralConfigured = !!(MISTRAL_API_KEY && MISTRAL_API_KEY !== 'your_mistral_api_key_here');

// Helper function to call Mistral API via HTTP
async function callMistralAPI(messages, model = 'mistral-small-latest', maxTokens = 500, temperature = 0.7) {
  if (!mistralConfigured) {
    throw new Error('Mistral API key not configured');
  }

  const response = await fetch(MISTRAL_API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${MISTRAL_API_KEY}`
    },
    body: JSON.stringify({
      model: model,
      messages: messages,
      max_tokens: maxTokens,
      temperature: temperature
    })
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Mistral API error: ${response.status} - ${errorText}`);
  }

  return await response.json();
}

// Helper function to clean AI response text
function cleanAIResponse(text) {
  return text
    .replace(/\*\*(.*?)\*\*/g, '$1')
    .replace(/\*(.*?)\*/g, '$1')
    .replace(/`(.*?)`/g, '$1')
    .replace(/#{1,6}\s/g, '')
    .trim();
}

// Helper function to generate fallback project name
function generateFallbackProjectName(prompt) {
  const words = prompt.toLowerCase().split(' ');
  const keyWords = words.filter(word => 
    word.length > 3 && 
    !['learn', 'how', 'to', 'start', 'begin', 'get', 'become', 'make', 'create'].includes(word)
  );
  
  if (keyWords.length > 0) {
    const mainWord = keyWords[0].charAt(0).toUpperCase() + keyWords[0].slice(1);
    return `${mainWord} Journey`;
  }
  
  return 'Learning Roadmap';
}

// Helper function to generate fallback roadmap
function generateFallbackRoadmap(prompt) {
  const projectName = generateFallbackProjectName(prompt);
  
  // Generate generic but relevant steps based on common learning patterns
  const roadmap = [
    {
      title: "Foundation",
      description: `Research and understand the basics of ${prompt.toLowerCase()}`
    },
    {
      title: "Planning",
      description: `Set clear goals and create a structured learning plan`
    },
    {
      title: "Resources",
      description: `Gather necessary tools, materials, and learning resources`
    },
    {
      title: "Practice",
      description: `Start with simple exercises and hands-on practice`
    },
    {
      title: "Building",
      description: `Create small projects to apply what you've learned`
    },
    {
      title: "Refinement",
      description: `Improve skills through feedback and iteration`
    },
    {
      title: "Advanced",
      description: `Tackle more complex challenges and advanced concepts`
    },
    {
      title: "Mastery",
      description: `Achieve proficiency and share knowledge with others`
    }
  ];

  return { projectName, roadmap };
}

// Helper function to parse roadmap from AI response
function parseRoadmapFromResponse(text) {
  const cleanedText = cleanAIResponse(text);
  const lines = cleanedText.split('\n').filter(line => line.trim());
  const roadmap = [];
  
  for (const line of lines) {
    // Match various step formats: "Step 1:", "1.", "•", "-", etc.
    const stepMatch = line.match(/^(?:Step\s+\d+:|[\d]+\.|\•|\-|\*)\s*(.+)/i);
    if (stepMatch) {
      const content = stepMatch[1].trim();
      
      // Try to split title and description by " - " or ":"
      const parts = content.split(/\s*[-:]\s*/);
      
      if (parts.length >= 2) {
        roadmap.push({
          title: parts[0].trim(),
          description: parts.slice(1).join(' - ').trim()
        });
      } else {
        // If no separator, use the whole content as title and generate description
        roadmap.push({
          title: content.length > 30 ? content.substring(0, 30) + '...' : content,
          description: content
        });
      }
    }
  }
  
  // If parsing failed, return a basic structure
  if (roadmap.length === 0) {
    return [{
      title: "Get Started",
      description: cleanedText.substring(0, 100) || "Begin your learning journey"
    }];
  }
  
  return roadmap;
}

// ROOT ROUTE
app.get('/', (req, res) => {
  res.json({
    message: 'Simplified Roadmap Backend API is running!',
    status: 'healthy',
    timestamp: new Date().toISOString(),
    endpoints: {
      health: '/api/health',
      generateRoadmap: '/api/generate-roadmap',
      generateInstructions: '/api/generate-instructions'
    }
  });
});

// SIMPLIFIED API endpoint to generate roadmap from free-text prompt
app.post('/api/generate-roadmap', async (req, res) => {
  try {
    console.log('📝 Received roadmap generation request:', req.body);
    
    const { prompt } = req.body;
    
    if (!prompt || typeof prompt !== 'string' || prompt.trim().length === 0) {
      console.error('❌ Missing or invalid prompt');
      return res.status(400).json({
        success: false,
        error: 'A valid prompt is required',
        timestamp: new Date().toISOString()
      });
    }

    const cleanPrompt = prompt.trim();
    
    // Check if Gemini AI is available
    if (!genAI) {
      console.log('⚠️ Gemini API key not configured, using fallback response');
      
      const fallbackResponse = generateFallbackRoadmap(cleanPrompt);
      
      return res.json({
        success: true,
        projectName: fallbackResponse.projectName,
        roadmap: fallbackResponse.roadmap,
        timestamp: new Date().toISOString(),
        note: 'Using fallback response - configure GEMINI_API_KEY for AI-generated content'
      });
    }

    try {
      // Generate project name
      const projectNamePrompt = `Generate a concise, engaging project name (2-5 words) for this goal: "${cleanPrompt}"

Requirements:
- Keep it short and memorable
- Make it relevant to the topic
- Avoid generic words like "journey", "guide", "plan"
- Return only the project name, nothing else

Examples:
- For "learn web development" → "Web Dev Mastery"
- For "start a fitness routine" → "Fitness Transformation"
- For "learn Spanish" → "Spanish Fluency"`;

      console.log('🤖 Generating project name with Gemini AI...');
      const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });
      
      const nameResult = await model.generateContent(projectNamePrompt);
      const nameResponse = await nameResult.response;
      const projectName = cleanAIResponse(nameResponse.text()) || generateFallbackProjectName(cleanPrompt);

      // Generate roadmap steps
      const roadmapPrompt = `Create a comprehensive roadmap for: "${cleanPrompt}"

Generate 6-10 actionable milestones/steps that will help achieve this goal. Each step should be:
- Specific and actionable
- Building progressively toward the goal
- Realistic and achievable
- Clear and concise

Format your response as a simple list:

Step 1: [Title] - [Brief description of what to accomplish]
Step 2: [Title] - [Brief description of what to accomplish]
Step 3: [Title] - [Brief description of what to accomplish]
...

Requirements:
- Provide 6-10 steps total
- Keep titles short (2-4 words)
- Make descriptions actionable (what specifically to do)
- Progress logically from beginner to advanced
- Focus on practical, real-world actions
- Don't use markdown formatting

Generate the roadmap for: "${cleanPrompt}"`;

      console.log('🤖 Generating roadmap steps with Gemini AI...');
      
      const roadmapResult = await model.generateContent(roadmapPrompt);
      const roadmapResponse = await roadmapResult.response;
      const roadmapText = roadmapResponse.text();

      console.log('✅ Received response from Gemini AI');

      // Parse the response into structured roadmap
      const roadmap = parseRoadmapFromResponse(roadmapText);
      
      if (roadmap.length === 0) {
        throw new Error('Failed to parse roadmap from AI response');
      }

      console.log(`📊 Generated roadmap with ${roadmap.length} steps`);

      // Return structured response
      res.json({
        success: true,
        projectName: projectName.replace(/['"]/g, ''), // Clean quotes
        roadmap,
        timestamp: new Date().toISOString()
      });

    } catch (aiError) {
      console.error('❌ AI generation error, falling back:', aiError);
      
      // Fallback to manual generation if AI fails
      const fallbackResponse = generateFallbackRoadmap(cleanPrompt);
      
      res.json({
        success: true,
        projectName: fallbackResponse.projectName,
        roadmap: fallbackResponse.roadmap,
        timestamp: new Date().toISOString(),
        note: 'AI service temporarily unavailable, using fallback content'
      });
    }

  } catch (error) {
    console.error('❌ Error generating roadmap:', error);
    
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to generate roadmap',
      timestamp: new Date().toISOString()
    });
  }
});

// API endpoint to generate instructions using Mistral AI
app.post('/api/generate-instructions', async (req, res) => {
  try {
    console.log('📝 Received instructions generation request:', req.body);
    
    const { stepDescription } = req.body;
    
    if (!stepDescription) {
      console.error('❌ Missing stepDescription');
      return res.status(400).json({
        success: false,
        error: 'Step description is required',
        timestamp: new Date().toISOString()
      });
    }

    // Check if Mistral API key is configured
    if (!mistralConfigured) {
      console.log('⚠️ Mistral API key not configured, using fallback response');
      
      // Fallback response when API key is not configured
      const fallbackInstructions = [
        `Start by understanding the requirements for: ${stepDescription}`,
        `Gather all necessary resources and tools needed`,
        `Follow best practices and established guidelines`,
        `Complete the task systematically and verify results`,
        `Review your work and make necessary improvements`
      ];
      
      return res.json({
        success: true,
        instructions: fallbackInstructions,
        timestamp: new Date().toISOString(),
        note: 'Using fallback response - configure MISTRAL_API_KEY for AI-generated content'
      });
    }

    // Generate instructions using Mistral AI
    const prompt = `Provide clear, actionable instructions for: ${stepDescription}

Please provide 4-6 specific steps to accomplish this task. Each instruction should be:
- Clear and actionable
- Easy to understand
- Practical to implement
- Building upon the previous step

Provide only the instructions as a simple numbered list, without additional commentary.

Task: ${stepDescription}`;

    console.log('🤖 Calling Mistral AI for instructions...');
    
    const response = await callMistralAPI([
      {
        role: 'user',
        content: prompt
      }
    ], 'mistral-small-latest', 500, 0.7);

    console.log('✅ Received response from Mistral AI');

    const content = response.choices[0]?.message?.content || '';
    
    // Parse the response into instructions
    const lines = content.split('\n').filter(line => line.trim());
    const instructions = [];
    
    for (const line of lines) {
      // Remove numbering and clean up the text
      const cleanedLine = line
        .replace(/^\d+\.\s*/, '') // Remove "1. " style numbering
        .replace(/^-\s*/, '')     // Remove "- " style bullets
        .replace(/^\*\s*/, '')    // Remove "* " style bullets
        .trim();
      
      if (cleanedLine && cleanedLine.length > 10) { // Only include substantial instructions
        instructions.push(cleanedLine);
      }
    }
    
    // Ensure we have at least one instruction
    if (instructions.length === 0) {
      instructions.push(`Complete the task: ${stepDescription}`);
    }

    console.log(`📊 Generated ${instructions.length} instructions`);

    res.json({
      success: true,
      instructions,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('❌ Error generating instructions:', error);
    
    // Fallback response on error
    const fallbackInstructions = [
      `Research and understand: ${req.body.stepDescription}`,
      `Plan your approach and gather resources`,
      `Execute the task step by step`,
      `Review and refine your work`,
      `Document your progress and learnings`
    ];
    
    res.json({
      success: true,
      instructions: fallbackInstructions,
      timestamp: new Date().toISOString(),
      note: 'AI service temporarily unavailable, using fallback content'
    });
  }
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  console.log('🏥 Health check requested');
  
  const healthData = {
    status: 'healthy',
    timestamp: new Date().toISOString(),
    geminiConfigured: !!(GEMINI_API_KEY && GEMINI_API_KEY !== 'your-gemini-api-key-here'),
    mistralConfigured: mistralConfigured,
    port: PORT,
    environment: process.env.NODE_ENV || 'development',
    aiServices: {
      gemini: {
        configured: !!(GEMINI_API_KEY && GEMINI_API_KEY !== 'your-gemini-api-key-here'),
        status: genAI ? 'active' : 'inactive'
      },
      mistral: {
        configured: mistralConfigured,
        status: mistralConfigured ? 'active' : 'inactive'
      }
    }
  };
  
  console.log('🏥 Health check response:', healthData);
  
  res.json(healthData);
});

// Error handling middleware
app.use((error, req, res, next) => {
  console.error('💥 Server error:', error);
  res.status(500).json({
    success: false,
    error: 'Internal server error',
    timestamp: new Date().toISOString()
  });
});

// Start server
app.listen(PORT, '0.0.0.0', () => {
  console.log('🚀 Simplified Roadmap Backend Server running on port', PORT);
  console.log('📡 API endpoints:');
  console.log('  - Generate Roadmap: http://localhost:' + PORT + '/api/generate-roadmap');
  console.log('  - Generate Instructions: http://localhost:' + PORT + '/api/generate-instructions');
  console.log('  - Health Check: http://localhost:' + PORT + '/api/health');
  console.log('🔑 Gemini API configured:', !!(GEMINI_API_KEY && GEMINI_API_KEY !== 'your-gemini-api-key-here'));
  console.log('🔑 Mistral API configured:', mistralConfigured);
  console.log('🌐 CORS enabled for development');
  console.log('🏠 Root endpoint: http://localhost:' + PORT + '/');
});