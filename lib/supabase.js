// src/lib/supabase.js
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables')
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Helper functions for Shush

// Get user's blocked contacts
export async function getBlockedContacts(userId) {
  const { data, error } = await supabase
    .from('blocked_contacts')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
  
  if (error) {
    console.error('Error fetching blocked contacts:', error)
    return []
  }
  
  return data || []
}

// Block a new contact
export async function blockContact(userId, contactData) {
  const { data, error } = await supabase
    .from('blocked_contacts')
    .insert({
      user_id: userId,
      contact_name: contactData.name,
      contact_phone: contactData.phone,
      reason: contactData.reason,
      platforms: contactData.platforms
    })
    .select()
  
  if (error) {
    console.error('Error blocking contact:', error)
    throw error
  }
  
  return data[0]
}

// Get user's guardian
export async function getUserGuardian(userId) {
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
}

// Create unblock request
export async function createUnblockRequest(userId, contactId, guardianEmail, mood, journalEntry) {
  const { data, error } = await supabase
    .from('unblock_requests')
    .insert({
      user_id: userId,
      blocked_contact_id: contactId,
      guardian_email: guardianEmail,
      current_mood: mood,
      journal_entry: journalEntry,
      status: 'pending'
    })
    .select()
  
  if (error) {
    console.error('Error creating unblock request:', error)
    throw error
  }
  
  return data[0]
}

// Add a guardian
export async function addGuardian(userId, guardianData) {
  const { data, error } = await supabase
    .from('guardians')
    .insert({
      user_id: userId,
      guardian_email: guardianData.email,
      guardian_name: guardianData.name,
      relationship_type: guardianData.relationship
    })
    .select()
  
  if (error) {
    console.error('Error adding guardian:', error)
    throw error
  }
  
  return data[0]
}