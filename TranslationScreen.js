import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Modal,
  Image,
  TextInput,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Audio } from 'expo-av';
import * as FileSystem from 'expo-file-system';

const ASSEMBLY_API_KEY = "75181ba65a4948499efb9e49ec310f4d";

export default function TranslationScreen() {
  const [isConnected, setIsConnected] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [showBluetoothModal, setShowBluetoothModal] = useState(false);
  const [isEditingPrompt, setIsEditingPrompt] = useState(false);
  const [speechInput, setSpeechInput] = useState('');
  const [recording, setRecording] = useState(null);
  const [transcript, setTranscript] = useState('');
  const [loading, setLoading] = useState(false);

  const handleConnect = async () => {
    setShowBluetoothModal(true);
    setIsConnecting(true);
    // Simulate connecting...
    setTimeout(() => {
      setIsConnecting(false);
      setIsConnected(true);
      // setShowBluetoothModal(false); // Optionally close modal after connecting
    }, 2000);
  };

  const handleCloseModal = () => {
    setShowBluetoothModal(false);
    setIsConnecting(false);
  };

  // Start recording
  const startRecording = async () => {
    try {
      const { granted } = await Audio.requestPermissionsAsync();
      if (!granted) return alert("Permission to access microphone is required");

      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
      });

      const { recording } = await Audio.Recording.createAsync(
        Audio.RecordingOptionsPresets.HIGH_QUALITY
      );

      setRecording(recording);
    } catch (err) {
      console.error("Failed to start recording", err);
    }
  };

  // Stop recording
  const stopRecording = async () => {
    if (!recording) return;
    await recording.stopAndUnloadAsync();
    const uri = recording.getURI();
    setRecording(null);

    await sendToAssemblyAI(uri);
  };

  // Upload + transcribe with AssemblyAI
  const sendToAssemblyAI = async (uri) => {
    try {
      setLoading(true);
      setTranscript('');

      // Upload audio file using FileSystem
      const uploadRes = await FileSystem.uploadAsync(
        "https://api.assemblyai.com/v2/upload",
        uri,
        {
          headers: {
            authorization: ASSEMBLY_API_KEY,
          },
          httpMethod: "POST",
          uploadType: FileSystem.FileSystemUploadType.BINARY_CONTENT,
        }
      );

      const uploadData = JSON.parse(uploadRes.body);
      const uploadUrl = uploadData.upload_url;

      // Request transcription
      const transcriptRes = await fetch("https://api.assemblyai.com/v2/transcript", {
        method: "POST",
        headers: {
          authorization: ASSEMBLY_API_KEY,
          "content-type": "application/json",
        },
        body: JSON.stringify({ audio_url: uploadUrl }),
      });

      const data = await transcriptRes.json();

      // Poll until transcription is complete
      let transcriptData;
      do {
        await new Promise((res) => setTimeout(res, 3000));
        const checkRes = await fetch(
          `https://api.assemblyai.com/v2/transcript/${data.id}`,
          {
            headers: { authorization: ASSEMBLY_API_KEY },
          }
        );
        transcriptData = await checkRes.json();
      } while (transcriptData.status !== "completed");

      setTranscript(transcriptData.text);
    } catch (err) {
      console.error("Transcription failed", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Bluetooth Modal */}
      <Modal
        visible={showBluetoothModal}
        transparent
        animationType="fade"
        onRequestClose={handleCloseModal}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>Bluetooth Connection</Text>
            <Text style={styles.modalText}>
              This feature will allow you to connect to the FSL Glove via Bluetooth in the future.
            </Text>
            {isConnecting ? (
              <ActivityIndicator size="large" color="#E53935" style={{ marginVertical: 20 }} />
            ) : (
              <Ionicons name="bluetooth" size={48} color="#E53935" style={{ marginVertical: 20 }} />
            )}
            <TouchableOpacity style={styles.closeButton} onPress={handleCloseModal}>
              <Text style={styles.closeButtonText}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {!isConnected ? (
          <>
            {/* Show connect button and placeholders */}
            <TouchableOpacity
              style={[styles.connectButton, isConnecting && styles.connectingButton]}
              onPress={handleConnect}
              disabled={isConnecting}
            >
              {isConnecting ? (
                <ActivityIndicator color="white" size="small" />
              ) : null}
              <Text style={styles.connectButtonText}>
                {isConnecting ? 'Connecting...' : 'Connect to device'}
              </Text>
            </TouchableOpacity>

            {/* Placeholder cards */}
            <View style={styles.messageCard}>
              <View style={styles.textLinesContainer}>
                <View style={styles.shortTextLine} />
                <View style={styles.longTextLine} />
                <View style={styles.mediumTextLine} />
              </View>
              <View style={styles.avatarPlaceholder} />
            </View>
            <View style={styles.messageCard}>
              <View style={styles.textLinesContainer}>
                <View style={styles.mediumTextLine} />
                <View style={styles.longTextLine} />
                <View style={styles.shortTextLine} />
              </View>
              <View style={styles.avatarPlaceholder} />
            </View>
          </>
        ) : (
          <>
            {/* Device Card */}
            <View style={styles.deviceCard}>
              <Image
                source={require('../assets/glove.png')}
                style={styles.deviceImage}
              />
              <View style={{ flex: 1 }}>
                <Text style={styles.deviceTitle}>
                  <Text style={{ fontWeight: 'bold' }}>Echo</Text>
                  <Text style={{ fontWeight: 'bold', color: '#E53935' }}>Wear</Text> Device
                </Text>
                <View style={styles.deviceStatusRow}>
                  <Ionicons name="battery-half" size={18} color="#333" />
                  <Text style={styles.deviceBattery}>75%</Text>
                  <Text style={styles.deviceConnected}>connected</Text>
                </View>
              </View>
              {/* Removed check icon */}
            </View>

            {/* Translation Card */}
            <View style={styles.translationCard}>
              <View style={styles.translationTextContainer}>
                <Text style={styles.translationText}>FSL to speech</Text>
                <Text style={styles.translationPrompt}>Ready to translate</Text>
              </View>
              <TouchableOpacity style={styles.translationPlayButton}>
                <Ionicons name="play" size={32} color="#E53935" />
              </TouchableOpacity>
            </View>

            {/* Speech to Text Card */}
            <View style={styles.speechCard}>
              <View style={styles.speechTextContainer}>
                <Text style={styles.speechTitle}>Speech to Text</Text>
                {loading ? (
                  <>
                    <ActivityIndicator size="small" color="#E53935" style={{ marginTop: 10 }} />
                    <Text style={styles.speechPrompt}>Transcribing...</Text>
                  </>
                ) : (
                  <Text style={styles.speechPrompt}>
                    <Text style={{ fontStyle: 'italic' }}>
                      {transcript
                        ? transcript
                        : 'Press the button to start\nvoice recognition'}
                    </Text>
                  </Text>
                )}
              </View>
              <TouchableOpacity
                style={styles.speechMicButton}
                onPress={recording ? stopRecording : startRecording}
                disabled={loading}
              >
                <Ionicons
                  name={recording ? "stop" : "mic"}
                  size={28}
                  color="white"
                />
              </TouchableOpacity>
            </View>
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
  },
  content: {
    flex: 1,
    padding: 16,
  },
  connectButton: {
    backgroundColor: '#E53935',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 25,
    paddingHorizontal: 20,
    borderRadius: 8,
    marginBottom: 20,
  },
  connectingButton: {
    backgroundColor: '#c62828',
  },
  connectButtonText: {
    color: 'white',
    fontSize: 19,
    fontWeight: '600',
    marginLeft: 8,
  },
  messageCard: {
    backgroundColor: '#f0f0f0',
    borderRadius: 12,
    padding: 22,
    marginBottom: 16,
    flexDirection: 'row',
    alignItems: 'flex-start', // ensures children start at the top
    justifyContent: 'space-between', // space between text and avatar
    minHeight: 250,
    position: 'relative', // optional, for more control
  },
  textLinesContainer: {
    flex: 1,
    marginRight: 16,
    alignItems: 'flex-start', // aligns text lines to the left
    justifyContent: 'flex-start', // aligns text lines to the top
  },
  shortTextLine: {
    backgroundColor: '#d0d0d0',
    height: 14,
    borderRadius: 4,
    marginBottom: 15,
    width: '50%',
  },
  mediumTextLine: {
    backgroundColor: '#d0d0d0',
    height: 14,
    borderRadius: 4,
    marginBottom: 15,
    width: '75%',
  },
  longTextLine: {
    backgroundColor: '#d0d0d0',
    height: 14,
    borderRadius: 4,
    marginBottom: 15,
    width: '90%',
  },
  avatarPlaceholder: {
    width: 70,
    height: 70,
    borderRadius: 510,
    backgroundColor: '#c0c0c0',
    alignSelf: 'flex-end', // pushes avatar to the bottom of the card
    marginTop: 'auto',     // ensures avatar is at the bottom
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.25)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalCard: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 28,
    width: '80%',
    alignItems: 'center',
    elevation: 6,
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#E53935',
    marginBottom: 12,
  },
  modalText: {
    fontSize: 16,
    color: '#333',
    textAlign: 'center',
  },
  closeButton: {
    marginTop: 18,
    backgroundColor: '#E53935',
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 28,
  },
  closeButtonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
  deviceCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 22, // match messageCard
    marginBottom: 16, // match messageCard
    minHeight: 100, // match messageCard
    position: 'relative',
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
  },
  deviceImage: {
    width: 60,
    height: 60,
    marginRight: 14,
    resizeMode: 'contain',
  },
  deviceTitle: {
    fontSize: 18,
    marginBottom: 6,
  },
  deviceStatusRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  deviceBattery: {
    marginLeft: 6,
    marginRight: 10,
    color: '#333',
    fontWeight: '500',
  },
  deviceConnected: {
    color: '#E53935',
    fontWeight: '500',
  },
  deviceConnectButton: {
    backgroundColor: '#E53935',
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 16,
    marginLeft: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  deviceConnectButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
  translationCard: {
    backgroundColor: '#E53935',
    borderRadius: 12,
    padding: 22,
    marginBottom: 16,
    minHeight: 250,
    position: 'relative',
    // subtle shadow
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'flex-start', // <-- changed from flex-end
  },
  translationTextContainer: {
    // flex: 1, // <-- Remove this line
    alignItems: 'flex-start',
    justifyContent: 'flex-start',
    flexShrink: 1, // Optional: allows text to shrink if needed
  },
  translationText: {
    color: 'white',
    fontSize: 18,
    marginBottom: 6,
    textAlign: 'left', // <-- changed from right
    fontWeight: 'bold',
  },
  translationPrompt: {
    color: '#fff',
    fontSize: 18,
    marginBottom: 18,
    textAlign: 'left', // <-- changed from right
    fontStyle: 'italic',
    // fontWeight: 'bold',
  },
  speechCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 22,
    marginBottom: 16,
    minHeight: 250,
    position: 'relative',
    // subtle shadow
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'flex-start', // <-- changed from flex-end
  },
  speechTextContainer: {
    flex: 1,
    alignItems: 'flex-start', // <-- changed from flex-end
    justifyContent: 'flex-start',
  },
  speechTitle: {
    color: '#E53935',
    fontWeight: 'bold',
    fontSize: 20,
    marginBottom: 8,
  },
  speechPrompt: {
    color: '#888',
    fontSize: 18,
    marginBottom: 18,
  },
  speechMicButton: {
    position: 'absolute',
    right: 20,
    bottom: 20,
    backgroundColor: '#E53935',
    borderRadius: 32,
    width: 60,
    height: 60,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 2,
  },
  translationPlayButton: {
    position: 'absolute',
    right: 20,
    bottom: 20,
    backgroundColor: 'white',
    borderRadius: 32,
    width: 60,
    height: 60,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 2,
  },
  speechInput: {
    color: '#333',
    fontSize: 18,
    marginBottom: 18,
    borderBottomWidth: 1,
    borderBottomColor: '#E53935',
    width: 220,
    paddingVertical: 2,
  },
});