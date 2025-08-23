// // src/lib/guardianEmailService.js
// // This service handles all guardian-related email communications

// /**
//  * Send guardian invitation email
//  * @param {Object} guardianData - Guardian information
//  * @param {Object} userData - User information
//  * @returns {Promise<boolean>} Success status
//  */
// export async function sendGuardianInvitation(guardianData, userData) {
//   const emailTemplate = generateGuardianInvitationEmail(guardianData, userData)
  
//   // In production, integrate with your email service (SendGrid, AWS SES, etc.)
//   console.log('Guardian invitation email:', emailTemplate)
  
//   // Mock sending
//   return new Promise(resolve => {
//     setTimeout(() => resolve(true), 1000)
//   })
// }

// /**
//  * Send unblock request notification to guardian
//  * @param {string} guardianEmail - Guardian's email
//  * @param {Object} requestData - Unblock request details
//  * @returns {Promise<boolean>} Success status
//  */
// export async function sendUnblockRequestNotification(guardianEmail, requestData) {
//   const emailTemplate = generateUnblockRequestEmail(guardianEmail, requestData)
  
//   console.log('Unblock request notification:', emailTemplate)
  
//   // Mock sending
//   return new Promise(resolve => {
//     setTimeout(() => resolve(true), 1000)
//   })
// }

// /**
//  * Generate guardian invitation email template
//  */
// function generateGuardianInvitationEmail(guardianData, userData) {
//   const accessCode = generateAccessCode()
//   const dashboardLink = `${process.env.NEXT_PUBLIC_SITE_URL}/guardian/${encodeURIComponent(guardianData.email)}?code=${accessCode}`
  
//   return {
//     to: guardianData.email,
//     from: 'noreply@shush.app',
//     subject: `${userData.name} has chosen you as their Guardian on Shush`,
//     html: `
//       <!DOCTYPE html>
//       <html>
//       <head>
//         <meta charset="utf-8">
//         <title>You've Been Chosen as a Guardian</title>
//         <style>
//           body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
//           .container { max-width: 600px; margin: 0 auto; padding: 20px; }
//           .header { background: #f8fafc; padding: 30px; text-align: center; border-radius: 8px; margin-bottom: 30px; }
//           .heart { font-size: 40px; margin-bottom: 10px; }
//           .button { display: inline-block; background: #dc2626; color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; font-weight: bold; margin: 20px 0; }
//           .code-box { background: #fef3c7; border: 2px solid #f59e0b; padding: 20px; border-radius: 8px; text-align: center; margin: 20px 0; }
//           .access-code { font-size: 24px; font-weight: bold; color: #92400e; letter-spacing: 3px; }
//           .info-box { background: #eff6ff; border: 2px solid #3b82f6; padding: 20px; border-radius: 8px; margin: 20px 0; }
//           .warning-box { background: #fef2f2; border: 2px solid #ef4444; padding: 20px; border-radius: 8px; margin: 20px 0; }
//           .footer { text-align: center; margin-top: 40px; padding-top: 20px; border-top: 1px solid #e5e7eb; color: #6b7280; font-size: 14px; }
//         </style>
//       </head>
//       <body>
//         <div class="container">
//           <!-- Header -->
//           <div class="header">
//             <div class="heart">❤️</div>
//             <h1 style="color: #dc2626; margin: 0;">You've Been Chosen as a Guardian</h1>
//             <p style="margin: 10px 0 0 0; color: #6b7280;">Someone trusts you to help them maintain healthy digital boundaries</p>
//           </div>

//           <!-- Personal Message -->
//           <h2>A Personal Message from ${userData.name}:</h2>
//           <div style="background: #f9fafb; padding: 20px; border-radius: 8px; font-style: italic; margin: 20px 0;">
//             "${guardianData.personalMessage}"
//           </div>

//           <!-- Access Information -->
//           <div class="code-box">
//             <h3 style="margin-top: 0; color: #92400e;">Your Guardian Access Code</h3>
//             <div class="access-code">${accessCode}</div>
//             <p style="margin-bottom: 0; font-size: 14px; color: #92400e;">Use this code to access your Guardian Dashboard</p>
//           </div>

//           <div style="text-align: center;">
//             <a href="${dashboardLink}" class="button">Access Guardian Dashboard</a>
//           </div>

//           <!-- What is a Guardian -->
//           <div class="info-box">
//             <h3 style="margin-top: 0; color: #1e40af;">What does it mean to be a Guardian?</h3>
//             <ul style="margin: 10px 0; padding-left: 20px;">
//               <li>You'll receive notifications when ${userData.name} wants to unblock someone</li>
//               <li>You'll see context about why they blocked the person originally</li>
//               <li>You can approve, deny, or ask for more information before deciding</li>
//               <li>You're helping them make thoughtful decisions during vulnerable moments</li>
//             </ul>
//           </div>

//           <!-- Responsibilities -->
//           <h3>Your Responsibilities as a Guardian:</h3>
//           <ul>
//             <li><strong>Review requests thoughtfully</strong> - Consider their wellbeing above all</li>
//             <li><strong>Respond in a timely manner</strong> - Aim for 24-48 hours when possible</li>
//             <li><strong>Provide clear reasoning</strong> - Help them understand your decisions</li>
//             <li><strong>Stay supportive</strong> - Remember you're helping them grow</li>
//           </ul>

//           <!-- Important Notes -->
//           <div class="warning-box">
//             <h3 style="margin-top: 0; color: #dc2626;">Important:</h3>
//             <ul style="margin: 10px 0; padding-left: 20px;">
//               <li>You are <strong>not</strong> responsible for their decisions or outcomes</li>
//               <li>You can step back from this role at any time</li>
//               <li>When in doubt, it's usually better to suggest waiting longer</li>
//               <li>Encourage professional help if you notice concerning patterns</li>
//             </ul>
//           </div>

//           <!-- Getting Started -->
//           <h3>Getting Started:</h3>
//           <ol>
//             <li>Click the button above to access your Guardian Dashboard</li>
//             <li>Enter your access code: <strong>${accessCode}</strong></li>
//             <li>Read the Guardian Guide to understand your role better</li>
//             <li>You'll receive email notifications when ${userData.name} needs your help</li>
//           </ol>

//           <!-- Footer -->
//           <div class="footer">
//             <p>Thank you for being part of the Shush community.</p>
//             <p>Questions? Reply to this email or contact us at <a href="mailto:guardians@shush.app">guardians@shush.app</a></p>
//             <p style="margin-top: 20px;">
//               <a href="${process.env.NEXT_PUBLIC_SITE_URL}/guardian-guide" style="color: #3b82f6;">Guardian Guide</a> |
//               <a href="${process.env.NEXT_PUBLIC_SITE_URL}/guardian/privacy" style="color: #3b82f6;">Privacy Policy</a> |
//               <a href="mailto:guardians@shush.app" style="color: #3b82f6;">Support</a>
//             </p>
//           </div>
//         </div>
//       </body>
//       </html>
//     `,
//     text: `
// You've Been Chosen as a Guardian

// ${userData.name} has chosen you as their Guardian on Shush, an app that helps people maintain healthy digital boundaries.

// Personal Message from ${userData.name}:
// "${guardianData.personalMessage}"

// Your Guardian Access Code: ${accessCode}

// What does it mean to be a Guardian?
// - You'll receive notifications when ${userData.name} wants to unblock someone they previously blocked
// - You'll see context about why they blocked the person originally
// - You can approve, deny, or ask for more information
// - You're helping them make thoughtful decisions during vulnerable moments

// Access your Guardian Dashboard: ${dashboardLink}

// Questions? Contact us at guardians@shush.app

// Thank you for being part of building a more supportive digital community.
//     `
//   }
// }

// /**
//  * Generate unblock request notification email
//  */
// function generateUnblockRequestEmail(guardianEmail, requestData) {
//   const accessCode = generateAccessCode()
//   const dashboardLink = `${process.env.NEXT_PUBLIC_SITE_URL}/guardian/${encodeURIComponent(guardianEmail)}?code=${accessCode}`
//   const urgencyColor = requestData.urgency === 'emergency' ? '#dc2626' : 
//                       requestData.urgency === 'high' ? '#f59e0b' : '#3b82f6'
  
//   return {
//     to: guardianEmail,
//     from: 'noreply@shush.app',
//     subject: `${requestData.urgency === 'emergency' ? '🚨 URGENT: ' : ''}Guardian Request: ${requestData.userName} needs your help`,
//     html: `
//       <!DOCTYPE html>
//       <html>
//       <head>
//         <meta charset="utf-8">
//         <title>Guardian Request</title>
//         <style>
//           body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
//           .container { max-width: 600px; margin: 0 auto; padding: 20px; }
//           .header { background: #f8fafc; padding: 30px; text-align: center; border-radius: 8px; margin-bottom: 30px; }
//           .urgency { background: ${urgencyColor}; color: white; padding: 10px 20px; border-radius: 20px; display: inline-block; font-weight: bold; text-transform: uppercase; font-size: 12px; }
//           .button { display: inline-block; background: #dc2626; color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; font-weight: bold; margin: 20px 0; }
//           .request-box { background: #f9fafb; border-left: 4px solid #3b82f6; padding: 20px; margin: 20px 0; }
//           .mood { font-size: 20px; }
//           .code-box { background: #fef3c7; border: 2px solid #f59e0b; padding: 15px; border-radius: 8px; text-align: center; margin: 20px 0; }
//         </style>
//       </head>
//       <body>
//         <div class="container">
//           <div class="header">
//             <div class="urgency">${requestData.urgency} Priority</div>
//             <h1 style="color: #dc2626; margin: 10px 0;">Guardian Request</h1>
//             <p style="margin: 0; color: #6b7280;">${requestData.userName} is asking to unblock someone</p>
//           </div>

//           <h2>Request Details:</h2>
//           <div class="request-box">
//             <p><strong>Person to unblock:</strong> ${requestData.contactName}</p>
//             <p><strong>Relationship:</strong> ${requestData.relationship}</p>
//             <p><strong>Current mood:</strong> <span class="mood">${requestData.moodEmoji}</span> ${requestData.currentMood}