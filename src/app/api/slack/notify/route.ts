import { NextRequest, NextResponse } from 'next/server';
import { WebClient } from '@slack/web-api';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { channel, text, blocks } = body;

    if (!process.env.SLACK_BOT_TOKEN) {
      return NextResponse.json(
        { error: 'Slack bot token not configured' },
        { status: 500 }
      );
    }

    if (!channel || !text) {
      return NextResponse.json(
        { error: 'channel and text are required' },
        { status: 400 }
      );
    }

    const client = new WebClient(process.env.SLACK_BOT_TOKEN);

    const result = await client.chat.postMessage({
      channel,
      text,
      blocks,
    });

    return NextResponse.json({
      success: true,
      ts: result.ts,
      channel: result.channel,
    });
  } catch (error: any) {
    console.error('Slack notification error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to send Slack notification' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const channel = searchParams.get('channel') || '#general';

    if (!process.env.SLACK_BOT_TOKEN) {
      return NextResponse.json(
        { error: 'Slack bot token not configured' },
        { status: 500 }
      );
    }

    const client = new WebClient(process.env.SLACK_BOT_TOKEN);

    // Get channel info
    const result = await client.conversations.info({
      channel,
    });

    return NextResponse.json({
      channel: result.channel,
    });
  } catch (error: any) {
    console.error('Slack channel info error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to get channel info' },
      { status: 500 }
    );
  }
}

