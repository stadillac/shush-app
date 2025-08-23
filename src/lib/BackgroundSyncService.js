// BackgroundSyncService.js
import { AppState } from 'react-native';
import BackgroundJob from '@react-native-async-storage/async-storage';
import BlockingManager from './NativeBlockingModule';
import { supabase } from '../lib/supabase';

class BackgroundSyncService {
  constructor() {
    this.isActive = false;
    this.syncInterval = null;
  }

  start() {
    if (this.isActive) return;
    
    this.isActive = true;
    this.setupAppStateListener();
    this.startPeriodicSync();
    
    console.log('Background sync service started');
  }

  stop() {
    this.isActive = false;
    
    if (this.syncInterval) {
      clearInterval(this.syncInterval);
      this.syncInterval = null;
    }
    
    console.log('Background sync service stopped');
  }

  setupAppStateListener() {
    AppState.addEventListener('change', (nextAppState) => {
      if (nextAppState === 'active') {
        // App came to foreground, sync immediately
        this.performSync();
      }
    });
  }

  startPeriodicSync() {
    // Sync every 5 minutes when app is active
    this.syncInterval = setInterval(() => {
      if (AppState.currentState === 'active') {
        this.performSync();
      }
    }, 5 * 60 * 1000);
  }

  async performSync() {
    try {
      console.log('Starting background sync...');
      
      // Get current user
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Sync blocked contacts from Supabase to native
      await this.syncBlockedContactsToNative(user.id);
      
      // Sync unblock requests back to Supabase  
      await this.syncUnblockRequestsToSupabase(user.id);
      
      console.log('Background sync completed');
    } catch (error) {
      console.error('Background sync failed:', error);
    }
  }

  async syncBlockedContactsToNative(userId) {
    try {
      // Get blocked contacts from Supabase
      const { data: supabaseContacts } = await supabase
        .from('blocked_contacts')
        .select('*')
        .eq('user_id', userId)
        .eq('status', 'active');

      // Get current native blocked numbers
      const nativeNumbers = await BlockingManager.getBlockedNumbers();
      const nativePhones = new Set(nativeNumbers.map(n => n.phoneNumber));

      // Add new blocks to native
      for (const contact of supabaseContacts) {
        if (contact.contact_phone && !nativePhones.has(contact.contact_phone)) {
          await BlockingManager.blockNumber(
            contact.contact_phone,
            contact.contact_name
          );
          console.log(`Added ${contact.contact_phone} to native blocking`);
        }
      }

      // Remove blocks that no longer exist in Supabase
      const supabasePhones = new Set(
        supabaseContacts
          .filter(c => c.contact_phone)
          .map(c => c.contact_phone)
      );

      for (const nativeNumber of nativeNumbers) {
        if (!supabasePhones.has(nativeNumber.phoneNumber)) {
          await BlockingManager.unblockNumber(nativeNumber.phoneNumber);
          console.log(`Removed ${nativeNumber.phoneNumber} from native blocking`);
        }
      }

    } catch (error) {
      console.error('Failed to sync blocked contacts to native:', error);
    }
  }

  async syncUnblockRequestsToSupabase(userId) {
    try {
      // Check for approved unblock requests
      const { data: approvedRequests } = await supabase
        .from('unblock_requests')
        .select(`
          *,
          blocked_contacts (
            contact_phone,
            contact_name
          )
        `)
        .eq('user_id', userId)
        .eq('status', 'approved')
        .is('processed_at', null);

      // Process approved requests
      for (const request of approvedRequests) {
        if (request.blocked_contacts.contact_phone) {
          // Unblock in native system
          await BlockingManager.unblockNumber(request.blocked_contacts.contact_phone);
          
          // Mark contact as unblocked in Supabase
          await supabase
            .from('blocked_contacts')
            .update({ status: 'inactive' })
            .eq('id', request.blocked_contact_id);

          // Mark request as processed
          await supabase
            .from('unblock_requests')
            .update({ 
              processed_at: new Date().toISOString(),
              status: 'completed' 
            })
            .eq('id', request.id);

          console.log(`Processed unblock for ${request.blocked_contacts.contact_phone}`);
        }
      }
    } catch (error) {
      console.error('Failed to sync unblock requests:', error);
    }
  }
}

export default new BackgroundSyncService();