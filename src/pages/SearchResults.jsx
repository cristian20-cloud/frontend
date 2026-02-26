// src/pages/SearchResults.jsx
import React, { useState, useEffect, useCallback } from 'react';
import { useLocation, Link, useNavigate } from 'react-router-dom';
import { initialProducts } from '../data';
import {
  FaSearch,
  FaTimes,
  FaShoppingCart,
  FaStar,
  FaFire,
  FaPalette,
  FaRuler,
  FaTag,
  FaEye,
  FaExclamationTriangle,
  FaArrowRight
} from 'react-icons/fa';
import styled, { keyframes, css } from 'styled-components';

// Animaciones DEFINIDAS PRIMERO
const fadeIn = keyframes`
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
`;

const slideIn = keyframes`
  from {
    transform: translateX(100%);
    opacity: 0;
  }
  to {
    transform: translateX(0);
    opacity: 1;
  }
`;

const slideOut = keyframes`
  from {
    transform: translateX(0);
    opacity: 1;
  }
  to {
    transform: translateX(100%);
    opacity: 0;
  }
`;

// Estilos con styled-components
const Container = styled.div`
  padding: 100px 20px 40px;
  max-width: 1400px;
  margin: 0 auto;
  min-height: 100vh;
  background: linear-gradient(135deg, #030712 0%, #111827 100%);
  color: white;
`;

const LoadingContainer = styled.div`
  padding: 60px 20px;
  text-align: center;
  color: #fff;
  max-width: 1200px;
  margin: 0 auto;
  background: #030712;
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
`;

const LoadingIcon = styled.div`
  font-size: 50px;
  margin-bottom: 20px;
`;

const LoadingSpinner = styled.div`
  width: 50px;
  height: 50px;
  border: 3px solid rgba(255, 193, 7, 0.3);
  border-radius: 50%;
  border-top-color: #FFC107;
  animation: spin 1s linear infinite;

  @keyframes spin {
    to { transform: rotate(360deg); }
  }
`;

const SearchHeader = styled.div`
  background: rgba(15, 23, 42, 0.9);
  padding: 25px;
  border-radius: 12px;
  margin-bottom: 40px;
  border: 1px solid rgba(255, 193, 7, 0.2);
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.3);
`;

const HeaderContent = styled.div`
  display: flex;
  align-items: center;
  gap: 20px;
  margin-bottom: 20px;

  @media (max-width: 768px) {
    flex-direction: column;
    text-align: center;
    gap: 15px;
  }
`;

const SearchIconContainer = styled.div`
  background: linear-gradient(135deg, #FFC107, #FFD54F);
  color: #000;
  width: 60px;
  height: 60px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.5rem;
  flex-shrink: 0;

  @media (max-width: 768px) {
    width: 50px;
    height: 50px;
    font-size: 1.3rem;
  }
`;

const HeaderText = styled.div`
  flex: 1;
`;

const Title = styled.h1`
  font-size: 32px;
  color: #FFFFFF;
  margin: 0;
  font-weight: 800;
  letter-spacing: -0.5px;

  @media (max-width: 768px) {
    font-size: 24px;
  }
`;

const Subtitle = styled.p`
  font-size: 16px;
  color: #94A3B8;
  margin: 8px 0 0 0;
  line-height: 1.6;

  @media (max-width: 768px) {
    font-size: 14px;
  }
`;

const SearchTermHighlight = styled.span`
  color: #FFC107;
  font-weight: 700;
  background: rgba(255, 193, 7, 0.1);
  padding: 2px 8px;
  border-radius: 6px;
`;

const ResultsStats = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-top: 20px;
  border-top: 1px solid rgba(255, 193, 7, 0.1);

  @media (max-width: 768px) {
    flex-direction: column;
    gap: 15px;
    text-align: center;
  }
`;

const ResultsCount = styled.div`
  color: #FFC107;
  font-size: 18px;
  font-weight: 700;

  span {
    font-size: 28px;
    margin-right: 8px;
    background: linear-gradient(135deg, #FFC107, #FFD54F);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
  }

  @media (max-width: 768px) {
    font-size: 16px;
    
    span {
      font-size: 24px;
    }
  }
`;

const ActionsContainer = styled.div`
  display: flex;
  gap: 15px;

  @media (max-width: 768px) {
    width: 100%;
    justify-content: center;
  }

  @media (max-width: 480px) {
    flex-direction: column;
  }
`;

const ActionButton = styled.button`
  display: inline-flex;
  align-items: center;
  gap: 10px;
  padding: 12px 24px;
  border-radius: 8px;
  font-weight: 600;
  font-size: 14px;
  border: 2px solid #4F46E5;
  background: transparent;
  color: #4F46E5;
  cursor: pointer;
  transition: all 0.3s ease;
  text-decoration: none;

  &:hover {
    background: #4F46E5;
    color: white;
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(79, 70, 229, 0.3);
  }

  @media (max-width: 480px) {
    width: 100%;
    justify-content: center;
  }
`;

const BackButton = styled(Link)`
  display: inline-flex;
  align-items: center;
  gap: 10px;
  padding: 12px 24px;
  border-radius: 8px;
  font-weight: 600;
  font-size: 14px;
  border: 2px solid #FFC107;
  background: transparent;
  color: #FFC107;
  cursor: pointer;
  transition: all 0.3s ease;
  text-decoration: none;

  &:hover {
    background: #FFC107;
    color: #000;
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(255, 193, 7, 0.3);
  }

  @media (max-width: 480px) {
    width: 100%;
    justify-content: center;
  }
`;

// Grid de productos
const ProductsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 30px;
  padding: 20px 0;

  @media (max-width: 768px) {
    grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
    gap: 20px;
  }

  @media (max-width: 480px) {
    grid-template-columns: 1fr;
    gap: 15px;
  }
`;

// Tarjeta de producto - CON PROPS TRANSITORIAS ($)
const ProductCard = styled.div`
  background: linear-gradient(145deg, #1E293B, #0F172A);
  border-radius: 16px;
  overflow: hidden;
  border: 1px solid rgba(255, 193, 7, 0.2);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
  animation: ${fadeIn} 0.5s ease ${props => props.$delay || '0s'} both;

  &:hover {
    transform: translateY(-8px);
    box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.3), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
    border-color: #FFC107;
  }

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 4px;
    background: linear-gradient(90deg, #FFC107, #FFD54F);
    opacity: 0;
    transition: opacity 0.3s ease;
  }

  &:hover::before {
    opacity: 1;
  }
`;

const ProductImageContainer = styled.div`
  position: relative;
  height: 220px;
  overflow: hidden;
  background: #0F172A;
`;

const ProductImage = styled.img`
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.5s ease;

  ${ProductCard}:hover & {
    transform: scale(1.05);
  }
`;

const ProductBadges = styled.div`
  position: absolute;
  top: 12px;
  left: 12px;
  right: 12px;
  display: flex;
  justify-content: space-between;
  z-index: 2;
`;

const Badge = styled.span`
  padding: 6px 12px;
  border-radius: 20px;
  font-size: 11px;
  font-weight: 800;
  display: flex;
  align-items: center;
  gap: 5px;
  letter-spacing: 0.5px;
  text-transform: uppercase;
`;

const DiscountBadge = styled(Badge)`
  background: linear-gradient(135deg, #EF4444, #DC2626);
  color: white;
  box-shadow: 0 2px 8px rgba(239, 68, 68, 0.3);
`;

const FeaturedBadge = styled(Badge)`
  background: linear-gradient(135deg, #FFC107, #FFD54F);
  color: #000;
  box-shadow: 0 2px 8px rgba(255, 193, 7, 0.3);
`;

const NewBadge = styled(Badge)`
  background: linear-gradient(135deg, #3B82F6, #1D4ED8);
  color: white;
  box-shadow: 0 2px 8px rgba(59, 130, 246, 0.3);
`;

const ProductContent = styled.div`
  padding: 20px;
`;

const ProductName = styled.h3`
  font-size: 16px;
  color: #FFFFFF;
  margin: 0 0 10px 0;
  font-weight: 700;
  line-height: 1.4;
  height: 45px;
  overflow: hidden;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
`;

const ProductCategory = styled.p`
  color: #94A3B8;
  font-size: 12px;
  margin: 0 0 15px 0;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 1px;
`;

const ProductDetails = styled.div`
  display: flex;
  align-items: center;
  margin-bottom: 20px;
  gap: 15px;
`;

const DetailItem = styled.div`
  display: flex;
  align-items: center;
  gap: 6px;
  color: #64748B;
  font-size: 12px;
  font-weight: 500;

  svg {
    color: #FFC107;
    font-size: 12px;
  }
`;

const ProductPriceContainer = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
`;

const PriceWrapper = styled.div`
  display: flex;
  flex-direction: column;
`;

const CurrentPrice = styled.span`
  color: #FFC107;
  font-size: 22px;
  font-weight: 800;
  line-height: 1;
`;

const OriginalPrice = styled.span`
  color: #64748B;
  font-size: 14px;
  text-decoration: line-through;
  font-weight: 500;
  margin-top: 4px;
`;

// NOTA: Cambiado a $instock (con minúscula para consistencia)
const StockStatus = styled.span`
  font-size: 12px;
  font-weight: 700;
  padding: 4px 10px;
  border-radius: 12px;
  background: ${props => props.$instock ? 'rgba(34, 197, 94, 0.1)' : 'rgba(239, 68, 68, 0.1)'};
  color: ${props => props.$instock ? '#22C55E' : '#EF4444'};
  border: 1px solid ${props => props.$instock ? 'rgba(34, 197, 94, 0.3)' : 'rgba(239, 68, 68, 0.3)'};
`;

const ProductActions = styled.div`
  display: flex;
  gap: 10px;
`;

// NOTA: Cambiado a $disabled
const AddToCartButton = styled.button`
  flex: 1;
  background: ${props => props.$disabled ? '#475569' : 'linear-gradient(135deg, #FFC107, #FFD54F)'};
  color: ${props => props.$disabled ? '#94A3B8' : '#000'};
  border: none;
  padding: 12px;
  border-radius: 10px;
  font-size: 14px;
  font-weight: 800;
  cursor: ${props => props.$disabled ? 'not-allowed' : 'pointer'};
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  letter-spacing: 0.5px;

  &:hover:not(:disabled) {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(255, 193, 7, 0.3);
    background: linear-gradient(135deg, #FFD54F, #FFC107);
  }

  &:disabled {
    opacity: 0.6;
  }
`;

const ViewDetailsButton = styled(Link)`
  flex: 1;
  padding: 12px;
  background: transparent;
  color: #FFC107;
  border: 1px solid #FFC107;
  border-radius: 10px;
  font-size: 14px;
  font-weight: 600;
  text-decoration: none;
  text-align: center;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;

  &:hover {
    background: rgba(255, 193, 7, 0.1);
    transform: translateY(-2px);
  }
`;

// Estados vacíos
const EmptyState = styled.div`
  text-align: center;
  padding: 80px 20px;
  background: rgba(15, 23, 42, 0.7);
  border-radius: 16px;
  border: 2px dashed rgba(255, 193, 7, 0.3);
  margin: 40px 0;
`;

const EmptyIcon = styled.div`
  font-size: 64px;
  margin-bottom: 20px;
  opacity: 0.8;
`;

const EmptyTitle = styled.h2`
  font-size: 28px;
  color: #FFFFFF;
  margin-bottom: 15px;
  font-weight: 700;
`;

const EmptyText = styled.p`
  color: #94A3B8;
  font-size: 16px;
  margin-bottom: 30px;
  line-height: 1.6;
  max-width: 600px;
  margin-left: auto;
  margin-right: auto;
`;

const SuggestionsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 15px;
  margin: 30px 0;
  max-width: 800px;
  margin-left: auto;
  margin-right: auto;
`;

const SuggestionCard = styled.button`
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 193, 7, 0.2);
  border-radius: 12px;
  padding: 15px;
  color: #FFC107;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;

  &:hover {
    background: rgba(255, 193, 7, 0.1);
    transform: translateY(-2px);
    border-color: #FFC107;
  }
`;

const CategoriesSection = styled.div`
  margin-top: 40px;
  padding-top: 30px;
  border-top: 1px solid rgba(255, 193, 7, 0.1);
`;

const CategoriesTitle = styled.h3`
  font-size: 20px;
  color: #FFFFFF;
  margin-bottom: 20px;
  text-align: center;
  font-weight: 700;
`;

const CategoriesGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
  gap: 15px;
  max-width: 800px;
  margin: 0 auto;
`;

const CategoryCard = styled(Link)`
  background: linear-gradient(145deg, rgba(255, 193, 7, 0.1), rgba(255, 193, 7, 0.05));
  border: 1px solid rgba(255, 193, 7, 0.2);
  border-radius: 12px;
  padding: 20px 15px;
  color: #FFC107;
  font-weight: 700;
  text-decoration: none;
  text-align: center;
  transition: all 0.3s ease;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10px;

  &:hover {
    background: rgba(255, 193, 7, 0.2);
    transform: translateY(-3px);
    box-shadow: 0 4px 12px rgba(255, 193, 7, 0.2);
    border-color: #FFC107;
  }

  span:first-child {
    font-size: 24px;
  }
`;

const SearchResults = ({ addToCart }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [hasSearched, setHasSearched] = useState(false);

  const searchProducts = useCallback((query) => {
    if (!query.trim()) {
      return [];
    }
    
    const normalizedQuery = query.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
    const searchTerms = normalizedQuery.split(' ').filter(term => term.length > 0);
    
    return initialProducts.filter(product => {
      const searchableText = [
        product.nombre?.toLowerCase(),
        product.categoria?.toLowerCase(),
        product.descripcion?.toLowerCase(),
        ...(product.tags || [])
      ].join(' ').normalize("NFD").replace(/[\u0300-\u036f]/g, "");
      
      return searchTerms.some(term => 
        searchableText.includes(term) ||
        (term.length > 3 && searchableText.includes(term.substring(0, term.length - 1)))
      );
    });
  }, []);

  const generateSuggestions = useCallback((query) => {
    const popularCategories = ['Gorras', 'Accesorios', 'Deportes', 'Ropa', 'Ofertas', 'Nuevos'];
    const popularTags = initialProducts
      .flatMap(p => p.tags || [])
      .filter((tag, index, arr) => arr.indexOf(tag) === index)
      .slice(0, 8);
    
    if (!query) {
      return [...popularCategories, ...popularTags];
    }
    
    return [...popularCategories, ...popularTags]
      .filter(item => 
        item.toLowerCase().includes(query.toLowerCase()) ||
        query.toLowerCase().includes(item.toLowerCase())
      )
      .slice(0, 6);
  }, []);

  useEffect(() => {
    const queryParams = new URLSearchParams(location.search);
    const query = queryParams.get('q') || '';
    setSearchTerm(query);
    setHasSearched(true);
    
    if (query) {
      setLoading(true);
      const timer = setTimeout(() => {
        const filtered = searchProducts(query);
        setResults(filtered);
        setSuggestions(generateSuggestions(query));
        setLoading(false);
      }, 500);
        
      return () => clearTimeout(timer);
    } else {
      setResults([]);
      setSuggestions(generateSuggestions(''));
      setLoading(false);
    }
  }, [location.search, searchProducts, generateSuggestions]);

  const handleAddToCart = (product) => {
    if (!addToCart) return;
    
    const cartItem = {
      id: product.id,
      name: product.nombre,
      price: product.precio,
      originalPrice: product.originalPrice,
      image: product.imagenes?.[0] || '',
      quantity: 1,
      color: product.colores?.[0] || 'Negro',
      size: product.tallas?.[0] || 'Única',
      stock: product.stock,
      category: product.categoria
    };
    
    addToCart(cartItem);
    showNotification('✓ Producto agregado al carrito');
  };

  const showNotification = (message) => {
    const existingNotifications = document.querySelectorAll('.search-notification');
    existingNotifications.forEach(notif => notif.remove());
    
    const notification = document.createElement('div');
    notification.className = 'search-notification';
    notification.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      background: linear-gradient(135deg, #FFC107, #FFD54F);
      color: #000;
      padding: 15px 20px;
      border-radius: 12px;
      box-shadow: 0 8px 25px rgba(0,0,0,0.3);
      z-index: 9999;
      display: flex;
      align-items: center;
      gap: 12px;
      font-weight: 700;
      font-size: 14px;
      border: 2px solid rgba(255, 213, 79, 0.3);
      animation: ${css`${slideIn} 0.3s ease`};
    `;
    notification.innerHTML = `<strong>${message}</strong>`;
    document.body.appendChild(notification);
    
    setTimeout(() => {
      notification.style.animation = css`${slideOut} 0.3s ease`;
      setTimeout(() => notification.remove(), 300);
    }, 3000);
  };

  const handleSearch = (newQuery) => {
    navigate(`/search?q=${encodeURIComponent(newQuery)}`);
  };

  if (loading) {
    return (
      <LoadingContainer>
        <LoadingIcon>🔍</LoadingIcon>
        <EmptyTitle>Buscando productos...</EmptyTitle>
        <EmptyText>
          Estamos buscando &quot;{searchTerm}&quot; en nuestro catálogo
        </EmptyText>
        <LoadingSpinner />
      </LoadingContainer>
    );
  }

  return (
    <Container>
      <SearchHeader>
        <HeaderContent>
          <SearchIconContainer>
            <FaSearch />
          </SearchIconContainer>
          <HeaderText>
            <Title>Resultados de Búsqueda</Title>
            <Subtitle>
              {searchTerm ? (
                <>
                  Mostrando resultados para: <SearchTermHighlight>&quot;{searchTerm}&quot;</SearchTermHighlight>
                </>
              ) : (
                'Ingresa un término de búsqueda para encontrar productos'
              )}
            </Subtitle>
          </HeaderText>
        </HeaderContent>

        <ResultsStats>
          <ResultsCount>
            <span>{results.length}</span>
            {results.length === 1 ? 'producto encontrado' : 'productos encontrados'}
          </ResultsCount>
          <ActionsContainer>
            <ActionButton onClick={() => navigate('/search')}>
              <FaEye /> Nueva Búsqueda
            </ActionButton>
            <BackButton to="/">
              <FaTimes /> Volver al Inicio
            </BackButton>
          </ActionsContainer>
        </ResultsStats>
      </SearchHeader>

      {results.length > 0 ? (
        <ProductsGrid>
          {results.map((product, index) => (
            <ProductCard 
              key={product.id}
              $delay={`${index * 0.1}s`}
            >
              <ProductImageContainer>
                <ProductImage
                  src={product.imagenes?.[0] || 'https://via.placeholder.com/300x220?text=GM+CAPS'}
                  alt={product.nombre}
                  loading="lazy"
                />
                <ProductBadges>
                  {product.hasDiscount && (
                    <DiscountBadge>
                      <FaFire /> -{Math.round(((product.originalPrice - product.precio) / product.originalPrice) * 100)}%
                    </DiscountBadge>
                  )}
                  {product.isFeatured && (
                    <FeaturedBadge>
                      <FaStar /> Destacado
                    </FeaturedBadge>
                  )}
                  {product.isNew && (
                    <NewBadge>
                      <span>🆕</span> Nuevo
                    </NewBadge>
                  )}
                </ProductBadges>
              </ProductImageContainer>

              <ProductContent>
                <ProductName>{product.nombre}</ProductName>
                <ProductCategory>{product.categoria}</ProductCategory>
                
                <ProductDetails>
                  {product.colores && product.colores.length > 0 && (
                    <DetailItem>
                      <FaPalette /> {product.colores.length} colores
                    </DetailItem>
                  )}
                  {product.tallas && product.tallas.length > 0 && (
                    <DetailItem>
                      <FaRuler /> {product.tallas.length} tallas
                    </DetailItem>
                  )}
                </ProductDetails>

                <ProductPriceContainer>
                  <PriceWrapper>
                    <CurrentPrice>${product.precio.toLocaleString()}</CurrentPrice>
                    {product.hasDiscount && product.originalPrice && (
                      <OriginalPrice>${product.originalPrice.toLocaleString()}</OriginalPrice>
                    )}
                  </PriceWrapper>
                  <StockStatus $instock={product.stock > 0}>
                    {product.stock > 0 ? `Stock: ${product.stock}` : 'Agotado'}
                  </StockStatus>
                </ProductPriceContainer>

                <ProductActions>
                  <AddToCartButton
                    onClick={() => handleAddToCart(product)}
                    $disabled={product.stock <= 0}
                  >
                    <FaShoppingCart />
                    {product.stock > 0 ? 'Agregar' : 'Agotado'}
                  </AddToCartButton>
                  <ViewDetailsButton to={`/producto/${product.id}`}>
                    <FaEye /> Detalles
                  </ViewDetailsButton>
                </ProductActions>
              </ProductContent>
            </ProductCard>
          ))}
        </ProductsGrid>
      ) : hasSearched ? (
        <EmptyState>
          <EmptyIcon>🔍</EmptyIcon>
          <EmptyTitle>No se encontraron resultados</EmptyTitle>
          <EmptyText>
            No encontramos productos relacionados con &quot;{searchTerm}&quot;. 
            Prueba con términos más generales o explora nuestras categorías.
          </EmptyText>

          {suggestions.length > 0 && (
            <>
              <EmptyText style={{ fontSize: '14px', marginBottom: '10px' }}>
                Tal vez te interese:
              </EmptyText>
              <SuggestionsGrid>
                {suggestions.slice(0, 4).map((suggestion, index) => (
                  <SuggestionCard
                    key={index}
                    onClick={() => handleSearch(suggestion)}
                  >
                    <FaTag /> {suggestion}
                  </SuggestionCard>
                ))}
              </SuggestionsGrid>
            </>
          )}

          <CategoriesSection>
            <CategoriesTitle>Explora por categorías</CategoriesTitle>
            <CategoriesGrid>
              <CategoryCard to="/categorias">
                <span>👕</span>
                <div>Categorías</div>
              </CategoryCard>
              <CategoryCard to="/ofertas">
                <span>🔥</span>
                <div>Ofertas</div>
              </CategoryCard>
              <CategoryCard to="/nuevos">
                <span>🆕</span>
                <div>Nuevos</div>
              </CategoryCard>
              <CategoryCard to="/destacados">
                <span>⭐</span>
                <div>Destacados</div>
              </CategoryCard>
            </CategoriesGrid>
          </CategoriesSection>
        </EmptyState>
      ) : (
        <EmptyState>
          <EmptyIcon>🔍</EmptyIcon>
          <EmptyTitle>¿Qué estás buscando?</EmptyTitle>
          <EmptyText>
            Usa la barra de búsqueda para encontrar productos específicos en nuestro catálogo.
            Puedes buscar por nombre, categoría o características.
          </EmptyText>
          
          <SuggestionsGrid>
            {['Gorras', 'Accesorios', 'Deportes', 'Ropa', 'Ofertas', 'Nuevos'].map((term, index) => (
              <SuggestionCard
                key={index}
                onClick={() => handleSearch(term)}
              >
                <FaSearch /> {term}
              </SuggestionCard>
            ))}
          </SuggestionsGrid>
        </EmptyState>
      )}
    </Container>
  );
};

export default SearchResults;