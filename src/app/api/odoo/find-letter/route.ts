import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';

const prisma = new PrismaClient();

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { refCode } = await request.json();
    if (!refCode) {
      return NextResponse.json({ error: 'refCode is required' }, { status: 400 });
    }

    // Get Odoo credentials
    const user = await prisma.userAccount.findUnique({
      where: { email: session.user.email },
    });

    if (!user || !user.odooUrl || !user.odooDb || !user.odooUsername || !user.odooApiKey) {
      return NextResponse.json({ 
        error: 'Odoo credentials not configured in profile' 
      }, { status: 400 });
    }

    // Clean URL and credentials
    const odooUrl = user.odooUrl.trim().replace(/\/$/, '');
    const odooDb = user.odooDb.trim();
    const odooUsername = user.odooUsername.trim();
    const odooApiKey = user.odooApiKey.trim();

    // 1. Authenticate with Odoo JSON-RPC
    const authPayload = {
      jsonrpc: '2.0',
      method: 'call',
      params: {
        db: odooDb,
        login: odooUsername,
        password: odooApiKey,
      },
      id: Math.floor(Math.random() * 1000000000),
    };

    const authRes = await fetch(`${odooUrl}/web/session/authenticate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(authPayload),
    });

    if (!authRes.ok) {
      throw new Error(`Odoo auth HTTP error: ${authRes.status}`);
    }

    const authData = await authRes.json();
    if (authData.error) {
      const detailedError = authData.error.data?.message || authData.error.data?.name || authData.error.message;
      throw new Error(`Odoo auth error: ${detailedError}`);
    }

    // Extract session_id cookie
    const setCookieHeader = authRes.headers.get('set-cookie');
    let sessionIdCookie = '';
    if (setCookieHeader) {
      const match = setCookieHeader.match(/(session_id=[^;]+)/);
      if (match) {
        sessionIdCookie = match[1];
      }
    }

    if (!sessionIdCookie && authData.result?.session_id) {
        sessionIdCookie = `session_id=${authData.result.session_id}`;
    }

    if (!sessionIdCookie) {
      throw new Error('Failed to get session_id from Odoo');
    }

    // 2. Search for the record
    const searchPayload = {
      jsonrpc: '2.0',
      method: 'call',
      params: {
        model: 'approval.request',
        method: 'search_read',
        args: [[['name', '=', refCode]]],
        kwargs: {
          fields: ['id', 'name'],
          limit: 1,
        },
      },
      id: Math.floor(Math.random() * 1000000000),
    };

    const searchRes = await fetch(`${odooUrl}/web/dataset/call_kw/approval.request/search_read`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Cookie': sessionIdCookie,
      },
      body: JSON.stringify(searchPayload),
    });

    if (!searchRes.ok) {
      throw new Error(`Odoo search HTTP error: ${searchRes.status}`);
    }

    const searchData = await searchRes.json();
    if (searchData.error) {
      const detailedError = searchData.error.data?.message || searchData.error.data?.name || searchData.error.message;
      throw new Error(`Odoo search error: ${detailedError}`);
    }

    const records = searchData.result;
    if (records && records.length > 0) {
      return NextResponse.json({ id: records[0].id, success: true });
    } else {
      return NextResponse.json({ error: 'Letter not found in Odoo' }, { status: 404 });
    }
  } catch (error: any) {
    console.error('Error finding letter in Odoo:', error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}
