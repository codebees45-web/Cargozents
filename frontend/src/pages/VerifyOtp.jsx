import { useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import AuthLayout from '../components/common/AuthLayout';
import { verifyOtp } from '../services/authService';
import { useAuth } from '../context/AuthContext';

const roleRedirect = {
  buyer: '/buyer/dashboard',
  shipper: '/shipper/dashboard',
  driver: '/driver/dashboard',
  agency: '/agency',
  admin: '/admin/dashboard',
};

const VerifyOtp = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { updateUser } = useAuth();
  const { userId, email, phone } = location.state || {};

  const [otp, setOtp] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  if (!userId) {
    return (
      <AuthLayout eyebrow="VERIFY" title="Nothing to verify">
        <p className="text-sm text-[#5B7A70]">
          Start by <Link to="/signup" className="text-primary hover:underline">creating an account</Link>.
        </p>
      </AuthLayout>
    );
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const { data } = await verifyOtp({ userId, otp });
      localStorage.setItem('loadshare_token', data.token);
      updateUser(data.user);
      
      if (!data.user.isProfileComplete && data.user.role !== 'admin') {
        navigate('/onboarding');
      } else {
        navigate(roleRedirect[data.user.role] || '/');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Invalid or expired code.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout
      eyebrow="VERIFY YOUR ACCOUNT"
      title="Enter the code"
      subtitle={email ? `We sent a 6-digit code to ${email}.` : 'Enter the 6-digit code sent to you.'}
    >
      <form onSubmit={handleSubmit} className="space-y-5">
        <input
          type="text"
          inputMode="numeric"
          maxLength={6}
          value={otp}
          onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
          placeholder="••••••"
          className="w-full rounded-lg border border-primary/15 bg-secondary/40 px-4 py-3 text-center font-mono-ls text-2xl tracking-[0.5em] text-primary outline-none focus:border-primary/60"
        />

        {error && (
          <p className="rounded-lg border border-danger/30 bg-danger/10 px-3 py-2 text-xs text-danger">
            {error}
          </p>
        )}

        <button
          type="submit"
          disabled={loading || otp.length !== 6}
          className="w-full rounded-lg bg-accent py-3 font-semibold text-primary transition hover:shadow-glow disabled:opacity-60"
        >
          {loading ? 'Verifying…' : 'Verify account'}
        </button>
      </form>
    </AuthLayout>
  );
};

export default VerifyOtp;
