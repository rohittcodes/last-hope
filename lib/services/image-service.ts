export const generateStoryImage = (description: string): string => {
  // Use local proxy to hide API key
  const enhancedPrompt = `${description}, cinematic lighting, high resolution, digital art, atmosphere`;
  const seed = Math.floor(Math.random() * 2000000000);

  // Return relative URL to our proxy
  // Note: encodedPrompt will be re-encoded by the proxy or URL params, 
  // but safest to pass raw and let searchParams handle it or encode once.
  // The proxy expects 'prompt' as a query param.

  const params = new URLSearchParams({
    prompt: enhancedPrompt,
    seed: seed.toString()
  });

  return `/api/proxy-image?${params.toString()}`;
};
