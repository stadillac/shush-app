// src/lib/supabase.js
import { createClient } from '@supabase/supabase-js'

// Debug: Log what we're getting from environment
console.log('Environment check:')
console.log('NEXT_PUBLIC_SUPABASE_URL:', process.env.NEXT_PUBLIC_SUPABASE_URL)
console.log('NEXT_PUBLIC_SUPABASE_ANON_KEY:', process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? 'Present' : 'Missing')

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl) {
  throw new Error('Missing NEXT_PUBLIC_SUPABASE_URL environment variable')
}

if (!supabaseAnonKey) {
  throw new Error('Missing NEXT_PUBLIC_SUPABASE_ANON_KEY environment variable')
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// ============================================
// BLOCKED CONTACTS FUNCTIONS
// ============================================

// Get user's blocked contacts
export async function getBlockedContacts(userId) {
  try {
    const { data, error } = await supabase
      .from('blocked_contacts')
      .select('*')
      .eq('user_id', userId)
      .order('blocked_at', { ascending: false })
    
    if (error) {
      console.error('Error fetching blocked contacts:', error)
      return []
    }
    
    return data || []
  } catch (err) {
    console.error('Unexpected error in getBlockedContacts:', err)
    return []
  }
}

// Block a new contact (Enhanced version)
export async function blockContact(userId, contactData) {
  try {
    // Validate required fields
    if (!contactData.name || !contactData.reason || !contactData.platforms || contactData.platforms.length === 0) {
      throw new Error('Missing required fields: name, reason, and at least one platform')
    }

    // Prepare data for insertion
    const blockData = {
      user_id: userId,
      contact_name: contactData.name.trim(),
      contact_phone: contactData.phone?.trim() || null,
      contact_email: contactData.email?.trim() || null,
      relationship_type: contactData.relationship || 'Other',
      reason: contactData.reason.trim(),
      platforms: contactData.platforms, // Array of platform IDs
      severity: contactData.severity || 'medium',
      blocked_at: new Date().toISOString(),
      status: 'active'
    }

    const { data, error } = await supabase
      .from('blocked_contacts')
      .insert(blockData)
      .select()
    
    if (error) {
      console.error('Error blocking contact:', error)
      throw error
    }
    
    // Log the blocking action for analytics
    await logUserAction(userId, 'contact_blocked', {
      contact_name: contactData.name,
      platforms: contactData.platforms,
      severity: contactData.severity
    })
    
    return data[0]
  } catch (err) {
    console.error('Unexpected error in blockContact:', err)
    throw err
  }
}

// Get a specific blocked contact
export async function getBlockedContact(userId, contactId) {
  try {
    const { data, error } = await supabase
      .from('blocked_contacts')
      .select('*')
      .eq('user_id', userId)
      .eq('id', contactId)
      .eq('status', 'active')
      .single()
    
    if (error && error.code !== 'PGRST116') { // PGRST116 = no rows found
      console.error('Error fetching blocked contact:', error)
      return null
    }
    
    return data
  } catch (err) {
    console.error('Unexpected error in getBlockedContact:', err)
    return null
  }
}

// Update blocked contact
export async function updateBlockedContact(userId, contactId, updates) {
  try {
    const { data, error } = await supabase
      .from('blocked_contacts')
      .update({
        ...updates,
        updated_at: new Date().toISOString()
      })
      .eq('user_id', userId)
      .eq('id', contactId)
      .select()
    
    if (error) {
      console.error('Error updating blocked contact:', error)
      throw error
    }
    
    return data[0]
  } catch (err) {
    console.error('Unexpected error in updateBlockedContact:', err)
    throw err
  }
}

// Soft delete blocked contact (set status to inactive)
export async function deleteBlockedContact(userId, contactId) {
  try {
    const { data, error } = await supabase
      .from('blocked_contacts')
      .update({ 
        status: 'inactive',
        updated_at: new Date().toISOString()
      })
      .eq('user_id', userId)
      .eq('id', contactId)
      .select()
    
    if (error) {
      console.error('Error deleting blocked contact:', error)
      throw error
    }
    
    await logUserAction(userId, 'contact_unblocked', {
      contact_id: contactId
    })
    
    return data[0]
  } catch (err) {
    console.error('Unexpected error in deleteBlockedContact:', err)
    throw err
  }
}

// ============================================
// GUARDIAN FUNCTIONS
// ============================================

// Get user's guardian
export async function getUserGuardian(userId) {
  try {
    const { data, error } = await supabase
      .from('guardians')
      .select('*')
      .eq('user_id', userId)
      .eq('status', 'active')
      .single()
    
    if (error && error.code !== 'PGRST116') { // PGRST116 = no rows found
      console.error('Error fetching guardian:', error)
      return null
    }
    
    return data
  } catch (err) {
    console.error('Unexpected error in getUserGuardian:', err)
    return null
  }
}

// // Add a guardian
// export async function addGuardian(userId, guardianData) {
//   try {
//     // Validate required fields
//     if (!guardianData.email || !guardianData.name) {
//       throw new Error('Guardian email and name are required')
//     }

//     // First, deactivate any existing guardian
//     await supabase
//       .from('guardians')
//       .update({ status: 'inactive' })
//       .eq('user_id', userId)

//     // Add new guardian
//     const { data, error } = await supabase
//       .from('guardians')
//       .insert({
//         user_id: userId,
//         guardian_email: guardianData.email.trim().toLowerCase(),
//         guardian_name: guardianData.name.trim(),
//         relationship_type: guardianData.relationship || 'friend',
//         status: 'active'
//       })
//       .select()
    
//     if (error) {
//       console.error('Error adding guardian:', error)
//       throw error
//     }
    
//     await logUserAction(userId, 'guardian_added', {
//       guardian_email: guardianData.email
//     })
    
//     return data[0]
//   } catch (err) {
//     console.error('Unexpected error in addGuardian:', err)
//     throw err
//   }
// }

// Update guardian
// export async function updateGuardian(userId, guardianId, updates) {
//   try {
//     const { data, error } = await supabase
//       .from('guardians')
//       .update({
//         ...updates,
//         updated_at: new Date().toISOString()
//       })
//       .eq('user_id', userId)
//       .eq('id', guardianId)
//       .select()
    
//     if (error) {
//       console.error('Error updating guardian:', error)
//       throw error
//     }
    
//     return data[0]
//   } catch (err) {
//     console.error('Unexpected error in updateGuardian:', err)
//     throw err
//   }
// }

// ============================================
// UNBLOCK REQUEST FUNCTIONS
// ============================================

// Create unblock request
export async function createUnblockRequest(userId, contactId, requestData) {
  try {
    // Get the user's guardian
    const guardian = await getUserGuardian(userId)
    if (!guardian) {
      throw new Error('No active guardian found. Please add a guardian first.')
    }

    // Get the blocked contact
    const contact = await getBlockedContact(userId, contactId)
    if (!contact) {
      throw new Error('Blocked contact not found or already unblocked.')
    }

    // Check if there's already a pending request
    const { data: existingRequest } = await supabase
      .from('unblock_requests')
      .select('id')
      .eq('user_id', userId)
      .eq('blocked_contact_id', contactId)
      .eq('status', 'pending')
      .single()

    if (existingRequest) {
      throw new Error('There is already a pending unblock request for this contact.')
    }

    const { data, error } = await supabase
      .from('unblock_requests')
      .insert({
        user_id: userId,
        blocked_contact_id: contactId,
        guardian_email: guardian.guardian_email,
        current_mood: requestData.mood || 'neutral',
        journal_entry: requestData.journalEntry || '',
        additional_context: requestData.additionalContext || '',
        status: 'pending'
      })
      .select()
    
    if (error) {
      console.error('Error creating unblock request:', error)
      throw error
    }
    
    await logUserAction(userId, 'unblock_requested', {
      contact_id: contactId,
      guardian_email: guardian.guardian_email
    })
    
    return data[0]
  } catch (err) {
    console.error('Unexpected error in createUnblockRequest:', err)
    throw err
  }
}

// Get user's unblock requests
export async function getUnblockRequests(userId) {
  try {
    const { data, error } = await supabase
      .from('unblock_requests')
      .select(`
        *,
        blocked_contacts (
          contact_name,
          platforms,
          relationship_type
        )
      `)
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
    
    if (error) {
      console.error('Error fetching unblock requests:', error)
      return []
    }
    
    return data || []
  } catch (err) {
    console.error('Unexpected error in getUnblockRequests:', err)
    return []
  }
}

// Get specific unblock request
export async function getUnblockRequest(userId, requestId) {
  try {
    const { data, error } = await supabase
      .from('unblock_requests')
      .select(`
        *,
        blocked_contacts (
          contact_name,
          platforms,
          relationship_type,
          reason
        )
      `)
      .eq('user_id', userId)
      .eq('id', requestId)
      .single()
    
    if (error && error.code !== 'PGRST116') {
      console.error('Error fetching unblock request:', error)
      return null
    }
    
    return data
  } catch (err) {
    console.error('Unexpected error in getUnblockRequest:', err)
    return null
  }
}

// ============================================
// ANALYTICS & LOGGING FUNCTIONS
// ============================================

// Log user actions for analytics
export async function logUserAction(userId, actionType, metadata = {}) {
  try {
    const { error } = await supabase
      .from('user_actions')
      .insert({
        user_id: userId,
        action_type: actionType,
        metadata: metadata,
        created_at: new Date().toISOString()
      })
    
    if (error) {
      console.error('Error logging user action:', error)
      // Don't throw error for logging failures
    }
  } catch (err) {
    console.error('Unexpected error in logUserAction:', err)
    // Don't throw error for logging failures
  }
}

// Get user stats for dashboard
export async function getUserStats(userId) {
  try {
    const [blockedContacts, unblockRequests, guardian] = await Promise.all([
      getBlockedContacts(userId),
      getUnblockRequests(userId),
      getUserGuardian(userId)
    ])

    // Calculate impulse-free streak
    let streakDays = 0
    if (blockedContacts.length > 0) {
      const oldestBlock = blockedContacts.reduce((oldest, contact) => {
        const contactDate = new Date(contact.blocked_at)
        const oldestDate = new Date(oldest.blocked_at)
        return contactDate < oldestDate ? contact : oldest
      })
      
      const daysSince = Math.floor(
        (new Date() - new Date(oldestBlock.blocked_at)) / (1000 * 60 * 60 * 24)
      )
      streakDays = daysSince
    }

    return {
      totalBlockedContacts: blockedContacts.length,
      activeBlockedContacts: blockedContacts.filter(c => c.status === 'active').length,
      totalUnblockRequests: unblockRequests.length,
      pendingUnblockRequests: unblockRequests.filter(r => r.status === 'pending').length,
      hasActiveGuardian: !!guardian,
      impulseFreeStreak: streakDays,
      platformsUsed: [...new Set(blockedContacts.flatMap(c => c.platforms))],
      riskLevels: {
        low: blockedContacts.filter(c => c.severity === 'low').length,
        medium: blockedContacts.filter(c => c.severity === 'medium').length,
        high: blockedContacts.filter(c => c.severity === 'high').length
      }
    }
  } catch (err) {
    console.error('Unexpected error in getUserStats:', err)
    return {
      totalBlockedContacts: 0,
      activeBlockedContacts: 0,
      totalUnblockRequests: 0,
      pendingUnblockRequests: 0,
      hasActiveGuardian: false,
      impulseFreeStreak: 0,
      platformsUsed: [],
      riskLevels: { low: 0, medium: 0, high: 0 }
    }
  }
}


// ============================================
// ENHANCED GUARDIAN FUNCTIONS
// ============================================

// Add a guardian (enhanced version)
export async function addGuardian(userId, guardianData) {
  try {
    // Validate required fields
    if (!guardianData.email || !guardianData.name) {
      throw new Error('Guardian email and name are required')
    }

    // Check if guardian email is same as user's email
    const { data: { user } } = await supabase.auth.getUser()
    if (user && guardianData.email.toLowerCase() === user.email.toLowerCase()) {
      throw new Error('You cannot set yourself as your own Guardian')
    }

    // First, deactivate any existing guardian
    await supabase
      .from('guardians')
      .update({ status: 'inactive' })
      .eq('user_id', userId)

    // Add new guardian
    const { data, error } = await supabase
      .from('guardians')
      .insert({
        user_id: userId,
        guardian_email: guardianData.email.trim().toLowerCase(),
        guardian_name: guardianData.name.trim(),
        relationship_type: guardianData.relationship || 'friend',
        personal_message: guardianData.personalMessage || '',
        status: 'active'
      })
      .select()
    
    if (error) {
      console.error('Error adding guardian:', error)
      throw new Error(error.message || 'Failed to add Guardian')
    }
    
    // Log the action
    await logUserAction(userId, 'guardian_added', {
      guardian_email: guardianData.email,
      relationship_type: guardianData.relationship
    })

    // In a real app, you would send an email notification here
    // await sendGuardianInvitationEmail(guardianData, user)
    
    return data[0]
  } catch (err) {
    console.error('Unexpected error in addGuardian:', err)
    throw err
  }
}

// Update guardian information
export async function updateGuardian(userId, guardianId, updates) {
  try {
    // Validate that we're not changing email to user's own email
    if (updates.guardian_email) {
      const { data: { user } } = await supabase.auth.getUser()
      if (user && updates.guardian_email.toLowerCase() === user.email.toLowerCase()) {
        throw new Error('You cannot set yourself as your own Guardian')
      }
    }

    const { data, error } = await supabase
      .from('guardians')
      .update({
        ...updates,
        updated_at: new Date().toISOString()
      })
      .eq('user_id', userId)
      .eq('id', guardianId)
      .select()
    
    if (error) {
      console.error('Error updating guardian:', error)
      throw new Error(error.message || 'Failed to update Guardian')
    }

    if (data.length === 0) {
      throw new Error('Guardian not found or you do not have permission to update it')
    }
    
    await logUserAction(userId, 'guardian_updated', {
      guardian_id: guardianId,
      updates: Object.keys(updates)
    })
    
    return data[0]
  } catch (err) {
    console.error('Unexpected error in updateGuardian:', err)
    throw err
  }
}

// Remove guardian (set status to inactive)
export async function removeGuardian(userId, guardianId) {
  try {
    const { data, error } = await supabase
      .from('guardians')
      .update({ 
        status: 'inactive',
        updated_at: new Date().toISOString()
      })
      .eq('user_id', userId)
      .eq('id', guardianId)
      .select()
    
    if (error) {
      console.error('Error removing guardian:', error)
      throw new Error(error.message || 'Failed to remove Guardian')
    }

    if (data.length === 0) {
      throw new Error('Guardian not found or you do not have permission to remove it')
    }
    
    await logUserAction(userId, 'guardian_removed', {
      guardian_id: guardianId
    })
    
    return data[0]
  } catch (err) {
    console.error('Unexpected error in removeGuardian:', err)
    throw err
  }
}

// Get guardian invitation details (for email templates)
export async function getGuardianInvitationData(userId, guardianId) {
  try {
    const { data, error } = await supabase
      .from('guardians')
      .select(`
        *,
        profiles (
          full_name,
          email
        )
      `)
      .eq('user_id', userId)
      .eq('id', guardianId)
      .single()
    
    if (error) {
      console.error('Error fetching guardian invitation data:', error)
      return null
    }
    
    return data
  } catch (err) {
    console.error('Unexpected error in getGuardianInvitationData:', err)
    return null
  }
}

// Check if user has active guardian
export async function hasActiveGuardian(userId) {
  try {
    const { data, error } = await supabase
      .from('guardians')
      .select('id')
      .eq('user_id', userId)
      .eq('status', 'active')
      .single()
    
    return !error && !!data
  } catch (err) {
    return false
  }
}

// Get guardian stats for dashboard
export async function getGuardianStats(userId) {
  try {
    const guardian = await getUserGuardian(userId)
    if (!guardian) {
      return {
        hasGuardian: false,
        guardianSince: null,
        totalRequests: 0,
        approvedRequests: 0,
        pendingRequests: 0
      }
    }

    // Get unblock request stats
    const { data: requests } = await supabase
      .from('unblock_requests')
      .select('status')
      .eq('user_id', userId)

    const stats = {
      hasGuardian: true,
      guardianSince: guardian.created_at,
      totalRequests: requests?.length || 0,
      approvedRequests: requests?.filter(r => r.status === 'approved').length || 0,
      deniedRequests: requests?.filter(r => r.status === 'denied').length || 0,
      pendingRequests: requests?.filter(r => r.status === 'pending').length || 0
    }

    return stats
  } catch (err) {
    console.error('Error getting guardian stats:', err)
    return {
      hasGuardian: false,
      guardianSince: null,
      totalRequests: 0,
      approvedRequests: 0,
      pendingRequests: 0
    }
  }
}

// ============================================
// EMAIL NOTIFICATION FUNCTIONS (for future implementation)
// ============================================

// Placeholder function for sending guardian invitation email
export async function sendGuardianInvitationEmail(guardianData, user) {
  // This would integrate with your email service (SendGrid, AWS SES, etc.)
  // For now, just log the action
  console.log('Guardian invitation email would be sent to:', guardianData.email)
  console.log('From user:', user.email)
  console.log('Personal message:', guardianData.personalMessage)
  
  // In a real implementation:
  // - Generate secure invitation link
  // - Send HTML email with guardian instructions
  // - Include personal message from user
  // - Provide links to Guardian guidelines and support
  
  return true
}

// Placeholder function for sending unblock request notification
export async function sendUnblockRequestEmail(guardianEmail, requestData) {
  console.log('Unblock request email would be sent to:', guardianEmail)
  console.log('Request details:', requestData)
  
  // In a real implementation:
  // - Send email with request context
  // - Include approve/deny links
  // - Show user's journal entry and mood
  // - Provide Guardian support resources
  
  return true
}

// ============================================
// VALIDATION HELPERS
// ============================================

// Validate email format
export function isValidEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

// Validate guardian data before submission
export function validateGuardianData(guardianData) {
  const errors = []
  
  if (!guardianData.name || guardianData.name.trim().length < 2) {
    errors.push('Guardian name must be at least 2 characters')
  }
  
  if (!guardianData.email || !isValidEmail(guardianData.email)) {
    errors.push('Please enter a valid email address')
  }
  
  if (!guardianData.relationship) {
    errors.push('Please select a relationship type')
  }
  
  if (guardianData.personalMessage && guardianData.personalMessage.length < 20) {
    errors.push('Personal message must be at least 20 characters')
  }
  
  return {
    isValid: errors.length === 0,
    errors
  }
}