import React, { useState } from 'react';
import { StyleSheet, Text, View, Button, ScrollView, Platform, TouchableOpacity, Image, Dimensions, Alert, SafeAreaView } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import * as ImagePicker from 'expo-image-picker';
import * as DocumentPicker from 'expo-document-picker';
import { Audio } from 'expo-av';

export default function CardsConfiguration({ onBack, pairsConfiguration, onUpdateConfiguration, initialConfiguration }) {
  const screenWidth = Dimensions.get('window').width;
  const isSmallScreen = screenWidth < 600; // Hide pair number column on screens smaller than 600px
  const [recording, setRecording] = useState(null);
  const [recordingIndex, setRecordingIndex] = useState(null);
  const [sound, setSound] = useState(null);

  const availableEmojis = [
    '🐶', '🐱', '🦊', '🐻', '🐼', '🐸', '🦁', '🐵', '🐯', '🐨', '🦄', '🐙',
    '🐷', '🐮', '🐷', '🐸', '🐙', '🦋', '🐞', '🐜', '🦗', '🕷️', '🦂', '🐢',
    '🐍', '🦎', '🐊', '🐅', '🐆', '🦓', '🦍', '🦧', '🐘', '🦛', '🦏', '🐪',
    '🐫', '🦒', '🦘', '🐃', '🐂', '🐄', '🐎', '🐖', '🐏', '🐑', '🐐', '🦌',
    '🐕', '🐩', '🦮', '🐕‍🦺', '🐈', '🐈‍⬛', '🐓', '🦃', '🦚', '🦜', '🦢', '🦩',
    '🦨', '🦡', '🦫', '🦦', '🦥', '🐁', '🐀', '🐇', '🐿️', '🦔', '🐉', '🐲',
    '🌵', '🎄', '🌲', '🌳', '🌴', '🌱', '🌿', '☘️', '🍀', '🎍', '🎋', '🍃',
    '🍂', '🍁', '🍄', '🌾', '💐', '🌷', '🌹', '🥀', '🌺', '🌻', '🌼', '🌸',
    '🌼', '🌻', '🌺', '🌹', '🌷', '🌼', '🌻', '🌺', '🌹', '🌷', '🌻'
  ];

  const updateContent = (index, newContent) => {
    const updatedConfiguration = [...pairsConfiguration];
    updatedConfiguration[index].content = newContent;
    onUpdateConfiguration(updatedConfiguration);
  };

  const updateType = (index, newType) => {
    const updatedConfiguration = [...pairsConfiguration];
    updatedConfiguration[index].type = newType;
    // Reset content when switching types
    if (newType === 'emoji') {
      updatedConfiguration[index].content = availableEmojis[0];
    } else if (newType === 'image') {
      updatedConfiguration[index].content = null; // Will be set when image is picked
    } else if (newType === 'sound') {
      updatedConfiguration[index].content = null; // Will be set when sound is picked
    }
    onUpdateConfiguration(updatedConfiguration);
  };

  const startRecording = async (index) => {
    try {
      // Request permissions
      const { status } = await Audio.requestPermissionsAsync();
      if (status !== 'granted') {
        alert('Sorry, we need recording permissions to make this work!');
        return;
      }

      // Configure audio mode
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
      });

      // Start recording
      const { recording } = await Audio.Recording.createAsync(
        Audio.RecordingOptionsPresets.HIGH_QUALITY
      );
      setRecording(recording);
      setRecordingIndex(index);
      alert('Recording started. Tap "Stop Recording" when done.');
    } catch (err) {
      console.error('Failed to start recording', err);
      alert('Failed to start recording');
    }
  };

  const stopRecording = async (index) => {
    if (!recording) return;

    try {
      await recording.stopAndUnloadAsync();
      const uri = recording.getURI();
      setRecording(null);
      setRecordingIndex(null);
      
      // Update the configuration with the recorded sound
      const updatedConfiguration = [...pairsConfiguration];
      updatedConfiguration[index].content = { uri, type: 'recorded' };
      onUpdateConfiguration(updatedConfiguration);
      
      alert('Recording saved!');
    } catch (err) {
      console.error('Failed to stop recording', err);
      alert('Failed to stop recording');
    }
  };

  const pickSoundFile = async (index) => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: 'audio/*',
        copyToCacheDirectory: true,
      });

      if (!result.canceled && result.assets[0]) {
        const soundUri = result.assets[0].uri;
        const updatedConfiguration = [...pairsConfiguration];
        updatedConfiguration[index].content = { uri: soundUri, type: 'file' };
        onUpdateConfiguration(updatedConfiguration);
        alert('Sound file selected!');
      }
    } catch (err) {
      console.error('Failed to pick sound file', err);
      alert('Failed to pick sound file');
    }
  };

  const playSound = async (soundData) => {
    if (!soundData || !soundData.uri) return;

    try {
      const { sound } = await Audio.Sound.createAsync({ uri: soundData.uri });
      setSound(sound);
      await sound.playAsync();
      
      // Unload sound after playing
      sound.setOnPlaybackStatusUpdate((status) => {
        if (status.didJustFinish) {
          sound.unloadAsync();
          setSound(null);
        }
      });
    } catch (err) {
      console.error('Failed to play sound', err);
      alert('Failed to play sound');
    }
  };

  const removeSound = (index) => {
    const updatedConfiguration = [...pairsConfiguration];
    updatedConfiguration[index].content = null;
    onUpdateConfiguration(updatedConfiguration);
  };

  const pickImage = async (index) => {
    // Request permissions first
    const libraryPermission = await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (libraryPermission.status !== 'granted') {
      alert('Sorry, we need library permissions to make this work!');
      return;
    }

    let result;

    if (Platform.OS === 'web') {
      result = await selectImageFromDisk(libraryPermission);
    } else {
      // Request permissions first
      const cameraPermission = await ImagePicker.requestCameraPermissionsAsync();

      if (cameraPermission.status !== 'granted') {
        alert('Sorry, we need camera permissions to make this work!');
        return;
      }

      // Show action sheet to choose between camera and photo library
      const options = ['Cancel', 'Take Photo', 'Choose from Library'];
      const cancelButtonIndex = 0;
      const cameraButtonIndex = 1;
      const libraryButtonIndex = 2;

      // For React Native, we'll use a simple alert with options
      // In a real app, you might want to use a proper action sheet library
      const choice = await new Promise((resolve) => {
        Alert.alert(
          'Select Image',
          'Choose how you want to add an image',
          [
            { text: 'Cancel', onPress: () => resolve('cancel'), style: 'cancel' },
            { text: 'Take Photo', onPress: () => resolve('camera') },
            { text: 'Choose from Library', onPress: () => resolve('library') }
          ]
        );
      });

      if (choice === 'cancel') return;

    

      if (choice === 'camera') {
        if (cameraPermission.status !== 'granted') {
          alert('Camera permission is required to take photos');
          return;
        }

        result = await ImagePicker.launchCameraAsync({
          mediaTypes: ImagePicker.MediaTypeOptions.Images,
          quality: 1,
          allowsEditing: true,
          aspect: [1, 1], // Square aspect ratio for better card display
        });
      } else if (choice === 'library') {
        result = await selectImageFromDisk(libraryPermission);
      }
    }

    if (result && !result.canceled) {
      const imageUri = result.assets[0].uri;
      const updatedConfiguration = [...pairsConfiguration];
      updatedConfiguration[index].content = imageUri;
      onUpdateConfiguration(updatedConfiguration);
    }
  };

  const selectImageFromDisk = async (libraryPermission) => {
    if (libraryPermission.status !== 'granted') {
      alert('Media library permission is required to select photos');
      return;
    }

    return await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsMultipleSelection: false,
      quality: 1,
      allowsEditing: true,
      aspect: [1, 1], // Square aspect ratio for better card display
    });
  }

  const movePairUp = (index) => {
    if (index > 0) {
      const updatedConfiguration = [...pairsConfiguration];
      const temp = updatedConfiguration[index];
      updatedConfiguration[index] = updatedConfiguration[index - 1];
      updatedConfiguration[index - 1] = temp;
      onUpdateConfiguration(updatedConfiguration);
    }
  };
  const movePairDown = (index) => {
    if (index < pairsConfiguration.length - 1) {
      const updatedConfiguration = [...pairsConfiguration];
      const temp = updatedConfiguration[index];
      updatedConfiguration[index] = updatedConfiguration[index + 1];
      updatedConfiguration[index + 1] = temp;
      onUpdateConfiguration(updatedConfiguration);
    }
  };

  const resetConfiguration = () => {
    onUpdateConfiguration([...initialConfiguration]);
  };

  const renderContentPicker = (item, index) => {
    if (item.type === 'emoji') {
      return (
        <View style={styles.pickerContainer}>
          <Picker
            selectedValue={item.content}
            onValueChange={(value) => updateContent(index, value)}
            style={styles.picker}
            mode={Platform.OS === 'android' ? 'dropdown' : 'default'}
          >
            {availableEmojis.map((emoji, emojiIndex) => (
              <Picker.Item key={emojiIndex} label={emoji} value={emoji} />
            ))}
          </Picker>
        </View>
      );
    } else if (item.type === 'image') {
      return (
        <View style={styles.imagePickerContainer}>
          {item.content ? (
            <View style={styles.imagePreviewContainer}>
              <Image source={{ uri: item.content }} style={styles.imagePreview} />
              <TouchableOpacity
                style={styles.changeImageButton}
                onPress={() => pickImage(index)}
              >
                <Text style={styles.changeImageText}>Change</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <TouchableOpacity
              style={styles.pickImageButton}
              onPress={() => pickImage(index)}
            >
              <Text style={styles.pickImageText}>Pick Image</Text>
            </TouchableOpacity>
          )}
        </View>
      );
    } else if (item.type === 'sound') {
      return (
        <View style={styles.soundPickerContainer}>
          {item.content ? (
            <View style={styles.soundPreviewContainer}>
              <Text style={styles.soundLabel}>
                {item.content.type === 'recorded' ? '🎤 Recorded' : '📁 File'}
              </Text>
              <View style={styles.soundActions}>
                <TouchableOpacity
                  style={styles.playSoundButton}
                  onPress={() => playSound(item.content)}
                >
                  <Text style={styles.playSoundText}>▶️</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.removeSoundButton}
                  onPress={() => removeSound(index)}
                >
                  <Text style={styles.removeSoundText}>🗑️</Text>
                </TouchableOpacity>
              </View>
            </View>
          ) : (
            <View style={styles.soundPickerButtons}>
              <TouchableOpacity
                style={styles.recordSoundButton}
                onPress={() => startRecording(index)}
              >
                <Text style={styles.recordSoundText}>🎤 Record</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.pickSoundButton}
                onPress={() => pickSoundFile(index)}
              >
                <Text style={styles.pickSoundText}>📁 Pick File</Text>
              </TouchableOpacity>
            </View>
          )}
          {recording && recordingIndex === index && (
            <TouchableOpacity
              style={styles.stopRecordingButton}
              onPress={() => stopRecording(index)}
            >
              <Text style={styles.stopRecordingText}>⏹️ Stop Recording</Text>
            </TouchableOpacity>
          )}
        </View>
      );
    }
    return null;
  };

  return (
    <SafeAreaView style={styles.configContainer}>
      <Text style={styles.configTitle}>CARDS CONFIGURATION</Text>

      <View style={styles.tableWrapper}>
        <View style={styles.tableHeader}>
          {!isSmallScreen && <Text style={styles.headerCell}>Pair number</Text>}
          <Text style={styles.headerCell}>Type</Text>
          <Text style={styles.headerCell}>Content</Text>
          <Text style={styles.headerCell}>Actions</Text>
        </View>

        <ScrollView
          style={styles.tableScrollView}
          contentContainerStyle={styles.tableContentContainer}
          showsVerticalScrollIndicator={true}
        >
          {pairsConfiguration.map((item, index) => (
            <View key={index} style={styles.tableRow}>
              {!isSmallScreen && <Text style={styles.cell}>{index + 1}</Text>}
              <View style={styles.typePickerContainer}>
                <Picker
                  selectedValue={item.type}
                  onValueChange={(value) => updateType(index, value)}
                  style={styles.typePicker}
                  mode={Platform.OS === 'android' ? 'dropdown' : 'default'}
                >
                  <Picker.Item label="Emoji" value="emoji" />
                  <Picker.Item label="Image" value="image" />
                  <Picker.Item label="Sound" value="sound" />
                </Picker>
              </View>
              {renderContentPicker(item, index)}
              <View style={styles.actionsContainer}>
                <TouchableOpacity
                  style={[styles.actionButton, index === 0 && styles.actionButtonDisabled]}
                  onPress={() => movePairUp(index)}
                  disabled={index === 0}
                >
                  <Text style={[styles.actionButtonText, index === 0 && styles.actionButtonTextDisabled]}>↑</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.actionButton, index === pairsConfiguration.length - 1 && styles.actionButtonDisabled]}
                  onPress={() => movePairDown(index)}
                  disabled={index === pairsConfiguration.length - 1}
                >
                  <Text style={[styles.actionButtonText, index === pairsConfiguration.length - 1 && styles.actionButtonTextDisabled]}>↓</Text>
                </TouchableOpacity>
              </View>
            </View>
          ))}
        </ScrollView>
      </View>

      <View style={styles.resetButtonContainer}>
        <Button
          onPress={resetConfiguration}
          title="Reset Configuration"
          accessibilityLabel="Reset Configuration"
          color="#FF3B30"
        />
      </View>

      <View style={styles.backButtonContainer}>
        <Button
          onPress={onBack}
          title="Back to Game"
          accessibilityLabel="Back to Game"
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  configContainer: {
    flex: 1,
    backgroundColor: '#fff',
    paddingTop: Platform.OS === 'android' ? 50 : 40,
    paddingHorizontal: 20,
    paddingBottom: Platform.OS === 'android' ? 20 : 0, // Add bottom padding for Android navigation buttons
  },
  configTitle: {
    fontSize: 32,
    fontWeight: 'bold',
    marginBottom: 30,
    textAlign: 'center',
  },
  tableWrapper: {
    flex: 1,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    overflow: 'hidden',
  },
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: '#f0f0f0',
    paddingVertical: 12,
    borderBottomWidth: 2,
    borderBottomColor: '#ccc',
  },
  headerCell: {
    flex: 1,
    textAlign: 'center',
    fontWeight: 'bold',
    fontSize: 16,
    color: '#333',
  },
  tableScrollView: {
    flex: 1,
  },
  tableContentContainer: {
    paddingBottom: 10,
  },
  tableRow: {
    flexDirection: 'row',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    alignItems: 'center',
    minHeight: 80,
  },
  cell: {
    flex: 1,
    textAlign: 'center',
    fontSize: 14,
    color: '#333',
  },
  typePickerContainer: {
    flex: 1,
    minHeight: 50,
    justifyContent: 'center',
  },
  typePicker: {
    height: Platform.OS === 'android' ? 50 : 50,
    width: '100%',
    backgroundColor: Platform.OS === 'android' ? 'transparent' : undefined,
  },
  pickerContainer: {
    flex: 1,
    minHeight: 50,
    justifyContent: 'center',
  },
  picker: {
    height: Platform.OS === 'android' ? 50 : 50,
    width: '100%',
    backgroundColor: Platform.OS === 'android' ? 'transparent' : undefined,
  },
  imagePickerContainer: {
    flex: 1,
    minHeight: 50,
    justifyContent: 'center',
    alignItems: 'center',
  },
  pickImageButton: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 6,
  },
  pickImageText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '500',
  },
  imagePreviewContainer: {
    alignItems: 'center',
  },
  imagePreview: {
    width: 40,
    height: 40,
    borderRadius: 4,
    marginBottom: 4,
  },
  changeImageButton: {
    backgroundColor: '#34C759',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 4,
  },
  changeImageText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '500',
  },
  resetButtonContainer: {
    marginTop: 20,
    marginBottom: 10,
  },
  backButtonContainer: {
    marginTop: 10,
    marginBottom: Platform.OS === 'android' ? 40 : 20, // Extra bottom margin for Android
  },
  actionsContainer: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
  },
  actionButton: {
    backgroundColor: '#007AFF',
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  actionButtonDisabled: {
    backgroundColor: '#ccc',
  },
  actionButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  actionButtonTextDisabled: {
    color: '#999',
  },
  soundPickerContainer: {
    flex: 1,
    minHeight: 50,
    justifyContent: 'center',
    alignItems: 'center',
  },
  soundPreviewContainer: {
    backgroundColor: '#f0f0f0',
    padding: 10,
    borderRadius: 6,
    alignItems: 'center',
  },
  soundLabel: {
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  soundActions: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
  },
  playSoundButton: {
    backgroundColor: '#4CAF50',
    padding: 8,
    borderRadius: 5,
  },
  playSoundText: {
    color: 'white',
    fontSize: 20,
  },
  removeSoundButton: {
    backgroundColor: '#FF3B30',
    padding: 8,
    borderRadius: 5,
  },
  removeSoundText: {
    color: 'white',
    fontSize: 20,
  },
  soundPickerButtons: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
  },
  recordSoundButton: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 6,
  },
  recordSoundText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '500',
  },
  pickSoundButton: {
    backgroundColor: '#4CAF50',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 6,
  },
  pickSoundText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '500',
  },
  stopRecordingButton: {
    backgroundColor: '#FF9500',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 6,
    marginTop: 10,
  },
  stopRecordingText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '500',
  },
});
