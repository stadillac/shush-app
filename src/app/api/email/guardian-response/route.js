// src/app/api/email/guardian-response/route.js
import { NextResponse } from 'next/server'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { sendGuardianResponseEmail } from '@/lib/guardianEmailService'

export async function POST(request) {
  try {
    const cookieStore = cookies()
    const supabase = createRouteHandlerClient({ cookies: () => cookieStore })
    
    // Get request body
    const body = await request.json()
    const { requestId, guardianEmail } = body

    if (!requestId) {
      return NextResponse.json(
        { error: 'Request ID is required' },
        { status: 400 }
      )
    }

    // Get the unblock request with the response
    const { data: unblockRequest, error: requestError } = await supabase
      .from('unblock_requests')
      .select(`
        *,
        blocked_contacts (
          contact_name
        ),
        profiles (
          full_name,
          email
        )
      `)
      .eq('id', requestId)
      .single()

    if (requestError || !unblockRequest) {
      return NextResponse.json(
        { error: 'Unblock request not found' },
        { status: 404 }
      )
    }

    // Verify the request has been responded to
    if (!unblockRequest.status || unblockRequest.status === 'pending') {
      return NextResponse.json(
        { error: 'Request has not been responded to yet' },
        { status: 400 }
      )
    }

    // Verify guardian email matches (security check)
    if (guardianEmail && unblockRequest.guardian_email.toLowerCase() !== guardianEmail.toLowerCase()) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 403 }
      )
    }

    // Get guardian name if they have an account
    let guardianName = 'Your Guardian'
    const { data: guardianAccount } = await supabase
      .from('guardian_accounts')
      .select('full_name')
      .eq('email', unblockRequest.guardian_email.toLowerCase())
      .single()
    
    if (guardianAccount?.full_name) {
      guardianName = guardianAccount.full_name
    }

    // Format the data for the email
    const responseData = {
      contactName: unblockRequest.blocked_contacts?.contact_name || 'the contact',
      guardianName,
      response: unblockRequest.status, // 'approved' or 'denied'
      guardianMessage: unblockRequest.guardian_response || 'No message provided',
      responseDate: unblockRequest.guardian_responded_at || new Date().toISOString()
    }

    // Send the notification email to the user
    const userEmail = unblockRequest.profiles?.email
    
    if (!userEmail) {
      return NextResponse.json(
        { error: 'User email not found' },
        { status: 400 }
      )
    }

    const result = await sendGuardianResponseEmail(userEmail, responseData)

    if (!result.success) {
      return NextResponse.json(
        { error: result.error || 'Failed to send response email' },
        { status: 500 }
      )
    }

    // Update the request to mark user notification as sent
    await supabase
      .from('unblock_requests')
      .update({ 
        user_notified_at: new Date().toISOString(),
        user_notification_email_id: result.data?.id 
      })
      .eq('id', requestId)

    return NextResponse.json({
      success: true,
      message: 'User notification sent successfully'
    })

  } catch (error) {
    console.error('Guardian response notification API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}