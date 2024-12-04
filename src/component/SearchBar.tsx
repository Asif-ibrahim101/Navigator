// src/components/SearchBar.tsx
import React, { useState } from 'react';
import { 
  View, 
  TextInput, 
  StyleSheet, 
  TouchableOpacity, 
  Text, 
  Keyboard,
  ActivityIndicator 
} from 'react-native';
import * as ExpoLocation from 'expo-location';
import { NavigationLocation } from '../types';

interface SearchBarProps {
  onLocationSelect: (location: NavigationLocation) => void;
  isLoading: boolean;
}

export const SearchBar: React.FC<SearchBarProps> = ({
  onLocationSelect,
  isLoading
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  const handleSearch = async (text: string) => {
    setSearchQuery(text);
    
    if (text.length > 2) {
      setIsSearching(true);
      try {
        const results = await ExpoLocation.geocodeAsync(text);
        const processedResults = await Promise.all(
          results.map(async (result) => {
            const [address] = await ExpoLocation.reverseGeocodeAsync({
              latitude: result.latitude,
              longitude: result.longitude,
            });
            
            return {
              ...result,
              displayName: address ? 
                `${address.name || ''} ${address.street || ''} ${address.city || ''}`.trim() :
                'Unknown location'
            };
          })
        );
        setSearchResults(processedResults);
      } catch (error) {
        console.error('Error searching:', error);
      } finally {
        setIsSearching(false);
      }
    } else {
      setSearchResults([]);
    }
  };

  const handleResultSelect = (result: any) => {
    onLocationSelect({
      latitude: result.latitude,
      longitude: result.longitude
    });
    setSearchQuery('');
    setSearchResults([]);
    Keyboard.dismiss();
  };

  return (
    <View style={styles.container}>
      <View style={styles.searchBox}>
        <TextInput
          style={styles.input}
          value={searchQuery}
          onChangeText={handleSearch}
          placeholder="Search for a destination..."
          editable={!isLoading}
          accessibilityLabel="Search destination"
          accessibilityHint="Enter a location name or address"
        />
        {isSearching && (
          <ActivityIndicator style={styles.loadingIndicator} />
        )}
      </View>
      
      {searchResults.length > 0 && (
        <View style={styles.resultsList}>
          {searchResults.map((result, index) => (
            <TouchableOpacity
              key={index}
              style={styles.resultItem}
              onPress={() => handleResultSelect(result)}
              accessibilityRole="button"
              accessibilityLabel={`Select ${result.displayName}`}
            >
              <Text style={styles.resultText}>{result.displayName}</Text>
            </TouchableOpacity>
          ))}
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 50,
    left: 16,
    right: 16,
    zIndex: 1,
  },
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  input: {
    flex: 1,
    height: 50,
    paddingHorizontal: 16,
    fontSize: 16,
  },
  loadingIndicator: {
    marginRight: 16,
  },
  resultsList: {
    marginTop: 8,
    backgroundColor: 'white',
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
    maxHeight: 200,
  },
  resultItem: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  resultText: {
    fontSize: 16,
  },
});