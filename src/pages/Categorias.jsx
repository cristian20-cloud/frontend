// src/pages/Categorias.jsx
import React, { useState, useEffect, useMemo } from "react";
import { Link, useLocation } from "react-router-dom";
import { initialCategories } from '../data';
import Footer from "../components/Footer";

// Imágenes optimizadas para cada categoría
const imgPorCategoria = {
  "NIKE 1.1": "https://res.cloudinary.com/dxc5qqsjd/image/upload/v1762950188/gorrarojaymorada9_sufoqt.jpg",
  "A/N 1.1": "https://res.cloudinary.com/dxc5qqsjd/image/upload/v1762988183/negraconelescudo_zzh4l9.jpg",
  "BEISBOLERA PREMIUM": "https://res.cloudinary.com/dxc5qqsjd/image/upload/v1762910786/gorraazulblancoLA_rembf2.jpg",
  "DIAMANTE IMPORTADA": "https://res.cloudinary.com/dxc5qqsjd/image/upload/v1762914412/gorraconrosas_ko3326.jpg",
  "EQUINAS-AGROPECUARIAS": "https://res.cloudinary.com/dxc5qqsjd/image/upload/v1762916288/gorraazulcerdoverde_e10kc7.jpg",
  "EXCLUSIVA 1.1": "https://res.cloudinary.com/dxc5qqsjd/image/upload/v1762956762/gorranube_jrten0.jpg",
  "MONASTERY 1.1": "https://res.cloudinary.com/dxc5qqsjd/image/upload/v1762957919/gorramonasterygris_ij6ksq.jpg",
  "MULTIMARCA": "https://res.cloudinary.com/dxc5qqsjd/image/upload/v1762957956/gorrablancachromebeart_amqbro.jpg",
  "PLANA CERRADA 1.1": "https://res.cloudinary.com/dxc5qqsjd/image/upload/v1762988576/gorranegrajordan_arghad.jpg",
  "PLANA IMPORTADA": "https://res.cloudinary.com/dxc5qqsjd/image/upload/v1762995130/gorranegraAA_zkdg1e.jpg",
  "PORTAGORRAS": "https://res.cloudinary.com/dxc5qqsjd/image/upload/v1762994460/portagorras-1sencillo_xxe5hf.jpg",
  "PREMIUM": "https://res.cloudinary.com/dxc5qqsjd/image/upload/v1762987076/gorrahugoboss_ev6z54.jpg",
  "camisetas": "https://res.cloudinary.com/dxc5qqsjd/image/upload/v1763002983/TALLA_M_3_youtflecha_hphfng.jpg",
  "default": "https://images.unsplash.com/photo-1523413651479-597eb2da0ad6?auto=format&fit=crop&w=1000&q=80",
};

const Categorias = ({ 
  searchTerm: externalSearchTerm = '',
  isSearching: externalIsSearching = false,
  onSearch,
  onClearSearch
}) => {
  const location = useLocation();
  const [localSearchTerm, setLocalSearchTerm] = useState('');

  // Efecto para leer el parámetro q de la URL al cargar
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const queryParam = params.get('q');
    if (queryParam) {
      setLocalSearchTerm(queryParam);
      if (onSearch) {
        onSearch(queryParam);
      }
    }
  }, [location.search, onSearch]);

  // Sincronizar con el término externo cuando cambia
  useEffect(() => {
    if (externalSearchTerm !== localSearchTerm) {
      setLocalSearchTerm(externalSearchTerm);
    }
  }, [externalSearchTerm]);

  const filteredCategories = useMemo(() => {
    // Usar el término de búsqueda (priorizar el externo si existe)
    const searchQuery = externalIsSearching ? externalSearchTerm : localSearchTerm;
    
    if (!searchQuery || !searchQuery.trim()) return initialCategories;
    
    const query = searchQuery.toLowerCase().trim();
    return initialCategories.filter(cat => 
      cat.Nombre.toLowerCase().includes(query) ||
      (cat.Descripcion && cat.Descripcion.toLowerCase().includes(query))
    );
  }, [localSearchTerm, externalSearchTerm, externalIsSearching]);

  const sortedCategories = useMemo(() => {
    return [...filteredCategories].sort((a, b) => {
      if (a.Nombre.toLowerCase() === "camisetas") return 1;
      if (b.Nombre.toLowerCase() === "camisetas") return -1;
      return 0;
    });
  }, [filteredCategories]);

  const handleClearSearch = () => {
    setLocalSearchTerm('');
    if (onClearSearch) {
      onClearSearch();
    }
    // Limpiar el parámetro de la URL
    window.history.replaceState({}, '', '/categorias');
  };

  // Determinar si estamos en modo búsqueda
  const isSearchActive = externalIsSearching || localSearchTerm.trim() !== '';
  const activeSearchTerm = externalIsSearching ? externalSearchTerm : localSearchTerm;

  return (
    <div style={{ background: "#030712", minHeight: "100vh" }}>
      {/* BANNER */}
      <section
        style={{
          background: "#031326",
          padding: "100px 20px 70px",
          textAlign: "center",
          borderBottomLeftRadius: "30px",
          borderBottomRightRadius: "30px",
          position: "relative",
          overflow: "hidden",
        }}
      >
        <div
          style={{
            position: "absolute",
            top: "-40px",
            left: 0,
            width: "100%",
            height: "80px",
            background: "#FFFF",
          }}
        />

        <h1
          style={{
            color: "white",
            fontSize: "3rem",
            fontWeight: "700",
            marginBottom: "20px",
          }}
        >
          Explora Nuestras Categorías
        </h1>

        <p
          style={{
            color: "#cbd5e1",
            fontSize: "1.2rem",
            maxWidth: "900px",
            margin: "0 auto",
            lineHeight: "1.6",
          }}
        >
          Descubre nuestra amplia selección de gorras organizadas por categorías.
          Desde estilos clásicos hasta las últimas tendencias, encuentra la gorra
          perfecta para ti.
        </p>

        <div
          style={{
            position: "absolute",
            bottom: "-40px",
            left: 0,
            width: "100%",
            height: "80px",
            background: "#030712",
            borderTopLeftRadius: "50% 80%",
            borderTopRightRadius: "50% 80%",
          }}
        />
      </section>

      {/* RESULTADOS DE BÚSQUEDA */}
      {isSearchActive && (
        <div style={{
          maxWidth: '1200px',
          margin: '20px auto',
          padding: '0 20px'
        }}>
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '20px',
            padding: '15px',
            background: 'rgba(255, 193, 7, 0.1)',
            borderRadius: '8px',
            border: '1px solid rgba(255, 193, 7, 0.2)'
          }}>
            <div>
              <h2 style={{ color: '#FFC107', fontSize: '1.2rem', margin: '0 0 5px 0' }}>
                Resultados para: &quot;{activeSearchTerm}&quot;
              </h2>
              <p style={{ color: '#94A3B8', fontSize: '0.9rem', margin: 0 }}>
                {filteredCategories.length} {filteredCategories.length === 1 ? 'categoría encontrada' : 'categorías encontradas'}
              </p>
            </div>
            <button
              onClick={handleClearSearch}
              style={{
                background: 'none',
                border: '1px solid #FFC107',
                color: '#FFC107',
                padding: '8px 16px',
                borderRadius: '6px',
                cursor: 'pointer',
                fontSize: '0.9rem',
                transition: 'all 0.2s ease'
              }}
              onMouseEnter={(e) => {
                e.target.style.background = '#FFC107';
                e.target.style.color = '#000';
              }}
              onMouseLeave={(e) => {
                e.target.style.background = 'none';
                e.target.style.color = '#FFC107';
              }}
            >
              Limpiar búsqueda
            </button>
          </div>
        </div>
      )}

      {/* GRID DE CATEGORÍAS */}
      <div className="categorias-grid">
        {sortedCategories.length > 0 ? (
          sortedCategories.map((cat, i) => {
            const imgUrl = imgPorCategoria[cat.Nombre] || imgPorCategoria.default;
            return (
              <Link
                to={`/productos?categoria=${encodeURIComponent(cat.Nombre)}`}
                key={i}
                className={`categoria-card ${cat.Nombre.toLowerCase() === "camisetas" ? "camisetas-card" : ""}`}
                onClick={handleClearSearch}
              >
                <img
                  src={imgUrl}
                  alt={cat.Nombre}
                  className="categoria-img"
                  onError={(e) => {
                    e.target.src = imgPorCategoria.default;
                  }}
                />

                {/* CONTENEDOR DEL NOMBRE Y DESCRIPCIÓN - SIN SOMBRA */}
                <div className="categoria-info-container">
                  <h3 className="categoria-name">{cat.Nombre}</h3>
                  {cat.Descripcion && (
                    <p className="categoria-description">{cat.Descripcion}</p>
                  )}
                </div>
              </Link>
            );
          })
        ) : (
          <div style={{
            textAlign: 'center',
            color: '#CBD5E1',
            fontSize: '1.2rem',
            gridColumn: '1 / -1',
            padding: '40px'
          }}>
            No se encontraron categorías que coincidan con &quot;{activeSearchTerm}&quot;.
          </div>
        )}
      </div>

      <Footer />

      <style>{`
        /* --- GRID DE CATEGORÍAS --- */
        .categorias-grid {
          max-width: 1200px;
          margin: 60px auto;
          padding: 0 10px;
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 20px;
        }

        .categoria-card {
          position: relative;
          height: 300px;
          border-radius: 12px;
          overflow: hidden;
          text-decoration: none;
          background: #111;
          transition: all 0.3s ease;
          aspect-ratio: 1/1;
          display: block;
          width: 100%;
        }

        .camisetas-card {
          order: 999;
        }

        .categoria-card:hover {
          transform: translateY(-5px);
          box-shadow: 0 15px 30px rgba(255, 193, 7, 0.2);
        }

        .categoria-img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          transition: 0.4s;
        }

        .categoria-card:hover .categoria-img {
          transform: scale(1.05);
        }

        /* CONTENEDOR DE INFORMACIÓN - CENTRADO Y SIN SOMBRA */
        .categoria-info-container {
          position: absolute;
          bottom: 0;
          left: 0;
          right: 0;
          background: linear-gradient(to top, 
            rgba(0, 0, 0, 0.95) 0%, 
            rgba(0, 0, 0, 0.8) 50%, 
            transparent 100%);
          padding: 30px 15px 20px;
          z-index: 1;
          border-bottom-left-radius: 12px;
          border-bottom-right-radius: 12px;
          transition: all 0.3s ease;
          text-align: center;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: flex-end;
        }

        .categoria-name {
          font-size: 1.4rem;
          font-weight: 700;
          margin: 0 0 10px 0;
          color: #FFC107;
          line-height: 1.2;
          letter-spacing: 0.5px;
          text-transform: uppercase;
          font-family: 'Inter', sans-serif;
          width: 100%;
          text-align: center;
          /* SIN SOMBRA - eliminado text-shadow */
        }

        .categoria-description {
          font-size: 0.9rem;
          color: rgba(255, 255, 255, 0.9);
          margin: 0;
          line-height: 1.4;
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
          max-width: 90%;
          margin: 0 auto;
          text-align: center;
          /* SIN SOMBRA - eliminado text-shadow */
        }

        .categoria-card:hover .categoria-info-container {
          background: linear-gradient(to top, 
            rgba(0, 0, 0, 0.98) 0%, 
            rgba(0, 0, 0, 0.9) 50%, 
            rgba(0, 0, 0, 0.3) 100%);
          transform: translateY(0);
        }

        /* RESPONSIVE */

        @media (max-width: 1200px) {
          .categorias-grid {
            max-width: 1000px;
            gap: 15px;
          }
        }

        @media (max-width: 1024px) {
          .categorias-grid {
            grid-template-columns: repeat(2, 1fr);
            gap: 20px;
            padding: 0 15px;
          }
          .categoria-card {
            height: 280px;
          }
          .categoria-name {
            font-size: 1.3rem;
          }
          .categoria-description {
            font-size: 0.85rem;
          }
        }

        @media (max-width: 768px) {
          .categorias-grid {
            grid-template-columns: 1fr;
            gap: 25px;
            padding: 0 20px;
          }
          .categoria-card {
            height: 250px;
          }
          .categoria-name {
            font-size: 1.2rem;
          }
          .categoria-description {
            font-size: 0.8rem;
          }
        }

        @media (max-width: 576px) {
          .categoria-card {
            height: 220px;
          }
          .categoria-name {
            font-size: 1.1rem;
          }
          .categoria-description {
            font-size: 0.75rem;
          }
        }

        @media (max-width: 425px) {
          .categoria-card {
            height: 200px;
          }
          .categoria-name {
            font-size: 1rem;
          }
          .categoria-info-container {
            padding: 20px 10px 15px;
          }
          .categoria-description {
            max-width: 95%;
          }
        }
      `}</style>
    </div>
  );
};

export default Categorias;