
import React, { useState } from 'react';
import SignInForm from './SignInForm';
import SignUpForm from './SignUpForm';

type AuthMode = 'signIn' | 'signUp';

const AuthPage: React.FC = () => {
  const [mode, setMode] = useState<AuthMode>('signIn');

  const switchMode = (newMode: AuthMode) => {
    setMode(newMode);
  };

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="w-full max-w-6xl mx-auto p-8">
        <div className="bg-white rounded-2xl shadow-2xl flex flex-col md:flex-row overflow-hidden">
          <div className="w-full md:w-1/2 p-12 flex flex-col justify-center bg-pink-50">
            <h1 className="text-5xl font-bold text-pink-500 mb-4">
              Welcome to <br /> ChitChat App
            </h1>
            <p className="text-gray-600">
              Connect with friends and family through our modern chat platform. Experience seamless messaging with real-time updates and an intuitive interface.
            </p>
          </div>
          <div className="w-full md:w-1/2 p-12">
            {mode === 'signIn' ? (
              <SignInForm onSwitchToSignUp={() => switchMode('signUp')} />
            ) : (
              <SignUpForm onSwitchToSignIn={() => switchMode('signIn')} />
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthPage;
