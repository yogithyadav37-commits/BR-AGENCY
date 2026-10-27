import express from 'express';
import { GoogleGenAI } from '@google/genai';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config();

const app = express();
const port = 3000;

app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Helper to get GoogleGenAI client with server-side environment key
function getAIClient() {
  const apiKey = process.env.GEMINI_API_KEY || process.env.API_KEY || '';
  if (!apiKey) {
    throw new Error('GEMINI_API_KEY environment variable is not configured on the server.');
  }
  return new GoogleGenAI({ apiKey });
}

// 1. Video Generation from Image via Interactions API (gemini-omni-1.1-flash)
app.post('/api/generate-video', async (req, res) => {
  try {
    const { imageBase64, mimeType = 'image/jpeg', prompt, aspectRatio = '16:9' } = req.body;

    if (!imageBase64) {
      return res.status(400).json({ error: 'imageBase64 is required to animate an image into video.' });
    }

    const ai = getAIClient();
    const cleanBase64 = imageBase64.replace(/^data:image\/[a-zA-Z0-9+.-]+;base64,/, '');

    const videoPrompt = prompt || 
      'Animate this commercial printing photo with smooth, dynamic cinema camera movement. Show subtle ink sheen, realistic paper grain texture, and high-speed production vitality.';

    const validAspectRatio = aspectRatio === '9:16' ? '9:16' : '16:9';

    const interaction = await ai.interactions.create({
      model: 'gemini-omni-1.1-flash',
      input: [
        {
          type: 'image',
          mime_type: mimeType,
          data: cleanBase64
        },
        {
          type: 'text',
          text: videoPrompt
        }
      ],
      background: false,
      store: false,
      stream: false,
      response_format: {
        type: 'video',
        aspect_ratio: validAspectRatio
      }
    }, { timeout: 300000 });

    const videoOutput = interaction.output_video;
    if (!videoOutput) {
      return res.status(500).json({ error: 'No video output returned from Gemini Omni Flash model.' });
    }

    return res.json({
      success: true,
      video: {
        data: videoOutput.data || null,
        uri: videoOutput.uri || null,
        mimeType: videoOutput.mime_type || 'video/mp4',
        aspectRatio: validAspectRatio
      }
    });
  } catch (error: any) {
    console.error('Error generating video via gemini-omni-1.1-flash:', error);
    return res.status(500).json({ 
      error: error?.message || 'Failed to generate video with Gemini Omni Flash model.' 
    });
  }
});

// 2. Google Maps Grounding via Gemini 3.8 Flash (with googleMaps tool)
app.post('/api/maps-grounding', async (req, res) => {
  try {
    const { query: userQuery, city = 'Delhi NCR, India', category = 'commercial printing presses' } = req.body;

    const ai = getAIClient();
    const searchPrompt = userQuery || 
      `Find reputable commercial printing presses, offset packaging companies, and logistics dispatch docks in ${city}. Include business names, verified addresses, contact numbers, and Google Maps location details.`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: searchPrompt,
      config: {
        tools: [{ googleMaps: {} }]
      }
    });

    const text = response.text || '';
    const candidate = response.candidates?.[0];
    const groundingMetadata = candidate?.groundingMetadata || null;

    return res.json({
      success: true,
      text,
      groundingMetadata
    });
  } catch (error: any) {
    console.error('Error in Google Maps Grounding:', error);
    return res.status(500).json({ 
      error: error?.message || 'Failed to fetch Maps Grounded data with Gemini 3.8 Flash.' 
    });
  }
});

// Mount Vite or static server
async function startServer() {
  if (process.env.NODE_ENV === 'production') {
    app.use(express.static(path.resolve('dist')));
    app.get('*', (_req, res) => {
      res.sendFile(path.resolve('dist', 'index.html'));
    });
  } else {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true }
    });
    app.use(vite.middlewares);
  }

  app.listen(port, '0.0.0.0', () => {
    console.log(`BR Agency Server running on http://0.0.0.0:${port}`);
  });
}

startServer();
