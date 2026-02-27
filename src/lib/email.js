// src/lib/email.js
// Core email sending utility using Resend

import { Resend } from 'resend'

// Initialize Resend client
const resend = new Resend(process.env.RESEND_API_KEY)

// Default sender - update this once you verify your domain
const DEFAULT_FROM = process.env.EMAIL_FROM || 'Shush <onboarding@resend.dev>'

/**
 * Send an email using Resend
 * @param {Object} options - Email options
 * @param {string} options.to - Recipient email
 * @param {string} options.subject - Email subject
 * @param {string} options.html - HTML content
 * @param {string} [options.text] - Plain text content (optional)
 * @param {string} [options.from] - Sender (optional, uses default)
 * @returns {Promise<{success: boolean, data?: any, error?: string}>}
 */
export async function sendEmail({ to, subject, html, text, from = DEFAULT_FROM }) {
  // Validate inputs
  if (!to || !subject || !html) {
    return {
      success: false,
      error: 'Missing required fields: to, subject, and html are required'
    }
  }

  // In development without API key, log and mock success
  if (!process.env.RESEND_API_KEY) {
    console.log('📧 [DEV MODE] Email would be sent:')
    console.log(`   To: ${to}`)
    console.log(`   Subject: ${subject}`)
    console.log(`   From: ${from}`)
    return {
      success: true,
      data: { id: 'dev-mock-' + Date.now() }
    }
  }

  try {
    const { data, error } = await resend.emails.send({
      from,
      to: Array.isArray(to) ? to : [to],
      subject,
      html,
      text: text || stripHtml(html)
    })

    if (error) {
      console.error('Resend API error:', error)
      return {
        success: false,
        error: error.message || 'Failed to send email'
      }
    }

    console.log(`✅ Email sent successfully to ${to}, ID: ${data.id}`)
    return {
      success: true,
      data
    }
  } catch (err) {
    console.error('Email sending exception:', err)
    return {
      success: false,
      error: err.message || 'Unexpected error sending email'
    }
  }
}

/**
 * Send multiple emails (batch)
 * @param {Array} emails - Array of email objects
 * @returns {Promise<{success: boolean, results: Array}>}
 */
export async function sendBatchEmails(emails) {
  const results = await Promise.all(
    emails.map(email => sendEmail(email))
  )
  
  return {
    success: results.every(r => r.success),
    results
  }
}

/**
 * Basic HTML tag stripper for generating plain text version
 */
function stripHtml(html) {
  return html
    .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '')
    .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '')
    .replace(/<[^>]+>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}

export default { sendEmail, sendBatchEmails }
