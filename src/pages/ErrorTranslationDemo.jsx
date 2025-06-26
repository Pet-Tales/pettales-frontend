import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useErrorTranslation } from '@/utils/errorMapper';

/**
 * Demo page to test error translation functionality
 */
const ErrorTranslationDemo = () => {
  const { t, i18n } = useTranslation();
  const translateError = useErrorTranslation();
  const [testError, setTestError] = useState('');
  const [translatedError, setTranslatedError] = useState('');

  // Sample backend error messages to test
  const sampleErrors = [
    'Invalid email or password',
    'Email already exists',
    'Password must be at least 6 characters',
    'Please verify your email before logging in',
    'Session expired',
    'Internal server error',
    'Network error',
    'Too many requests',
    'Invalid token',
    'Email verification failed',
  ];

  const handleTestError = (errorMessage) => {
    setTestError(errorMessage);
    const translated = translateError(errorMessage);
    setTranslatedError(translated);
  };

  const changeLanguage = (lang) => {
    i18n.changeLanguage(lang);
    // Re-translate current error if any
    if (testError) {
      const translated = translateError(testError);
      setTranslatedError(translated);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Error Translation Demo
          </h1>
          <p className="text-lg text-gray-600">
            Test how backend error messages are translated to localized frontend messages
          </p>
        </div>

        {/* Language Switcher */}
        <div className="mb-8 text-center">
          <h2 className="text-xl font-semibold mb-4">Current Language: {i18n.language}</h2>
          <div className="space-x-4">
            <button
              onClick={() => changeLanguage('en')}
              className={`px-4 py-2 rounded ${
                i18n.language === 'en' 
                  ? 'bg-blue-500 text-white' 
                  : 'bg-gray-200 text-gray-700'
              }`}
            >
              English
            </button>
            <button
              onClick={() => changeLanguage('es')}
              className={`px-4 py-2 rounded ${
                i18n.language === 'es' 
                  ? 'bg-blue-500 text-white' 
                  : 'bg-gray-200 text-gray-700'
              }`}
            >
              Español
            </button>
          </div>
        </div>

        {/* Error Testing Section */}
        <div className="bg-white rounded-lg shadow p-6 mb-8">
          <h2 className="text-2xl font-semibold mb-4">Test Error Messages</h2>
          <p className="text-gray-600 mb-4">
            Click on any error message below to see how it gets translated:
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            {sampleErrors.map((error, index) => (
              <button
                key={index}
                onClick={() => handleTestError(error)}
                className="text-left p-3 border border-gray-300 rounded hover:bg-gray-50 transition-colors"
              >
                <span className="text-sm text-gray-500">Backend Error:</span>
                <div className="font-mono text-sm text-red-600">{error}</div>
              </button>
            ))}
          </div>

          {/* Results */}
          {testError && (
            <div className="border-t pt-6">
              <h3 className="text-lg font-semibold mb-4">Translation Result</h3>
              
              <div className="space-y-4">
                <div className="bg-red-50 border border-red-200 rounded p-4">
                  <div className="text-sm text-red-600 font-semibold mb-1">
                    Original Backend Error:
                  </div>
                  <div className="font-mono text-red-800">{testError}</div>
                </div>

                <div className="bg-green-50 border border-green-200 rounded p-4">
                  <div className="text-sm text-green-600 font-semibold mb-1">
                    Translated Frontend Message ({i18n.language}):
                  </div>
                  <div className="text-green-800">{translatedError}</div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* How It Works */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-2xl font-semibold mb-4">How It Works</h2>
          <div className="space-y-4 text-gray-700">
            <div>
              <h3 className="font-semibold">1. Error Mapping</h3>
              <p>Backend error messages are mapped to translation keys using pattern matching.</p>
            </div>
            <div>
              <h3 className="font-semibold">2. Translation</h3>
              <p>Translation keys are converted to localized messages using react-i18next.</p>
            </div>
            <div>
              <h3 className="font-semibold">3. Fallback</h3>
              <p>If no translation is found, the original error message is displayed.</p>
            </div>
            <div>
              <h3 className="font-semibold">4. Toast Integration</h3>
              <p>The useAuthErrorHandler hook automatically shows translated errors in toast notifications.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ErrorTranslationDemo;
