# Memory Game

A feature-rich memory game built with [Expo](https://expo.dev/) and React Native. Flip cards to find matching pairs with customizable content types!

## Features

- **Flexible Grid**: 2-12 pairs of cards (configurable)
- **Three Content Types**: 
  - **Emoji cards** with extensive emoji library (100+ emojis)
  - **Image cards** from camera or photo library with square aspect ratio editing
  - **Sound cards** with custom recordings or imported audio files
- **Advanced Configuration**: 
  - Cards Configuration panel for detailed setup
  - Reorder pairs with up/down arrow controls
  - Preview and test sounds before playing
  - Reset configuration to defaults
  - Responsive design that adapts to screen size
- **Game Features**:
  - Timer tracking with automatic stop on win
  - Match counter showing pairs found
  - Win detection with celebration message
  - Automatic sound playback when sound cards are flipped
  - Busy state prevention during card animations
  - Debug configuration panel for troubleshooting
- **Image Management**:
  - Choose multiple images from photo library
  - Take photos with camera
  - Image editing with square aspect ratio
  - Fallback to default emojis when insufficient images
- **Sound Management**:
  - Record custom audio with high quality settings
  - Import audio files from device
  - Playback controls with automatic cleanup
  - Visual indicators for recorded vs imported sounds

## Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) (LTS recommended)
- [Expo CLI](https://docs.expo.dev/get-started/installation/)

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/your-username/memory-game.git
   cd memory-game
   ```

2. Install dependencies:
   ```bash
   npm install
   # or
   yarn install
   ```

3. Start the Expo development server:
   ```bash
   npx expo start
   # or
   yarn expo start
   ```

4. Use the Expo Go app on your phone, or an emulator, to run the app.

## Project Structure

- `App.js` — Main application file with game logic
- `CardsConfiguration.js` — Configuration panel for customizing pairs
- `assets/` — App icons and images
- `package.json` — Project dependencies and scripts

## Dependencies

- `expo-av` — Audio recording and playback with high-quality settings
- `expo-document-picker` — File selection for sounds and audio files
- `expo-image-picker` — Image selection, camera access, and photo editing
- `@react-native-picker/picker` — UI picker components for configuration
- `expo-status-bar` — Status bar management
- `react-native-web` — Web platform support

## Permissions

The app requests the following permissions:
- **Camera**: For taking photos
- **Photo Library**: For selecting images
- **Microphone**: For recording sounds
- **File Access**: For importing audio files

## License

This project is open source and available under the [MIT License](LICENSE).