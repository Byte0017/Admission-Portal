import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { useState, useEffect } from 'react';
import { toast } from 'react-toastify';

const loginSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  userType: z.enum(['student', 'admin']),
  otp: z.string().optional(),
});

type LoginFormData = z.infer<typeof loginSchema>;

const Login = () => {
  const navigate = useNavigate();
  const [otpSent, setOtpSent] = useState(false);
  const [otpVerified, setOtpVerified] = useState(false);
  const [otpInput, setOtpInput] = useState(['', '', '', '', '', '']);
  const [errorMessage, setErrorMessage] = useState('');
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [emailNotFound, setEmailNotFound] = useState(false);
  const [passwordIncorrect, setPasswordIncorrect] = useState(false);
  const [showError, setShowError] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
    reset,
    setFocus,
    setValue,
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      userType: 'student',
    },
  });

  const onSubmit = async (data: LoginFormData) => {
    setShowError(true); // Show error messages after submit
    try {
      setEmailNotFound(false);
      setPasswordIncorrect(false);
      setErrorMessage('');
      setShowForgotPassword(false);

      if (!otpSent) {
        // Check if email exists in the database (simulating an API call)
        const user = await fakeLoginApi(data.email, data.password, data.userType);

        if (!user) {
          setEmailNotFound(true);
          setErrorMessage('Email not found in the database.');
          setFocus('email');
          toast.error('Email not found.');
          reset({ email: '', password: '', userType: data.userType });
          return;
        }

        if (user && user.password !== data.password) {
          setPasswordIncorrect(true);
          setErrorMessage('Incorrect password.');
          setFocus('password');
          setShowForgotPassword(true);
          toast.error('Incorrect password.');
          reset({ email: data.email, password: '', userType: data.userType });
          return;
        }

        // Proceed to OTP if email and password are correct
        sendOtp(data.email);
        setOtpSent(true);
        toast.success('OTP sent to your email.');
      } else if (otpInput.join('').length === 6 && !otpVerified) {
        // Simulate OTP verification
        const otpValid = await verifyOtp(otpInput.join(''));

        if (otpValid) {
          setOtpVerified(true);
          toast.success('OTP verified successfully.');
          if (data.userType === 'student') {
            navigate('/student-dashboard');
          } else if (data.userType === 'admin') {
            navigate('/admin-dashboard');
          }
        } else {
          setErrorMessage('Invalid OTP. Please try again.');
          toast.error('Invalid OTP. Please try again.');
          setOtpInput(['', '', '', '', '', '']);
        }
      }
    } catch (error) {
      console.error('Login failed:', error);
      setErrorMessage('Something went wrong. Please try again later.');
      toast.error('Something went wrong. Please try again later.');
    }
  };

  const fakeLoginApi = async (email: string, password: string, userType: string) => {
    if (email === 'test@example.com') {
      if (password === '00000000') {
        return { email, userType, password };
      } else {
        return { email, userType, password: 'incorrect' };
      }
    }
    return null;
  };

  const sendOtp = (email: string) => {
    console.log(`OTP sent to: ${email}`);
  };

  const verifyOtp = async (otp: string) => {
    return otp === '123456';
  };

  const handleOtpChange = (index: number, value: string) => {
    const newOtpInput = [...otpInput];
    newOtpInput[index] = value;
    setOtpInput(newOtpInput);

    if (value && index < otpInput.length - 1) {
      const nextBox = document.getElementById(`otp-${index + 1}`);
      if (nextBox) nextBox.focus();
    }
  };

  const handleOtpKeyDown = (event: React.KeyboardEvent, index: number) => {
    if (event.key === 'Backspace' && !otpInput[index]) {
      const prevBox = document.getElementById(`otp-${index - 1}`);
      if (prevBox) prevBox.focus();
    }
  };

  const resetFormForAdmin = () => {
    reset({
      email: '',
      password: '',
      userType: 'admin',
    });
    setOtpSent(false);
    setOtpVerified(false);
    setOtpInput(['', '', '', '', '', '']);
    setErrorMessage('');
    setShowForgotPassword(false); // Reset forgot password section when userType changes
  };

  const resetFormForStudent = () => {
    reset({
      email: '',
      password: '',
      userType: 'student',
    });
    setOtpSent(false);
    setOtpVerified(false);
    setOtpInput(['', '', '', '', '', '']);
    setErrorMessage('');
    setShowForgotPassword(false);
  };

  useEffect(() => {
    if (watch('userType') === 'admin') {
      resetFormForAdmin();
    } else if (watch('userType') === 'student') {
      resetFormForStudent();
    }
  }, [watch('userType'), reset]);

  const handleForgotPassword = async (email: string) => {
    toast.success('Password reset link sent to your email!');
    setShowForgotPassword(false);
  };

  useEffect(() => {
    // Reset error message when switching user type
    if (watch('userType') !== 'student') {
      setErrorMessage('');
      setEmailNotFound(false);
      setPasswordIncorrect(false);
      setShowError(false);
      setShowForgotPassword(false); // Hide reset password section when user type changes
    }
  }, [watch('userType')]);

  const handleFieldChange = (field: string) => {
    if (field === 'email') {
      setEmailNotFound(false);
      setErrorMessage('');
    } else if (field === 'password') {
      setPasswordIncorrect(false);
      setErrorMessage('');
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="max-w-md mx-auto p-6 bg-white rounded-xl shadow-lg mt-10"
    >
      <h1 className="text-2xl font-bold text-center mb-8">Welcome Back!</h1>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* User Type Selector - Only show if OTP is not sent */}
        {!otpSent && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
          >
            <label className="block text-sm font-medium text-gray-700 mb-3">Login as</label>
            <div className="flex gap-2 p-1 bg-gray-100 rounded-lg">
              {['student', 'admin'].map((role) => (
                <label
                  key={role}
                  className={`flex-1 text-center py-2 px-4 rounded-md transition-all cursor-pointer ${watch('userType') === role
                    ? 'bg-indigo-600 text-white shadow-md'
                    : 'bg-transparent text-gray-600 hover:bg-gray-200'}`}
                >
                  <input
                    {...register('userType')}
                    type="radio"
                    value={role}
                    className="hidden"
                  />
                  {role.charAt(0).toUpperCase() + role.slice(1)}
                </label>
              ))}
            </div>
          </motion.div>
        )}

        {/* Email and Password Fields - Only show if OTP is not sent */}
        {!otpSent && (
          <>
            {/* Email Field */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
            >
              <label className="block text-sm font-medium text-gray-700">Email address</label>
              <div className="mt-1">
                <input
                  {...register('email')}
                  type="email"
                  onChange={() => handleFieldChange('email')}
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-600 focus:border-transparent transition-all"
                  placeholder="Enter your email"
                />
                {errors.email && showError && <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>}
                {emailNotFound && showError && <p className="mt-1 text-sm text-red-600">Email not found in the database.</p>}
              </div>
            </motion.div>

            {/* Password Field */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6 }}
            >
              <label className="block text-sm font-medium text-gray-700">Password</label>
              <div className="mt-1">
                <input
                  {...register('password')}
                  type="password"
                  onChange={() => handleFieldChange('password')}
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-600 focus:border-transparent transition-all"
                  placeholder="Enter your password"
                />
                {errors.password && showError && <p className="mt-1 text-sm text-red-600">{errors.password.message}</p>}
                {passwordIncorrect && showError && <p className="mt-1 text-sm text-red-600">Incorrect password.</p>}
              </div>
            </motion.div>
          </>
        )}

        {/* OTP Field - Only show if OTP is sent */}
        {otpSent && !otpVerified && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8 }}
          >
            <label className="block text-sm font-medium text-gray-700">Enter OTP</label>
            <div className="mt-1 flex gap-2 justify-center">
              {otpInput.map((otpChar, index) => (
                <input
                  key={index}
                  id={`otp-${index}`}
                  type="text"
                  maxLength={1}
                  value={otpChar}
                  onChange={(e) => handleOtpChange(index, e.target.value)}
                  onKeyDown={(e) => handleOtpKeyDown(e, index)}
                  className="w-12 h-12 text-center text-xl border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-600 focus:border-transparent transition-all sm:w-16 sm:h-16 md:w-14 md:h-14 lg:w-12 lg:h-12"
                />
              ))}
            </div>
          </motion.div>
        )}

        {/* Submit Button */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
        >
          <Button
            type="submit"
            disabled={isSubmitting}
            className="w-full flex justify-center py-2.5 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors"
          >
            {isSubmitting || otpSent ? 'Enter' : 'Sign in'}
          </Button>
        </motion.div>

        {/* Forgot Password Component */}
        {showForgotPassword && !otpSent && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="mt-4 text-center"
          >
            <p className="text-sm text-gray-600">
              Forgot your password?{' '}
              <Link
                to="/forgot-password"
                className="font-medium text-indigo-600 hover:text-indigo-500 transition-colors"
              >
                Reset Password
              </Link>
            </p>
          </motion.div>
        )}

        {/* Register Link - Only show if OTP section is not visible and user is not an admin */}
        {!otpSent && !otpVerified && watch('userType') === 'student' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0 }}
          >
            <div className="text-sm text-center pt-4 border-t border-gray-100">
              Don't have an account?{' '}
              <Link
                to="/register"
                className="font-medium text-indigo-600 hover:text-indigo-500 transition-colors"
              >
                Register now
              </Link>
            </div>
          </motion.div>
        )}
      </form>
    </motion.div>
  );
};

export default Login;
