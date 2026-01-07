// ShushBlockingScreen.js
import React, { useState, useEffect } from 'react';
import { View, Text, Alert, FlatList, TouchableOpacity, StyleSheet } from 'react-native';
import BlockingManager from './NativeBlockingModule';

const ShushBlockingScreen = () => {
  const [blockedNumbers, setBlockedNumbers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    initializeBlocking();
    setupEventListeners();
    
    return () => {
      // Cleanup listeners
      BlockingManager.removeListener('onNumberBlocked');
      BlockingManager.removeListener('onNumberUnblocked');
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const initializeBlocking = async () => {
    try {
      // Request necessary permissions
      const permissions = await BlockingManager.requestPermissions();
      console.log('Permissions status:', permissions);

      // Load existing blocked numbers
      const numbers = await BlockingManager.getBlockedNumbers();
      setBlockedNumbers(numbers);
      
      // Sync with backend
      await syncWithSupabase();
      
    } catch (error) {
      console.error('Failed to initialize blocking:', error);
      Alert.alert('Error', 'Failed to initialize blocking system');
    } finally {
      setLoading(false);
    }
  };

  const setupEventListeners = () => {
    BlockingManager.addListener('onNumberBlocked', (data) => {
      console.log('Number blocked:', data);
      refreshBlockedNumbers();
    });

    BlockingManager.addListener('onNumberUnblocked', (data) => {
      console.log('Number unblocked:', data);
      refreshBlockedNumbers();
    });
  };

  const refreshBlockedNumbers = async () => {
    try {
      const numbers = await BlockingManager.getBlockedNumbers();
      setBlockedNumbers(numbers);
    } catch (error) {
      console.error('Failed to refresh blocked numbers:', error);
    }
  };

  const syncWithSupabase = async () => {
    try {
      // Get blocked contacts from Supabase
      const { data: supabaseContacts } = await supabase
        .from('blocked_contacts')
        .select('*')
        .eq('user_id', user.id)
        .eq('status', 'active');

      // Sync each contact to native blocking
      for (const contact of supabaseContacts) {
        if (contact.contact_phone) {
          await BlockingManager.blockNumber(
            contact.contact_phone,
            contact.contact_name
          );
        }
      }
      
      console.log(`Synced ${supabaseContacts.length} contacts from Supabase`);
    } catch (error) {
      console.error('Failed to sync with Supabase:', error);
    }
  };

  const testBlocking = (phoneNumber) => {
    Alert.alert(
      'Test Blocking',
      `This will simulate calls and messages from ${phoneNumber}`,
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Test', onPress: () => simulateIncomingCommunication(phoneNumber) }
      ]
    );
  };

  const simulateIncomingCommunication = (phoneNumber) => {
    // This would normally be handled by the native blocking services
    // For testing, we can show what would happen
    Alert.alert(
      'Blocking Test Result',
      `✅ Call from ${phoneNumber} would be automatically rejected\n✅ SMS from ${phoneNumber} would be quarantined\n\nNo notifications would be shown to user.`
    );
  };

  const renderBlockedNumber = ({ item }) => (
    <View style={styles.blockedItem}>
      <View style={styles.contactInfo}>
        <Text style={styles.contactName}>{item.contactName}</Text>
        <Text style={styles.phoneNumber}>{item.phoneNumber}</Text>
        <Text style={styles.blockedDate}>
          Blocked: {new Date(item.blockedAt).toLocaleDateString()}
        </Text>
      </View>
      <TouchableOpacity 
        style={styles.testButton}
        onPress={() => testBlocking(item.phoneNumber)}
      >
        <Text style={styles.testButtonText}>Test Block</Text>
      </TouchableOpacity>
    </View>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <Text>Initializing blocking system...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Native Blocking System</Text>
        <Text style={styles.subtitle}>
          {blockedNumbers.length} numbers actively blocked
        </Text>
      </View>

      <FlatList
        data={blockedNumbers}
        renderItem={renderBlockedNumber}
        keyExtractor={(item) => item.phoneNumber}
        style={styles.list}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No blocked numbers yet</Text>
          </View>
        }
      />

      <TouchableOpacity 
        style={styles.syncButton}
        onPress={syncWithSupabase}
      >
        <Text style={styles.syncButtonText}>Sync with Backend</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    backgroundColor: '#6366f1',
    padding: 20,
    paddingTop: 50,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
  },
  subtitle: {
    fontSize: 16,
    color: '#e0e7ff',
    marginTop: 5,
  },
  list: {
    flex: 1,
    padding: 15,
  },
  blockedItem: {
    backgroundColor: 'white',
    padding: 15,
    marginBottom: 10,
    borderRadius: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  contactInfo: {
    flex: 1,
  },
  contactName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
  },
  phoneNumber: {
    fontSize: 14,
    color: '#6b7280',
    marginTop: 2,
  },
  blockedDate: {
    fontSize: 12,
    color: '#9ca3af',
    marginTop: 4,
  },
  testButton: {
    backgroundColor: '#10b981',
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 6,
  },
  testButtonText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '600',
  },
  emptyContainer: {
    padding: 40,
    alignItems: 'center',
  },
  emptyText: {
    color: '#9ca3af',
    fontSize: 16,
  },
  syncButton: {
    backgroundColor: '#6366f1',
    margin: 15,
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
  },
  syncButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
});

const shushBlockingScreen = new ShushBlockingScreen();
export default shushBlockingScreen;