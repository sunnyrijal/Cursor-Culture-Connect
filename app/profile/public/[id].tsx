// project/app/profile/public/[id].tsx

import React, { useState, useMemo, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image, Modal, TextInput, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router, useLocalSearchParams } from 'expo-router';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { theme, spacing, typography, borderRadius } from '@/components/theme';
import { ArrowLeft, Users, Calendar, Info, Globe, Lock, Mail, GraduationCap, Linkedin, CircleCheck as CheckCircle, UserPlus, X, MessageSquare } from 'lucide-react-native';
import { findUserById, MockUser, MockGroup, currentUser } from '@/data/mockData';

export default function PublicProfile() {
  const { id } = useLocalSearchParams();
  
  const [user, setUser] = useState<MockUser | null>(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [message, setMessage] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
      const foundUser = findUserById(id);
      setUser(foundUser);
  }, [id]);

  // Monitor user state changes for debugging
  useEffect(() => {
    if (user) {
      console.log('User state updated - isConnected:', user.isConnected);
    }
  }, [user?.isConnected]);

  const handleConnect = () => {
    setModalVisible(true);
  };
  
  const handleSendRequest = () => {
    if (!user) return;
    setIsProcessing(true);
    
    // Simulate network request
    setTimeout(() => {
      console.log(`Connection request sent to ${user.name} with message: "${message}"`);
      setUser(prevUser => prevUser ? { ...prevUser, isConnected: true } : null);
      setModalVisible(false);
      setMessage('');
      setIsProcessing(false);
      Alert.alert("Connection Request Sent", `Your request to connect with ${user.name} has been sent.`);
    }, 1000);
  };

  const handleRemoveConnection = () => {
    if (!user) return;
    
    Alert.alert(
      "Remove Connection",
      `Are you sure you want to remove ${user.name} from your connections? This action cannot be undone.`,
      [
        { 
          text: "Cancel", 
          style: "cancel" 
        },
        { 
          text: "Remove Connection", 
          style: "destructive", 
          onPress: () => {
            setIsProcessing(true);
            
            // Simulate network request
            setTimeout(() => {
              console.log(`Removing connection with ${user.name}`);
              console.log('Before removal - isConnected:', user.isConnected);
              
              setUser(prevUser => {
                if (prevUser) {
                  const updatedUser = { ...prevUser, isConnected: false };
                  console.log('After removal - isConnected:', updatedUser.isConnected);
                  return updatedUser;
                }
                return null;
              });
              
              setIsProcessing(false);
              Alert.alert(
                "Connection Removed", 
                `You are no longer connected with ${user.name}.`,
                [{ text: "OK", style: "default" }]
              );
            }, 500);
          }
        }
      ]
    );
  };

  const handleMessage = () => {
    if (!user) return;
    console.log(`Opening chat with ${user.name}`);
    // Navigate directly to chat screen with the user's ID
    router.push(`/chat/${user.id}`);
  };
  
  const handleBack = () => {
    if (typeof window !== 'undefined' && window.history.length > 1) {
      router.back();
    } else {
      router.replace('/'); // fallback to home or main page
    }
  };

  if (!user) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={handleBack} style={styles.backButton}>
            <ArrowLeft size={24} color={theme.textPrimary} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>User Not Found</Text>
          <View style={{width: 40}} />
        </View>
        <View style={styles.centered}>
          <Text>Sorry, this user could not be found.</Text>
          <Button title="Go Back" onPress={() => router.back()} style={{ marginTop: spacing.lg }} />
        </View>
      </SafeAreaView>
    );
  }

  const renderActionButtons = () => {
    // Hide action buttons if viewing own profile
    if (!user || user.id === currentUser.id) return null;
    if (user.isConnected) {
      return (
        <View style={styles.actionButtons}>
          <Button 
            title="Message" 
            variant="primary" 
            onPress={handleMessage} 
            style={styles.messageButton}
            leftIcon={<MessageSquare size={16} color={theme.white} />}
            disabled={isProcessing}
          />
          <Button 
            title={isProcessing ? "Removing..." : "Remove Connection"} 
            variant="outline" 
            onPress={handleRemoveConnection} 
            style={styles.removeButton} 
            textStyle={styles.removeButtonText}
            disabled={isProcessing}
          />
        </View>
      )
    }
    return (
      <View style={styles.actionButtons}>
        <Button 
          title={isProcessing ? "Connecting..." : "Connect"} 
          leftIcon={!isProcessing ? <UserPlus size={16} color={theme.white} /> : undefined} 
          onPress={handleConnect} 
          style={styles.connectButton}
          disabled={isProcessing}
        />
      </View>
    )
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Connection Message Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Connect with {user.name}</Text>
            <TextInput
              style={styles.modalInput}
              placeholder="Add a personal message (optional)..."
              multiline
              value={message}
              onChangeText={setMessage}
            />
            <View style={styles.modalActions}>
              <Button 
                title="Cancel" 
                variant="outline" 
                onPress={() => setModalVisible(false)} 
                style={{flex: 1}}
                disabled={isProcessing}
              />
              <Button 
                title={isProcessing ? "Sending..." : "Send Request"} 
                onPress={handleSendRequest} 
                style={{flex: 1}}
                disabled={isProcessing}
              />
            </View>
          </View>
        </View>
      </Modal>

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={handleBack} style={styles.backButton}>
          <ArrowLeft size={24} color={theme.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{user.name}'s Profile</Text>
        <View style={{width: 40}} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <Card style={styles.profileHeaderCard}>
          <View style={{alignItems: 'center'}}>
            <Image source={{ uri: user.image }} style={styles.profileImage} />
            {user.verified && <CheckCircle size={24} color={theme.success} style={styles.verifiedBadge}/>}
            <Text style={styles.profileName}>{user.name}</Text>
            <Text style={styles.profileMeta}>{user.major} • {user.year}</Text>
            <Text style={styles.profileMeta}>{user.university}</Text>
          </View>
        </Card>
        
        {renderActionButtons()}

        <Card style={{marginBottom: spacing.md}}>
            <Text style={styles.sectionTitle}>About</Text>
            <Text style={styles.bioText}>{user.bio}</Text>
        </Card>

        <Card style={{marginBottom: spacing.md}}>
            <Text style={styles.sectionTitle}>Cultural Identity</Text>
            <View style={styles.identityItem}>
                <Globe size={16} color={theme.primary} />
                <Text style={styles.identityLabel}>Heritage:</Text>
            </View>
            <View style={styles.badgeContainer}>
              {user.heritage.map(h => <Badge key={h} label={h} variant="primary"/>)}
            </View>

             <View style={[styles.identityItem, {marginTop: spacing.md}]}>
                <MessageSquare size={16} color={theme.accent} />
                <Text style={styles.identityLabel}>Languages:</Text>
            </View>
            <View style={styles.badgeContainer}>
              {user.languages.map(l => <Badge key={l} label={l} variant="secondary"/>)}
            </View>
        </Card>

        {user.isPublic ? (
          <>
            <Card style={{marginBottom: spacing.md}}>
              <Text style={styles.sectionTitle}>Joined Groups ({user.groupsList?.length || 0})</Text>
              {user.groupsList && user.groupsList.length > 0 ? user.groupsList.map(group => (
                <TouchableOpacity key={group.id} style={styles.listItem} onPress={() => router.push(`/group/${group.id}`)}>
                  <Image source={{uri: group.image}} style={styles.listItemImage} />
                  <Text style={styles.listItemText}>{group.name}</Text>
                </TouchableOpacity>
              )) : <Text style={styles.privateText}>This user hasn't joined any groups yet.</Text>}
            </Card>

            <Card style={{marginBottom: spacing.md}}>
              <Text style={styles.sectionTitle}>Connections ({user.connectionsList?.length || 0})</Text>
              {user.connectionsList && user.connectionsList.length > 0 ? user.connectionsList.map(connection => (
                <TouchableOpacity key={connection.id} style={styles.listItem} onPress={() => router.push(`/profile/public/${connection.id}`)}>
                  <Image source={{uri: connection.image}} style={styles.listItemImage} />
                  <Text style={styles.listItemText}>{connection.name}</Text>
                </TouchableOpacity>
              )) : <Text style={styles.privateText}>This user hasn't made any connections yet.</Text>}
            </Card>
          </>
        ) : (
          <Card style={styles.privateProfileCard}>
            <Lock size={16} color={theme.gray500} />
            <Text style={styles.privateText}>This profile is private. Connect with {user.name} to see more.</Text>
          </Card>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.background },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: theme.border,
    backgroundColor: theme.white,
  },
  headerTitle: { fontSize: typography.fontSize.lg, fontFamily: typography.fontFamily.semiBold },
  backButton: { padding: spacing.xs },
  content: { padding: spacing.md },
  profileHeaderCard: { alignItems: 'center', padding: spacing.lg, marginBottom: spacing.md },
  profileImage: { width: 100, height: 100, borderRadius: 50, marginBottom: spacing.md },
  verifiedBadge: { position: 'absolute', top: 80, left: 180, backgroundColor: 'white', borderRadius: 20 },
  profileName: { fontSize: typography.fontSize['2xl'], fontFamily: typography.fontFamily.bold, color: theme.textPrimary, marginBottom: spacing.xs },
  profileMeta: { fontSize: typography.fontSize.base, color: theme.textSecondary, marginBottom: spacing.xs/2 },
  actionButtons: { flexDirection: 'row', marginBottom: spacing.md },
  messageButton: { 
    flex: 1,
    backgroundColor: theme.primary,
    marginRight: spacing.md,
  },
  connectButton: {
    flex: 1,
    backgroundColor: theme.primary,
  },
  removeButton: {
    flex: 1,
    borderColor: theme.error,
    borderWidth: 2,
    backgroundColor: 'transparent',
  },
  removeButtonText: {
    color: theme.error,
    fontFamily: typography.fontFamily.bold,
    fontSize: typography.fontSize.base,
  },
  sectionTitle: { fontSize: typography.fontSize.lg, fontFamily: typography.fontFamily.bold, marginBottom: spacing.md },
  bioText: { fontSize: typography.fontSize.base, color: theme.textSecondary, lineHeight: 22 },
  identityItem: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, marginBottom: spacing.sm },
  identityLabel: { fontFamily: typography.fontFamily.semiBold, fontSize: typography.fontSize.base },
  badgeContainer: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  privateProfileCard: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, padding: spacing.md, backgroundColor: theme.gray50 },
  privateText: { color: theme.textSecondary },
  listItem: { flexDirection: 'row', alignItems: 'center', paddingVertical: spacing.sm, borderBottomWidth: 1, borderBottomColor: theme.borderLight },
  listItemImage: { width: 40, height: 40, borderRadius: 20, marginRight: spacing.md },
  listItemText: { fontSize: typography.fontSize.base },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center' },
  modalContent: { width: '90%', backgroundColor: 'white', borderRadius: borderRadius.lg, padding: spacing.lg, gap: spacing.md },
  modalTitle: { fontSize: typography.fontSize.xl, fontFamily: typography.fontFamily.bold, textAlign: 'center' },
  modalInput: { borderWidth: 1, borderColor: theme.border, borderRadius: borderRadius.md, padding: spacing.md, minHeight: 80, textAlignVertical: 'top' },
  modalActions: { flexDirection: 'row', gap: spacing.md, justifyContent: 'space-between' },
});