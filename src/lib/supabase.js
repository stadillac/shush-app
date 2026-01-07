// src/lib/supabase.js
import { createClient } from '@supabase/supabase-js'

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

// ============================================
// PASSWORD RESET FUNCTIONS
// ============================================

// Send password reset email
export async function sendPasswordResetEmail(email, redirectTo) {
  try {
    if (!email || !isValidEmail(email)) {
      throw new Error('Please enter a valid email address')
    }

    const { error } = await supabase.auth.resetPasswordForEmail(email.trim(), {
      redirectTo: redirectTo
    })

    if (error) {
      console.error('Password reset error:', error)
      throw new Error(error.message || 'Failed to send password reset email')
    }

    return { success: true }
  } catch (err) {
    console.error('Unexpected error in sendPasswordResetEmail:', err)
    throw err
  }
}

// Update password (used after clicking reset link)
export async function updatePassword(newPassword) {
  try {
    if (!newPassword || newPassword.length < 6) {
      throw new Error('Password must be at least 6 characters')
    }

    const { error } = await supabase.auth.updateUser({
      password: newPassword
    })

    if (error) {
      console.error('Password update error:', error)
      throw new Error(error.message || 'Failed to update password')
    }

    return { success: true }
  } catch (err) {
    console.error('Unexpected error in updatePassword:', err)
    throw err
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
    }
  } catch (err) {
    console.error('Unexpected error in logUserAction:', err)
  }
}

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

// Block a new contact
export async function blockContact(userId, contactData) {
  try {
    if (!contactData.name || !contactData.reason || !contactData.platforms || contactData.platforms.length === 0) {
      throw new Error('Missing required fields: name, reason, and at least one platform')
    }

    const blockData = {
      user_id: userId,
      contact_name: contactData.name.trim(),
      contact_phone: contactData.phone?.trim() || null,
      contact_email: contactData.email?.trim() || null,
      relationship_type: contactData.relationship || 'Other',
      reason: contactData.reason.trim(),
      platforms: contactData.platforms,
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
    
    if (error && error.code !== 'PGRST116') {
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
// GUARDIAN ACCOUNT MANAGEMENT
// ============================================

// Create a new Guardian account
export async function createGuardianAccount(guardianData) {
  try {
    if (!guardianData.email || !guardianData.password || !guardianData.fullName) {
      throw new Error('Email, password, and full name are required')
    }

    if (!isValidEmail(guardianData.email)) {
      throw new Error('Please enter a valid email address')
    }

    const { data: existingGuardian } = await supabase
      .from('guardian_accounts')
      .select('id')
      .eq('email', guardianData.email.toLowerCase())
      .single()

    if (existingGuardian) {
      throw new Error('A Guardian account with this email already exists')
    }

    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: guardianData.email.trim().toLowerCase(),
      password: guardianData.password,
      options: {
        data: {
          user_type: 'guardian',
          full_name: guardianData.fullName.trim()
        }
      }
    })

    if (authError) {
      console.error('Guardian auth creation error:', authError)
      throw new Error(authError.message || 'Failed to create Guardian account')
    }

    if (!authData.user) {
      throw new Error('Failed to create Guardian authentication')
    }

    const { data: guardianAccount, error: dbError } = await supabase
      .from('guardian_accounts')
      .insert({
        id: authData.user.id,
        email: guardianData.email.trim().toLowerCase(),
        full_name: guardianData.fullName.trim(),
        status: 'active',
        created_at: new Date().toISOString()
      })
      .select()
      .single()

    if (dbError) {
      console.error('Guardian account creation error:', dbError)
      await supabase.auth.admin.deleteUser(authData.user.id)
      throw new Error('Failed to create Guardian account record')
    }

    await logUserAction(authData.user.id, 'guardian_account_created', {
      email: guardianData.email,
      signup_date: new Date().toISOString()
    })

    return {
      success: true,
      guardian: {
        id: guardianAccount.id,
        email: guardianAccount.email,
        name: guardianAccount.full_name,
        status: guardianAccount.status
      },
      authUser: authData.user
    }
  } catch (err) {
    console.error('Unexpected error in createGuardianAccount:', err)
    throw err
  }
}

// Sign in Guardian account
export async function signInGuardian(email, password) {
  try {
    if (!email || !password) {
      throw new Error('Email and password are required')
    }

    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email: email.trim().toLowerCase(),
      password: password
    })

    if (authError) {
      console.error('Guardian auth sign in error:', authError)
      throw new Error('Invalid email or password')
    }

    if (!authData.user) {
      throw new Error('Sign in failed')
    }

    const { data: guardianAccount, error: dbError } = await supabase
      .from('guardian_accounts')
      .select('*')
      .eq('id', authData.user.id)
      .eq('status', 'active')
      .single()

    if (dbError || !guardianAccount) {
      console.error('Guardian account lookup error:', dbError)
      await supabase.auth.signOut()
      throw new Error('Guardian account not found or inactive')
    }

    await supabase
      .from('guardian_accounts')
      .update({ last_sign_in: new Date().toISOString() })
      .eq('id', authData.user.id)

    await logUserAction(authData.user.id, 'guardian_sign_in', {
      email: email,
      sign_in_date: new Date().toISOString()
    })

    return {
      success: true,
      guardian: {
        id: guardianAccount.id,
        email: guardianAccount.email,
        name: guardianAccount.full_name,
        status: guardianAccount.status,
        created_at: guardianAccount.created_at
      },
      session: authData.session
    }
  } catch (err) {
    console.error('Unexpected error in signInGuardian:', err)
    throw err
  }
}

// Get current Guardian account from session
export async function getCurrentGuardian() {
  try {
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return null
    }

    const { data: guardianAccount, error: dbError } = await supabase
      .from('guardian_accounts')
      .select('*')
      .eq('id', user.id)
      .eq('status', 'active')
      .single()

    if (dbError || !guardianAccount) {
      return null
    }

    return {
      id: guardianAccount.id,
      email: guardianAccount.email,
      name: guardianAccount.full_name,
      status: guardianAccount.status,
      created_at: guardianAccount.created_at,
      last_sign_in: guardianAccount.last_sign_in
    }
  } catch (err) {
    console.error('Error getting current guardian:', err)
    return null
  }
}

// Sign out Guardian
export async function signOutGuardian() {
  try {
    const { error } = await supabase.auth.signOut()
    
    if (error) {
      console.error('Guardian sign out error:', error)
      return false
    }

    return true
  } catch (err) {
    console.error('Unexpected error in signOutGuardian:', err)
    return false
  }
}

// Update Guardian account information
export async function updateGuardianAccount(guardianId, updates) {
  try {
    const allowedUpdates = {}
    if (updates.full_name) allowedUpdates.full_name = updates.full_name.trim()
    if (updates.status && ['active', 'inactive'].includes(updates.status)) {
      allowedUpdates.status = updates.status
    }

    if (Object.keys(allowedUpdates).length === 0) {
      throw new Error('No valid fields to update')
    }

    const { data, error } = await supabase
      .from('guardian_accounts')
      .update({
        ...allowedUpdates,
        updated_at: new Date().toISOString()
      })
      .eq('id', guardianId)
      .select()
      .single()

    if (error) {
      console.error('Guardian account update error:', error)
      throw new Error('Failed to update Guardian account')
    }

    await logUserAction(guardianId, 'guardian_account_updated', {
      updated_fields: Object.keys(allowedUpdates)
    })

    return {
      id: data.id,
      email: data.email,
      name: data.full_name,
      status: data.status,
      created_at: data.created_at,
      updated_at: data.updated_at
    }
  } catch (err) {
    console.error('Unexpected error in updateGuardianAccount:', err)
    throw err
  }
}

// Get Guardian by email (for user guardian selection)
export async function findGuardianByEmail(email) {
  try {
    const { data: guardianAccount, error } = await supabase
      .from('guardian_accounts')
      .select('id, email, full_name, status, created_at')
      .eq('email', email.toLowerCase())
      .eq('status', 'active')
      .single()

    if (error || !guardianAccount) {
      return null
    }

    return {
      id: guardianAccount.id,
      email: guardianAccount.email,
      name: guardianAccount.full_name,
      status: guardianAccount.status,
      created_at: guardianAccount.created_at
    }
  } catch (err) {
    console.error('Error finding guardian by email:', err)
    return null
  }
}

// Get Guardian statistics and activity
export async function getGuardianAccountStats(guardianId) {
  try {
    const { data: guardianData } = await supabase
      .from('guardian_accounts')
      .select('email')
      .eq('id', guardianId)
      .single()

    if (!guardianData?.email) {
      return getEmptyGuardianStats()
    }

    const guardianEmail = guardianData.email

    const { data: relationships } = await supabase
      .from('guardians')
      .select('user_id')
      .eq('guardian_email', guardianEmail)
      .eq('status', 'active')

    const { data: requests } = await supabase
      .from('unblock_requests')
      .select('status, created_at, guardian_responded_at')
      .eq('guardian_email', guardianEmail)

    const stats = {
      people_helped: relationships?.length || 0,
      total_requests: requests?.length || 0,
      pending_requests: requests?.filter(r => r.status === 'pending').length || 0,
      approved_requests: requests?.filter(r => r.status === 'approved').length || 0,
      denied_requests: requests?.filter(r => r.status === 'denied').length || 0
    }

    const completedRequests = requests?.filter(r => 
      r.guardian_responded_at && r.created_at
    ) || []

    if (completedRequests.length > 0) {
      const totalHours = completedRequests.reduce((sum, request) => {
        const created = new Date(request.created_at)
        const responded = new Date(request.guardian_responded_at)
        return sum + ((responded - created) / (1000 * 60 * 60))
      }, 0)

      stats.average_response_hours = Math.round((totalHours / completedRequests.length) * 10) / 10
    } else {
      stats.average_response_hours = 0
    }

    return stats
  } catch (err) {
    console.error('Error getting guardian account stats:', err)
    return getEmptyGuardianStats()
  }
}

// ============================================
// USER GUARDIAN FUNCTIONS
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
    
    if (error && error.code !== 'PGRST116') {
      console.error('Error fetching guardian:', error)
      return null
    }
    
    return data
  } catch (err) {
    console.error('Unexpected error in getUserGuardian:', err)
    return null
  }
}

// Add a guardian
export async function addGuardian(userId, guardianData) {
  try {
    if (!guardianData.email || !guardianData.name) {
      throw new Error('Guardian email and name are required')
    }

    const { data: { user } } = await supabase.auth.getUser()
    if (user && guardianData.email.toLowerCase() === user.email.toLowerCase()) {
      throw new Error('You cannot set yourself as your own Guardian')
    }

    await supabase
      .from('guardians')
      .update({ status: 'inactive' })
      .eq('user_id', userId)

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
    
    await logUserAction(userId, 'guardian_added', {
      guardian_email: guardianData.email,
      relationship_type: guardianData.relationship
    })
    
    return data[0]
  } catch (err) {
    console.error('Unexpected error in addGuardian:', err)
    throw err
  }
}

// Enhanced add guardian function that validates Guardian account exists
export async function addGuardianWithAccountValidation(userId, guardianData) {
  try {
    const guardianAccount = await findGuardianByEmail(guardianData.email)
    
    if (!guardianAccount) {
      throw new Error(`No Guardian account found with email ${guardianData.email}. They need to create a Guardian account first.`)
    }

    const result = await addGuardian(userId, guardianData)
    
    await logUserAction(userId, 'verified_guardian_added', {
      guardian_account_id: guardianAccount.id,
      guardian_email: guardianData.email
    })

    return result
  } catch (err) {
    console.error('Error in addGuardianWithAccountValidation:', err)
    throw err
  }
}

// Update guardian information
export async function updateGuardian(userId, guardianId, updates) {
  try {
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

// ============================================
// UNBLOCK REQUEST FUNCTIONS
// ============================================

// Create unblock request
export async function createUnblockRequest(userId, contactId, requestData) {
  try {
    const guardian = await getUserGuardian(userId)
    if (!guardian) {
      throw new Error('No active guardian found. Please add a guardian first.')
    }

    const contact = await getBlockedContact(userId, contactId)
    if (!contact) {
      throw new Error('Blocked contact not found or already unblocked.')
    }

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
// GUARDIAN DASHBOARD FUNCTIONS
// ============================================

// Get all unblock requests for a specific guardian
export async function getGuardianRequests(guardianEmail) {
  try {
    const { data, error } = await supabase
      .from('unblock_requests')
      .select(`
        *,
        blocked_contacts (
          contact_name,
          contact_phone,
          contact_email,
          relationship_type,
          reason,
          platforms,
          severity,
          blocked_at
        ),
        profiles (
          full_name,
          email
        )
      `)
      .eq('guardian_email', guardianEmail.toLowerCase())
      .order('created_at', { ascending: false })
    
    if (error) {
      console.error('Error fetching guardian requests:', error)
      return []
    }
    
    const transformedData = data?.map(request => ({
      id: request.id,
      user_name: request.profiles?.full_name || 'Anonymous User',
      user_email: request.profiles?.email || '',
      contact_name: request.blocked_contacts?.contact_name || 'Unknown Contact',
      contact_relationship: request.blocked_contacts?.relationship_type || 'Unknown',
      blocked_reason: request.blocked_contacts?.reason || '',
      platforms: request.blocked_contacts?.platforms || [],
      blocked_date: request.blocked_contacts?.blocked_at,
      request_date: request.created_at,
      current_mood: request.current_mood,
      journal_entry: request.journal_entry,
      additional_context: request.additional_context,
      urgency: request.urgency || 'normal',
      status: request.status,
      severity: request.blocked_contacts?.severity || 'medium',
      guardian_response: request.guardian_response,
      response_date: request.guardian_responded_at
    })) || []
    
    return transformedData
  } catch (err) {
    console.error('Unexpected error in getGuardianRequests:', err)
    return []
  }
}

// Get all unblock requests for a guardian by account ID
export async function getGuardianRequestsByAccountId(guardianId) {
  try {
    const { data: guardianAccount, error: guardianError } = await supabase
      .from('guardian_accounts')
      .select('email')
      .eq('id', guardianId)
      .single()

    if (guardianError || !guardianAccount) {
      console.error('Guardian account not found:', guardianError)
      return []
    }

    return await getGuardianRequests(guardianAccount.email)
  } catch (err) {
    console.error('Unexpected error in getGuardianRequestsByAccountId:', err)
    return []
  }
}

// Respond to an unblock request as a guardian
export async function respondToUnblockRequest(requestId, response, message, guardianEmail) {
  try {
    if (!['approved', 'denied'].includes(response)) {
      throw new Error('Response must be either "approved" or "denied"')
    }

    if (!message || message.trim().length < 10) {
      throw new Error('Guardian response message must be at least 10 characters')
    }

    const { data: existingRequest, error: fetchError } = await supabase
      .from('unblock_requests')
      .select('id, guardian_email, status, user_id, blocked_contact_id')
      .eq('id', requestId)
      .eq('guardian_email', guardianEmail.toLowerCase())
      .single()

    if (fetchError || !existingRequest) {
      throw new Error('Request not found or you do not have permission to respond')
    }

    if (existingRequest.status !== 'pending') {
      throw new Error('This request has already been responded to')
    }

    const { data, error } = await supabase
      .from('unblock_requests')
      .update({
        status: response,
        guardian_response: message.trim(),
        guardian_responded_at: new Date().toISOString()
      })
      .eq('id', requestId)
      .select()

    if (error) {
      console.error('Error responding to unblock request:', error)
      throw error
    }

    if (response === 'approved') {
      await supabase
        .from('blocked_contacts')
        .update({ 
          status: 'inactive',
          unblocked_at: new Date().toISOString(),
          unblock_reason: 'guardian_approved'
        })
        .eq('id', existingRequest.blocked_contact_id)
    }

    await logUserAction(existingRequest.user_id, 'guardian_response', {
      request_id: requestId,
      guardian_email: guardianEmail,
      response: response,
      message_length: message.length
    })

    return data[0]
  } catch (err) {
    console.error('Unexpected error in respondToUnblockRequest:', err)
    throw err
  }
}

// Get statistics for a guardian's dashboard
export async function getGuardianDashboardStats(guardianEmail) {
  try {
    const { data: requests, error: requestsError } = await supabase
      .from('unblock_requests')
      .select('status, created_at, guardian_responded_at, user_id')
      .eq('guardian_email', guardianEmail.toLowerCase())

    if (requestsError) {
      console.error('Error fetching guardian stats:', requestsError)
      return getEmptyGuardianStats()
    }

    const uniqueUsers = new Set(requests?.map(r => r.user_id) || [])

    const completedRequests = requests?.filter(r => 
      r.guardian_responded_at && r.created_at
    ) || []

    let averageResponseTime = '0 hours'
    if (completedRequests.length > 0) {
      const responseTimes = completedRequests.map(r => {
        const created = new Date(r.created_at)
        const responded = new Date(r.guardian_responded_at)
        return (responded - created) / (1000 * 60 * 60)
      })
      
      const avgHours = responseTimes.reduce((sum, time) => sum + time, 0) / responseTimes.length
      
      if (avgHours < 1) {
        averageResponseTime = `${Math.round(avgHours * 60)} minutes`
      } else if (avgHours < 24) {
        averageResponseTime = `${Math.round(avgHours)} hours`
      } else {
        averageResponseTime = `${Math.round(avgHours / 24)} days`
      }
    }

    let streak = 0
    if (requests && requests.length > 0) {
      const oldestRequest = requests.reduce((oldest, current) => {
        return new Date(current.created_at) < new Date(oldest.created_at) ? current : oldest
      })
      
      streak = Math.floor(
        (new Date() - new Date(oldestRequest.created_at)) / (1000 * 60 * 60 * 24)
      )
    }

    return {
      totalUsers: uniqueUsers.size,
      totalRequests: requests?.length || 0,
      approvedRequests: requests?.filter(r => r.status === 'approved').length || 0,
      deniedRequests: requests?.filter(r => r.status === 'denied').length || 0,
      pendingRequests: requests?.filter(r => r.status === 'pending').length || 0,
      averageResponseTime,
      streak
    }
  } catch (err) {
    console.error('Unexpected error in getGuardianDashboardStats:', err)
    return getEmptyGuardianStats()
  }
}

// Get guardian information and verify access
export async function getGuardianInfo(guardianEmail) {
  try {
    const { data, error } = await supabase
      .from('guardians')
      .select(`
        *,
        profiles!guardians_user_id_fkey (
          full_name,
          email
        )
      `)
      .eq('guardian_email', guardianEmail.toLowerCase())
      .eq('status', 'active')

    if (error || !data || data.length === 0) {
      return null
    }

    return {
      guardian_email: guardianEmail,
      users: data.map(guardian => ({
        user_id: guardian.user_id,
        user_name: guardian.profiles?.full_name || 'Anonymous User',
        user_email: guardian.profiles?.email,
        relationship: guardian.relationship_type,
        guardian_since: guardian.created_at
      }))
    }
  } catch (err) {
    console.error('Unexpected error in getGuardianInfo:', err)
    return null
  }
}

// Get detailed request information for guardian review
export async function getGuardianRequestDetails(requestId, guardianEmail) {
  try {
    const { data, error } = await supabase
      .from('unblock_requests')
      .select(`
        *,
        blocked_contacts (
          *
        ),
        profiles (
          full_name,
          email
        )
      `)
      .eq('id', requestId)
      .eq('guardian_email', guardianEmail.toLowerCase())
      .single()

    if (error || !data) {
      return null
    }

    const { data: previousRequests } = await supabase
      .from('unblock_requests')
      .select('status, created_at, guardian_response')
      .eq('blocked_contact_id', data.blocked_contact_id)
      .neq('id', requestId)
      .order('created_at', { ascending: false })
      .limit(5)

    return {
      ...data,
      previous_requests: previousRequests || [],
      blocked_duration_days: Math.floor(
        (new Date(data.created_at) - new Date(data.blocked_contacts.blocked_at)) / 
        (1000 * 60 * 60 * 24)
      )
    }
  } catch (err) {
    console.error('Unexpected error in getGuardianRequestDetails:', err)
    return null
  }
}

// Update guardian notification preferences
export async function updateGuardianPreferences(guardianEmail, preferences) {
  try {
    console.log('Guardian preferences update requested:', {
      guardian_email: guardianEmail,
      preferences
    })

    return { success: true }
  } catch (err) {
    console.error('Error updating guardian preferences:', err)
    throw err
  }
}

// Helper function to return empty stats when there's an error
function getEmptyGuardianStats() {
  return {
    totalUsers: 0,
    totalRequests: 0,
    approvedRequests: 0,
    deniedRequests: 0,
    pendingRequests: 0,
    averageResponseTime: '0 hours',
    streak: 0
  }
}

// ============================================
// GUARDIAN ANALYTICS
// ============================================

// Get guardian performance analytics
export async function getGuardianAnalytics(guardianEmail, days = 30) {
  try {
    const startDate = new Date()
    startDate.setDate(startDate.getDate() - days)

    const { data, error } = await supabase
      .from('unblock_requests')
      .select('*')
      .eq('guardian_email', guardianEmail.toLowerCase())
      .gte('created_at', startDate.toISOString())

    if (error) {
      console.error('Error fetching guardian analytics:', error)
      return null
    }

    return {
      period_days: days,
      total_requests: data?.length || 0,
      approved_rate: data?.length > 0 
        ? Math.round((data.filter(r => r.status === 'approved').length / data.length) * 100) 
        : 0,
      average_response_time_hours: calculateAverageResponseTime(data || []),
      mood_distribution: calculateMoodDistribution(data || []),
      urgency_distribution: calculateUrgencyDistribution(data || [])
    }
  } catch (err) {
    console.error('Error calculating guardian analytics:', err)
    return null
  }
}

function calculateAverageResponseTime(requests) {
  const responded = requests.filter(r => r.guardian_responded_at && r.created_at)
  if (responded.length === 0) return 0

  const totalHours = responded.reduce((sum, request) => {
    const created = new Date(request.created_at)
    const responded_at = new Date(request.guardian_responded_at)
    return sum + ((responded_at - created) / (1000 * 60 * 60))
  }, 0)

  return Math.round(totalHours / responded.length * 10) / 10
}

function calculateMoodDistribution(requests) {
  const moods = {}
  requests.forEach(request => {
    const mood = request.current_mood || 'unknown'
    moods[mood] = (moods[mood] || 0) + 1
  })
  return moods
}

function calculateUrgencyDistribution(requests) {
  const urgencies = {}
  requests.forEach(request => {
    const urgency = request.urgency || 'normal'
    urgencies[urgency] = (urgencies[urgency] || 0) + 1
  })
  return urgencies
}

// ============================================
// USER STATS & DASHBOARD FUNCTIONS
// ============================================

// Get user stats for dashboard
export async function getUserStats(userId) {
  try {
    const [blockedContacts, unblockRequests, guardian] = await Promise.all([
      getBlockedContacts(userId),
      getUnblockRequests(userId),
      getUserGuardian(userId)
    ])

    let streakDays = 0
    if (blockedContacts.length > 0) {
      const oldestBlock = blockedContacts.reduce((oldest, contact) => {
        const contactDate = new Date(contact.blocked_at)
        const oldestDate = new Date(oldest.blocked_at)
        return contactDate < oldestDate ? contact : oldest
      })
      
      streakDays = Math.floor(
        (new Date() - new Date(oldestBlock.blocked_at)) / (1000 * 60 * 60 * 24)
      )
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

// Get guardian stats for user dashboard
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

    const { data: requests } = await supabase
      .from('unblock_requests')
      .select('status')
      .eq('user_id', userId)

    return {
      hasGuardian: true,
      guardianSince: guardian.created_at,
      totalRequests: requests?.length || 0,
      approvedRequests: requests?.filter(r => r.status === 'approved').length || 0,
      deniedRequests: requests?.filter(r => r.status === 'denied').length || 0,
      pendingRequests: requests?.filter(r => r.status === 'pending').length || 0
    }
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
// EMAIL NOTIFICATION FUNCTIONS (Placeholders)
// ============================================

export async function sendGuardianInvitationEmail(guardianData, user) {
  console.log('Guardian invitation email would be sent to:', guardianData.email)
  console.log('From user:', user.email)
  console.log('Personal message:', guardianData.personalMessage)
  return true
}

export async function sendUnblockRequestEmail(guardianEmail, requestData) {
  console.log('Unblock request email would be sent to:', guardianEmail)
  console.log('Request details:', requestData)
  return true
}

export async function sendUnblockResponseEmail(userId, response, message) {
  console.log('Unblock response email would be sent:', {
    userId,
    response,
    message: message.substring(0, 50) + '...'
  })
  return true
}

export async function sendEmergencyNotification(guardianEmail, emergencyData) {
  console.log('Emergency notification would be sent to:', guardianEmail)
  return true
}