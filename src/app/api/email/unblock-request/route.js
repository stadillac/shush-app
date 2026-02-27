// src/app/api/email/unblock-request/route.js
import { NextResponse } from 'next/server'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { sendUnblockRequestNotification } from '@/lib/guardianEmailService'

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
    const { requestId } = body

    if (!requestId) {
      return NextResponse.json(
        { error: 'Request ID is required' },
        { status: 400 }
      )
    }

    // Get the unblock request with all related data
    const { data: unblockRequest, error: requestError } = await supabase
      .from('unblock_requests')
      .select(`
        *,
        blocked_contacts (
          contact_name,
          relationship_type,
          reason,
          platforms,
          blocked_at
        ),
        profiles (
          full_name,
          email
        )
      `)
      .eq('id', requestId)
      .eq('user_id', user.id)
      .single()

    if (requestError || !unblockRequest) {
      return NextResponse.json(
        { error: 'Unblock request not found' },
        { status: 404 }
      )
    }

    // Format the data for the email
    const requestData = {
      requestId: unblockRequest.id,
      userName: unblockRequest.profiles?.full_name || 'A Shush User',
      userEmail: unblockRequest.profiles?.email,
      contactName: unblockRequest.blocked_contacts?.contact_name || 'Unknown Contact',
      relationship: unblockRequest.blocked_contacts?.relationship_type || 'Not specified',
      originalReason: unblockRequest.blocked_contacts?.reason || 'No reason provided',
      platforms: unblockRequest.blocked_contacts?.platforms || [],
      blockedDate: unblockRequest.blocked_contacts?.blocked_at 
        ? new Date(unblockRequest.blocked_contacts.blocked_at).toLocaleDateString()
        : 'Unknown',
      currentMood: unblockRequest.current_mood || 'Not specified',
      journalEntry: unblockRequest.journal_entry || '',
      additionalContext: unblockRequest.additional_context || '',
      urgency: unblockRequest.urgency || 'normal'
    }

    // Send the notification email
    const result = await sendUnblockRequestNotification(
      unblockRequest.guardian_email,
      requestData
    )

    if (!result.success) {
      return NextResponse.json(
        { error: result.error || 'Failed to send notification email' },
        { status: 500 }
      )
    }

    // Update the request to mark notification as sent
    await supabase
      .from('unblock_requests')
      .update({ 
        guardian_notified_at: new Date().toISOString(),
        notification_email_id: result.data?.id 
      })
      .eq('id', requestId)

    return NextResponse.json({
      success: true,
      message: 'Guardian notification sent successfully'
    })

  } catch (error) {
    console.error('Unblock request notification API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}