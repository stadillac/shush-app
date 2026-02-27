// src/app/api/email/guardian-invite/route.js
import { NextResponse } from 'next/server'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { sendGuardianInvitation } from '@/lib/guardianEmailService'

export async function POST(request) {
  try {
    const cookieStore = cookies()
    const supabase = createRouteHandlerClient({ cookies: () => cookieStore })
    
    // Verify the user is authenticated
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Get request body
    const body = await request.json()
    const { guardianEmail, personalMessage } = body

    if (!guardianEmail) {
      return NextResponse.json(
        { error: 'Guardian email is required' },
        { status: 400 }
      )
    }

    // Get user profile for the email
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('full_name, email')
      .eq('id', user.id)
      .single()

    if (profileError) {
      console.error('Error fetching profile:', profileError)
      return NextResponse.json(
        { error: 'Failed to fetch user profile' },
        { status: 500 }
      )
    }

    // Send the invitation email
    const result = await sendGuardianInvitation(
      {
        email: guardianEmail,
        personalMessage: personalMessage || ''
      },
      {
        name: profile.full_name || 'A Shush User',
        email: profile.email
      }
    )

    if (!result.success) {
      return NextResponse.json(
        { error: result.error || 'Failed to send invitation email' },
        { status: 500 }
      )
    }

    // Log the invitation
    await supabase
      .from('guardians')
      .update({ 
        invitation_sent_at: new Date().toISOString(),
        invitation_email_id: result.data?.id 
      })
      .eq('user_id', user.id)
      .eq('guardian_email', guardianEmail.toLowerCase())

    return NextResponse.json({
      success: true,
      message: 'Guardian invitation sent successfully'
    })

  } catch (error) {
    console.error('Guardian invite API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}