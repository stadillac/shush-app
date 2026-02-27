// src/lib/guardianEmailService.js
// Guardian email communications service - sends real emails via Resend

import { sendEmail } from './email'
import { supabase } from './supabase'

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'

// ============================================
// ACCESS CODE MANAGEMENT
// ============================================

/**
 * Generate and store a secure access code for guardian authentication
 * @param {string} guardianEmail - Guardian's email
 * @param {string} purpose - Purpose of the code ('invitation' | 'unblock_request')
 * @param {string} [relatedId] - Related record ID (e.g., unblock request ID)
 * @returns {Promise<string>} The generated access code
 */
async function generateAndStoreAccessCode(guardianEmail, purpose, relatedId = null) {
  const accessCode = Math.floor(100000 + Math.random() * 900000).toString()
  const expiresAt = new Date(Date.now() + 48 * 60 * 60 * 1000) // 48 hours from now

  // Store in database
  const { error } = await supabase
    .from('guardian_access_codes')
    .insert({
      guardian_email: guardianEmail.toLowerCase(),
      code: accessCode,
      purpose,
      related_id: relatedId,
      expires_at: expiresAt.toISOString(),
      used: false
    })

  if (error) {
    console.error('Error storing access code:', error)
    // Fall back to returning the code anyway - worst case guardian can request new one
  }

  return accessCode
}

/**
 * Verify an access code
 * @param {string} guardianEmail - Guardian's email
 * @param {string} code - Access code to verify
 * @returns {Promise<{valid: boolean, purpose?: string, relatedId?: string}>}
 */
export async function verifyAccessCode(guardianEmail, code) {
  const { data, error } = await supabase
    .from('guardian_access_codes')
    .select('*')
    .eq('guardian_email', guardianEmail.toLowerCase())
    .eq('code', code)
    .eq('used', false)
    .gt('expires_at', new Date().toISOString())
    .single()

  if (error || !data) {
    return { valid: false }
  }

  // Mark code as used
  await supabase
    .from('guardian_access_codes')
    .update({ used: true, used_at: new Date().toISOString() })
    .eq('id', data.id)

  return {
    valid: true,
    purpose: data.purpose,
    relatedId: data.related_id
  }
}

// ============================================
// GUARDIAN INVITATION EMAIL
// ============================================

/**
 * Send guardian invitation email
 * @param {Object} guardianData - Guardian information
 * @param {string} guardianData.email - Guardian's email
 * @param {string} guardianData.personalMessage - Personal message from user
 * @param {Object} userData - User information  
 * @param {string} userData.name - User's name
 * @param {string} userData.email - User's email
 * @returns {Promise<{success: boolean, error?: string}>}
 */
export async function sendGuardianInvitation(guardianData, userData) {
  const accessCode = await generateAndStoreAccessCode(
    guardianData.email, 
    'invitation'
  )
  
  const dashboardLink = `${SITE_URL}/guardian/dashboard?email=${encodeURIComponent(guardianData.email)}&code=${accessCode}`
  
  const html = generateGuardianInvitationHtml(guardianData, userData, accessCode, dashboardLink)
  const text = generateGuardianInvitationText(guardianData, userData, accessCode, dashboardLink)

  return await sendEmail({
    to: guardianData.email,
    subject: `${userData.name} has chosen you as their Guardian on Shush`,
    html,
    text
  })
}

function generateGuardianInvitationHtml(guardianData, userData, accessCode, dashboardLink) {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>You've Been Chosen as a Guardian</title>
    </head>
    <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; background-color: #f4f4f5;">
      <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background: white; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
          
          <!-- Header -->
          <div style="background: linear-gradient(135deg, #dc2626 0%, #b91c1c 100%); padding: 40px 30px; text-align: center;">
            <div style="font-size: 50px; margin-bottom: 10px;">❤️</div>
            <h1 style="color: white; margin: 0; font-size: 24px;">You've Been Chosen as a Guardian</h1>
            <p style="color: #fecaca; margin: 10px 0 0 0;">Someone trusts you to help protect their wellbeing</p>
          </div>
          
          <!-- Content -->
          <div style="padding: 30px;">
            <p style="font-size: 16px; margin-bottom: 20px;">
              <strong>${userData.name}</strong> has chosen you as their Guardian on Shush, an app that helps people maintain healthy digital boundaries.
            </p>

            ${guardianData.personalMessage ? `
            <div style="background: #fef3c7; border-left: 4px solid #f59e0b; padding: 15px 20px; margin: 20px 0; border-radius: 0 8px 8px 0;">
              <p style="margin: 0 0 5px 0; font-weight: bold; color: #92400e;">Personal message from ${userData.name}:</p>
              <p style="margin: 0; font-style: italic; color: #78350f;">"${guardianData.personalMessage}"</p>
            </div>
            ` : ''}

            <div style="background: #fef3c7; border: 2px solid #f59e0b; padding: 20px; border-radius: 8px; text-align: center; margin: 25px 0;">
              <p style="margin: 0 0 5px 0; font-weight: bold; color: #92400e;">Your Guardian Access Code</p>
              <p style="margin: 0; font-size: 32px; letter-spacing: 4px; font-weight: bold; color: #78350f;">${accessCode}</p>
            </div>

            <div style="text-align: center; margin: 30px 0;">
              <a href="${dashboardLink}" style="display: inline-block; background: #dc2626; color: white; padding: 15px 40px; text-decoration: none; border-radius: 8px; font-weight: bold; font-size: 16px;">Access Guardian Dashboard</a>
            </div>

            <h2 style="color: #374151; border-bottom: 2px solid #e5e7eb; padding-bottom: 10px;">What does being a Guardian mean?</h2>
            <ul style="color: #4b5563; padding-left: 20px;">
              <li style="margin-bottom: 10px;">You'll receive notifications when ${userData.name} wants to unblock someone they previously blocked</li>
              <li style="margin-bottom: 10px;">You'll see context about why they blocked the person originally</li>
              <li style="margin-bottom: 10px;">You can approve, deny, or ask for more information before deciding</li>
              <li style="margin-bottom: 10px;">You're helping them make thoughtful decisions during vulnerable moments</li>
            </ul>

            <div style="background: #fef2f2; border: 2px solid #fecaca; padding: 20px; border-radius: 8px; margin: 25px 0;">
              <h3 style="margin: 0 0 10px 0; color: #991b1b;">Important to know:</h3>
              <ul style="margin: 0; padding-left: 20px; color: #991b1b;">
                <li>You are <strong>not</strong> responsible for their decisions or outcomes</li>
                <li>You can step back from this role at any time</li>
                <li>When in doubt, it's usually better to suggest waiting longer</li>
              </ul>
            </div>
          </div>
          
          <!-- Footer -->
          <div style="background: #f9fafb; padding: 20px 30px; text-align: center; border-top: 1px solid #e5e7eb;">
            <p style="margin: 0 0 10px 0; color: #6b7280; font-size: 14px;">Questions about being a Guardian?</p>
            <a href="${SITE_URL}/guardian-guide" style="color: #dc2626; text-decoration: none; font-weight: 500;">Read the Guardian Guide</a>
            <span style="color: #d1d5db; margin: 0 10px;">|</span>
            <a href="mailto:support@shush.app" style="color: #dc2626; text-decoration: none; font-weight: 500;">Contact Support</a>
          </div>
        </div>
      </div>
    </body>
    </html>
  `
}

function generateGuardianInvitationText(guardianData, userData, accessCode, dashboardLink) {
  return `
You've Been Chosen as a Guardian

${userData.name} has chosen you as their Guardian on Shush, an app that helps people maintain healthy digital boundaries.

${guardianData.personalMessage ? `Personal message from ${userData.name}:\n"${guardianData.personalMessage}"\n` : ''}

Your Guardian Access Code: ${accessCode}

Access your Guardian Dashboard: ${dashboardLink}

What does being a Guardian mean?
- You'll receive notifications when ${userData.name} wants to unblock someone they previously blocked
- You'll see context about why they blocked the person originally
- You can approve, deny, or ask for more information before deciding
- You're helping them make thoughtful decisions during vulnerable moments

Important:
- You are NOT responsible for their decisions or outcomes
- You can step back from this role at any time
- When in doubt, suggest waiting longer

Questions? Visit ${SITE_URL}/guardian-guide or contact support@shush.app
  `.trim()
}

// ============================================
// UNBLOCK REQUEST NOTIFICATION EMAIL
// ============================================

/**
 * Send unblock request notification to guardian
 * @param {string} guardianEmail - Guardian's email
 * @param {Object} requestData - Unblock request details
 * @returns {Promise<{success: boolean, error?: string}>}
 */
export async function sendUnblockRequestNotification(guardianEmail, requestData) {
  const accessCode = await generateAndStoreAccessCode(
    guardianEmail, 
    'unblock_request',
    requestData.requestId
  )
  
  const dashboardLink = `${SITE_URL}/guardian/dashboard?email=${encodeURIComponent(guardianEmail)}&code=${accessCode}&request=${requestData.requestId}`
  
  const html = generateUnblockRequestHtml(requestData, accessCode, dashboardLink)
  const text = generateUnblockRequestText(requestData, accessCode, dashboardLink)

  const urgencyPrefix = requestData.urgency === 'emergency' ? '🚨 URGENT: ' : ''

  return await sendEmail({
    to: guardianEmail,
    subject: `${urgencyPrefix}Guardian Request: ${requestData.userName} needs your guidance`,
    html,
    text
  })
}

function generateUnblockRequestHtml(requestData, accessCode, dashboardLink) {
  const urgencyColors = {
    low: { bg: '#f0fdf4', border: '#16a34a', text: '#166534' },
    normal: { bg: '#eff6ff', border: '#3b82f6', text: '#1e40af' },
    high: { bg: '#fef3c7', border: '#f59e0b', text: '#92400e' },
    emergency: { bg: '#fef2f2', border: '#dc2626', text: '#991b1b' }
  }
  const colors = urgencyColors[requestData.urgency] || urgencyColors.normal

  const moodEmojis = {
    calm: '😌', sad: '😢', anxious: '😰', angry: '😠',
    lonely: '😔', hopeful: '🙂', confused: '😕', determined: '😤'
  }
  const moodEmoji = moodEmojis[requestData.currentMood] || '😐'

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Guardian Request</title>
    </head>
    <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; background-color: #f4f4f5;">
      <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background: white; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
          
          <!-- Header -->
          <div style="background: ${colors.bg}; padding: 30px; text-align: center; border-bottom: 3px solid ${colors.border};">
            <span style="background: ${colors.border}; color: white; padding: 8px 20px; border-radius: 20px; font-size: 12px; font-weight: bold; text-transform: uppercase;">${requestData.urgency} Priority</span>
            <h1 style="color: ${colors.text}; margin: 15px 0 5px 0; font-size: 24px;">Guardian Request</h1>
            <p style="margin: 0; color: ${colors.text};">${requestData.userName} is asking to unblock someone</p>
          </div>
          
          <!-- Content -->
          <div style="padding: 30px;">
            
            <!-- Request Details -->
            <div style="background: #f9fafb; border-left: 4px solid #3b82f6; padding: 20px; margin-bottom: 25px; border-radius: 0 8px 8px 0;">
              <h2 style="margin: 0 0 15px 0; color: #374151; font-size: 18px;">Request Details</h2>
              <table style="width: 100%; border-collapse: collapse;">
                <tr><td style="padding: 5px 0; color: #6b7280;">Person to unblock:</td><td style="padding: 5px 0; font-weight: bold;">${requestData.contactName}</td></tr>
                <tr><td style="padding: 5px 0; color: #6b7280;">Relationship:</td><td style="padding: 5px 0;">${requestData.relationship}</td></tr>
                <tr><td style="padding: 5px 0; color: #6b7280;">Current mood:</td><td style="padding: 5px 0;">${moodEmoji} ${requestData.currentMood}</td></tr>
                <tr><td style="padding: 5px 0; color: #6b7280;">Platforms:</td><td style="padding: 5px 0;">${requestData.platforms?.join(', ') || 'Not specified'}</td></tr>
                <tr><td style="padding: 5px 0; color: #6b7280;">Originally blocked:</td><td style="padding: 5px 0;">${requestData.blockedDate || 'Unknown'}</td></tr>
              </table>
            </div>

            <!-- Original Reason -->
            <div style="background: #fef2f2; border: 2px solid #fecaca; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
              <h3 style="margin: 0 0 10px 0; color: #991b1b; font-size: 16px;">⚠️ Why they originally blocked this person:</h3>
              <p style="margin: 0; font-style: italic; color: #7f1d1d;">"${requestData.originalReason || 'No reason provided'}"</p>
            </div>

            <!-- Journal Entry -->
            <div style="background: #eff6ff; border: 2px solid #bfdbfe; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
              <h3 style="margin: 0 0 10px 0; color: #1e40af; font-size: 16px;">💭 Their current thoughts:</h3>
              <p style="margin: 0; font-style: italic; color: #1e3a8a;">"${requestData.journalEntry || 'No journal entry provided'}"</p>
            </div>

            ${requestData.additionalContext ? `
            <!-- Additional Context -->
            <div style="background: #f9fafb; border: 2px solid #d1d5db; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
              <h3 style="margin: 0 0 10px 0; color: #374151; font-size: 16px;">📝 Additional context:</h3>
              <p style="margin: 0; font-style: italic; color: #4b5563;">"${requestData.additionalContext}"</p>
            </div>
            ` : ''}

            <!-- Access Code -->
            <div style="background: #fef3c7; border: 2px solid #f59e0b; padding: 20px; border-radius: 8px; text-align: center; margin: 25px 0;">
              <p style="margin: 0 0 5px 0; font-weight: bold; color: #92400e;">Your Access Code</p>
              <p style="margin: 0; font-size: 32px; letter-spacing: 4px; font-weight: bold; color: #78350f;">${accessCode}</p>
            </div>

            <!-- CTA Button -->
            <div style="text-align: center; margin: 30px 0;">
              <a href="${dashboardLink}" style="display: inline-block; background: #dc2626; color: white; padding: 15px 40px; text-decoration: none; border-radius: 8px; font-weight: bold; font-size: 16px;">Review & Respond</a>
            </div>

            <!-- Guidelines -->
            <div style="background: #f0f9ff; border: 2px solid #0ea5e9; padding: 20px; border-radius: 8px;">
              <h3 style="margin: 0 0 10px 0; color: #0c4a6e; font-size: 16px;">Guidelines for your decision:</h3>
              <ul style="margin: 0; padding-left: 20px; color: #0c4a6e;">
                <li>Consider their emotional state and recent stressors</li>
                <li>Think about whether enough time has passed for healing</li>
                <li>Evaluate if reconnecting serves their long-term wellbeing</li>
                <li>When in doubt, it's usually better to suggest waiting longer</li>
              </ul>
            </div>
          </div>
          
          <!-- Footer -->
          <div style="background: #f9fafb; padding: 20px 30px; text-align: center; border-top: 1px solid #e5e7eb;">
            <p style="margin: 0; color: #6b7280; font-size: 14px;">
              <a href="${SITE_URL}/guardian-guide" style="color: #dc2626; text-decoration: none;">Guardian Guide</a>
              <span style="color: #d1d5db; margin: 0 10px;">|</span>
              <a href="mailto:support@shush.app" style="color: #dc2626; text-decoration: none;">Support</a>
            </p>
          </div>
        </div>
      </div>
    </body>
    </html>
  `
}

function generateUnblockRequestText(requestData, accessCode, dashboardLink) {
  return `
GUARDIAN REQUEST - ${requestData.urgency?.toUpperCase() || 'NORMAL'} PRIORITY

${requestData.userName} is asking to unblock someone and needs your guidance.

REQUEST DETAILS:
- Person to unblock: ${requestData.contactName}
- Relationship: ${requestData.relationship}
- Current mood: ${requestData.currentMood}
- Platforms: ${requestData.platforms?.join(', ') || 'Not specified'}
- Originally blocked: ${requestData.blockedDate || 'Unknown'}

WHY THEY ORIGINALLY BLOCKED THIS PERSON:
"${requestData.originalReason || 'No reason provided'}"

THEIR CURRENT THOUGHTS:
"${requestData.journalEntry || 'No journal entry provided'}"

${requestData.additionalContext ? `ADDITIONAL CONTEXT:\n"${requestData.additionalContext}"\n` : ''}

Your Access Code: ${accessCode}

Review and respond: ${dashboardLink}

GUIDELINES:
- Consider their emotional state and recent stressors
- Think about whether enough time has passed for healing
- Evaluate if reconnecting serves their long-term wellbeing
- When in doubt, suggest waiting longer

Questions? Contact support@shush.app
  `.trim()
}

// ============================================
// GUARDIAN RESPONSE EMAIL (TO USER)
// ============================================

/**
 * Send guardian response notification to user
 * @param {string} userEmail - User's email
 * @param {Object} responseData - Guardian's response details
 * @returns {Promise<{success: boolean, error?: string}>}
 */
export async function sendGuardianResponseEmail(userEmail, responseData) {
  const html = generateGuardianResponseHtml(responseData)
  const text = generateGuardianResponseText(responseData)
  
  const statusEmoji = responseData.response === 'approved' ? '✅' : '❌'

  return await sendEmail({
    to: userEmail,
    subject: `${statusEmoji} Guardian Decision: Your unblock request was ${responseData.response}`,
    html,
    text
  })
}

function generateGuardianResponseHtml(responseData) {
  const isApproved = responseData.response === 'approved'
  const statusColor = isApproved ? '#16a34a' : '#dc2626'
  const statusBg = isApproved ? '#f0fdf4' : '#fef2f2'
  const statusBorder = isApproved ? '#86efac' : '#fecaca'

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Guardian Decision</title>
    </head>
    <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; background-color: #f4f4f5;">
      <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background: white; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
          
          <!-- Header -->
          <div style="background: ${statusBg}; padding: 40px 30px; text-align: center; border-bottom: 3px solid ${statusColor};">
            <div style="font-size: 50px; margin-bottom: 10px;">${isApproved ? '✅' : '❌'}</div>
            <span style="background: ${statusColor}; color: white; padding: 8px 20px; border-radius: 20px; font-size: 14px; font-weight: bold; text-transform: uppercase;">${responseData.response}</span>
            <h1 style="color: ${statusColor}; margin: 15px 0 0 0; font-size: 24px;">Guardian Decision</h1>
          </div>
          
          <!-- Content -->
          <div style="padding: 30px;">
            
            <!-- Summary -->
            <div style="background: #f9fafb; padding: 20px; border-radius: 8px; margin-bottom: 25px;">
              <table style="width: 100%; border-collapse: collapse;">
                <tr><td style="padding: 5px 0; color: #6b7280;">Contact:</td><td style="padding: 5px 0; font-weight: bold;">${responseData.contactName}</td></tr>
                <tr><td style="padding: 5px 0; color: #6b7280;">Guardian:</td><td style="padding: 5px 0;">${responseData.guardianName || 'Your Guardian'}</td></tr>
                <tr><td style="padding: 5px 0; color: #6b7280;">Decision:</td><td style="padding: 5px 0; font-weight: bold; color: ${statusColor};">${responseData.response}</td></tr>
              </table>
            </div>

            <!-- Guardian's Message -->
            <div style="background: ${statusBg}; border: 2px solid ${statusBorder}; padding: 20px; border-radius: 8px; margin-bottom: 25px;">
              <h3 style="margin: 0 0 10px 0; color: ${statusColor}; font-size: 16px;">💬 Your Guardian's Message:</h3>
              <p style="margin: 0; font-style: italic; font-size: 16px; color: #374151;">"${responseData.guardianMessage}"</p>
            </div>

            <!-- Outcome Message -->
            ${isApproved ? `
            <div style="background: #f0fdf4; border: 2px solid #86efac; padding: 20px; border-radius: 8px; margin-bottom: 25px;">
              <h3 style="margin: 0 0 10px 0; color: #166534;">What happens now:</h3>
              <p style="margin: 0; color: #166534;">
                ${responseData.contactName} has been unblocked. You can now contact them again across the platforms where they were blocked.
                Remember to maintain the healthy boundaries you've learned.
              </p>
            </div>
            ` : `
            <div style="background: #fef2f2; border: 2px solid #fecaca; padding: 20px; border-radius: 8px; margin-bottom: 25px;">
              <h3 style="margin: 0 0 10px 0; color: #991b1b;">What this means:</h3>
              <p style="margin: 0; color: #991b1b;">
                Your Guardian believes it's best to wait longer before unblocking ${responseData.contactName}. 
                They care about your wellbeing and want you to make decisions from a place of strength, not vulnerability.
                You can submit another request in the future when you feel ready.
              </p>
            </div>
            `}

            <!-- Supportive Message -->
            <div style="background: #eff6ff; border: 2px solid #bfdbfe; padding: 20px; border-radius: 8px; margin-bottom: 25px;">
              <h3 style="margin: 0 0 10px 0; color: #1e40af;">💙 Remember</h3>
              <p style="margin: 0; color: #1e3a8a;">
                Your Guardian's decision comes from a place of care and objectivity. They can see patterns and risks 
                that might be harder for you to notice when you're emotionally involved. Trust in the process and 
                continue building healthy relationship patterns.
              </p>
            </div>

            <!-- CTA Button -->
            <div style="text-align: center; margin: 30px 0;">
              <a href="${SITE_URL}/dashboard" style="display: inline-block; background: #3b82f6; color: white; padding: 15px 40px; text-decoration: none; border-radius: 8px; font-weight: bold; font-size: 16px;">Return to Dashboard</a>
            </div>
          </div>
          
          <!-- Footer -->
          <div style="background: #f9fafb; padding: 20px 30px; text-align: center; border-top: 1px solid #e5e7eb;">
            <p style="margin: 0; color: #6b7280; font-size: 14px;">
              Need support? <a href="mailto:support@shush.app" style="color: #3b82f6; text-decoration: none;">Contact us</a>
            </p>
          </div>
        </div>
      </div>
    </body>
    </html>
  `
}

function generateGuardianResponseText(responseData) {
  const isApproved = responseData.response === 'approved'
  
  return `
GUARDIAN DECISION: ${responseData.response.toUpperCase()}

Your Guardian has responded to your request to unblock ${responseData.contactName}.

Contact: ${responseData.contactName}
Guardian: ${responseData.guardianName || 'Your Guardian'}
Decision: ${responseData.response}

YOUR GUARDIAN'S MESSAGE:
"${responseData.guardianMessage}"

${isApproved ? 
`WHAT HAPPENS NOW:
${responseData.contactName} has been unblocked. You can now contact them again. Remember to maintain healthy boundaries.` :
`WHAT THIS MEANS:
Your Guardian believes it's best to wait longer. They care about your wellbeing and want you to make decisions from strength, not vulnerability. You can submit another request in the future.`
}

Your Guardian's decision comes from care and objectivity. Trust in the process and continue building healthy relationship patterns.

Return to your dashboard: ${SITE_URL}/dashboard

Need support? Contact support@shush.app
  `.trim()
}

export default {
  sendGuardianInvitation,
  sendUnblockRequestNotification,
  sendGuardianResponseEmail,
  verifyAccessCode
}
