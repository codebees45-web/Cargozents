import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import AuthLayout from '../components/common/AuthLayout';
import FormInput from '../components/common/FormInput';
import TruckLoader from '../components/common/TruckLoader';
import { useAuth } from '../context/AuthContext';

// NEW: Added the agency route so the app knows where to send them
const roleRedirect = {
  buyer: '/buyer/dashboard',
  shipper: '/shipper/dashboard',
  driver: '/driver/dashboard',
  admin: '/admin/dashboard',
  agency: '/agency', 
};

const Login = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const user = await login(form.email, form.password);
      navigate(roleRedirect[user.role] || '/');
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed. Check your details and try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {loading && <TruckLoader label="Logging you in…" />}
      <AuthLayout
        eyebrow="WELCOME BACK"
        title="Log in to Cargozents"
        subtitle="Access your dashboard as a buyer, shipper, driver, agency, or admin."
      >
      <form onSubmit={handleSubmit} className="space-y-5">
        <FormInput
          label="EMAIL"
          type="email"
          name="email"
          value={form.email}
          onChange={handleChange}
          placeholder="you@example.com"
        />
        <FormInput
          label="PASSWORD"
          type="password"
          name="password"
          value={form.password}
          onChange={handleChange}
          placeholder="••••••••"
        />

        {error && (
          <p className="rounded-lg border border-danger/30 bg-danger/10 px-3 py-2 text-xs text-danger">
            {error}
          </p>
        )}

        <div className="flex items-center justify-between text-xs">
          <Link to="/forgot-password" className="text-[#5B7A70] hover:text-primary">
            Forgot password?
          </Link>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-lg bg-accent py-3 font-semibold text-primary transition hover:shadow-glow disabled:opacity-60"
        >
          {loading ? 'Logging in…' : 'Log in'}
        </button>

        <p className="text-center text-xs text-[#5B7A70]">
          Don't have an account?{' '}
          <Link to="/signup" className="text-primary hover:underline">
            Sign up
          </Link>
        </p>
      </form>
      </AuthLayout>
    </>
  );
};
export default Login;