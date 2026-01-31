
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const prompt = searchParams.get('prompt');
  const seed = searchParams.get('seed');

  if (!prompt) {
    return new NextResponse('Missing prompt parameter', { status: 400 });
  }

  // Construct external URL
  const baseUrl = 'https://gen.pollinations.ai/image';
  let url = `${baseUrl}/${encodeURIComponent(prompt)}?width=1280&height=720&model=flux&seed=${seed || Math.floor(Math.random() * 2000000000)}`;

  // Append Secret API Key server-side
  const apiKey = process.env.POLLINATIONS_API_KEY;
  if (apiKey) {
    url += `&key=${apiKey}`;
  }

  try {
    const response = await fetch(url);

    if (!response.ok) {
      return new NextResponse(`Error fetching image: ${response.statusText}`, { status: response.status });
    }

    // Proxy the image data directly
    const contentType = response.headers.get('content-type') || 'image/jpeg';
    const arrayBuffer = await response.arrayBuffer();

    return new NextResponse(arrayBuffer, {
      headers: {
        'Content-Type': contentType,
        'Cache-Control': 'public, max-age=31536000, immutable',
      },
    });

  } catch (error) {
    console.error('Proxy Error:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}
