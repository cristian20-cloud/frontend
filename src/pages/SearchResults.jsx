// src/pages/SearchResults.jsx
import React, { useState, useEffect, useCallback } from 'react';
import { useLocation, Link, useNavigate } from 'react-router-dom';
import { initialProducts } from '../data';
import {
  FaSearch,
  FaTimes,
  FaShoppingCart,
  FaStar,
  FaRegStar,
  FaStarHalfAlt,
  FaMinus,
  FaPlus,
  FaCheckCircle,
  FaExclamationCircle,
  FaFire,
  FaTag,
  FaEye,
} from 'react-icons/fa';
import styled, { keyframes } from 'styled-components';

/* =========================
DESCUENTO POR MAYOR
========================= */
const BULK_MIN_QTY = 6;
const BULK_DISCOUNT = 0.1;

const applyBulkDiscount = (cart) => {
  const totalQty = cart.reduce((acc, it) => acc + (Number(it.quantity) || 0), 0);
  if (totalQty < BULK_MIN_QTY) {
    return cart.map((it) => ({
      ...it,
      price: Number(it.originalPrice ?? it.price),
    }));
  }
  return cart.map((it) => {
    const base = Number(it.originalPrice ?? it.price) || 0;
    const discounted = Math.round(base * (1 - BULK_DISCOUNT));
    return { ...it, originalPrice: base, price: discounted };
  });
};

// Función para determinar el color del stock
const getStockColorClass = (stock) => {
  if (stock === 0) return 'stock-zero';
  if (stock >= 10) return 'stock-high';
  if (stock >= 4 && stock <= 9) return 'stock-medium';
  if (stock >= 1 && stock <= 3) return 'stock-low';
  return 'stock-zero';
};

// Animaciones
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

// Estilos
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
  grid-template-columns: repeat(4, 1fr);
  gap: 20px;
  padding: 20px 0;

  @media (max-width: 980px) {
    grid-template-columns: repeat(2, 1fr);
  }

  @media (max-width: 480px) {
    grid-template-columns: 1fr;
  }
`;

// Tarjeta de producto
const ProductCard = styled.div`
  background: transparent;
  border-radius: 12px;
  overflow: hidden;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
  animation: ${fadeIn} 0.5s ease ${(props) => props.$delay || '0s'} both;
`;

const ProductImageContainer = styled.div`
  height: 250px;
  position: relative;
  overflow: hidden;
  border-radius: 16px;
  background: #000;
  border: 1px solid rgba(255, 255, 255, 0.08);
  cursor: pointer;

  @media (max-width: 768px) {
    height: 200px;
  }

  @media (max-width: 480px) {
    height: 180px;
  }
`;

const ProductImage = styled.img`
  width: 100%;
  height: 100%;
  object-fit: cover;
  object-position: center;
  transition: transform 240ms ease;

  ${ProductCard}:hover & {
    transform: scale(1.02);
  }
`;

const ProductBadges = styled.div`
  position: absolute;
  top: 10px;
  left: 10px;
  right: 10px;
  display: flex;
  justify-content: space-between;
  z-index: 10;
`;

const Badge = styled.span`
  padding: 6px 10px;
  border-radius: 12px;
  font-weight: 900;
  font-size: 0.72rem;
  letter-spacing: 0.4px;
  border: 1px solid rgba(255, 255, 255, 0.12);
`;

const DiscountBadge = styled(Badge)`
  background: linear-gradient(135deg, #ffd700, #e6c85a);
  color: #0b1220;
`;

const FeaturedBadge = styled(Badge)`
  background: linear-gradient(135deg, #60a5fa, #2563eb);
  color: #fff;
`;

const ImageDots = styled.div`
  position: absolute;
  bottom: 10px;
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  gap: 8px;
  z-index: 3;
  background: rgba(0, 0, 0, 0.35);
  padding: 6px 10px;
  border-radius: 14px;
  border: 1px solid rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(6px);
  opacity: 0;
  pointer-events: none;
  transition: opacity 160ms ease;

  ${ProductImageContainer}:hover & {
    opacity: 1;
    pointer-events: auto;
  }

  @media (max-width: 768px) {
    display: none;
  }
`;

const Dot = styled.button`
  width: 9px;
  height: 9px;
  border-radius: 999px;
  border: 1px solid #ffd700;
  background: rgba(0, 0, 0, 0.2);
  cursor: pointer;
  transition: 0.2s ease;

  &.active {
    background: rgba(255, 215, 0, 0.95);
    box-shadow: 0 0 10px rgba(255, 215, 0, 0.35);
  }
`;

const ProductContent = styled.div`
  padding: 10px 6px 10px 6px;
`;

const ProductName = styled.h3`
  margin: 0 0 8px 0;
  font-size: 0.98rem;
  font-weight: 400;
  line-height: 1.25;
  color: rgba(255, 255, 255, 0.92);
  overflow: hidden;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
`;

const ProductCategory = styled.p`
  color: #94a3b8;
  font-size: 12px;
  margin: 0 0 8px 0;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 1px;
`;

const StarsRow = styled.div`
  margin-top: 4px;
`;

const Rating = styled.span`
  display: inline-flex;
  gap: 2px;
  color: rgba(255, 215, 0, 0.92);

  svg {
    width: 14px;
    height: 14px;
  }
`;

const ProductPriceContainer = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
  margin-top: 4px;
`;

const PriceWrapper = styled.div`
  display: flex;
  flex-direction: row;
  align-items: baseline;
  gap: 12px;
`;

const OriginalPrice = styled.span`
  font-size: 1rem;
  color: rgba(255, 255, 255, 0.5);
  text-decoration: line-through;
  font-family: 'Times New Roman', Times, serif;
  font-weight: 400;
`;

const CurrentPrice = styled.span`
  font-variant-numeric: tabular-nums;
  font-family: 'Times New Roman', Times, serif;
  font-size: 1.4rem;
  font-weight: 900;
  color: #ffb300;
  white-space: nowrap;
  line-height: 1;
`;

const AddToCartButton = styled.button`
  width: 38px;
  height: 38px;
  padding: 0;
  border-radius: 50%;
  border: 1.5px solid #ffd700;
  background: transparent;
  color: #ffd700;
  font-size: 0.85rem;
  cursor: ${(props) => (props.$disabled ? 'not-allowed' : 'pointer')};
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: ${(props) => (props.$disabled ? 0.5 : 1)};

  &:hover:not(:disabled) {
    background: rgba(255, 215, 0, 0.25);
    border-color: #ffa500;
    color: #ffa500;
    transform: scale(1.05);
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
  color: #ffffff;
  margin-bottom: 15px;
  font-weight: 700;
`;

const EmptyText = styled.p`
  color: #94a3b8;
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
  color: #ffc107;
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
    border-color: #ffc107;
  }
`;

// MODAL
const ModalOverlay = styled.div`
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.82);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9999;
  padding: 18px;
`;

const Modal = styled.div`
  position: relative;
  width: min(1100px, 98%);
  background: #030712;
  border: none;
  border-radius: 16px;
  display: flex;
  gap: 20px;
  padding: 20px;
  box-shadow: 0 20px 50px rgba(0, 0, 0, 0.55);
  max-height: 90vh;
  overflow-y: auto;

  @media (max-width: 768px) {
    flex-direction: column;
    width: 98vw;
    max-height: 95vh;
    padding: 14px;
  }
`;

const ModalClose = styled.button`
  position: absolute;
  top: 15px;
  right: 15px;
  width: 36px;
  height: 36px;
  border-radius: 50%;
  border: none;
  background: transparent;
  color: #fff;
  cursor: pointer;
  z-index: 10;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;

  &:hover {
    background: rgba(255, 255, 255, 0.1);
    color: #fff;
  }
`;

const ModalLeft = styled.div`
  flex: 0 0 45%;
  min-width: 360px;
  border-radius: 12px;
  overflow: hidden;

  @media (max-width: 768px) {
    flex: none;
    width: 100%;
    min-width: auto;
    max-height: 50vh;
  }
`;

const ModalImgBox = styled.div`
  width: 100%;
  height: 100%;
  min-height: 420px;
  background: #000;
  border-radius: 12px;
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: center;

  @media (max-width: 768px) {
    min-height: 280px;
    max-height: 50vh;
  }

  @media (max-width: 480px) {
    min-height: 220px;
    max-height: 45vh;
  }
`;

const ModalImg = styled.img`
  width: 100%;
  height: 100%;
  object-fit: cover;
  object-position: center;
  cursor: pointer;
`;

const ModalRight = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 14px;
  padding: 14px;
  overflow-y: auto;
  max-height: 75vh;
  scrollbar-width: none;
  -ms-overflow-style: none;

  &::-webkit-scrollbar {
    display: none;
    width: 0;
    background: transparent;
  }

  @media (max-width: 768px) {
    max-height: 40vh;
  }
`;

const ModalHeaderRow = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

const ModalTitleRow = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  flex-wrap: wrap;
`;

const ModalTitleLight = styled.h2`
  margin: 0;
  font-size: 1.6rem;
  font-weight: 400;
  line-height: 1.2;
  color: #fff;

  @media (max-width: 768px) {
    font-size: 1.4rem;
  }

  @media (max-width: 480px) {
    font-size: 1.2rem;
  }
`;

const ModalTagsInline = styled.div`
  display: flex;
  gap: 6px;
  flex-wrap: wrap;
`;

const Tag = styled.span`
  padding: 5px 12px;
  border-radius: 14px;
  font-weight: 700;
  font-size: 0.75rem;
  border: 1px solid rgba(96, 165, 250, 0.35);
  color: #fff;
`;

const TagFeatured = styled(Tag)`
  background: #2a4a6f;
  border-color: #152744;
`;

const TagOffer = styled(Tag)`
  background: #152744;
  border-color: #1e3a5f;
`;

const PriceRow = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
  margin: 4px 0;
`;

const PriceStrikethrough = styled.span`
  color: rgba(255, 255, 255, 0.5);
  text-decoration: line-through;
  font-size: 1.2rem;
  font-family: 'Times New Roman', Times, serif;

  @media (max-width: 768px) {
    font-size: 1.1rem;
  }
`;

const PriceArrow = styled.span`
  color: #ffb300;
  font-size: 1.2rem;
  font-weight: 700;

  @media (max-width: 768px) {
    font-size: 1.1rem;
  }
`;

const ModalPrice = styled.span`
  color: #ffb300;
  font-weight: 900;
  font-size: 1.6rem;
  font-family: 'Times New Roman', Times, serif;
  white-space: nowrap;

  @media (max-width: 768px) {
    font-size: 1.3rem;
  }

  @media (max-width: 480px) {
    font-size: 1.1rem;
  }
`;

const ProductDescription = styled.div`
  margin-top: 8px;
  padding: 10px 14px;
  background: rgba(42, 74, 111, 0.2);
  border-radius: 8px;
  font-size: 0.95rem;
  color: rgba(255, 255, 255, 0.72);
  border: 1px solid rgba(96, 165, 250, 0.2);
  line-height: 1.5;
`;

const SizesNew = styled.div`
  margin: 4px 0;
`;

const SizesRowNew = styled.div`
  display: flex;
  align-items: flex-start;
  gap: 24px;

  @media (max-width: 768px) {
    flex-direction: column;
    gap: 16px;
  }
`;

const SizesSectionNew = styled.div`
  flex: 2;

  @media (max-width: 768px) {
    width: 100%;
  }
`;

const QuantitySectionNew = styled.div`
  flex: 1;
  min-width: 120px;
  display: flex;
  flex-direction: column;
  align-items: flex-end;

  @media (max-width: 768px) {
    width: 100%;
    align-items: flex-start;
  }
`;

const SectionLabelLight = styled.div`
  font-weight: 400;
  color: #fff;
  font-size: 0.9rem;
  margin-bottom: 8px;
`;

const SizesWrapNew = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
`;

const SizeChipNew = styled.button`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 4px 12px;
  border-radius: 999px;
  border: 1px solid #2a4a6f;
  background: transparent;
  color: #fff;
  font-weight: 400;
  font-size: 0.85rem;
  min-width: 45px;
  text-align: center;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover:not(.is-disabled) {
    border-color: #ffd700;
    color: #ffd700;
  }

  &.is-selected {
    border-color: #ffd700;
    color: #ffd700;
  }

  &.is-disabled {
    opacity: 0.35;
    border-color: rgba(255, 255, 255, 0.2);
    cursor: not-allowed;
  }

  @media (max-width: 768px) {
    padding: 4px 10px;
    font-size: 0.8rem;
    min-width: 40px;
  }

  @media (max-width: 480px) {
    padding: 4px 8px;
    font-size: 0.75rem;
    min-width: 35px;
  }
`;

const QuantityButtonsNew = styled.div`
  display: flex;
  align-items: center;
  gap: 6px;
  border: 1px solid #2a4a6f;
  border-radius: 6px;
  padding: 2px;

  @media (max-width: 768px) {
    width: 100%;
    justify-content: space-between;
  }
`;

const QtyBtnNew = styled.button`
  width: 28px;
  height: 28px;
  border: none;
  background: transparent;
  color: #fff;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 4px;
  transition: all 0.2s ease;

  &:hover:not(:disabled) {
    background: rgba(42, 74, 111, 0.3);
  }

  &:disabled {
    opacity: 0.3;
    cursor: not-allowed;
  }

  @media (max-width: 768px) {
    width: 30px;
    height: 30px;
  }

  @media (max-width: 480px) {
    width: 32px;
    height: 32px;
  }
`;

const QtyValueNew = styled.span`
  min-width: 28px;
  text-align: center;
  font-weight: 400;
  font-size: 1rem;
  color: #fff;

  @media (max-width: 768px) {
    font-size: 0.95rem;
  }
`;

const StockSingleLine = styled.div`
  margin: 8px 0 12px 0;
  padding: 0;
  font-size: 0.95rem;
  line-height: 1.5;
  color: #fff;
`;

const BulkMessage = styled.span`
  color: #ffd700;
  font-weight: 400;
`;

const BulkSeparator = styled.span`
  color: #fff;
  margin: 0 4px;
  font-weight: 400;
`;

const StockText = styled.span`
  color: #fff;
  font-weight: 400;
`;

const StockNumber = styled.span`
  font-weight: 700;

  &.stock-high {
    color: #10b981;
  }

  &.stock-medium {
    color: #f59e0b;
  }

  &.stock-low {
    color: #ef4444;
  }

  &.stock-zero {
    color: #ef4444;
  }
`;

const OutOfStockMessage = styled.div`
  background: rgba(239, 68, 68, 0.15);
  border: 1.5px solid #ef4444;
  color: #ef4444;
  padding: 8px 14px;
  border-radius: 8px;
  font-size: 0.9rem;
  font-weight: 600;
  margin: 8px 0;
  width: fit-content;
`;

const QuantityAlert = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 12px;
  background: rgba(239, 68, 68, 0.15);
  border: 1px solid #ef4444;
  border-radius: 8px;
  color: #ef4444;
  font-size: 0.9rem;
  font-weight: 500;
  margin: 4px 0;
`;

const ModalButtonsRow = styled.div`
  display: flex;
  gap: 12px;
  margin-top: 16px;

  @media (max-width: 768px) {
    gap: 8px;
  }
`;

const BtnAddCartReverse = styled.button`
  flex: 2;
  height: 44px;
  padding: 0 20px;
  border-radius: 10px;
  border: 1.5px solid #ffb300;
  background: #ffb300;
  color: #000;
  font-weight: 700;
  font-size: 0.95rem;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  transition: all 180ms ease;
  white-space: nowrap;

  &:hover:not(:disabled) {
    background: transparent;
    color: #ffb300;
    border-color: #ffb300;
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  @media (max-width: 768px) {
    height: 42px;
    padding: 0 14px;
    font-size: 0.9rem;
  }

  @media (max-width: 640px) {
    height: 38px;
    padding: 0 10px;
    font-size: 0.8rem;
  }

  @media (max-width: 480px) {
    height: 36px;
    font-size: 0.75rem;
    padding: 0 8px;
  }
`;

const BtnViewCartNew = styled(Link)`
  flex: 1;
  height: 38px;
  padding: 0 12px;
  border-radius: 8px;
  border: 1px solid #ffb300;
  background: transparent;
  color: #ffb300;
  font-weight: 400;
  font-size: 0.8rem;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  white-space: nowrap;
  text-decoration: none;
  transition: all 180ms ease;
  min-width: auto;

  &:hover {
    background: rgba(255, 179, 0, 0.1);
    border-color: #ffa000;
    color: #ffa000;
  }

  @media (max-width: 768px) {
    height: 36px;
    padding: 0 8px;
    font-size: 0.75rem;
  }

  @media (max-width: 640px) {
    height: 32px;
    font-size: 0.7rem;
    padding: 0 6px;
  }

  @media (max-width: 480px) {
    height: 30px;
    font-size: 0.65rem;
    padding: 0 5px;
  }
`;

const SizeErrorMsg = styled.div`
  color: #ef4444;
  font-size: 0.85rem;
  font-weight: 600;
  margin-top: 8px;
  animation: shake 0.4s ease-in-out;

  @keyframes shake {
    0%,
    100% {
      transform: translateX(0);
    }
    25% {
      transform: translateX(-5px);
    }
    75% {
      transform: translateX(5px);
    }
  }
`;

// Toast de éxito
const SuccessToastContainer = styled.div`
  position: fixed;
  top: 100px;
  right: 20px;
  z-index: 10000;
  animation: ${slideIn} 0.4s ease-out;

  @media (max-width: 768px) {
    top: 80px;
    right: 10px;
    left: 10px;
  }

  @media (max-width: 480px) {
    top: 70px;
  }
`;

const SuccessToastContent = styled.div`
  background: #1e293b;
  border: 1px solid #ffd700;
  border-radius: 12px;
  padding: 16px 20px;
  display: flex;
  align-items: center;
  gap: 12px;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.5);
  min-width: 280px;

  @media (max-width: 768px) {
    min-width: auto;
  }
`;

const ToastText = styled.div`
  h4 {
    margin: 0;
    font-size: 0.95rem;
    font-weight: 700;
    color: #10b981;
  }

  p {
    margin: 2px 0 0 0;
    font-size: 0.8rem;
    color: #94a3b8;
  }
`;

// RatingStars component
const RatingStars = ({ value }) => {
  if (value == null) return null;
  const full = Math.floor(value);
  const half = value - full >= 0.5 ? 1 : 0;
  const empty = 5 - full - half;
  return (
    <Rating>
      {Array.from({ length: full }).map((_, i) => (
        <FaStar key={`f-${i}`} />
      ))}
      {half === 1 && <FaStarHalfAlt />}
      {Array.from({ length: empty }).map((_, i) => (
        <FaRegStar key={`e-${i}`} />
      ))}
    </Rating>
  );
};

// Helpers
const clampRating = (r) => {
  const n = Number(r);
  if (Number.isNaN(n)) return null;
  return Math.max(0, Math.min(5, n));
};

const getRatingFromProduct = (p) =>
  clampRating(p?.rating) ??
  clampRating(p?.calificacion) ??
  clampRating(p?.stars) ??
  clampRating(p?.score) ??
  null;

const normalizeSizes = (product) => {
  const t = product?.tallas;
  if (!t) return [];
  if (Array.isArray(t))
    return t
      .filter(Boolean)
      .map((x) => String(x).trim())
      .filter(Boolean);
  if (typeof t === 'string')
    return t
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean);
  if (typeof t === 'object') return Object.keys(t).filter((k) => Boolean(t[k]));
  return [];
};

const safeImg = (product) => {
  const first =
    product?.imagenes?.[0]?.trim?.() ||
    product?.imagen?.trim?.() ||
    'https://via.placeholder.com/800x800?text=Sin+Imagen';
  return first;
};

/* =========================
INVENTARIO
========================= */
const INV_KEY = 'inv_by_variant_v1';

const readInventory = () => {
  try {
    return JSON.parse(localStorage.getItem(INV_KEY) || '{}');
  } catch {
    return {};
  }
};

const writeInventory = (inv) => {
  localStorage.setItem(INV_KEY, JSON.stringify(inv));
};

const buildInitialInventoryFromProducts = (products) => {
  const inv = {};
  for (const p of products) {
    const sizes = normalizeSizes(p);
    const pid = String(p.id);
    if (!sizes.length) continue;

    const total = Math.max(0, Number(p.stock ?? 0));
    const totalSafe = Number.isFinite(total) ? total : 0;
    const baseTotal = totalSafe > 0 ? totalSafe : 12;
    const per = Math.floor(baseTotal / sizes.length);
    let rem = baseTotal - per * sizes.length;

    inv[pid] = {};
    for (const s of sizes) {
      const add = rem > 0 ? 1 : 0;
      inv[pid][s] = Math.max(0, per + add);
      if (rem > 0) rem -= 1;
    }
  }
  return inv;
};

const ensureInventory = (products) => {
  const current = readInventory();
  const built = buildInitialInventoryFromProducts(products);

  if (!Object.keys(current).length) {
    writeInventory(built);
    return built;
  }

  let changed = false;
  const merged = { ...current };

  for (const pid of Object.keys(built)) {
    if (!merged[pid]) {
      merged[pid] = built[pid];
      changed = true;
      continue;
    }
    for (const talla of Object.keys(built[pid])) {
      if (typeof merged[pid][talla] !== 'number') {
        merged[pid][talla] = built[pid][talla];
        changed = true;
      }
    }
  }

  if (changed) writeInventory(merged);
  return merged;
};

const getAvailableFor = (inv, productId, talla) => {
  const pid = String(productId);
  return Math.max(0, Number(inv?.[pid]?.[talla] ?? 0));
};

const decreaseInventory = (inv, productId, talla, qty) => {
  const pid = String(productId);
  const next = { ...inv, [pid]: { ...(inv[pid] || {}) } };
  const current = getAvailableFor(inv, productId, talla);
  next[pid][talla] = Math.max(0, current - Math.max(0, qty));
  return next;
};

const SearchResults = ({ updateCart, cartItems }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [hasSearched, setHasSearched] = useState(false);

  // Estados del modal
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [selectedSize, setSelectedSize] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [showSuccessToast, setShowSuccessToast] = useState(false);
  const [showSizeError, setShowSizeError] = useState(false);
  const [showQuantityAlert, setShowQuantityAlert] = useState(false);
  const [inventory, setInventory] = useState({});
  const [availableStock, setAvailableStock] = useState(0);
  const [remainingStock, setRemainingStock] = useState(0);
  const [imageIndices, setImageIndices] = useState({});

  useEffect(() => {
    const inv = ensureInventory(initialProducts);
    setInventory(inv);
  }, []);

  // Actualizar stock disponible cuando cambia la talla seleccionada
  useEffect(() => {
    if (selectedProduct && selectedSize) {
      const stock = getAvailableFor(inventory, selectedProduct.id, selectedSize);
      setAvailableStock(stock);
      setRemainingStock(stock);
      if (quantity > stock) {
        setQuantity(Math.max(1, stock));
      }
    } else {
      setAvailableStock(0);
      setRemainingStock(0);
    }
  }, [selectedProduct, selectedSize, inventory, quantity]);

  // Actualizar stock restante cuando cambia la cantidad
  useEffect(() => {
    if (selectedProduct && selectedSize) {
      const stock = getAvailableFor(inventory, selectedProduct.id, selectedSize);
      setRemainingStock(Math.max(0, stock - quantity));
    }
  }, [quantity, selectedProduct, selectedSize, inventory]);

  const searchProducts = useCallback(
    (query) => {
      if (!query.trim()) {
        return [];
      }

      const normalizedQuery = query
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '');

      return initialProducts.filter((product) => {
        const searchableText = [
          product.nombre?.toLowerCase() || '',
          product.categoria?.toLowerCase() || '',
          product.descripcion?.toLowerCase() || '',
          ...(product.tags || []).map((tag) => tag.toLowerCase()),
        ]
          .join(' ')
          .normalize('NFD')
          .replace(/[\u0300-\u036f]/g, '');

        return searchableText.includes(normalizedQuery);
      });
    },
    []
  );

  const generateSuggestions = useCallback((query) => {
    const popularCategories = ['Gorras', 'Accesorios', 'Deportes', 'Ropa', 'Ofertas', 'Nuevos'];

    if (!query) {
      return popularCategories.slice(0, 6);
    }

    return popularCategories
      .filter((item) => item.toLowerCase().includes(query.toLowerCase()))
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
      }, 300);

      return () => clearTimeout(timer);
    } else {
      setResults([]);
      setSuggestions(generateSuggestions(''));
      setLoading(false);
    }
  }, [location.search, searchProducts, generateSuggestions]);

  const addToCart = (product, size, qty) => {
    if (!size) return;
    const available = getAvailableFor(inventory, product.id, size);
    if (available < qty) return;

    const currentCart = cartItems || [];
    const cartItem = {
      id: product.id,
      name: product.nombre,
      originalPrice: Math.round(product.precio || 0),
      price: Math.round(product.precio || 0),
      image: safeImg(product),
      quantity: qty,
      color: size,
    };

    const idx = currentCart.findIndex(
      (it) => it.id === cartItem.id && it.color === cartItem.color
    );

    let newCart;
    if (idx > -1) {
      newCart = currentCart.map((item, i) =>
        i === idx ? { ...item, quantity: item.quantity + qty } : item
      );
    } else {
      newCart = [...currentCart, cartItem];
    }

    const discountedCart = applyBulkDiscount(newCart);
    localStorage.setItem('cart', JSON.stringify(discountedCart));

    if (updateCart) {
      updateCart(discountedCart);
    }

    window.dispatchEvent(
      new CustomEvent('cartUpdated', {
        detail: { cart: discountedCart },
      })
    );

    const nextInv = decreaseInventory(inventory, product.id, size, qty);
    setInventory(nextInv);
    writeInventory(nextInv);

    setShowSuccessToast(true);
    setTimeout(() => {
      setShowSuccessToast(false);
    }, 3000);

    closeModal();
  };

  const handleAddToCartSimple = (product) => {
    setSelectedProduct(product);
    setSelectedSize(null);
    setQuantity(1);
    setShowSizeError(false);
    setShowQuantityAlert(false);
  };

  const handleImageClick = (productId, imagesLength, e) => {
    e.stopPropagation();
    if (imagesLength > 1) {
      setImageIndices((prev) => ({
        ...prev,
        [productId]: ((prev[productId] || 0) + 1) % imagesLength,
      }));
    }
  };

  const handleDotClick = (productId, index, e) => {
    e.stopPropagation();
    setImageIndices((prev) => ({
      ...prev,
      [productId]: index,
    }));
  };

  const handleSearch = (newQuery) => {
    navigate(`/search?q=${encodeURIComponent(newQuery)}`);
  };

  // Funciones del modal
  const sizesForModal = selectedProduct ? normalizeSizes(selectedProduct) : [];

  const closeModal = () => {
    setSelectedProduct(null);
    setSelectedSize(null);
    setQuantity(1);
    setShowSizeError(false);
    setShowQuantityAlert(false);
  };

  const handleSizeSelect = (talla) => {
    if (selectedSize === talla) {
      setSelectedSize(null);
    } else {
      setSelectedSize(talla);
      setShowSizeError(false);
      setQuantity(1);
    }
  };

  const incrementQuantity = () => {
    if (!selectedSize && sizesForModal.length > 0) {
      setShowSizeError(true);
      setTimeout(() => setShowSizeError(false), 2000);
      return;
    }

    if (quantity < availableStock && quantity < 10) {
      setQuantity(quantity + 1);
    } else if (quantity >= availableStock) {
      setShowQuantityAlert(true);
      setTimeout(() => setShowQuantityAlert(false), 2000);
    }
  };

  const decrementQuantity = () => {
    if (quantity > 1) {
      setQuantity(quantity - 1);
    }
  };

  const handleModalAddToCart = () => {
    if (!selectedProduct) return;
    if (sizesForModal.length > 0 && !selectedSize) {
      setShowSizeError(true);
      setTimeout(() => setShowSizeError(false), 2000);
      return;
    }
    const size = selectedSize ? selectedSize : sizesForModal[0];
    addToCart(selectedProduct, size, quantity);
  };

  const basePrice = selectedProduct ? Math.round(selectedProduct.precio || 0) : 0;
  const originalPrice = selectedProduct?.originalPrice ? Math.round(selectedProduct.originalPrice) : basePrice;
  const isWholesale = quantity >= BULK_MIN_QTY;
  const displayPrice = isWholesale ? Math.round(basePrice * (1 - BULK_DISCOUNT)) : basePrice;

  if (loading) {
    return (
      <LoadingContainer>
        <LoadingSpinner />
        <h2 style={{ marginTop: '20px', color: '#FFC107' }}>Buscando productos...</h2>
        <p style={{ color: '#94A3B8' }}>
          {searchTerm ? `Buscando "${searchTerm}"` : 'Cargando...'}
        </p>
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
            <Title>Explora Nuestras Categorías</Title>
            <Subtitle>
              {searchTerm ? (
                <>
                  Mostrando resultados para: <SearchTermHighlight>&quot;{searchTerm}&quot;</SearchTermHighlight>
                </>
              ) : (
                'Descubre nuestra amplia selección de gorras organizadas por categorías. Desde estilos clásicos hasta las últimas tendencias, encuentra la gorra perfecta para ti.'
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
          {results.map((product, index) => {
            const rating = getRatingFromProduct(product);
            const images = product.imagenes?.length ? product.imagenes : [safeImg(product)];
            const currentImageIndex = imageIndices[product.id] || 0;

            return (
              <ProductCard key={product.id} $delay={`${index * 0.1}s`}>
                <ProductImageContainer
                  onClick={(e) => handleImageClick(product.id, images.length, e)}
                >
                  <ProductImage
                    src={images[currentImageIndex] || images[0]}
                    alt={product.nombre}
                    loading="lazy"
                    onError={(e) => {
                      e.currentTarget.src =
                        'https://via.placeholder.com/800x800?text=Sin+Imagen';
                    }}
                  />
                  <ProductBadges>
                    {(product.hasDiscount || product.oferta) && (
                      <DiscountBadge>OFERTA</DiscountBadge>
                    )}
                    {(product.destacado || product.isFeatured) && (
                      <FeaturedBadge>DESTACADO</FeaturedBadge>
                    )}
                  </ProductBadges>
                  {images.length > 1 && (
                    <ImageDots>
                      {images.slice(0, 4).map((_, i) => (
                        <Dot
                          key={i}
                          className={i === currentImageIndex ? 'active' : ''}
                          onClick={(e) => handleDotClick(product.id, i, e)}
                        />
                      ))}
                    </ImageDots>
                  )}
                </ProductImageContainer>

                <ProductContent>
                  <ProductName>{product.nombre}</ProductName>
                  <ProductCategory>{product.categoria}</ProductCategory>

                  <StarsRow>
                    <RatingStars value={rating} />
                  </StarsRow>

                  <ProductPriceContainer>
                    <PriceWrapper>
                      {(product.hasDiscount || product.oferta) && product.originalPrice && (
                        <OriginalPrice>
                          ${Math.round(product.originalPrice).toLocaleString()}
                        </OriginalPrice>
                      )}
                      <CurrentPrice>
                        ${Math.round(product.precio || 0).toLocaleString()}
                      </CurrentPrice>
                    </PriceWrapper>
                    <AddToCartButton
                      onClick={() => handleAddToCartSimple(product)}
                      $disabled={product.stock <= 0}
                    >
                      <FaShoppingCart size={15} />
                    </AddToCartButton>
                  </ProductPriceContainer>
                </ProductContent>
              </ProductCard>
            );
          })}
        </ProductsGrid>
      ) : hasSearched ? (
        <EmptyState>
          <EmptyIcon>🔍</EmptyIcon>
          <EmptyTitle>No se encontraron resultados</EmptyTitle>
          <EmptyText>
            No encontramos productos relacionados con &quot;{searchTerm}&quot;. Prueba con
            términos más generales o explora nuestras categorías.
          </EmptyText>

          {suggestions.length > 0 && (
            <>
              <EmptyText style={{ fontSize: '14px', marginBottom: '10px' }}>
                Tal vez te interese:
              </EmptyText>
              <SuggestionsGrid>
                {suggestions.slice(0, 4).map((suggestion, index) => (
                  <SuggestionCard key={index} onClick={() => handleSearch(suggestion)}>
                    <FaTag /> {suggestion}
                  </SuggestionCard>
                ))}
              </SuggestionsGrid>
            </>
          )}
        </EmptyState>
      ) : (
        <EmptyState>
          <EmptyIcon>🔍</EmptyIcon>
          <EmptyTitle>¿Qué estás buscando?</EmptyTitle>
          <EmptyText>
            Usa la barra de búsqueda para encontrar productos específicos en nuestro
            catálogo. Puedes buscar por nombre, categoría o características.
          </EmptyText>

          <SuggestionsGrid>
            {['Gorras', 'Accesorios', 'Deportes', 'Ropa', 'Ofertas', 'Nuevos'].map(
              (term, index) => (
                <SuggestionCard key={index} onClick={() => handleSearch(term)}>
                  <FaSearch /> {term}
                </SuggestionCard>
              )
            )}
          </SuggestionsGrid>
        </EmptyState>
      )}

      {/* MODAL DETALLE */}
      {selectedProduct && (
        <ModalOverlay onClick={closeModal}>
          <Modal onClick={(e) => e.stopPropagation()}>
            <ModalClose onClick={closeModal}>
              <FaTimes size={18} />
            </ModalClose>

            <ModalLeft>
              <ModalImgBox>
                <ModalImg
                  src={safeImg(selectedProduct)}
                  alt={selectedProduct.nombre || 'Producto'}
                />
              </ModalImgBox>
            </ModalLeft>

            <ModalRight>
              <ModalHeaderRow>
                <ModalTitleRow>
                  <ModalTitleLight>{selectedProduct.nombre}</ModalTitleLight>
                  <ModalTagsInline>
                    {(selectedProduct.hasDiscount || selectedProduct.oferta) && (
                      <TagOffer>OFERTA</TagOffer>
                    )}
                    {(selectedProduct.destacado || selectedProduct.isFeatured) && (
                      <TagFeatured>DESTACADO</TagFeatured>
                    )}
                  </ModalTagsInline>
                </ModalTitleRow>

                <PriceRow>
                  {(selectedProduct.hasDiscount || selectedProduct.oferta) &&
                    selectedProduct.originalPrice && (
                      <>
                        <PriceStrikethrough>
                          ${originalPrice.toLocaleString()}
                        </PriceStrikethrough>
                        <PriceArrow>→</PriceArrow>
                      </>
                    )}
                  <ModalPrice>${displayPrice.toLocaleString()}</ModalPrice>
                </PriceRow>

                <ProductDescription>
                  {selectedProduct.descripcion || 'Sin descripción disponible'}
                </ProductDescription>
              </ModalHeaderRow>

              {/* TALLAS Y CANTIDAD */}
              {sizesForModal.length > 0 && (
                <SizesNew>
                  <SizesRowNew>
                    <SizesSectionNew>
                      <SectionLabelLight>Talla:</SectionLabelLight>
                      <SizesWrapNew>
                        {sizesForModal.map((t) => {
                          const ava = getAvailableFor(inventory, selectedProduct.id, t);
                          const disabled = ava <= 0;
                          const isSelected = selectedSize === t;
                          return (
                            <SizeChipNew
                              key={t}
                              className={`${disabled ? 'is-disabled' : ''} ${
                                isSelected ? 'is-selected' : ''
                              }`}
                              onClick={() => !disabled && handleSizeSelect(t)}
                            >
                              {t}
                            </SizeChipNew>
                          );
                        })}
                      </SizesWrapNew>
                    </SizesSectionNew>

                    <QuantitySectionNew>
                      <SectionLabelLight>Cantidad:</SectionLabelLight>
                      <QuantityButtonsNew>
                        <QtyBtnNew onClick={decrementQuantity} disabled={quantity <= 1}>
                          <FaMinus size={10} />
                        </QtyBtnNew>
                        <QtyValueNew>{quantity}</QtyValueNew>
                        <QtyBtnNew
                          onClick={incrementQuantity}
                          disabled={quantity >= 10 || quantity >= availableStock}
                        >
                          <FaPlus size={10} />
                        </QtyBtnNew>
                      </QuantityButtonsNew>
                    </QuantitySectionNew>
                  </SizesRowNew>

                  {showSizeError && (
                    <SizeErrorMsg>⚠️ Debes seleccionar una talla primero</SizeErrorMsg>
                  )}
                </SizesNew>
              )}

              {/* STOCK QUE SE DESCUENTA EN TIEMPO REAL */}
              {selectedSize && (
                <StockSingleLine>
                  {isWholesale && (
                    <>
                      <BulkMessage>¡Gracias eres mayorista!</BulkMessage>
                      <BulkSeparator> · </BulkSeparator>
                    </>
                  )}
                  <StockText>
                    Stock disponible:{' '}
                    <StockNumber className={getStockColorClass(remainingStock)}>
                      {remainingStock} unidades
                    </StockNumber>
                  </StockText>
                </StockSingleLine>
              )}

              {/* MENSAJE DE AGOTADO */}
              {selectedSize && remainingStock === 0 && (
                <OutOfStockMessage>Agotada - No disponible</OutOfStockMessage>
              )}

              {/* ALERTA CUANDO EXCEDE STOCK */}
              {showQuantityAlert && quantity > availableStock && availableStock > 0 && (
                <QuantityAlert>
                  <FaExclamationCircle size={16} />
                  <span>
                    Solo hay {availableStock} {availableStock === 1 ? 'unidad' : 'unidades'}{' '}
                    disponibles
                  </span>
                </QuantityAlert>
              )}

              {/* BOTONES */}
              <ModalButtonsRow>
                <BtnAddCartReverse
                  className={
                    showSizeError || (selectedSize && remainingStock === 0)
                      ? 'gm-btn-error'
                      : ''
                  }
                  onClick={handleModalAddToCart}
                  disabled={selectedSize && remainingStock === 0}
                >
                  <FaShoppingCart size={16} />
                  {selectedSize && remainingStock === 0 ? 'Agotada' : 'Añadir al Carrito'}
                </BtnAddCartReverse>
                <BtnViewCartNew to="/cart" onClick={closeModal}>
                  Ver Carrito
                </BtnViewCartNew>
              </ModalButtonsRow>
            </ModalRight>
          </Modal>
        </ModalOverlay>
      )}

      {/* TOAST DE ÉXITO */}
      {showSuccessToast && (
        <SuccessToastContainer>
          <SuccessToastContent>
            <FaCheckCircle size={24} color="#10B981" />
            <ToastText>
              <h4>¡Agregado con éxito!</h4>
              <p>El producto está en tu carrito</p>
            </ToastText>
          </SuccessToastContent>
        </SuccessToastContainer>
      )}
    </Container>
  );
};

export default SearchResults;