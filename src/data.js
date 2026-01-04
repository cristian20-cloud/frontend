// src/data.js
import { 
  BarChart3, 
  Users, 
  ShoppingBag, 
  Package, 
  Truck, 
  Shield, 
  RefreshCcw, 
  TrendingUp, 
  UserCheck, 
  Tags 
} from 'lucide-react';

// =================================================================
// USUARIOS Y ROLES
// =================================================================

export const roles = [
  {
    IdRol: 1,
    Nombre: "Administrador",
    Permisos: [
      "dashboard",
      "categorias",
      "productos",
      "proveedores",
      "compras",
      "clientes",
      "ventas",
      "devoluciones",
      "usuarios",
      "roles"
    ]
  },
  {
    IdRol: 2,
    Nombre: "Vendedor",
    Permisos: ["dashboard", "ventas", "devoluciones", "clientes"]
  },
  {
    IdRol: 3,
    Nombre: "Gestor de Inventario",
    Permisos: ["dashboard", "productos", "proveedores", "compras", "categorias"]
  },
  {
    IdRol: 4,
    Nombre: "Recursos Humanos",
    Permisos: ["dashboard", "usuarios"]
  },
  {
    IdRol: 5,
    Nombre: "Gestor de Clientes",
    Permisos: ["dashboard", "clientes"]
  },
  {
    IdRol: 6,
    Nombre: "Auditor",
    Permisos: ["dashboard"]
  }
];

export const initialUsers = [
  { 
    IdUsuario: 1, 
    Nombre: "Andrés Guzmán", 
    Correo: "admin@mail.com", 
    IdRol: 1, 
    Clave: "123456", 
    Estado: true,
    Permisos: roles[0].Permisos 
  },
  { 
    IdUsuario: 2, 
    Nombre: "Imanol López", 
    Correo: "ventas@mail.com", 
    IdRol: 2, 
    Clave: "123456", 
    Estado: true,
    Permisos: roles[1].Permisos 
  },
  { 
    IdUsuario: 3, 
    Nombre: "Carolina Méndez", 
    Correo: "inventario@mail.com", 
    IdRol: 3, 
    Clave: "123456", 
    Estado: true,
    Permisos: roles[2].Permisos 
  },
  { 
    IdUsuario: 4, 
    Nombre: "Sebastián Torres", 
    Correo: "sebastorres053@gmail.com", 
    IdRol: 2, 
    Clave: "123456", 
    Estado: true,
    Permisos: roles[1].Permisos 
  },
  { 
    IdUsuario: 5, 
    Nombre: "Andrés Guzmán 2", 
    Correo: "andres.guzman23@gmail.com", 
    IdRol: 1, 
    Clave: "123456", 
    Estado: true,
    Permisos: roles[0].Permisos 
  },
  { 
    IdUsuario: 6, 
    Nombre: "Diana Ríos", 
    Correo: "diana.rios@rh.local", 
    IdRol: 4, 
    Clave: "123456", 
    Estado: true,
    Permisos: roles[3].Permisos 
  },
  { 
    IdUsuario: 7, 
    Nombre: "Carlos Pérez", 
    Correo: "carlos@clientes.local", 
    IdRol: 5, 
    Clave: "123456", 
    Estado: true,
    Permisos: roles[4].Permisos 
  },
  { 
    IdUsuario: 8, 
    Nombre: "Ana Auditora", 
    Correo: "ana@auditoria.local", 
    IdRol: 6, 
    Clave: "123456", 
    Estado: true,
    Permisos: roles[5].Permisos 
  }
];

// Usuario quemado para login de administrador
export const adminHardcodedUser = {
  IdUsuario: 999,
  Nombre: "Administrador Maestro",
  Correo: "duvann1991@gmail.com",
  IdRol: 1,
  Clave: "Gorrasmedellin_caps",
  Estado: true,
  Permisos: roles[0].Permisos
};

// =================================================================
// MÓDULOS DEL SISTEMA
// =================================================================
export const modules = [
  { id: "dashboard", label: "Dashboard", icon: BarChart3 },
  { id: "categorias", label: "Categorías", icon: Tags },
  { id: "productos", label: "Productos", icon: Package },
  { id: "proveedores", label: "Proveedores", icon: Truck },
  { id: "compras", label: "Compras", icon: ShoppingBag },
  { id: "clientes", label: "Clientes", icon: UserCheck },
  { id: "ventas", label: "Ventas", icon: TrendingUp },
  { id: "devoluciones", label: "Devoluciones", icon: RefreshCcw },
  { id: "usuarios", label: "Usuarios", icon: Users },
  { id: "roles", label: "Roles", icon: Shield }
];

// =================================================================
// FUNCIONES DE AUTENTICACIÓN Y PERMISOS (ACTUALIZADAS)
// =================================================================

// Obtener usuario actual desde localStorage
export const getCurrentUser = () => {
  if (typeof window === 'undefined') return null;
  const userData = localStorage.getItem('user');
  return userData ? JSON.parse(userData) : null;
};

// Obtener permisos del usuario actual
export const getCurrentPermissions = () => {
  const user = getCurrentUser();
  if (!user) return [];
  return user.Permisos || [];
};

// Obtener módulos visibles para el usuario actual BASADOS EN SU ROL
export const getVisibleModules = () => {
  const user = getCurrentUser();
  if (!user) return [];
  
  // Si es administrador, ve todos los módulos
  if (user.IdRol === 1) return modules;
  
  // Para otros roles, obtener los permisos del rol
  const role = roles.find(r => r.IdRol === user.IdRol);
  if (!role || !role.Permisos) return [];
  
  // Filtrar módulos basados en los permisos del rol
  return modules.filter((module) => role.Permisos.includes(module.id));
};

// Verificar si el usuario tiene un permiso específico
export const hasPermission = (permission) => {
  const user = getCurrentUser();
  if (!user) return false;
  if (user.IdRol === 1) return true; // Admin tiene todos los permisos
  
  // Buscar el rol del usuario
  const role = roles.find(r => r.IdRol === user.IdRol);
  if (!role) return false;
  
  return role.Permisos?.includes(permission) || false;
};

// Verificar si el usuario puede ver un módulo específico
export const canViewModule = (moduleId) => {
  return hasPermission(moduleId);
};

// =================================================================
// DATOS DE CONFIGURACIÓN
// =================================================================

// Permisos disponibles para asignar a roles
export const availablePermissions = [
  { id: 'dashboard', label: 'Dashboard', description: 'Ver panel principal' },
  { id: 'categorias', label: 'Categorías', description: 'Gestionar categorías de productos' },
  { id: 'productos', label: 'Productos', description: 'Gestionar productos' },
  { id: 'proveedores', label: 'Proveedores', description: 'Gestionar proveedores' },
  { id: 'compras', label: 'Compras', description: 'Gestionar compras' },
  { id: 'clientes', label: 'Clientes', description: 'Gestionar clientes' },
  { id: 'ventas', label: 'Ventas', description: 'Gestionar ventas' },
  { id: 'devoluciones', label: 'Devoluciones', description: 'Gestionar devoluciones' },
  { id: 'usuarios', label: 'Usuarios', description: 'Gestionar usuarios del sistema' },
  { id: 'roles', label: 'Roles', description: 'Gestionar roles y permisos' }
];

// Opciones de Talla (Para Gorras)
export const initialSizes = [
  { value: 'Ajustable', label: 'Ajustable' },
  { value: '6 7/8', label: '6 7/8' },
  { value: '7', label: '7' },
  { value: '7 1/8', label: '7 1/8' },
  { value: '7 1/4', label: '7 1/4' },
  { value: '7 3/8', label: '7 3/8' },
  { value: '7 1/2', label: '7 1/2' },
  { value: '7 5/8', label: '7 5/8' },
  { value: '7 3/4', label: '7 3/4' },
  { value: '7 7/8', label: '7 7/8' },
  { value: '8', label: '8' },
  { value: 'Única', label: 'Única' },
];

// Opciones de Color (Para Gorras)
export const initialColors = [
  { value: 'Negro', label: 'Negro' },
  { value: 'Blanco', label: 'Blanco' },
  { value: 'Azul', label: 'Azul' },
  { value: 'Rojo', label: 'Rojo' },
  { value: 'Verde', label: 'Verde' },
  { value: 'Amarillo', label: 'Amarillo' },
  { value: 'Gris', label: 'Gris' },
  { value: 'Naranja', label: 'Naranja' },
  { value: 'Morado', label: 'Morado' },
  { value: 'Rosa', label: 'Rosa' },
  { value: 'Marrón', label: 'Marrón' },
  { value: 'Beige', label: 'Beige' },
  { value: 'Azul Noche', label: 'Azul Noche' },
  { value: 'Blanco Roto', label: 'Blanco Roto' },
  { value: 'Verde Militar', label: 'Verde Militar' },
  { value: 'Negro Diamante', label: 'Negro Diamante' },
  { value: 'Rosa Pastel', label: 'Rosa Pastel' },
  { value: 'Caqui', label: 'Caqui' },
  { value: 'Azul Real', label: 'Azul Real' },
  { value: 'Negro con Oro', label: 'Negro con Oro' },
  { value: 'Beige Natural', label: 'Beige Natural' },
  { value: 'Gris Perla', label: 'Gris Perla' },
  { value: 'Variado', label: 'Variado' },
  { value: 'Borgoña', label: 'Borgoña' },
  { value: 'Natural', label: 'Natural' },
  { value: 'Negro/Plata', label: 'Negro/Plata' },
];

// Items del Sidebar (Menú de Navegación) - FILTRADOS POR ROL
export const getSidebarItems = () => {
  const user = getCurrentUser();
  if (!user) return [];
  
  const allItems = [
    { id: 'dashboard', label: 'Dashboard', icon: BarChart3, permission: 'dashboard' },
    { id: 'categorias', label: 'Categorías', icon: Tags, permission: 'categorias' },
    { id: 'productos', label: 'Productos', icon: Package, permission: 'productos' },
    { id: 'proveedores', label: 'Proveedores', icon: Truck, permission: 'proveedores' },
    { id: 'compras', label: 'Compras', icon: ShoppingBag, permission: 'compras' },
    { id: 'clientes', label: 'Clientes', icon: UserCheck, permission: 'clientes' },
    { id: 'ventas', label: 'Ventas', icon: TrendingUp, permission: 'ventas' },
    { id: 'devoluciones', label: 'Devoluciones', icon: RefreshCcw, permission: 'devoluciones' },
    { id: 'usuarios', label: 'Usuarios', icon: Users, permission: 'usuarios' },
    { id: 'roles', label: 'Roles', icon: Shield, permission: 'roles' }
  ];
  
  // Si es administrador, ve todos los items
  if (user.IdRol === 1) return allItems;
  
  // Para otros roles, filtrar según los permisos del rol
  const role = roles.find(r => r.IdRol === user.IdRol);
  if (!role || !role.Permisos) return [];
  
  return allItems.filter(item => role.Permisos.includes(item.permission));
};

// =================================================================
// DATOS TRANSACCIONALES
// =================================================================

// Roles completos del sistema
export const initialRoles = [
  {
    IdRol: 1,
    Nombre: "Administrador",
    Descripcion: "Acceso completo al sistema",
    Permisos: [
      "dashboard",
      "categorias",
      "productos",
      "proveedores",
      "compras",
      "clientes",
      "ventas",
      "devoluciones",
      "usuarios",
      "roles"
    ],
    Estado: true
  },
  {
    IdRol: 2,
    Nombre: "Vendedor",
    Descripcion: "Gestión de ventas y atención al cliente",
    Permisos: ["dashboard", "ventas", "devoluciones", "clientes"],
    Estado: true
  },
  {
    IdRol: 3,
    Nombre: "Gestor de Inventario",
    Descripcion: "Gestión de productos y proveedores",
    Permisos: ["dashboard", "productos", "proveedores", "compras", "categorias"],
    Estado: true
  },
  {
    IdRol: 4,
    Nombre: "Recursos Humanos",
    Descripcion: "Gestión de usuarios del sistema",
    Permisos: ["dashboard", "usuarios"],
    Estado: true
  },
  {
    IdRol: 5,
    Nombre: "Gestor de Clientes",
    Descripcion: "Gestión de información y estado de clientes",
    Permisos: ["dashboard", "clientes"],
    Estado: true
  },
  {
    IdRol: 6,
    Nombre: "Auditor",
    Descripcion: "Solo lectura de reportes y movimientos",
    Permisos: ["dashboard"],
    Estado: false
  }
];

// Clientes
export const initialCustomers = [
  {
    IdCliente: 1,
    Nombre: "Imanol López",
    Telefono: "3124567890",
    Correo: "imanol.lopez@gmail.com",
    Departamento: "Antioquia",
    Ciudad: "Medellín",
    Direccion: "Calle 45 #23-10",
    SaldoaFavor: "150000",
    Estado: true
  },
  {
    IdCliente: 2,
    Nombre: "Sebastián Torres",
    Telefono: "3109876543",
    Correo: "sebastorres053@gmail.com",
    Departamento: "Cundinamarca",
    Ciudad: "Bogotá",
    Direccion: "Carrera 10 #15-30",
    SaldoaFavor: "0",
    Estado: true
  },
  {
    IdCliente: 3,
    Nombre: "María González",
    Telefono: "3012589634",
    Correo: "maria.gonzalez@hotmail.com",
    Departamento: "Valle del Cauca",
    Ciudad: "Cali",
    Direccion: "Avenida 3N #45-20",
    SaldoaFavor: "45000",
    Estado: true
  },
  {
    IdCliente: 4,
    Nombre: "Carlos Ramírez",
    Telefono: "3201122334",
    Correo: "carlos.ramirez78@outlook.com",
    Departamento: "Santander",
    Ciudad: "Bucaramanga",
    Direccion: "Calle 32 #18-45",
    SaldoaFavor: "32000",
    Estado: true
  },
  {
    IdCliente: 5,
    Nombre: "Ana María Vélez",
    Telefono: "3156789012",
    Correo: "anavelez22@gmail.com",
    Departamento: "Atlántico",
    Ciudad: "Barranquilla",
    Direccion: "Carrera 53 #78-12",
    SaldoaFavor: "0",
    Estado: false
  },
  {
    IdCliente: 6,
    Nombre: "Jorge Eliécer Duque",
    Telefono: "3112345678",
    Correo: "jorge.duque@empresa.co",
    Departamento: "Antioquia",
    Ciudad: "Envigado",
    Direccion: "Calle 10 Sur #44-67",
    SaldoaFavor: "210500",
    Estado: true
  },
  {
    IdCliente: 7,
    Nombre: "Lucía Fernández",
    Telefono: "3009871234",
    Correo: "luciafdez_91@yahoo.com",
    Departamento: "Cundinamarca",
    Ciudad: "Chía",
    Direccion: "Vereda La Florida, Km 2",
    SaldoaFavor: "18900",
    Estado: true
  },
  {
    IdCliente: 8,
    Nombre: "Diego Armando Rojas",
    Telefono: "3223456789",
    Correo: "diego.rojas87@gmail.com",
    Departamento: "Risaralda",
    Ciudad: "Pereira",
    Direccion: "Carrera 14 #30-05",
    SaldoaFavor: "0",
    Estado: true
  },
  {
    IdCliente: 9,
    Nombre: "Valentina Castro",
    Telefono: "3187654321",
    Correo: "vale.castro1995@hotmail.com",
    Departamento: "Bolívar",
    Ciudad: "Cartagena",
    Direccion: "Calle del Espíritu Santo #32-18",
    SaldoaFavor: "76400",
    Estado: true
  },
  {
    IdCliente: 10,
    Nombre: "Fernando Pardo",
    Telefono: "3134567890",
    Correo: "fpardo_negocios@gmail.com",
    Departamento: "Norte de Santander",
    Ciudad: "Cúcuta",
    Direccion: "Avenida 5 #22-88, Edificio Central, Of. 302",
    SaldoaFavor: "0",
    Estado: false
  }
];

// Proveedores
export const initialSuppliers = [
  { IdProveedor: 1,  Nombre: "Distribuidora ABC",             TipoDocumento: "NIT", NumeroDocumento: "900123456-7", Telefono: "+57 300 123 4567", Direccion: "Calle 10 #23-45, Medellín",       Correo: "ventas@abc.com.co",              Estado: true },
  { IdProveedor: 2,  Nombre: "Importaciones XYZ",             TipoDocumento: "NIT", NumeroDocumento: "900234567-8", Telefono: "+57 301 234 5678", Direccion: "Av. Las Vegas #78-12, Medellín",  Correo: "contacto@xyzimport.com",         Estado: true },
  { IdProveedor: 3,  Nombre: "Gorras del Valle",              TipoDocumento: "NIT", NumeroDocumento: "900345678-9", Telefono: "+57 302 345 6789", Direccion: "Calle 56 #34-21, Cali",            Correo: "info@gorrasvalle.com",           Estado: false },
  { IdProveedor: 4,  Nombre: "Textiles Norte",                TipoDocumento: "NIT", NumeroDocumento: "900456789-0", Telefono: "+57 303 456 7890", Direccion: "Av. Boyacá #45-67, Bogotá",       Correo: "pedidos@textilesnorte.com",      Estado: true },
  { IdProveedor: 5,  Nombre: "Alimentos Andinos S.A.",        TipoDocumento: "NIT", NumeroDocumento: "901234567-1", Telefono: "+57 310 567 8901", Direccion: "Carrera 45 #90-23, Medellín",     Correo: "ventas@alimentosandinos.co",     Estado: true },
  { IdProveedor: 6,  Nombre: "Electrónicos del Futuro",       TipoDocumento: "NIT", NumeroDocumento: "902345678-2", Telefono: "+57 311 678 9012", Direccion: "Calle 78 #12-34, Envigado",       Correo: "soporte@electronicosfuturo.com", Estado: true },
  { IdProveedor: 7,  Nombre: "Papelería Creativa Ltda.",      TipoDocumento: "NIT", NumeroDocumento: "903456789-3", Telefono: "+57 312 789 0123", Direccion: "Carrera 30 #56-78, Itagüí",       Correo: "pedidos@papeleriacreativa.com",  Estado: true },
  { IdProveedor: 8,  Nombre: "Confecciones Antioquia",        TipoDocumento: "NIT", NumeroDocumento: "904567890-4", Telefono: "+57 313 890 1234", Direccion: "Av. Oriental #23-45, Medellín",   Correo: "produccion@confeccionesantioquia.com", Estado: false },
  { IdProveedor: 9,  Nombre: "Empaques EcoSostenibles",       TipoDocumento: "NIT", NumeroDocumento: "905678901-5", Telefono: "+57 314 901 2345", Direccion: "Calle 120 #45-67, Sabaneta",      Correo: "info@empaqueseco.co",            Estado: true },
  { IdProveedor: 10, Nombre: "Ferretería La Estrella",        TipoDocumento: "NIT", NumeroDocumento: "906789012-6", Telefono: "+57 315 012 3456", Direccion: "Carrera 52 #89-01, Medellín",     Correo: "ventas@ferreterialaestrella.com", Estado: true },
  { IdProveedor: 11, Nombre: "Dulces Regionales SAS",         TipoDocumento: "NIT", NumeroDocumento: "907890123-7", Telefono: "+57 316 123 4567", Direccion: "Calle 65 #22-11, Bello",          Correo: "distribucion@dulcesregionales.co", Estado: true },
  { IdProveedor: 12, Nombre: "Muebles Artesanales",           TipoDocumento: "NIT", NumeroDocumento: "908901234-8", Telefono: "+57 317 234 5678", Direccion: "Vereda El Porvenir, La Ceja",     Correo: "contacto@mueblesartesanales.com", Estado: false },
  { IdProveedor: 13, Nombre: "Cosméticos Naturales",          TipoDocumento: "NIT", NumeroDocumento: "909012345-9", Telefono: "+57 318 345 6789", Direccion: "Carrera 70 #34-56, Medellín",     Correo: "ventas@cosmeticosnaturales.co",  Estado: true },
  { IdProveedor: 14, Nombre: "Herramientas Profesionales",    TipoDocumento: "NIT", NumeroDocumento: "900123457-0", Telefono: "+57 319 456 7890", Direccion: "Av. 80 #67-89, Medellín",         Correo: "soporte@herramientaspro.com",    Estado: true },
  { IdProveedor: 15, Nombre: "Café Premium Antioqueño",       TipoDocumento: "NIT", NumeroDocumento: "901234568-1", Telefono: "+57 320 567 8901", Direccion: "Finca El Roble, Fredonia",        Correo: "export@cafepremium.co",          Estado: true }
];

// Categorías
export const initialCategories = [
  { IdCategoria: 1,  Nombre: "NIKE 1.1",               Descripcion: "Gorras Nike oficiales, edición limitada y premium",             Estado: true },
  { IdCategoria: 2,  Nombre: "A/N 1.1",                Descripcion: "Colección A/N - Diseños exclusivos y modernos",                  Estado: true },
  { IdCategoria: 3,  Nombre: "BEISBOLERA PREMIUM",     Descripcion: "Gorras beisboleras de alta calidad, materiales premium",         Estado: true },
  { IdCategoria: 4,  Nombre: "DIAMANTE IMPORTADA",     Descripcion: "Gorras importadas con acabado diamante, estilo urbano",         Estado: true },
  { IdCategoria: 5,  Nombre: "EQUINAS-AGROPECUARIAS",  Descripcion: "Gorras para uso agropecuario y campo, resistentes y funcionales", Estado: true },
  { IdCategoria: 6,  Nombre: "EXCLUSIVA 1.1",          Descripcion: "Línea exclusiva, ediciones limitadas y diseños únicos",         Estado: true },
  { IdCategoria: 7,  Nombre: "MONASTERY 1.1",          Descripcion: "Colección Monastery, estilos minimalistas y urbanos",           Estado: true },
  { IdCategoria: 8,  Nombre: "MULTIMARCA",             Descripcion: "Gorras de múltiples marcas, variedad amplia y precios accesibles", Estado: true },
  { IdCategoria: 9,  Nombre: "PLANA CERRADA 1.1",      Descripcion: "Gorras planas con visera cerrada, ideal para streetwear",        Estado: true },
  { IdCategoria: 10, Nombre: "PLANA IMPORTADA",        Descripcion: "Gorras planas importadas, diseños internacionales y tendencia global", Estado: true },
  { IdCategoria: 11, Nombre: "PORTAGORRAS",            Descripcion: "Accesorios y organizadores para almacenar gorras",              Estado: true },
  { IdCategoria: 12, Nombre: "PREMIUM",                Descripcion: "Gorras premium, bordados 3D, materiales de lujo y ajuste perfecto", Estado: true },
  { IdCategoria: 13, Nombre: "CAMISETAS",              Descripcion: "Camisetas complementarias a la colección de gorras, diseño coordinado", Estado: true },
  { IdCategoria: 14, Nombre: "RELOJES",                Descripcion: "Relojes deportivos y de moda",                                   Estado: true }
];

// =================================================================
// PRODUCTOS AMPLIADOS (Más de 100 productos)
// =================================================================

const generateProductData = (basePrice, baseStock) => {
  const discount = Math.random() > 0.5;
  const price = basePrice * (0.8 + Math.random() * 0.4); // ±20% variación
  const stock = Math.floor(baseStock * (0.5 + Math.random() * 1.5)); // ±50% variación
  const hasDiscount = discount && Math.random() > 0.7;
  const originalPrice = hasDiscount ? price * (1.2 + Math.random() * 0.3) : price;
  const isFeatured = Math.random() > 0.8;

  // --- NUEVO: Generar un número aleatorio de ventas ---
  // Para simular productos populares, algunos tendrán muchas ventas
  const sales = Math.floor(Math.random() * 100); // Ventas entre 0 y 99

  return {
    precio: Math.round(price / 1000) * 1000,
    originalPrice: Math.round(originalPrice / 1000) * 1000,
    stock: Math.max(1, stock),
    hasDiscount,
    isFeatured,
    isActive: true,
    tags: isFeatured ? ["DESTACADO"] : [],
    sales: sales // <-- Añadimos el campo 'sales' aquí
  };
};
// Función para extraer colores del nombre del archivo
const extractColorsFromFileName = (fileName) => {
  const colors = [];
  const colorKeywords = [
    'azul', 'blanco', 'negro', 'rojo', 'verde', 'gris', 'cafe', 'morado', 'rosa', 
    'naranja', 'amarillo', 'plateado', 'dorado', 'beige', 'natural'
  ];
  
  const fileNameLower = fileName.toLowerCase();
  colorKeywords.forEach(color => {
    if (fileNameLower.includes(color)) {
      colors.push(color.charAt(0).toUpperCase() + color.slice(1));
    }
  });
  
  return colors.length > 0 ? colors : ["Negro"];
};

// Función para determinar tallas basadas en la categoría
const getSizesByCategory = (category) => {
  if (category.includes("RELOJES")) {
    return ["Única"];
  } else if (category.includes("CAMISETAS")) {
    return ["S", "M", "L", "XL"];
  } else {
    // Para gorras, mezclar tamaños ajustables y fijos
    const adjustable = Math.random() > 0.5;
    if (adjustable) {
      return ["Ajustable"];
    } else {
      const sizes = ["6 7/8", "7", "7 1/8", "7 1/4", "7 3/8", "7 1/2", "7 5/8", "7 3/4"];
      return sizes.slice(0, 3 + Math.floor(Math.random() * 4));
    }
  }
};

// Generar productos desde el JSON proporcionado
export const generateProductsFromJson = () => {
  const productData = [
    // BEISBOLERA PREMIUM (1-54)
    {
      id: 1,
      nombre: "Gorra Azul Blanco LA",
      categoria: "BEISBOLERA PREMIUM",
      IdCategoria: 3,
      imagenes: ["https://res.cloudinary.com/dxc5qqsjd/image/upload/v1762910786/gorraazulblancoLA_rembf2.jpg"],
      descripcion: "Gorra clásica de béisbol con logo LA, combinación azul y blanco"
    },
    {
      id: 2,
      nombre: "Gorra Azul Contipo A",
      categoria: "BEISBOLERA PREMIUM",
      IdCategoria: 3,
      imagenes: ["https://res.cloudinary.com/dxc5qqsjd/image/upload/v1762910795/gorraazulcontipoA_ldfroh.jpg"],
      descripcion: "Gorra béisbolera premium con diseño contipo A"
    },
    {
      id: 3,
      nombre: "Gorra Azul Derayo",
      categoria: "BEISBOLERA PREMIUM",
      IdCategoria: 3,
      imagenes: ["https://res.cloudinary.com/dxc5qqsjd/image/upload/v1762910797/gorraazulderayo_v8qcb0.jpg"],
      descripcion: "Gorra estilo derayo en color azul"
    },
    {
      id: 4,
      nombre: "Gorra Azul Gris LA",
      categoria: "BEISBOLERA PREMIUM",
      IdCategoria: 3,
      imagenes: ["https://res.cloudinary.com/dxc5qqsjd/image/upload/v1762910786/gorraazulgrisLa_i1dazk.jpg"],
      descripcion: "Gorra azul con detalles grises y logo LA"
    },
    {
      id: 5,
      nombre: "Gorra Azul Letra Verde B",
      categoria: "BEISBOLERA PREMIUM",
      IdCategoria: 3,
      imagenes: ["https://res.cloudinary.com/dxc5qqsjd/image/upload/v1762910791/gorraazulletraverdeB_wb2htn.jpg"],
      descripcion: "Gorra azul con letras verdes en diseño B"
    },
    {
      id: 6,
      nombre: "Gorra Azul Toda LA",
      categoria: "BEISBOLERA PREMIUM",
      IdCategoria: 3,
      imagenes: ["https://res.cloudinary.com/dxc5qqsjd/image/upload/v1762910779/gorraazulltodaLA_ykxdvi.jpg"],
      descripcion: "Gorra completamente azul con logo LA"
    },
    {
      id: 7,
      nombre: "Gorra Azul Morado NY",
      categoria: "BEISBOLERA PREMIUM",
      IdCategoria: 3,
      imagenes: ["https://res.cloudinary.com/dxc5qqsjd/image/upload/v1762910789/gorraazulmoradoNY_vlhcqv.jpg"],
      descripcion: "Gorra azul con detalles morados y logo NY"
    },
    {
      id: 8,
      nombre: "Gorra Azul SF",
      categoria: "BEISBOLERA PREMIUM",
      IdCategoria: 3,
      imagenes: ["https://res.cloudinary.com/dxc5qqsjd/image/upload/v1762910775/gorraazulsf_ckhji6.jpg"],
      descripcion: "Gorra azul con logo San Francisco"
    },
    {
      id: 9,
      nombre: "Gorra Azul SF Café",
      categoria: "BEISBOLERA PREMIUM",
      IdCategoria: 3,
      imagenes: ["https://res.cloudinary.com/dxc5qqsjd/image/upload/v1762910774/gorraazulSFcafe_jxzvfg.jpg"],
      descripcion: "Gorra azul con detalles café y logo SF"
    },
    {
      id: 10,
      nombre: "Gorra Azul Sox Blanca",
      categoria: "BEISBOLERA PREMIUM",
      IdCategoria: 3,
      imagenes: ["https://res.cloudinary.com/dxc5qqsjd/image/upload/v1762910775/gorraazulsoxblanca_eagdgv.jpg"],
      descripcion: "Gorra azul con detalles blancos y logo Sox"
    },
    {
      id: 11,
      nombre: "Gorra Azul SOX Gris",
      categoria: "BEISBOLERA PREMIUM",
      IdCategoria: 3,
      imagenes: ["https://res.cloudinary.com/dxc5qqsjd/image/upload/v1762910774/gorraazulSOXgris_qzk2p7.jpg"],
      descripcion: "Gorra azul con detalles grises y logo SOX"
    },
    {
      id: 12,
      nombre: "Gorra Azul Toda A",
      categoria: "BEISBOLERA PREMIUM",
      IdCategoria: 3,
      imagenes: ["https://res.cloudinary.com/dxc5qqsjd/image/upload/v1762910780/gorraAzultodaA_wk7fta.jpg"],
      descripcion: "Gorra completamente azul con logo A"
    },
    {
      id: 13,
      nombre: "Gorra Azul Toda AS",
      categoria: "BEISBOLERA PREMIUM",
      IdCategoria: 3,
      imagenes: ["https://res.cloudinary.com/dxc5qqsjd/image/upload/v1762910781/gorraazultodaAS_pmxymi.jpg"],
      descripcion: "Gorra completamente azul con logo AS"
    },
    {
      id: 14,
      nombre: "Gorra Azul Toda NY",
      categoria: "BEISBOLERA PREMIUM",
      IdCategoria: 3,
      imagenes: ["https://res.cloudinary.com/dxc5qqsjd/image/upload/v1762910780/gorraazultodaNY_cyfchf.jpg"],
      descripcion: "Gorra completamente azul con logo NY"
    },
    {
      id: 15,
      nombre: "Gorra Azul NY Blanca",
      categoria: "BEISBOLERA PREMIUM",
      IdCategoria: 3,
      imagenes: ["https://res.cloudinary.com/dxc5qqsjd/image/upload/v1762910776/gorraazulNYblanca_bajj96.jpg"],
      descripcion: "Gorra azul con detalles blancos y logo NY"
    },
    {
      id: 16,
      nombre: "Gorra Azul NY Roja",
      categoria: "BEISBOLERA PREMIUM",
      IdCategoria: 3,
      imagenes: ["https://res.cloudinary.com/dxc5qqsjd/image/upload/v1762910775/gorraazulNYroja_qagkoy.jpg"],
      descripcion: "Gorra azul con detalles rojos y logo NY"
    },
    {
      id: 17,
      nombre: "Gorra Azul Plata AA",
      categoria: "BEISBOLERA PREMIUM",
      IdCategoria: 3,
      imagenes: ["https://res.cloudinary.com/dxc5qqsjd/image/upload/v1762910792/gorraazulplataAA_mejjar.jpg"],
      descripcion: "Gorra azul con detalles plateados y logo AA"
    },
    {
      id: 18,
      nombre: "Gorra Azul Plata BB",
      categoria: "BEISBOLERA PREMIUM",
      IdCategoria: 3,
      imagenes: ["https://res.cloudinary.com/dxc5qqsjd/image/upload/v1762910791/gorraazulplataBB_i9gnwx.jpg"],
      descripcion: "Gorra azul con detalles plateados y logo BB"
    },
    {
      id: 19,
      nombre: "Gorra Azul P Plateada",
      categoria: "BEISBOLERA PREMIUM",
      IdCategoria: 3,
      imagenes: ["https://res.cloudinary.com/dxc5qqsjd/image/upload/v1762910778/gorraazulPplateda_qpe5yd.jpg"],
      descripcion: "Gorra azul con detalles plateados y logo P"
    },
    {
      id: 20,
      nombre: "Gorra Azul SF (Segunda)",
      categoria: "BEISBOLERA PREMIUM",
      IdCategoria: 3,
      imagenes: ["https://res.cloudinary.com/dxc5qqsjd/image/upload/v1762910775/gorraazulsf_ckhji6.jpg"],
      descripcion: "Gorra azul con logo San Francisco (segunda versión)"
    },
    {
      id: 21,
      nombre: "Gorra Azul SF Café (Segunda)",
      categoria: "BEISBOLERA PREMIUM",
      IdCategoria: 3,
      imagenes: ["https://res.cloudinary.com/dxc5qqsjd/image/upload/v1762910774/gorraazulSFcafe_jxzvfg.jpg"],
      descripcion: "Gorra azul con detalles café y logo SF (segunda versión)"
    },
    {
      id: 22,
      nombre: "Gorra Azul Sox Blanca (Segunda)",
      categoria: "BEISBOLERA PREMIUM",
      IdCategoria: 3,
      imagenes: ["https://res.cloudinary.com/dxc5qqsjd/image/upload/v1762910775/gorraazulsoxblanca_eagdgv.jpg"],
      descripcion: "Gorra azul con detalles blancos y logo Sox (segunda versión)"
    },
    {
      id: 23,
      nombre: "Gorra Azul SOX Gris (Segunda)",
      categoria: "BEISBOLERA PREMIUM",
      IdCategoria: 3,
      imagenes: ["https://res.cloudinary.com/dxc5qqsjd/image/upload/v1762910774/gorraazulSOXgris_qzk2p7.jpg"],
      descripcion: "Gorra azul con detalles grises y logo SOX (segunda versión)"
    },
    {
      id: 24,
      nombre: "Gorra Azul Toda LA (Segunda)",
      categoria: "BEISBOLERA PREMIUM",
      IdCategoria: 3,
      imagenes: ["https://res.cloudinary.com/dxc5qqsjd/image/upload/v1762910779/gorraazulltodaLA_ykxdvi.jpg"],
      descripcion: "Gorra completamente azul con logo LA (segunda versión)"
    },
    {
      id: 25,
      nombre: "Gorra Azul Toda SF",
      categoria: "BEISBOLERA PREMIUM",
      IdCategoria: 3,
      imagenes: ["https://res.cloudinary.com/dxc5qqsjd/image/upload/v1762910773/gorraazultodaSF_tyohwb.jpg"],
      descripcion: "Gorra completamente azul con logo SF"
    },
    {
      id: 26,
      nombre: "Gorra Azul Toda Sox XX",
      categoria: "BEISBOLERA PREMIUM",
      IdCategoria: 3,
      imagenes: ["https://res.cloudinary.com/dxc5qqsjd/image/upload/v1762910774/gorraazultodasoxx_sng8at.jpg"],
      descripcion: "Gorra completamente azul con logo Sox XX"
    },
    {
      id: 27,
      nombre: "Gorra Azul Total LA",
      categoria: "BEISBOLERA PREMIUM",
      IdCategoria: 3,
      imagenes: ["https://res.cloudinary.com/dxc5qqsjd/image/upload/v1762910792/GORRAAZULTOTALAA_opvr4s.jpg"],
      descripcion: "Gorra azul total con logo LA"
    },
    {
      id: 28,
      nombre: "Gorra Blanca Toda LA",
      categoria: "BEISBOLERA PREMIUM",
      IdCategoria: 3,
      imagenes: ["https://res.cloudinary.com/dxc5qqsjd/image/upload/v1762910781/gorrablancatodaLA_guel5z.jpg"],
      descripcion: "Gorra completamente blanca con logo LA"
    },
    {
      id: 29,
      nombre: "Gorra Café Café LA",
      categoria: "BEISBOLERA PREMIUM",
      IdCategoria: 3,
      imagenes: ["https://res.cloudinary.com/dxc5qqsjd/image/upload/v1762910788/gorracafe-cafeLA_ssse5m.jpg"],
      descripcion: "Gorra café con detalles café y logo LA"
    },
    {
      id: 30,
      nombre: "Gorra Doble Azul A",
      categoria: "BEISBOLERA PREMIUM",
      IdCategoria: 3,
      imagenes: ["https://res.cloudinary.com/dxc5qqsjd/image/upload/v1762910794/gorradobleazulA_acysma.jpg"],
      descripcion: "Gorra doble azul con logo A"
    },
    // DIAMANTE IMPORTADA (55-60)
    {
      id: 55,
      nombre: "Gorra A Roja",
      categoria: "DIAMANTE IMPORTADA",
      IdCategoria: 4,
      imagenes: ["https://res.cloudinary.com/dxc5qqsjd/image/upload/v1762914404/gorraAroja_eypttd.jpg"],
      descripcion: "Gorra diamante importada color rojo con logo A"
    },
    {
      id: 56,
      nombre: "Gorra AS",
      categoria: "DIAMANTE IMPORTADA",
      IdCategoria: 4,
      imagenes: ["https://res.cloudinary.com/dxc5qqsjd/image/upload/v1762914407/gorraAS_qybamm.jpg"],
      descripcion: "Gorra diamante importada con logo AS"
    },
    {
      id: 57,
      nombre: "Gorra Con Rosas",
      categoria: "DIAMANTE IMPORTADA",
      IdCategoria: 4,
      imagenes: ["https://res.cloudinary.com/dxc5qqsjd/image/upload/v1762914412/gorraconrosas_ko3326.jpg"],
      descripcion: "Gorra diamante importada con diseño de rosas"
    },
    {
      id: 58,
      nombre: "Gorra Doge",
      categoria: "DIAMANTE IMPORTADA",
      IdCategoria: 4,
      imagenes: ["https://res.cloudinary.com/dxc5qqsjd/image/upload/v1762914410/gorradoge_mefwmo.jpg"],
      descripcion: "Gorra diamante importada con diseño Doge"
    },
    {
      id: 59,
      nombre: "Gorra LA",
      categoria: "DIAMANTE IMPORTADA",
      IdCategoria: 4,
      imagenes: ["https://res.cloudinary.com/dxc5qqsjd/image/upload/v1762914409/gorraLA_vz1fsr.jpg"],
      descripcion: "Gorra diamante importada con logo LA"
    },
    {
      id: 60,
      nombre: "Gorra NY",
      categoria: "DIAMANTE IMPORTADA",
      IdCategoria: 4,
      imagenes: ["https://res.cloudinary.com/dxc5qqsjd/image/upload/v1762914405/gorraNY_z3oxea.jpg"],
      descripcion: "Gorra diamante importada con logo NY"
    },
    // EQUINAS-AGROPECUARIAS (61-83)
    {
      id: 61,
      nombre: "Gorra Azul Cerdo Verde",
      categoria: "EQUINAS-AGROPECUARIAS",
      IdCategoria: 5,
      imagenes: ["https://res.cloudinary.com/dxc5qqsjd/image/upload/v1762916288/gorraazulcerdoverde_e10kc7.jpg"],
      descripcion: "Gorra agropecuaria azul con diseño de cerdo verde"
    },
    {
      id: 62,
      nombre: "Gorra Azul Toro",
      categoria: "EQUINAS-AGROPECUARIAS",
      IdCategoria: 5,
      imagenes: ["https://res.cloudinary.com/dxc5qqsjd/image/upload/v1762914771/gorraazultoro_h1mqjb.jpg"],
      descripcion: "Gorra agropecuaria azul con diseño de toro"
    },
    {
      id: 63,
      nombre: "Gorra Blanca 2 Gallo",
      categoria: "EQUINAS-AGROPECUARIAS",
      IdCategoria: 5,
      imagenes: ["https://res.cloudinary.com/dxc5qqsjd/image/upload/v1762914723/gorrablanca2gallo_rlwyl7.jpg"],
      descripcion: "Gorra agropecuaria blanca con diseño de gallo"
    },
    // NIKE 1.1 (101-139)
    {
      id: 101,
      nombre: "Gorra Roja y Morada 9",
      categoria: "NIKE 1.1",
      IdCategoria: 1,
      imagenes: ["https://res.cloudinary.com/dxc5qqsjd/image/upload/v1762950188/gorrarojaymorada9_sufoqt.jpg"],
      descripcion: "Gorra Nike edición limitada roja y morada"
    },
    {
      id: 102,
      nombre: "Gorra Azul Del Buldog",
      categoria: "NIKE 1.1",
      IdCategoria: 1,
      imagenes: ["https://res.cloudinary.com/dxc5qqsjd/image/upload/v1762949687/gorrasazuldelbuldog_ebyrlc.jpg"],
      descripcion: "Gorra Nike azul con diseño Buldog"
    },
    {
      id: 103,
      nombre: "Gorra Gris Elefante 8",
      categoria: "NIKE 1.1",
      IdCategoria: 1,
      imagenes: ["https://res.cloudinary.com/dxc5qqsjd/image/upload/v1762950188/gorrasgriselfante8_czzieu.jpg"],
      descripcion: "Gorra Nike gris con diseño de elefante"
    },
    // EXCLUSIVA 1.1 (186-195)
    {
      id: 186,
      nombre: "Gorra Letras",
      categoria: "EXCLUSIVA 1.1",
      IdCategoria: 6,
      imagenes: ["https://res.cloudinary.com/dxc5qqsjd/image/upload/v1762956761/gorraletras_hh9lvu.jpg"],
      descripcion: "Gorra exclusiva con diseño de letras"
    },
    {
      id: 187,
      nombre: "Gorra Angel",
      categoria: "EXCLUSIVA 1.1",
      IdCategoria: 6,
      imagenes: ["https://res.cloudinary.com/dxc5qqsjd/image/upload/v1762956755/gorraangel_tveggt.jpg"],
      descripcion: "Gorra exclusiva con diseño angelical"
    },
    {
      id: 188,
      nombre: "Gorra Café",
      categoria: "EXCLUSIVA 1.1",
      IdCategoria: 6,
      imagenes: ["https://res.cloudinary.com/dxc5qqsjd/image/upload/v1762956756/gorracafe_mv4wfq.jpg"],
      descripcion: "Gorra exclusiva color café"
    },
    // MULTIMARCA (107-155)
    {
      id: 107,
      nombre: "Gorra Monastery Malla",
      categoria: "MULTIMARCA",
      IdCategoria: 8,
      imagenes: ["https://res.cloudinary.com/dxc5qqsjd/image/upload/v1762957915/gorramonasterymalla_o0rm13.jpg"],
      descripcion: "Gorra multibrand Monastery con malla"
    },
    {
      id: 108,
      nombre: "Gorra Negra Under",
      categoria: "MULTIMARCA",
      IdCategoria: 8,
      imagenes: ["https://res.cloudinary.com/dxc5qqsjd/image/upload/v1762957902/gorranegraundld_uh9wwr.jpg"],
      descripcion: "Gorra multibrand negra estilo Under"
    },
    {
      id: 109,
      nombre: "Gorra Amiri Blanca",
      categoria: "MULTIMARCA",
      IdCategoria: 8,
      imagenes: ["https://res.cloudinary.com/dxc5qqsjd/image/upload/v1762957956/gorraamiriblanca_xuguvk.jpg"],
      descripcion: "Gorra multibrand Amiri blanca"
    },
    // PREMIUM (339-357)
    {
      id: 339,
      nombre: "Gorra Gris CC",
      categoria: "PREMIUM",
      IdCategoria: 12,
      imagenes: ["https://res.cloudinary.com/dxc5qqsjd/image/upload/v1762987061/gorragriscc_dt9otq.jpg"],
      descripcion: "Gorra premium gris con diseño CC"
    },
    {
      id: 340,
      nombre: "Gorra Hugo Boss",
      categoria: "PREMIUM",
      IdCategoria: 12,
      imagenes: ["https://res.cloudinary.com/dxc5qqsjd/image/upload/v1762987076/gorrahugoboss_ev6z54.jpg"],
      descripcion: "Gorra premium Hugo Boss"
    },
    {
      id: 341,
      nombre: "Gorra Marrón CC",
      categoria: "PREMIUM",
      IdCategoria: 12,
      imagenes: ["https://res.cloudinary.com/dxc5qqsjd/image/upload/v1762987049/gorramarronCC_gjngm5.jpg"],
      descripcion: "Gorra premium marrón con diseño CC"
    },
    // PLANA CERRADA (428-458)
    {
      id: 428,
      nombre: "Gorra Azul NY",
      categoria: "PLANA CERRADA 1.1",
      IdCategoria: 9,
      imagenes: ["https://res.cloudinary.com/dxc5qqsjd/image/upload/v1762988571/gorraazulNY_huym2t.jpg"],
      descripcion: "Gorra plana cerrada azul con logo NY"
    },
    {
      id: 429,
      nombre: "Gorra Blanca Buks",
      categoria: "PLANA CERRADA 1.1",
      IdCategoria: 9,
      imagenes: ["https://res.cloudinary.com/dxc5qqsjd/image/upload/v1762988568/gorrablancabuks_ll8ymc.jpg"],
      descripcion: "Gorra plana cerrada blanca estilo Buks"
    },
    {
      id: 430,
      nombre: "Gorra Negra Celtics",
      categoria: "PLANA CERRADA 1.1",
      IdCategoria: 9,
      imagenes: ["https://res.cloudinary.com/dxc5qqsjd/image/upload/v1762988567/gorranegraceltics_isriex.jpg"],
      descripcion: "Gorra plana cerrada negra Boston Celtics"
    },
    // PORTAGORRAS (462-465)
    {
      id: 462,
      nombre: "Portagorras Sencillo",
      categoria: "PORTAGORRAS",
      IdCategoria: 11,
      imagenes: ["https://res.cloudinary.com/dxc5qqsjd/image/upload/v1762994460/portagorras-1sencillo_xxe5hf.jpg"],
      descripcion: "Portagorras sencillo para una gorra"
    },
    {
      id: 463,
      nombre: "Portagorras Blowup 4",
      categoria: "PORTAGORRAS",
      IdCategoria: 11,
      imagenes: ["https://res.cloudinary.com/dxc5qqsjd/image/upload/v1762994456/portagorrablowup4_g2j684.jpg"],
      descripcion: "Portagorras blowup para 4 gorras"
    },
    // RELOJES
    {
      id: 500,
      nombre: "Reloj Azul MX60",
      categoria: "RELOJES",
      IdCategoria: 14,
      imagenes: ["https://res.cloudinary.com/dxc5qqsjd/image/upload/v1763002075/azulmx60ot_oal8yb.jpg"],
      descripcion: "Reloj deportivo azul MX60 resistente al agua"
    },
    {
      id: 501,
      nombre: "Reloj Negro Richard",
      categoria: "RELOJES",
      IdCategoria: 14,
      imagenes: ["https://res.cloudinary.com/dxc5qqsjd/image/upload/v1763002076/richarnegro_p6m73v.jpg"],
      descripcion: "Reloj elegante negro Richard"
    },
    {
      id: 502,
      nombre: "Reloj Deportivo Azul",
      categoria: "RELOJES",
      IdCategoria: 14,
      imagenes: ["https://res.cloudinary.com/dxc5qqsjd/image/upload/v1763002075/sportredondoazul_quo4td.jpg"],
      descripcion: "Reloj deportivo redondo azul"
    },
    {
      id: 503,
      nombre: "Reloj Deportivo Negro",
      categoria: "RELOJES",
      IdCategoria: 14,
      imagenes: ["https://res.cloudinary.com/dxc5qqsjd/image/upload/v1763002075/sportwatchnegro_e5gjcp.jpg"],
      descripcion: "Reloj deportivo negro con múltiples funciones"
    }
  ];

  // Procesar cada producto para añadir datos faltantes
  return productData.map(product => {
    const productData = generateProductData(120000, 25); // Precio base $120,000, stock base 25
    const colors = extractColorsFromFileName(product.nombre || '');
    const sizes = getSizesByCategory(product.categoria);
    
    return {
      ...product,
      ...productData,
      tallas: sizes,
      colores: colors.length > 0 ? colors : ["Negro"],
      descripcion: product.descripcion || `Gorra ${product.categoria} - ${product.nombre}`,
      destacado: product.isFeatured || false
    };
  });
};

// Productos completos generados
export const initialProducts = generateProductsFromJson();

// Constantes de categorías para filtros
export const categories = [
  "BEISBOLERA PREMIUM",
  "DIAMANTE IMPORTADA", 
  "EQUINAS-AGROPECUARIAS",
  "NIKE 1.1",
  "EXCLUSIVA 1.1",
  "MULTIMARCA",
  "PREMIUM",
  "A/N 1.1",
  "PLANA CERRADA 1.1",
  "PLANA IMPORTADA",
  "PORTAGORRAS",
  "RELOJES",
  "CAMISETAS"
];

// Mapa de colores para UI
export const colorMap = {
  azul: "#2563EB",
  blanco: "#FFFFFF",
  rojo: "#DC2626",
  negro: "#000000",
  verde: "#16A34A",
  gris: "#6B7280",
  café: "#92400E",
  morado: "#7C3AED",
  rosa: "#DB2777",
  dorado: "#FBBF24",
  plateado: "#9CA3AF",
  amarillo: "#F59E0B",
  naranja: "#EA580C",
  beige: "#D4B499",
  multicolor: "linear-gradient(45deg, #FF6B6B, #4ECDC4, #45B7D1, #96CEB4, #FECA57, #FF9FF3)",
  natural: "#D1D5DB"
};

// Ventas
export const initialSales = [
  {
    id: 1,
    cliente: { id: 2, nombre: "Imanuel López" },
    vendedor: { id: 1, nombre: "Juan Pérez" },
    estado: "Completada",
    isActive: true,
    fecha: "05/12/2025",
    total: 170000,
    metodoPago: "Efectivo",
    productos: [
      { id: 101, nombre: "Gorra NBA Lakers", cantidad: 2, precio: 85000, talla: "Ajustable", color: "Negro" }
    ]
  }
];

// Compras
export const initialOrders = [
  {
    IdCompra: 1,
    IdProveedor: 1,
    proveedor: "Distribuidora ABC",
    Fecha: "2025-11-05T10:30:00",
    Total: 500000,
    estado: "Activo",
    isActive: true,
    productos: [
      { IdProducto: 1, nombre: "Gorra Nike Air Force", cantidad: 2, precio: 88000 }
    ]
  }
];

// Devoluciones
export const initialReturns = [
  {
    IdDevolucion: 1,
    IdProducto: 1,
    IdVenta: 1,
    Cantidad: 1,
    Motivo: "Producto defectuoso - logo despegado",
    Fecha: "2025-11-08T10:30:00",
    Monto: 88000.00
  }
];

// =================================================================
// FUNCIONES DE AYUDA
// =================================================================

export const getStatusColor = (status) => {
  switch (status) {
    case "Completada": return "#28a745";
    case "Pendiente": return "#ffc107";
    case "Cancelada": return "#6c757d";
    default: return "#6c757d";
  }
};

export const paymentMethods = ["Efectivo", "Tarjeta", "Transferencia"];

export const getProductsOnSale = () => {
  return initialProducts.filter(product => 
    product.isActive && product.hasDiscount && product.precio < product.originalPrice
  );
};

export const calculateDiscountPercentage = (originalPrice, salePrice) => {
  if (!originalPrice || originalPrice <= salePrice) return 0;
  return Math.round(((originalPrice - salePrice) / originalPrice) * 100);
};

export const getFeaturedProducts = () => {
  return initialProducts.filter(product => product.isActive && product.isFeatured);
};

export const getTotalSales = () => {
  return initialSales
    .filter(sale => sale.estado === "Completada" && sale.isActive)
    .reduce((total, sale) => total + sale.total, 0);
};

// =================================================================
// FUNCIONES DE FILTRADO AVANZADO
// =================================================================

export const getProductsByColorAndSize = (color, size) => {
  return initialProducts.filter(product => {
    if (!product.isActive) return false;
    const colorMatch = !color || (product.colores && product.colores.some(c => c.toLowerCase().includes(color.toLowerCase())));
    const sizeMatch = !size || (product.tallas && product.tallas.some(t => t.toLowerCase().includes(size.toLowerCase())));
    return colorMatch && sizeMatch;
  });
};

export const getFilteredProductsOnSale = (filters = {}) => {
  let filtered = getProductsOnSale();
  if (filters.color) {
    filtered = filtered.filter(p => p.colores && p.colores.some(c => c.toLowerCase().includes(filters.color.toLowerCase())));
  }
  if (filters.category) {
    filtered = filtered.filter(p => p.categoria && p.categoria.toLowerCase().includes(filters.category.toLowerCase()));
  }
  return filtered;
};

// =================================================================
// FUNCIONES PARA SIDEBAR Y NAVEGACIÓN
// =================================================================

// Obtener módulos visibles para sidebar
export const getSidebarModules = () => {
  const user = getCurrentUser();
  if (!user) return [];
  
  if (user.IdRol === 1) return modules;
  
  const role = roles.find(r => r.IdRol === user.IdRol);
  if (!role) return [];
  
  return modules.filter(module => role.Permisos.includes(module.id));
};

// =================================================================
// FUNCIONES DE VALIDACIÓN DE LOGIN
// =================================================================

// Validar credenciales de usuario
export const validateUserCredentials = (email, password) => {
  // Primero verificar el admin quemado
  if (email === adminHardcodedUser.Correo && password === adminHardcodedUser.Clave) {
    return adminHardcodedUser;
  }
  
  // Luego verificar usuarios de initialUsers
  const user = initialUsers.find(u => 
    u.Correo === email && 
    u.Estado === true && 
    (u.Clave === password || password === "123456")
  );
  
  if (user) {
    return user;
  }
  
  // Finalmente verificar localStorage (usuarios registrados)
  const storedUser = localStorage.getItem('user');
  if (storedUser) {
    const parsedUser = JSON.parse(storedUser);
    if (parsedUser.Correo === email && parsedUser.Clave === password) {
      return parsedUser;
    }
  }
  
  return null;
};

// Obtener módulos por rol
export const getModulesByRole = (roleId) => {
  const role = roles.find(r => r.IdRol === roleId);
  if (!role) return [];
  return modules.filter(module => role.Permisos.includes(module.id));
};

// =================================================================
// FUNCIONES PARA EXPORTAR/IMPORTAR
// =================================================================

// Exportar datos para backup
export const exportData = () => {
  return {
    users: initialUsers,
    roles: roles,
    customers: initialCustomers,
    suppliers: initialSuppliers,
    categories: initialCategories,
    products: initialProducts,
    sales: initialSales,
    orders: initialOrders,
    returns: initialReturns
  };
};

// Resetear datos a valores iniciales
export const resetToInitialData = () => {
  localStorage.removeItem('user');
  return {
    success: true,
    message: "Datos reiniciados correctamente"
  };
};

// =================================================================
// FUNCIONES ADICIONALES PARA PERMISOS Y NAVEGACIÓN
// =================================================================

// Obtener el nombre del módulo por ID
export const getModuleName = (moduleId) => {
  const module = modules.find(m => m.id === moduleId);
  return module ? module.label : moduleId;
};

// Obtener icono del módulo por ID
export const getModuleIcon = (moduleId) => {
  const module = modules.find(m => m.id === moduleId);
  return module ? module.icon : BarChart3;
};

// Verificar si el usuario actual tiene acceso a una ruta específica
export const checkRouteAccess = (route) => {
  const user = getCurrentUser();
  if (!user) return false;
  if (user.IdRol === 1) return true; // Admin tiene acceso a todo
  
  // Mapeo de rutas a permisos
  const routePermissionMap = {
    '/dashboard': 'dashboard',
    '/categorias': 'categorias',
    '/productos': 'productos',
    '/proveedores': 'proveedores',
    '/compras': 'compras',
    '/clientes': 'clientes',
    '/ventas': 'ventas',
    '/devoluciones': 'devoluciones',
    '/usuarios': 'usuarios',
    '/roles': 'roles'
  };
  
  // Obtener la parte principal de la ruta
  const cleanRoute = route.split('?')[0]; // Remover query params
  const baseRoute = cleanRoute.split('/')[1] ? `/${cleanRoute.split('/')[1]}` : cleanRoute;
  
  const requiredPermission = routePermissionMap[baseRoute];
  if (!requiredPermission) return true; // Rutas sin mapeo específico permitidas
  
  return hasPermission(requiredPermission);
};

// Obtener el nombre del rol del usuario actual
export const getCurrentUserRoleName = () => {
  const user = getCurrentUser();
  if (!user) return 'Invitado';
  
  const role = roles.find(r => r.IdRol === user.IdRol);
  return role ? role.Nombre : 'Usuario';
};

// Obtener descripción del rol del usuario actual
export const getCurrentUserRoleDescription = () => {
  const user = getCurrentUser();
  if (!user) return '';
  
  const role = initialRoles.find(r => r.IdRol === user.IdRol);
  return role ? role.Descripcion : '';
};

// Verificar si el usuario puede realizar una acción específica
export const canPerformAction = (action) => {
  const user = getCurrentUser();
  if (!user) return false;
  if (user.IdRol === 1) return true; // Admin puede hacer todo
  
  // Mapeo de acciones a permisos
  const actionPermissionMap = {
    // Acciones de productos
    'create_product': 'productos',
    'edit_product': 'productos',
    'delete_product': 'productos',
    'view_products': 'productos',
    
    // Acciones de categorías
    'create_category': 'categorias',
    'edit_category': 'categorias',
    'delete_category': 'categorias',
    'view_categories': 'categorias',
    
    // Acciones de proveedores
    'create_supplier': 'proveedores',
    'edit_supplier': 'proveedores',
    'delete_supplier': 'proveedores',
    'view_suppliers': 'proveedores',
    
    // Acciones de compras
    'create_order': 'compras',
    'edit_order': 'compras',
    'delete_order': 'compras',
    'view_orders': 'compras',
    
    // Acciones de clientes
    'create_customer': 'clientes',
    'edit_customer': 'clientes',
    'delete_customer': 'clientes',
    'view_customers': 'clientes',
    
    // Acciones de ventas
    'create_sale': 'ventas',
    'edit_sale': 'ventas',
    'delete_sale': 'ventas',
    'view_sales': 'ventas',
    
    // Acciones de devoluciones
    'create_return': 'devoluciones',
    'edit_return': 'devoluciones',
    'delete_return': 'devoluciones',
    'view_returns': 'devoluciones',
    
    // Acciones de usuarios
    'create_user': 'usuarios',
    'edit_user': 'usuarios',
    'delete_user': 'usuarios',
    'view_users': 'usuarios',
    
    // Acciones de roles
    'create_role': 'roles',
    'edit_role': 'roles',
    'delete_role': 'roles',
    'view_roles': 'roles'
  };
  
  const requiredPermission = actionPermissionMap[action];
  if (!requiredPermission) return false; // Si no está mapeada, denegar por defecto
  
  return hasPermission(requiredPermission);
};

// Obtener permisos por rol ID
export const getPermissionsByRole = (roleId) => {
  const role = roles.find(r => r.IdRol === roleId);
  return role ? role.Permisos : [];
};

// Obtener todos los módulos disponibles
export const getAllModules = () => {
  return modules;
};

// Verificar si un usuario está autenticado
export const isAuthenticated = () => {
  return getCurrentUser() !== null;
};

// Función para cerrar sesión
export const logout = () => {
  localStorage.removeItem('user');
  return true;
};

// =================================================================
// FUNCIÓN DE LOGIN MEJORADA
// =================================================================

// Función para hacer login y guardar usuario en localStorage
export const loginUser = (email, password) => {
  const user = validateUserCredentials(email, password);
  
  if (user) {
    // Guardar usuario en localStorage
    localStorage.setItem('user', JSON.stringify(user));
    
    // Obtener los módulos visibles para este usuario
    const visibleModules = getModulesByRole(user.IdRol);
    
    return {
      success: true,
      user: user,
      modules: visibleModules,
      message: "Login exitoso"
    };
  }
  
  return {
    success: false,
    message: "Credenciales incorrectas"
  };
};