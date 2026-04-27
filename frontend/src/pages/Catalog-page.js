import React, { useEffect, useState, useRef, useContext } from 'react';
import { useParams } from 'react-router-dom';
import Header from '../components/layout/Header.js';
import Footer from '../components/layout/Footer.js';
import Catalogo from '../components/catalog/Catalog.js';
// import CatalogoIndice from '../components/catalog/CatalogoIndice.js'; // Commented out - not currently used
import Breadcrumb from '../components/ui/Breadcrumb.js';
import MobileFilters from '../components/catalog/MobileFilters.js';
import { CarritoContext } from '../context/CarritoContext.js';
import productoService from '../services/productoService.js';

// Datos de fallback para cuando el backend no esté disponible
import matesData from '../data/catalogo-mates.json';
import bombillasData from '../data/catalogo-bombillas.json';
import combosData from '../data/catalogo-combos.json';

import './styles/Catalog-page.css';
import Loading from '../components/shared/Loading';

function Catalog() {
  const { catalogoId } = useParams(); // Obtiene el ID del catálogo desde la URL
  const [catalogo, setCatalogo] = useState(null);
  const [loading, setLoading] = useState(true); // Estado para manejar la carga
  const [error, setError] = useState(null);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);
  const [isMobileFiltersOpen, setIsMobileFiltersOpen] = useState(false);
  const [filteredItems, setFilteredItems] = useState([]);
  const sectionRefs = useRef([]);
  const { carrito } = useContext(CarritoContext);

  // Detectar preferencia de motion reducido
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setPrefersReducedMotion(mediaQuery.matches);

    const handleChange = () => setPrefersReducedMotion(mediaQuery.matches);
    mediaQuery.addEventListener('change', handleChange);

    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  // Sistema de animación en scroll
  useEffect(() => {
    if (loading || !catalogo) return;

    // Inicializar inmediatamente las secciones para que sean visibles
    sectionRefs.current.forEach((ref) => {
      if (ref) {
        ref.classList.add('animate-in');
      }
    });

    if (prefersReducedMotion) return;

    const observerOptions = {
      threshold: 0.1,
      rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry, index) => {
        if (entry.isIntersecting) {
          const delay = index * 100;

          setTimeout(() => {
            entry.target.classList.add('animate-in');
          }, delay);
        }
      });
    }, observerOptions);

    const currentRefs = sectionRefs.current;
    currentRefs.forEach((ref) => {
      if (ref) observer.observe(ref);
    });

    return () => {
      currentRefs.forEach((ref) => {
        if (ref) observer.unobserve(ref);
      });
    };
  }, [loading, catalogo, prefersReducedMotion]);

  useEffect(() => {
    // Reinicia el estado al cambiar de catálogo
    setCatalogo(null);
    setLoading(true);
    setError(null);

    // Scroll al inicio de la página
    window.scrollTo({ top: 0, behavior: prefersReducedMotion ? 'auto' : 'smooth' });

    // Cargar productos desde la API
    const fetchCatalogo = async () => {
      try {
        let response, catalogoData;
        
        console.log('🔍 [Catalog-page] Cargando catálogo, catalogoId:', catalogoId);
        
        if (catalogoId) {
          // Si hay catalogoId, cargar productos de esa categoría específica usando el slug
          console.log('📂 [Catalog-page] Cargando categoría con slug:', catalogoId);
          console.log('🌐 [Catalog-page] URL del servicio:', `${process.env.REACT_APP_BACKEND_URL}/productos/categoria/${catalogoId}`);
          response = await productoService.obtenerProductosPorCategoria(catalogoId);
          console.log('📦 [Catalog-page] Respuesta del backend:', response);
          
          if (response.success) {
            // Usar el nombre de la categoría desde la respuesta si está disponible
            const categoryName = response.categoria?.nombre || catalogoId.replace(/-/g, ' ');
            
            console.log('🔍 [Catalog-page] Analizando respuesta del backend:');
            console.log('  - response.productos:', response.productos);
            console.log('  - response.data:', response.data);
            console.log('  - response.categoria:', response.categoria);
            
            const productos = response.productos || response.data || [];
            console.log('  - productos finales:', productos);
            console.log('  - cantidad de productos:', productos.length);
            
            catalogoData = {
              nombre: categoryName, // Para el CategorySelector
              titulo: categoryName.charAt(0).toUpperCase() + categoryName.slice(1),
              descripcion: response.categoria?.descripcion || `Catálogo de ${categoryName}`,
              items: productos
            };
            console.log('✅ [Catalog-page] Productos de categoría cargados:', catalogoData.items.length);
            console.log('📋 [Catalog-page] Estructura catalogoData:', catalogoData);
          } else {
            console.error('❌ [Catalog-page] Backend retornó success: false');
            console.error('❌ [Catalog-page] Mensaje de error:', response.message || 'Sin mensaje');
            setError(`No se pudo cargar el catálogo "${catalogoId}": ${response.message || 'Error desconocido'}`);
            return;
          }
        } else {
          // Si no hay catalogoId, cargar TODOS los productos
          console.log('📦 [Catalog-page] Cargando TODOS los productos');
          response = await productoService.obtenerProductos();
          console.log('📦 [Catalog-page] Respuesta del backend (todos):', response);
          
          if (response.success) {
            catalogoData = {
              nombre: 'Todos', // Para el CategorySelector
              titulo: 'Todos los Productos',
              descripcion: 'Catálogo completo de productos disponibles',
              items: response.productos || response.data || []
            };
            console.log('✅ [Catalog-page] Todos los productos cargados:', catalogoData.items.length);
            console.log('📋 [Catalog-page] Estructura catalogoData (todos):', catalogoData);
          } else {
            console.error('❌ [Catalog-page] Error cargando todos los productos:', response);
            setError(`No se pudo cargar el catálogo completo: ${response.message || 'Error desconocido'}`);
            return;
          }
        }
        
        setCatalogo(catalogoData);
      } catch (err) {
        console.error('❌ [Catalog-page] Error de red o servicio:', err);
        console.error('❌ [Catalog-page] Intentando usar datos de fallback...');
        
        try {
          // Usar datos estáticos como fallback
          let catalogoData;
          
          if (catalogoId) {
            // Mapear catalogoId a datos estáticos
            const catalogoMap = {
              'mates': matesData,
              'mate': matesData,
              'bombillas': bombillasData,
              'bombilla': bombillasData,
              'combos': combosData,
              'combo': combosData
            };
            
            const fallbackData = catalogoMap[catalogoId.toLowerCase()];
            
            if (fallbackData) {
              catalogoData = {
                nombre: fallbackData.id,
                titulo: fallbackData.id,
                descripcion: fallbackData.descripcion,
                items: fallbackData.items
              };
              console.log('✅ [Catalog-page] Usando datos de fallback para:', catalogoId);
            } else {
              setError(`Categoría "${catalogoId}" no encontrada`);
              return;
            }
          } else {
            // Combinar todos los catálogos para "ver todos"
            const allItems = [
              ...matesData.items,
              ...bombillasData.items,
              ...combosData.items
            ];
            
            catalogoData = {
              nombre: 'Todos',
              titulo: 'Todos los Productos',
              descripcion: 'Catálogo completo de productos disponibles',
              items: allItems
            };
            console.log('✅ [Catalog-page] Usando datos de fallback para todos los productos');
          }
          
          setCatalogo(catalogoData);
          
        } catch (fallbackError) {
          console.error('❌ [Catalog-page] Error con datos de fallback:', fallbackError);
          setError('No se pudo cargar el catálogo. Por favor, intenta más tarde.');
        }
      } finally {
        setLoading(false); // Desactiva el estado de "cargando"
      }
    };

    fetchCatalogo();
  }, [catalogoId, prefersReducedMotion]); // Se ejecuta cada vez que cambia catalogoId

  // Loading state mejorado
  if (loading) {
    return (
      <div className="catalog-page-wrapper">
        <Header carrito={carrito} userRole="client" />
          <Loading text="Cargando catálogo..." />
        <Footer />
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="catalog-page-wrapper">
        <Header carrito={carrito} userRole="client" />
        <div className="catalog-error-container">
          <h2>¡Oops! Algo salió mal</h2>
          <p>{error}</p>
          <button
            className="retry-button"
            onClick={() => window.location.reload()}
          >
            Intentar de nuevo
          </button>
        </div>
        <Footer />
      </div>
    );
  }

  if (!catalogo) return null;

  return (
    <div className="catalog-page-wrapper">
      <Header carrito={carrito} userRole="client" />

      {/* Breadcrumb mejorado */}
      <div
        className={`breadcrumb-section fade-section animate-in ${prefersReducedMotion ? 'no-motion' : ''}`}
        ref={(el) => sectionRefs.current[0] = el}
        style={{ animationDelay: '0ms' }}
      >
        <Breadcrumb />
      </div>

      {/* Hero Section - mismo estilo que otras páginas */}
      <div
        className={`catalog-hero-section fade-section animate-in ${prefersReducedMotion ? 'no-motion' : ''}`}
        ref={(el) => sectionRefs.current[1] = el}
        style={{ animationDelay: '100ms' }}
      >
        <h1 className="catalog-hero-title">{catalogo.titulo}</h1>
        <p className="catalog-hero-subtitle">{catalogo.descripcion}</p>
        
        {/* Botón de filtros móvil */}
        <div className="mobile-filters-in-hero">
          <button 
            className="mobile-filters-button-in-hero"
            onClick={() => setIsMobileFiltersOpen(true)}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
              <path d="M4 6H20M4 12H16M4 18H12" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
            </svg>
            <span>Filtros y Ordenar</span>
          </button>
        </div>
      </div>

      <div className="catalog-page">
        {/* Contenido principal del catálogo */}
        <div
          className={`catalog-content fade-section animate-in ${prefersReducedMotion ? 'no-motion' : ''}`}
          ref={(el) => sectionRefs.current[2] = el}
          style={{ animationDelay: '200ms' }}
        >
          <Catalogo 
            catalogo={catalogo}
            hideFiltersButton={true}
            filteredItems={filteredItems}
            onItemsChange={setFilteredItems}
          />
        </div>
      </div>

      {/* Sidebar móvil en la página principal */}
      <MobileFilters
        isOpen={isMobileFiltersOpen}
        onClose={() => setIsMobileFiltersOpen(false)}
        catalogoItems={catalogo.items}
        currentItems={filteredItems.length > 0 ? filteredItems : catalogo.items}
        currentCategory={catalogo.nombre}
        onFilter={setFilteredItems}
        onSort={setFilteredItems}
      />

      <Footer />
    </div>
  );
}

export default Catalog;