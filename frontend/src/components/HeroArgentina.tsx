// Hero Section con temática Argentina + Messi + Maradona
export const HeroArgentina = () => {
  return (
    <div className="relative overflow-hidden bg-gradient-to-br from-celeste-afa via-celeste-light to-white py-12 mb-8">
      {/* Estrellas del mundial en el fondo */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-10 left-10 text-8xl animate-pulse">⭐</div>
        <div className="absolute top-20 right-20 text-6xl animate-pulse delay-100">⭐</div>
        <div className="absolute bottom-10 left-1/3 text-7xl animate-pulse delay-200">⭐</div>
      </div>

      <div className="container mx-auto px-4 relative z-10">
        <div className="text-center">
          {/* Título principal */}
          <div className="flex items-center justify-center gap-4 mb-6">
            <span className="text-7xl animate-bounce">🏆</span>
            <h1 className="text-6xl md:text-8xl font-black text-white drop-shadow-2xl tracking-tight">
              PRODE MUNDIAL
            </h1>
            <span className="text-7xl animate-bounce delay-75">🏆</span>
          </div>

          {/* Subtítulo con año y bandera */}
          <div className="flex items-center justify-center gap-4 mb-8">
            <span className="text-6xl">🇦🇷</span>
            <h2 className="text-4xl md:text-6xl font-black text-amarillo-oro drop-shadow-lg">
              2026
            </h2>
            <span className="text-6xl">🇦🇷</span>
          </div>

          {/* Leyendas argentinas */}
          <div className="bg-white/90 backdrop-blur rounded-3xl shadow-2xl p-6 max-w-4xl mx-auto mb-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Messi */}
              <div className="flex items-center gap-4 p-4 bg-gradient-to-r from-celeste-afa to-celeste-light rounded-2xl transform hover:scale-105 transition-all">
                <div className="text-6xl">🐐</div>
                <div className="text-left">
                  <div className="text-3xl font-black text-white drop-shadow">LEO MESSI</div>
                  <div className="text-xl text-white/90 font-semibold">#10 | 🏆 Campeón del Mundo</div>
                  <div className="text-sm text-white/80">⭐⭐⭐ La Scaloneta</div>
                </div>
              </div>

              {/* Maradona */}
              <div className="flex items-center gap-4 p-4 bg-gradient-to-r from-azul-oscuro to-celeste-dark rounded-2xl transform hover:scale-105 transition-all">
                <div className="text-6xl">👑</div>
                <div className="text-left">
                  <div className="text-3xl font-black text-white drop-shadow">DIEGO MARADONA</div>
                  <div className="text-xl text-white/90 font-semibold">#10 | Leyenda Eterna</div>
                  <div className="text-sm text-white/80">⭐⭐ México '86</div>
                </div>
              </div>
            </div>
          </div>

          {/* Frase motivacional */}
          <div className="text-2xl md:text-3xl font-bold text-azul-oscuro italic mb-4">
            "La pelota no se mancha" 🇦🇷
          </div>

          {/* Stats rápidas */}
          <div className="flex flex-wrap items-center justify-center gap-4 text-lg text-azul-oscuro font-semibold">
            <span className="px-4 py-2 bg-white rounded-full shadow-lg">
              ⚽ 3 Copas del Mundo
            </span>
            <span className="px-4 py-2 bg-white rounded-full shadow-lg">
              🏆 Qatar 2022
            </span>
            <span className="px-4 py-2 bg-white rounded-full shadow-lg">
              🔟 El Mejor del Mundo
            </span>
            <span className="px-4 py-2 bg-white rounded-full shadow-lg">
              💙 La Albiceleste
            </span>
          </div>
        </div>
      </div>

      {/* Animación de confetti */}
      <div className="absolute inset-0 pointer-events-none">
        {[...Array(20)].map((_, i) => (
          <div
            key={i}
            className="absolute text-2xl animate-float"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 5}s`,
              animationDuration: `${3 + Math.random() * 4}s`,
            }}
          >
            {['⚽', '🏆', '⭐', '💙', '🇦🇷'][Math.floor(Math.random() * 5)]}
          </div>
        ))}
      </div>
    </div>
  );
};

