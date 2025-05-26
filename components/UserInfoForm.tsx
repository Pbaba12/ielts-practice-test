
import React, { useState } from 'react';
import { UserInfo } from '../types';
import { Card, CardTitle, CardContent } from './ui/Card';
import { Button } from './ui/Button';

interface UserInfoFormProps {
  onUserInfoSubmit: (userInfo: UserInfo) => void;
}

interface FormErrors {
  firstName?: string;
  lastName?: string;
  email?: string;
  phone?: string;
}

export const UserInfoForm: React.FC<UserInfoFormProps> = ({ onUserInfoSubmit }) => {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [errors, setErrors] = useState<FormErrors>({});

  const validate = (): boolean => {
    const newErrors: FormErrors = {};
    if (!firstName.trim()) newErrors.firstName = 'First name is required.';
    if (!lastName.trim()) newErrors.lastName = 'Last name is required.';
    if (!email.trim()) {
      newErrors.email = 'Email is required.';
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      newErrors.email = 'Email address is invalid.';
    }
    // Basic phone validation (optional) - e.g., at least 7 digits if provided
    if (phone.trim() && !/^\+?[0-9\s-]{7,}$/.test(phone)) {
        newErrors.phone = 'Phone number format is invalid.';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validate()) {
      onUserInfoSubmit({ firstName, lastName, email, phone });
    }
  };

  const inputClass = "w-full p-3 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-primary focus:border-primary transition-colors duration-150 ease-in-out";
  const errorClass = "text-red-500 text-sm mt-1";

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 p-4">
      <Card className="w-full max-w-lg">
        <CardTitle className="text-center">Welcome to IELTS Master Prep</CardTitle>
        <CardContent>
          <p className="text-gray-600 mb-6 text-center">Please enter your details to proceed with the practice test.</p>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="firstName" className="block text-sm font-medium text-gray-700 mb-1">First Name</label>
              <input
                type="text"
                id="firstName"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                className={inputClass}
                aria-describedby="firstNameError"
                aria-invalid={!!errors.firstName}
              />
              {errors.firstName && <p id="firstNameError" className={errorClass}>{errors.firstName}</p>}
            </div>
            <div>
              <label htmlFor="lastName" className="block text-sm font-medium text-gray-700 mb-1">Last Name</label>
              <input
                type="text"
                id="lastName"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                className={inputClass}
                aria-describedby="lastNameError"
                aria-invalid={!!errors.lastName}
              />
              {errors.lastName && <p id="lastNameError" className={errorClass}>{errors.lastName}</p>}
            </div>
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
              <input
                type="email"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className={inputClass}
                aria-describedby="emailError"
                aria-invalid={!!errors.email}
              />
              {errors.email && <p id="emailError" className={errorClass}>{errors.email}</p>}
            </div>
            <div>
              <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">Phone Number (Optional)</label>
              <input
                type="tel"
                id="phone"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className={inputClass}
                aria-describedby="phoneError"
                aria-invalid={!!errors.phone}
              />
              {errors.phone && <p id="phoneError" className={errorClass}>{errors.phone}</p>}
            </div>
            <Button type="submit" variant="primary" size="lg" className="w-full">
              Start Practice Test
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};
