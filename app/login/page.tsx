'use client';

import React, { useState } from 'react';
import Link from 'next/link';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    alert('جارٍ التحقق من بيانات المالك...');
  };

  return (
    <div className="min-h-screen bg-[#07080D] text-white flex flex-col justify-center items-center px-4">
      <div className="w-full max-w-md bg-[#0D1018] border border-[#1E2640] p-8 rounded-2xl shadow-2xl">
        <div className="text-center mb-8">
          <Link href="/" className="text-3xl font-black bg-gradient-to-r from-[#8B5CF6] to-[#00D4FF] bg-clip-text text-transparent">
            NOVA MEDIA
          </Link>
          <p className="text-[#94A3B8] text-sm mt-2">تسجيل الدخول إلى لوحة التحكم</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-6">
          <div>
            <label className="block text-xs font-semibold text-[#94A3B8] mb-2">البريد الإلكتروني</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="owner@novamedia.com"
              required
              className="w-full bg-[#07080D] border border-[#1E2640] rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[#8B5CF6] transition"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#94A3B8] mb-2">كلمة المرور</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
              className="w-full bg-[#07080D] border border-[#1E2640] rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[#8B5CF6] transition"
            />
          </div>

          <button
            type="submit"
            className="w-full bg-gradient-to-r from-[#8B5CF6] to-[#00D4FF] text-white font-bold py-3 rounded-xl shadow-lg shadow-[#8B5CF6]/20 hover:opacity-90 transition"
          >
            دخول
          </button>
        </form>

        <div className="text-center mt-6">
          <Link href="/" className="text-xs text-[#64748B] hover:text-[#94A3B8] transition">
            العودة إلى الصفحة الرئيسية
          </Link>
        </div>
      </div>
    </div>
  );
}
