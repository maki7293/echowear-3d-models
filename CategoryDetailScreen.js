import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  FlatList,
  Image,
  TouchableOpacity,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

// Dummy data for demonstration
const signsData = {
  'Alphabet': [
    { id: 'a', name: 'A', image: require('../assets/signs/a.png'), model: 'https://raw.githubusercontent.com/maki7293/echowear-3d-models/main/1.glb' },
    { id: 'b', name: 'B', image: require('../assets/signs/b.png'), model: 'https://raw.githubusercontent.com/maki7293/echowear-3d-models/main/1.glb' },
    { id: 'c', name: 'C', image: require('../assets/signs/c.png'), model: 'https://raw.githubusercontent.com/maki7293/echowear-3d-models/main/1.glb' },
    // ...add more
  ],
  'Numbers': [
    { id: '1', name: 'One', image: require('../assets/signs/1..png'), model: 'https://raw.githubusercontent.com/maki7293/echowear-3d-models/main/1.glb' },
    { id: '2', name: 'Two', image: require('../assets/signs/2..png'), model: 'https://raw.githubusercontent.com/maki7293/echowear-3d-models/main/1.glb' },
    { id: '3', name: 'Three', image: require('../assets/signs/3..png'), model: 'https://raw.githubusercontent.com/maki7293/echowear-3d-models/main/1.glb' },
    // ...add more
  ],
  // ...add more categories
};

export default function CategoryDetailScreen({ route, navigation }) {
  const { category } = route.params;
  const signs = signsData[category] || [];

  const renderSign = ({ item }) => {
    const modelUrl = item.model;
    return (
      <TouchableOpacity
        style={styles.signCard}
        onPress={() => navigation.navigate('Sign3DModel', { sign: item })}
      >
        <Image source={item.image} style={styles.signImage} />
        <Text style={styles.signName}>{item.name}</Text>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header Row */}
      <View style={styles.headerRow}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color="#E53935" />
          <Text style={styles.backText}>Back</Text>
        </TouchableOpacity>
        <Text style={styles.header}>{category}</Text>
      </View>
      <FlatList
        data={signs}
        renderItem={renderSign}
        keyExtractor={item => item.id}
        numColumns={3}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
      />
      {signs.length === 0 && (
        <View style={styles.emptyState}>
          <Text>No signs available in this category.</Text>
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fafafa',
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    marginTop: 12,
    marginBottom: 12,
    position: 'relative',
    height: 40,
    justifyContent: 'center',
  },
  backButton: {
    position: 'absolute',
    left: 12,
    flexDirection: 'row',
    alignItems: 'center',
    zIndex: 1,
  },
  backText: {
    color: '#E53935',
    fontWeight: 'bold',
    fontSize: 16,
    marginLeft: 4,
  },
  header: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#222',
    position: 'absolute',
    left: 0,
    right: 0,
    textAlign: 'center',
  },
  listContent: {
    paddingHorizontal: 12,
    paddingBottom: 16,
  },
  signCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    margin: 6,
    flex: 1,
    aspectRatio: 1, // Square
    maxWidth: '30%', // 3 per row
    // subtle shadow
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  signImage: {
    width: 48,
    height: 48,
    marginBottom: 8,
    resizeMode: 'contain',
  },
  signName: {
    color: '#E53935',
    fontWeight: 'bold',
    fontSize: 16,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});