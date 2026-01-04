// src/pages/Categorias.jsx
import React, { useState, useEffect, useMemo } from "react";
import { Link } from "react-router-dom";
import { initialCategories } from "../data";
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

const Categorias = () => {
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const handleSearch = (event) => {
      setSearchQuery(event.detail.query || '');
    };
    window.addEventListener('globalSearchFilter', handleSearch);
    return () => window.removeEventListener('globalSearchFilter', handleSearch);
  }, []);

  const filteredCategories = useMemo(() => {
    if (!searchQuery.trim()) return initialCategories;
    const query = searchQuery.toLowerCase();
    return initialCategories.filter(cat => 
      cat.Nombre.toLowerCase().includes(query) ||
      cat.Descripcion?.toLowerCase().includes(query)
    );
  }, [searchQuery]);

  const sortedCategories = useMemo(() => {
    return [...filteredCategories].sort((a, b) => {
      if (a.Nombre.toLowerCase() === "camisetas") return 1;
      if (b.Nombre.toLowerCase() === "camisetas") return -1;
      return 0;
    });
  }, [filteredCategories]);

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

      {searchQuery && (
        <div style={{
          textAlign: 'center',
          padding: '12px',
          backgroundColor: 'rgba(255, 193, 7, 0.1)',
          color: '#FFC107',
          fontSize: '1.1rem',
          fontWeight: 'bold',
          margin: '0 auto',
          maxWidth: '1200px',
          marginBottom: '20px'
        }}>
          Buscando: "{searchQuery}"
        </div>
      )}

      {/* GRID DE CATEGORÍAS */}
      <div className="categorias-grid">
        {sortedCategories.length > 0 ? (
          sortedCategories.map((cat, i) => {
            const imgUrl = imgPorCategoria[cat.Nombre] || imgPorCategoria.default;
            return (
              <Link
                to={`/categoria/${encodeURIComponent(cat.Nombre)}`}
                key={i}
                className={`categoria-card ${cat.Nombre.toLowerCase() === "camisetas" ? "camisetas-card" : ""}`}
              >
                <img
                  src={imgUrl}
                  alt={cat.Nombre}
                  className="categoria-img"
                  onError={(e) => {
                    e.target.src = imgPorCategoria.default;
                  }}
                />

                {/* CAPA DE FONDO OSCURO EN LA PARTE INFERIOR */}
                <div className="categoria-name-container">
                  <div className="categoria-name-content">
                    <h3 className="categoria-name">{cat.Nombre}</h3>
                    {cat.Descripcion && (
                      <p className="categoria-description">{cat.Descripcion}</p>
                    )}
                  </div>
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
            No se encontraron categorías que coincidan con "{searchQuery}".
          </div>
        )}
      </div>

      <Footer />

      <style>{`
        /* --- GRID DE CATEGORÍAS --- */
        .categorias-grid {
          max-width: 1200px;
          margin: 60px auto;
          padding: 0 10px; /* Reducimos el padding horizontal para que las tarjetas se acerquen más a los bordes */
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 20px; /* Reducimos el gap para que las tarjetas estén más juntas en desktop */
        }

        .categoria-card {
          position: relative;
          height: 300px; /* Reducimos ligeramente la altura para que se vean más compactas */
          border-radius: 12px;
          overflow: hidden;
          text-decoration: none;
          background: #111;
          transition: all 0.3s ease;
          aspect-ratio: 1/1;
          display: block;
          /* Aseguramos que en móviles ocupe todo el ancho */
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
          transition: transform 0.5s ease;
        }

        .categoria-card:hover .categoria-img {
          transform: scale(1.05);
        }

        /* CONTENEDOR DEL NOMBRE Y DESCRIPCIÓN */
        .categoria-name-container {
          position: absolute;
          bottom: 0;
          left: 0;
          width: 100%;
          background: linear-gradient(to top, rgba(0, 0, 0, 0.9) 0%, rgba(0, 0, 0, 0.7) 70%, transparent 100%);
          padding: 15px 10px 10px; /* Reducimos el padding para que el texto no se aleje tanto del borde */
          z-index: 1;
          border-bottom-left-radius: 12px;
          border-bottom-right-radius: 12px;
          transition: all 0.3s ease;
        }

        .categoria-name-content {
          text-align: center;
          color: white;
        }

        .categoria-name {
          font-size: 1.1rem;
          font-weight: 700;
          margin: 0 0 6px 0;
          color: #FFFFFF;
          text-shadow: 0 2px 4px rgba(0, 0, 0, 0.5);
          line-height: 1.2;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
          padding: 0 5px;
        }

        .categoria-description {
          color: #bbb;
          font-size: 0.85rem;
          margin: 0;
          line-height: 1.3;
          opacity: 0.9;
        }

        .categoria-card:hover .categoria-name-container {
          opacity: 0.8;
          transform: translateY(3px);
        }

        /* RESPONSIVE */

        @media (max-width: 1200px) {
          .categorias-grid {
            max-width: 1000px;
            gap: 15px; /* Aún más cerca en pantallas medianas */
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
            font-size: 1rem;
          }
          .categoria-description {
            font-size: 0.8rem;
          }
        }

        @media (max-width: 576px) {
          .categorias-grid {
            padding: 0 10px; /* Ajuste fino en móvil */
          }
          .categoria-card {
            height: 220px; /* Altura más compacta en móvil */
          }
          .categoria-name {
            font-size: 0.95rem;
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
            font-size: 0.9rem;
          }
        }
      `}</style>
    </div>
  );
};

export default Categorias;