// NativeBlockingModule.js
import { NativeModules, NativeEventEmitter } from 'react-native';

const { ShushBlockingModule } = NativeModules;
const eventEmitter = new NativeEventEmitter(ShushBlockingModule);

class BlockingManager {
  constructor() {
    this.listeners = new Map();
  }

  // Block a phone number
  async blockNumber(phoneNumber, contactName) {
    try {
      const result = await ShushBlockingModule.blockNumber(phoneNumber, contactName);
      return result;
    } catch (error) {
      console.error('Failed to block number:', error);
      throw error;
    }
  }

  // Unblock a phone number
  async unblockNumber(phoneNumber) {
    try {
      const result = await ShushBlockingModule.unblockNumber(phoneNumber);
      return result;
    } catch (error) {
      console.error('Failed to unblock number:', error);
      throw error;
    }
  }

  // Get all blocked numbers
  async getBlockedNumbers() {
    try {
      return await ShushBlockingModule.getBlockedNumbers();
    } catch (error) {
      console.error('Failed to get blocked numbers:', error);
      return [];
    }
  }

  // Sync with Supabase
  async syncWithBackend() {
    try {
      return await ShushBlockingModule.syncWithBackend();
    } catch (error) {
      console.error('Failed to sync with backend:', error);
      throw error;
    }
  }

  // Listen for blocking events
  addListener(eventType, callback) {
    const subscription = eventEmitter.addListener(eventType, callback);
    this.listeners.set(eventType, subscription);
    return subscription;
  }

  removeListener(eventType) {
    const subscription = this.listeners.get(eventType);
    if (subscription) {
      subscription.remove();
      this.listeners.delete(eventType);
    }
  }

  // Request necessary permissions
  async requestPermissions() {
    try {
      return await ShushBlockingModule.requestPermissions();
    } catch (error) {
      console.error('Failed to request permissions:', error);
      throw error;
    }
  }
}
const blockingManager = new BlockingManager();
export default blockingManager;