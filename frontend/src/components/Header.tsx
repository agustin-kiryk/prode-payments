// Componente Header con temática argentina
import { useState } from 'react';
import type { User } from '../types';

interface HeaderProps {
  users: User[];
  selectedUser: User | null;
  onUserSelect: (user: User) => void;
}

export const Header = ({ users, selectedUser, onUserSelect }: HeaderProps) => {
  const [showDropdown, setShowDropdown] = useState(false);

  return (
    <header className="bg-gradient-to-r from-celeste-afa via-celeste-dark to-azul-oscuro text-white shadow-2xl sticky top-0 z-50 border-b-4 border-amarillo-oro">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          {/* Logo y título con efecto especial */}
          <div className="flex items-center gap-3">
            <div className="relative">
              <span className="text-5xl animate-bounce">🏆</span>
              <span className="absolute -top-2 -right-2 text-2xl animate-pulse">⭐</span>
            </div>

            <div>
              <h1 className="text-3xl md:text-4xl font-black tracking-tight flex items-center gap-3">
                <span className="text-white drop-shadow-lg">PRODE</span>
                <span className="text-amarillo-oro drop-shadow-lg">MUNDIAL</span>
                <span className="text-white drop-shadow-lg">2026</span>
              </h1>
              <div className="text-xs md:text-sm font-semibold text-celeste-light flex items-center gap-2">
                <span>🇦🇷</span>
                <span>LA SCALONETA</span>
                <span>⭐⭐⭐</span>
                <span className="text-amarillo-oro drop-shadow-lg">CREDIT</span>
                <span className="text-white drop-shadow-lg">PAYMENTS</span>
              </div>
            </div>

            <div className="hidden md:flex gap-2 ml-4">
              <span className="text-3xl animate-pulse">⚽</span>
              <span className="text-3xl animate-pulse delay-100">🇦🇷</span>
              <span className="text-3xl animate-pulse delay-200">💙</span>
            </div>
          </div>

          {/* Selector de usuario mejorado */}
          <div className="relative">
            <button
              onClick={() => setShowDropdown(!showDropdown)}
              className="flex items-center gap-3 bg-white text-celeste-afa px-5 py-3 rounded-xl font-bold hover:bg-amarillo-oro hover:text-azul-oscuro transition-all transform hover:scale-105 shadow-xl border-2 border-amarillo-oro"
            >
              {selectedUser ? (
                <>
                  <span className="text-3xl">{selectedUser.avatar}</span>
                  <span className="hidden md:inline">{selectedUser.name}</span>
                  <span className="text-xl">▼</span>
                </>
              ) : (
                <>
                  <span className="text-3xl">👤</span>
                  <span className="hidden md:inline">Seleccionar</span>
                  <span className="text-xl">▼</span>
                </>
              )}
            </button>

            {/* Dropdown mejorado */}
            {showDropdown && (
              <div className="absolute right-0 mt-2 w-72 bg-white rounded-xl shadow-2xl py-2 max-h-96 overflow-y-auto border-2 border-celeste-afa">
                <div className="px-4 py-2 bg-gradient-to-r from-celeste-afa to-celeste-dark text-white font-bold text-center rounded-t-xl">
                  ⚽ Seleccioná tu usuario
                </div>
                {users.map((user) => (
                  <button
                    key={user.id}
                    onClick={() => {
                      onUserSelect(user);
                      setShowDropdown(false);
                    }}
                    className={`w-full flex items-center gap-3 px-4 py-3 hover:bg-celeste-light transition-all transform hover:scale-105 ${
                      selectedUser?.id === user.id 
                        ? 'bg-gradient-to-r from-celeste-afa to-celeste-light text-white font-bold' 
                        : 'text-gray-800'
                    }`}
                  >
                    <span className="text-3xl">{user.avatar}</span>
                    <span className="font-semibold flex-1 text-left">{user.name}</span>
                    {selectedUser?.id === user.id && <span className="text-2xl">✓</span>}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

