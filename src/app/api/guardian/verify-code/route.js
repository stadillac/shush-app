// src/app/api/guardian/verify-code/route.js
import { NextResponse } from 'next/server'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'

export async function POST(request) {
  try {
    const cookieStore = cookies()
    const supabase = createRouteHandlerClient({ cookies: () => cookieStore })
    
    // Get request body
    const body = await request.json()
    const { email, code } = body

    if (!email || !code) {
      return NextResponse.json(
        { error: 'Email and code are required' },
        { status: 400 }
      )
    }

    // Validate code format (6 digits)
    if (!/^\d{6}$/.test(code)) {
      return NextResponse.json(
        { valid: false, error: 'Invalid code format' },
        { status: 400 }
      )
    }

    // Look up the access code
    const { data: accessCode, error: lookupError } = await supabase
      .from('guardian_access_codes')
      .select('*')
      .eq('guardian_email', email.toLowerCase())
      .eq('code', code)
      .eq('used', false)
      .gt('expires_at', new Date().toISOString())
      .order('created_at', { ascending: false })
      .limit(1)
      .single()

    if (lookupError || !accessCode) {
      // Check if code exists but is expired or used
      const { data: expiredCode } = await supabase
        .from('guardian_access_codes')
        .select('expires_at, used')
        .eq('guardian_email', email.toLowerCase())
        .eq('code', code)
        .single()

      if (expiredCode) {
        if (expiredCode.used) {
          return NextResponse.json({
            valid: false,
            error: 'This code has already been used. Please request a new one.'
          })
        }
        if (new Date(expiredCode.expires_at) < new Date()) {
          return NextResponse.json({
            valid: false,
            error: 'This code has expired. Please request a new one.'
          })
        }
      }

      return NextResponse.json({
        valid: false,
        error: 'Invalid access code. Please check and try again.'
      })
    }

    // Mark the code as used
    await supabase
      .from('guardian_access_codes')
      .update({ 
        used: true, 
        used_at: new Date().toISOString() 
      })
      .eq('id', accessCode.id)

    // Return success with purpose info
    return NextResponse.json({
      valid: true,
      purpose: accessCode.purpose,
      relatedId: accessCode.related_id,
      message: 'Access code verified successfully'
    })

  } catch (error) {
    console.error('Verify code API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// Also support GET for simple verification checks
export async function GET(request) {
  const { searchParams } = new URL(request.url)
  const email = searchParams.get('email')
  const code = searchParams.get('code')

  if (!email || !code) {
    return NextResponse.json(
      { error: 'Email and code are required' },
      { status: 400 }
    )
  }

  // Create a fake request to reuse POST logic
  const fakeRequest = {
    json: async () => ({ email, code })
  }

  return POST(fakeRequest)
}