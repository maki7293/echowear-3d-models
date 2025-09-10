import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  FlatList,
  TouchableOpacity,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const categories = [
  { id: '1', name: 'Alphabet' },
  { id: '2', name: 'Numbers' },
  { id: '3', name: 'Basic Expressions' },
  { id: '4', name: 'Greetings & Farewells' },
  { id: '5', name: 'Time & Frequency' },
  { id: '6', name: 'Days of the Week' },
  { id: '7', name: 'Physical Appearance' },
  { id: '8', name: 'Gender & Sexuality' },
];

export default function LibraryScreen({ navigation }) {
  const renderCategory = ({ item }) => (
    <TouchableOpacity
      style={styles.categoryCard}
      activeOpacity={0.7}
      onPress={() => navigation.navigate('CategoryDetail', { category: item.name })}
    >
      <Text style={styles.categoryText}>{item.name}</Text>
      <Ionicons name="chevron-forward" size={22} color="#E53935" />
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <FlatList
        data={categories}
        renderItem={renderCategory}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fafafa',
  },
  listContent: {
    padding: 16,
    paddingTop: 15,
  },
  categoryCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    paddingVertical: 20,
    paddingHorizontal: 20,
    marginBottom: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    // subtle shadow
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  categoryText: {
    color: '#E53935',
    fontWeight: 'bold',
    fontSize: 18,
  },
});