// src/utils/errorHandler.ts
import { Alert } from 'react-native';

export const handleError = (error: Error, context: string) => {
  console.error(`Error in ${context}:`, error);
  
  Alert.alert(
    'Navigation Error',
    getErrorMessage(error, context),
    [{ text: 'OK' }]
  );
};

const getErrorMessage = (error: Error, context: string): string => {
  switch (context) {
    case 'location':
      return 'Unable to access your location. Please check your device settings.';
    case 'navigation':
      return 'Unable to calculate a route. Please try a different destination.';
    case 'accessibility':
      return 'Unable to find an accessible route. Please adjust your preferences or try a different destination.';
    default:
      return 'An unexpected error occurred. Please try again.';
  }
};