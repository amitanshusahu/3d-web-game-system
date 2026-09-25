import { OpenRouter } from '@openrouter/sdk';

const openRouter = new OpenRouter({
  apiKey: process.env.OPENROUTER_API_KEY,
});

async function getOpenRouterResponse(prompt: string): Promise<string> {
  const completion = await openRouter.chat.send({
    chatRequest: {
      model: 'openrouter/free',
      messages: [
        {
          role: 'user',
          content: prompt,
        },
      ],
    },
  });

  if (completion instanceof ReadableStream) {
    throw new Error('Expected a non-streaming response');
  }

  console.log('Model used:', completion.model);
  
  return completion.choices[0].message.content;
}