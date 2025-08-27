import express from 'express';
import cors from 'cors';
import { GoogleGenerativeAI } from '@google/generative-ai';
import dotenv from 'dotenv';
import fetch from 'node-fetch';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

const allowedOrigins = [
  'http://localhost:5173',
  'http://127.0.0.1:5173',
  'https://illustrious-pika-a1466a.netlify.app',
  'https://ai-roadmap-generator-c1q3.onrender.com',
  'https://flowniq.netlify.app',
  'https://flowniq.onrender.com'
];

const corsOptions = {
  origin: function (origin, callback) {
    if (!origin) {
      // Allow requests with no origin like Postman or server-to-server requests
      callback(null, true);
      return;
    }
    if (allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('CORS policy does not allow access from this origin'), false);
    }
  },
  credentials: true
};

app.use(cors(corsOptions));
app.use(express.json());

// Your existing keys and configuration follow here...
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const MISTRAL_API_KEY = process.env.MISTRAL_API_KEY;

const geminiConfigured = !!(GEMINI_API_KEY && GEMINI_API_KEY.trim().length > 0);
const mistralConfigured = !!(MISTRAL_API_KEY && MISTRAL_API_KEY.trim().length > 0);

console.log('🔑 Gemini API Key configured:', geminiConfigured);
console.log('🔑 Mistral API Key configured:', mistralConfigured);


let genAI = null;
if (geminiConfigured) {
  genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
}

const MISTRAL_API_URL = 'https://api.mistral.ai/v1/chat/completions';

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

function cleanAIResponse(text) {
  return text
    .replace(/\*\*(.*?)\*\*/g, '$1')
    .replace(/\*(.*?)\*/g, '$1')
    .replace(/\`(.*?)\`/g, '$1')
    .replace(/#{1,6}\s/g, '')
    .trim();
}

function parseInstructionsFromAI(content, stepDescription) {
  const lines = content.split('\n').filter(line => line.trim());
  const instructions = [];

  for (const line of lines) {
    const cleanedLine = line
      .replace(/^\d+\.\s*/, '')       // Remove numbering like 1.
      .replace(/^Step\s*\d+:\s*/i, '') // Remove "Step X:"
      .replace(/^-+\s*/, '')          // Remove leading dashes
      .replace(/^\*\s*/, '')          // Remove leading stars
      .replace(/^\*\*(.*?)\*\*/, '$1') // Remove bold
      .replace(/#{1,6}\s*/, '')       // Remove markdown headers
      .trim();

    if (cleanedLine && cleanedLine.length > 15 && !cleanedLine.toLowerCase().includes('here are') && !cleanedLine.toLowerCase().includes('instructions:')) {
      instructions.push(cleanedLine);
    }
  }

  if (instructions.length === 0) {
    instructions.push(
      `Begin by researching and understanding the requirements for: ${stepDescription}`,
      `Gather all necessary tools, resources, and materials needed`,
      `Follow established best practices and methodologies`,
      `Complete the task systematically, checking progress regularly`,
      `Review and verify your results meet the intended objectives`
    );
  }

  return instructions.slice(0, 8);
}

function generateFallbackInstructions(stepDescription, category) {
  if (category === 'travel_planner') {
    return [
      `Plan your timing and check opening hours for: ${stepDescription}`,
      `Research transportation options and routes to reach your destination`,
      `Prepare necessary items like tickets, maps, or reservations`,
      `Experience the main activities and take time to enjoy the moment`,
      `Document your experience and prepare for the next activity`,
      `Check local customs, safety guidelines, and any special requirements`
    ];
  } else {
    return [
      `Start by understanding the core concepts and requirements for: ${stepDescription}`,
      `Gather all necessary resources, tools, and learning materials`,
      `Break down the task into smaller, manageable components`,
      `Practice the fundamental skills through hands-on exercises`,
      `Apply your learning to real-world scenarios and projects`,
      `Review your progress and identify areas for improvement`,
      `Seek feedback and refine your approach based on results`
    ];
  }
}

// Generate instructions with Gemini AI
async function generateInstructionsWithGemini(stepDescription, category, phaseNumber, stepNumber, projectName) {
  const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

  let prompt = '';

  if (category === 'travel_planner') {
    prompt = `Create detailed travel instructions for this activity: "${stepDescription}"

Context:
- This is step ${stepNumber} of day ${phaseNumber} in "${projectName}"
- Focus on practical travel advice and logistics

Provide 4-6 specific, actionable instructions covering:
1. Preparation and timing
2. Transportation/getting there
3. What to do/see/experience
4. Practical tips (costs, booking, what to bring)
5. Safety and local customs
6. Next steps or connections

Format as clear, numbered steps. Be specific about times, locations, costs, and practical details.

Activity: ${stepDescription}`;
  } else {
    prompt = `Create comprehensive learning instructions for: "${stepDescription}"

Context:
- This is step ${stepNumber} of phase ${phaseNumber} in "${projectName}"
- Category: ${category.replace('_', ' ')}
- Focus on practical, hands-on learning

Provide 5-7 detailed, actionable instructions covering:
1. Prerequisites and preparation
2. Learning objectives and goals
3. Step-by-step methodology
4. Hands-on practice exercises
5. Resources and tools needed
6. Progress evaluation
7. Common pitfalls and troubleshooting

Format as clear, actionable steps. Include specific examples, tools, and practical advice.

Learning Goal: ${stepDescription}`;
  }

  const result = await model.generateContent(prompt);
  const response = await result.response;
  const content = response.text();

  return parseInstructionsFromAI(content, stepDescription);
}

// Generate instructions with Mistral AI
async function generateInstructionsWithMistral(stepDescription, category, phaseNumber, stepNumber, projectName) {
  let prompt = '';

  if (category === 'travel_planner') {
    prompt = `Generate detailed travel instructions for: "${stepDescription}"

This is day ${phaseNumber}, activity ${stepNumber} of "${projectName}".

Create practical, actionable instructions covering:
- Pre-visit preparation and timing
- Transportation and navigation
- Main activities and experiences
- Budget considerations and booking tips
- Local customs and safety advice
- Connecting to next activities

Provide 4-6 specific, numbered steps with practical details.

Activity: ${stepDescription}`;
  } else {
    prompt = `Generate comprehensive learning instructions for: "${stepDescription}"

This is phase ${phaseNumber}, step ${stepNumber} of "${projectName}" in ${category.replace('_', ' ')}.

Create detailed, actionable instructions covering:
- Learning preparation and setup
- Core concepts to master
- Practical exercises and projects
- Tools and resources needed
- Skill assessment and practice
- Troubleshooting common issues

Provide 5-7 specific, numbered steps with examples and practical advice.

Learning objective: ${stepDescription}`;
  }

  const response = await callMistralAPI([
    {
      role: 'system',
      content: 'You are an expert instructor who creates detailed, practical, step-by-step instructions. Focus on actionable advice with specific examples and real-world application.'
    },
    {
      role: 'user',
      content: prompt
    }
  ], 'mistral-small-latest', 800, 0.7);

  const content = response.choices[0]?.message?.content || '';
  return parseInstructionsFromAI(content, stepDescription);
}

// Generate roadmap with AI
async function generateRoadmapWithAI(prompt, category) {
  let useGemini = false;
  let useMistral = false;

  if (category === 'travel_planner' && geminiConfigured) {
    useGemini = true;
  } else if (mistralConfigured) {
    useMistral = true;
  } else if (geminiConfigured) {
    useGemini = true;
  }

  if (useGemini) {
    try {
      const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });
      const aiPrompt = `Create a comprehensive learning roadmap for: ${prompt}

Structure your response as phases with steps:

Phase 1: [Phase Name - 1-2 words]
1.1 [Step description]
1.2 [Step description]
...

Phase 2: [Phase Name - 1-2 words]
2.1 [Step description]
2.2 [Step description]
...

Requirements:
- Create a logical number of phases (3-5 phases)
- Each phase can have 2-4 steps
- Phase names should be 1-2 words only (e.g., "Foundation", "Practice", "Mastery")
- Steps should be specific and actionable
- Focus on practical, real-world implementation
- Do not use markdown formatting
- Keep language clear and professional

Generate the roadmap for: ${prompt}`;

      const result = await model.generateContent(aiPrompt);
      const response = await result.response;
      const content = response.text();

      return parsePhasesFromResponse(content);
    } catch (error) {
      console.error('Error with Gemini AI:', error);
    }
  }

  if (useMistral) {
    try {
      const response = await callMistralAPI([
        {
          role: 'system',
          content: 'You are an expert learning path designer. Create structured, practical roadmaps for learning goals.'
        },
        {
          role: 'user',
          content: `Create a comprehensive learning roadmap for: ${prompt}

Structure as phases with steps:
Phase 1: [Name]
1.1 [Step]
1.2 [Step]

Create 3-5 phases with 2-4 steps each. Make it practical and actionable.`
        }
      ], 'mistral-small-latest', 800, 0.7);

      const content = response.choices[0]?.message?.content || '';
      return parsePhasesFromResponse(content);
    } catch (error) {
      console.error('Error with Mistral AI:', error);
    }
  }

  // Fallback roadmap
  return generateGenericFallback(prompt, category);
}

function parsePhasesFromResponse(text) {
  const cleanedText = cleanAIResponse(text);
  const lines = cleanedText.split('\n').filter(line => line.trim());
  const phases = [];
  let currentPhase = null;

  for (const line of lines) {
    // Match phase headers (Phase 1:, Phase 2:, etc.)
    const phaseMatch = line.match(/^Phase\s+(\d+):\s*(.+)/i);
    if (phaseMatch) {
      if (currentPhase) {
        phases.push(currentPhase);
      }
      currentPhase = {
        number: parseInt(phaseMatch[1]),
        name: phaseMatch[2].trim(),
        steps: []
      };
      continue;
    }

    // Match steps within phases (1.1, 1.2, etc.)
    const stepMatch = line.match(/^(\d+)\.(\d+)\s*(.+)/) || line.match(/^-\s*(.+)/);
    if (stepMatch && currentPhase) {
      const stepContent = stepMatch[3] || stepMatch[1];
      currentPhase.steps.push({
        title: stepContent.length > 50 ? stepContent.substring(0, 50) + '...' : stepContent,
        description: stepContent
      });
    }
  }

  if (currentPhase) {
    phases.push(currentPhase);
  }

  return phases.length > 0 ? phases : generateGenericFallback(text, 'learning');
}

function generateGenericFallback(prompt, category) {
  return [
    {
      number: 1,
      name: 'Foundation',
      steps: [
        { title: 'Research Basics', description: `Learn the fundamentals of ${prompt}` },
        { title: 'Set Goals', description: `Define clear objectives for ${prompt}` },
        { title: 'Gather Resources', description: `Collect materials needed for ${prompt}` }
      ]
    },
    {
      number: 2,
      name: 'Development',
      steps: [
        { title: 'Build Skills', description: `Develop core skills for ${prompt}` },
        { title: 'Practice Daily', description: `Apply what you've learned about ${prompt}` },
        { title: 'Get Feedback', description: `Seek feedback on your ${prompt} progress` }
      ]
    },
    {
      number: 3,
      name: 'Mastery',
      steps: [
        { title: 'Advanced Techniques', description: `Master advanced aspects of ${prompt}` },
        { title: 'Share Knowledge', description: `Teach others about ${prompt}` },
        { title: 'Build Portfolio', description: `Create showcase projects for ${prompt}` }
      ]
    }
  ];
}

// POST route for instructions
app.post('/api/instructions', async (req, res) => {
  try {
    console.log('📝 Received instructions generation request:', req.body);

    let { stepDescription, category, phaseNumber, stepNumber, projectName, useAI = 'auto' } = req.body;

    // Provide fallback default if stepDescription missing
    if (!stepDescription || stepDescription.trim().length === 0) {
      if (projectName && projectName.trim().length > 0) {
        stepDescription = `General instructions for project ${projectName}`;
      } else if (category) {
        stepDescription = `General instructions for category ${category}`;
      } else {
        stepDescription = 'General learning instructions';
      }
      console.log('⚠️ No stepDescription provided, using default:', stepDescription);
    }

    let useGemini = false;
    let useMistral = false;

    if (useAI === 'gemini' && geminiConfigured) {
      useGemini = true;
    } else if (useAI === 'mistral' && mistralConfigured) {
      useMistral = true;
    } else if (useAI === 'auto') {
      if (category === 'travel_planner' && geminiConfigured) {
        useGemini = true;
      } else if (mistralConfigured) {
        useMistral = true;
      } else if (geminiConfigured) {
        useGemini = true;
      }
    }

    if (!useGemini && !useMistral) {
      console.log('⚠️ No AI configured or requested, using fallback response');
      const fallbackInstructions = generateFallbackInstructions(stepDescription, category);
      return res.json({
        success: true,
        instructions: fallbackInstructions,
        timestamp: new Date().toISOString(),
        aiUsed: 'fallback',
        note: 'Using fallback response - configure AI API keys for enhanced content'
      });
    }

    let instructions = [];
    let aiUsed = '';

    if (useGemini) {
      console.log('🤖 Using Gemini AI for enhanced instructions...');
      instructions = await generateInstructionsWithGemini(stepDescription, category, phaseNumber, stepNumber, projectName);
      aiUsed = 'gemini';
    } else if (useMistral) {
      console.log('🤖 Using Mistral AI for enhanced instructions...');
      instructions = await generateInstructionsWithMistral(stepDescription, category, phaseNumber, stepNumber, projectName);
      aiUsed = 'mistral';
    }

    console.log(`📊 Generated ${instructions.length} detailed instructions using ${aiUsed}`);

    res.json({
      success: true,
      instructions,
      timestamp: new Date().toISOString(),
      aiUsed,
      category,
      stepDescription
    });

  } catch (error) {
    console.error('❌ Error generating instructions:', error);

    try {
      const fallbackInstructions = generateFallbackInstructions(req.body.stepDescription || 'General learning instructions', req.body.category);
      res.json({
        success: true,
        instructions: fallbackInstructions,
        timestamp: new Date().toISOString(),
        aiUsed: 'fallback',
        error: 'AI generation failed, using fallback',
        originalError: error.message
      });
    } catch (fallbackError) {
      res.status(500).json({
        success: false,
        error: error.message || 'Failed to generate instructions',
        timestamp: new Date().toISOString()
      });
    }
  }
});

// POST route for generating roadmaps - THIS WAS MISSING!
app.post('/api/generate-roadmap', async (req, res) => {
  try {
    console.log('📝 Received roadmap generation request:', req.body);

    const { prompt, category } = req.body;

    if (!prompt || !category) {
      console.error('❌ Missing required fields:', { prompt: !!prompt, category: !!category });
      return res.status(400).json({
        success: false,
        error: 'Prompt and category are required',
        timestamp: new Date().toISOString()
      });
    }

    console.log('🤖 Generating roadmap with AI...');
    const phases = await generateRoadmapWithAI(prompt, category);

    const projectName = `Learn ${prompt.split(' ').slice(0, 3).join(' ')}`;

    console.log(`📊 Generated ${phases.length} phases for roadmap`);

    res.json({
      success: true,
      projectName: projectName,
      phases: phases,
      category,
      originalPrompt: prompt,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('❌ Error generating roadmap:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to generate roadmap',
      timestamp: new Date().toISOString()
    });
  }
});

// GET route for health check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    geminiConfigured,
    mistralConfigured,
    port: PORT,
    environment: process.env.NODE_ENV || 'development'
  });
});

app.listen(PORT, () => {
  console.log(`🚀 Flowniq Backend Server running on port ${PORT}`);
  console.log('🔑 Gemini API configured:', geminiConfigured);
  console.log('🔑 Mistral API configured:', mistralConfigured);
});
