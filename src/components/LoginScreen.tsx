import React, { useState } from 'react';
import styled from 'styled-components';
import { apiService } from '../services/api';
import { User, Company, Store, Device } from '../types';

const LoginContainer = styled.div`
  display: flex;
  width: 100%;
  height: 100%;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #1976d2 0%, #42a5f5 100%);
`;

const LoginCard = styled.div`
  background: white;
  border-radius: 12px;
  padding: 48px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
  width: 100%;
  max-width: 400px;
  text-align: center;
`;

const Logo = styled.h1`
  color: #1976d2;
  font-size: 32px;
  font-weight: 700;
  margin: 0 0 8px 0;
`;

const Subtitle = styled.p`
  color: #666;
  font-size: 16px;
  margin: 0 0 32px 0;
`;

const FormGroup = styled.div`
  margin-bottom: 24px;
  text-align: left;
`;

const Label = styled.label`
  display: block;
  font-size: 14px;
  font-weight: 500;
  color: #333;
  margin-bottom: 8px;
`;

const Input = styled.input`
  width: 100%;
  padding: 12px 16px;
  border: 2px solid #e0e0e0;
  border-radius: 8px;
  font-size: 16px;
  transition: border-color 0.2s;
  box-sizing: border-box;

  &:focus {
    outline: none;
    border-color: #1976d2;
  }

  &:disabled {
    background-color: #f5f5f5;
    cursor: not-allowed;
  }
`;

const LoginButton = styled.button`
  width: 100%;
  padding: 14px;
  background: #1976d2;
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 16px;
  font-weight: 500;
  cursor: pointer;
  transition: background-color 0.2s;

  &:hover:not(:disabled) {
    background: #1565c0;
  }

  &:disabled {
    background: #ccc;
    cursor: not-allowed;
  }
`;

const ErrorMessage = styled.div`
  color: #f44336;
  font-size: 14px;
  margin-top: 16px;
  padding: 12px;
  background: #ffebee;
  border-radius: 4px;
  border-left: 4px solid #f44336;
`;

const QuickLoginSection = styled.div`
  margin-top: 32px;
  padding-top: 24px;
  border-top: 1px solid #e0e0e0;
`;

const QuickLoginTitle = styled.h3`
  font-size: 14px;
  color: #666;
  margin: 0 0 16px 0;
  font-weight: 500;
`;

const QuickLoginButton = styled.button`
  width: 100%;
  padding: 12px;
  background: #f5f5f5;
  color: #333;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  font-size: 14px;
  cursor: pointer;
  transition: background-color 0.2s;

  &:hover {
    background: #eeeeee;
  }
`;

interface LoginScreenProps {
  onLogin: (user: User, company: Company, store: Store, device: Device) => void;
}

export const LoginScreen: React.FC<LoginScreenProps> = ({ onLogin }) => {
  console.log('🔐 LoginScreen component rendering...');
  
  const [userNumber, setUserNumber] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!userNumber || !password) {
      setError('Please enter both user number and password');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const response = await apiService.login({
        userNumber,
        password
      });

      if (response.success && response.data) {
        onLogin(
          response.data.user,
          response.data.company,
          response.data.store,
          response.data.device
        );
      } else {
        setError(response.error?.message || 'Login failed');
      }
    } catch (err) {
      setError('Network error. Please check your connection.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuickLogin = () => {
    setUserNumber('1');
    setPassword('111');
    setError('');
  };

  return (
    <LoginContainer>
      <LoginCard>
        <Logo>LAS POS</Logo>
        <Subtitle>Point of Sale System</Subtitle>

        <form onSubmit={handleSubmit}>
          <FormGroup>
            <Label htmlFor="userNumber">User Number</Label>
            <Input
              id="userNumber"
              type="text"
              value={userNumber}
              onChange={(e) => setUserNumber(e.target.value)}
              disabled={isLoading}
              placeholder="Enter your user number"
              autoFocus
            />
          </FormGroup>

          <FormGroup>
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={isLoading}
              placeholder="Enter your password"
            />
          </FormGroup>

          <LoginButton type="submit" disabled={isLoading}>
            {isLoading ? 'Signing In...' : 'Sign In'}
          </LoginButton>
        </form>

        {error && <ErrorMessage>{error}</ErrorMessage>}

        <QuickLoginSection>
          <QuickLoginTitle>Development Quick Login</QuickLoginTitle>
          <QuickLoginButton type="button" onClick={handleQuickLogin}>
            Use Demo Credentials (User: 1, Password: 111)
          </QuickLoginButton>
        </QuickLoginSection>
      </LoginCard>
    </LoginContainer>
  );
};
