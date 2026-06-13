import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import { Flame, Mail, Lock, User, Calendar, CircleAlert } from 'lucide-react';

export default function Signup() {
  const { signup } = useAuth();
  const navigate = useNavigate();

  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [dateOfBirth, setDateOfBirth] = useState('');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!fullName || !email || !password) {
      setError("Please fill in all required fields.");
      return;
    }
    setLoading(true);
    setError(null);

    try {
      await signup(email, password, fullName, dateOfBirth);
      navigate('/onboarding');
    } catch (err) {
      setError(err.message || "Signup failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex-1 flex items-center justify-center p-6 warm-bg paper-texture page-entrance">
      <Card className="w-full max-w-md border-[#E6DEC9] p-8 shadow-premium">
        {/* Header */}
        <div className="text-center space-y-2 mb-6">
          <div className="bg-amber/10 p-2 rounded-full w-fit mx-auto border border-amber/10">
            <Flame className="text-amber w-6 h-6 animate-flame" />
          </div>
          <h2 className="font-display text-2xl font-bold text-deep-brown">Begin Your Estate Plan</h2>
          <p className="font-serif text-xs text-deep-brown italic">Prepare a digital haven for those you love.</p>
        </div>

        {error && (
          <div className="text-red-700 bg-red-50 border border-red-200 p-3 rounded-lg text-xs font-sans mb-4 flex items-center gap-1.5">
            <CircleAlert size={14} className="flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4 font-sans text-sm">
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-deep-brown flex items-center gap-1">
              <User size={13} className="text-muted-rose" />
              <span>Full Name <span className="text-amber">*</span></span>
            </label>
            <input 
              type="text" 
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="e.g. Sarah Jenkins"
              required
              className="input-warm py-2 px-3 rounded-md w-full"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-deep-brown flex items-center gap-1">
              <Mail size={13} className="text-muted-rose" />
              <span>Email Address <span className="text-amber">*</span></span>
            </label>
            <input 
              type="email" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="name@example.com"
              required
              className="input-warm py-2 px-3 rounded-md w-full"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-deep-brown flex items-center gap-1">
              <Lock size={13} className="text-muted-rose" />
              <span>Secure Password <span className="text-amber">*</span></span>
            </label>
            <input 
              type="password" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
              className="input-warm py-2 px-3 rounded-md w-full"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-deep-brown flex items-center gap-1">
              <Calendar size={13} className="text-muted-rose" />
              <span>Date of Birth</span>
            </label>
            <input 
              type="date" 
              value={dateOfBirth}
              onChange={(e) => setDateOfBirth(e.target.value)}
              className="input-warm py-2 px-3 rounded-md w-full"
            />
          </div>

          <Button 
            type="submit" 
            loading={loading}
            className="w-full justify-center bg-amber text-warm-white hover:bg-warm-brown font-semibold py-3 rounded-md mt-6 shadow-sm"
          >
            Create Your Account
          </Button>
        </form>

        {/* Footer link */}
        <div className="text-center text-xs font-serif text-deep-brown mt-6 border-t border-cream pt-4">
          Already have an account?{' '}
          <Link to="/login" className="text-amber font-semibold font-sans hover:underline">
            Log In
          </Link>
        </div>
      </Card>
    </div>
  );
}
