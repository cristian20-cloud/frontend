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
// CLIENTES CON CONTRASEÑA (CORREGIDO - SIN ESPACIOS)
// =================================================================
export const initialCustomers = [
  {
    IdCliente: 1,
    Nombre: "Imanol López",
    Telefono: "3124567890",
    Correo: "imanol.lopez@gmail.com",
    Clave: "imanol123",
    Departamento: "Antioquia",
    Ciudad: "Medellín",
    Direccion: "Calle 45 #23-10",
    SaldoaFavor: "150000",
    Estado: true,
    Pedidos: 5,
    FechaRegistro: "2024-01-15"
  },
  {
    IdCliente: 2,
    Nombre: "Sebastián Torres",
    Telefono: "3109876543",
    Correo: "sebastorres053@gmail.com",
    Clave: "sebastian123",
    Departamento: "Cundinamarca",
    Ciudad: "Bogotá",
    Direccion: "Carrera 10 #15-30",
    SaldoaFavor: "0",
    Estado: true,
    Pedidos: 2,
    FechaRegistro: "2024-02-20"
  },
  {
    IdCliente: 3,
    Nombre: "María González",
    Telefono: "3012589634",
    Correo: "maria.gonzalez@hotmail.com",
    Clave: "maria123",
    Departamento: "Valle del Cauca",
    Ciudad: "Cali",
    Direccion: "Avenida 3N #45-20",
    SaldoaFavor: "45000",
    Estado: true,
    Pedidos: 8,
    FechaRegistro: "2024-03-10"
  },
  {
    IdCliente: 4,
    Nombre: "Carlos Ramírez",
    Telefono: "3201122334",
    Correo: "carlos.ramirez78@outlook.com",
    Clave: "carlos123",
    Departamento: "Santander",
    Ciudad: "Bucaramanga",
    Direccion: "Calle 32 #18-45",
    SaldoaFavor: "32000",
    Estado: true,
    Pedidos: 3,
    FechaRegistro: "2024-01-25"
  },
  {
    IdCliente: 5,
    Nombre: "Ana María Vélez",
    Telefono: "3156789012",
    Correo: "anavelez22@gmail.com",
    Clave: "ana123",
    Departamento: "Atlántico",
    Ciudad: "Barranquilla",
    Direccion: "Carrera 53 #78-12",
    SaldoaFavor: "0",
    Estado: false,
    Pedidos: 0,
    FechaRegistro: "2024-04-05"
  },
  {
    IdCliente: 6,
    Nombre: "Jorge Eliécer Duque",
    Telefono: "3112345678",
    Correo: "jorge.duque@empresa.co",
    Clave: "jorge123",
    Departamento: "Antioquia",
    Ciudad: "Envigado",
    Direccion: "Calle 10 Sur #44-67",
    SaldoaFavor: "210500",
    Estado: true,
    Pedidos: 12,
    FechaRegistro: "2023-12-10"
  },
  {
    IdCliente: 7,
    Nombre: "Lucía Fernández",
    Telefono: "3009871234",
    Correo: "luciafdez_91@yahoo.com",
    Clave: "lucia123",
    Departamento: "Cundinamarca",
    Ciudad: "Chía",
    Direccion: "Vereda La Florida, Km 2",
    SaldoaFavor: "18900",
    Estado: true,
    Pedidos: 4,
    FechaRegistro: "2024-02-15"
  },
  {
    IdCliente: 8,
    Nombre: "Diego Armando Rojas",
    Telefono: "3223456789",
    Correo: "diego.rojas87@gmail.com",
    Clave: "diego123",
    Departamento: "Risaralda",
    Ciudad: "Pereira",
    Direccion: "Carrera 14 #30-05",
    SaldoaFavor: "0",
    Estado: true,
    Pedidos: 1,
    FechaRegistro: "2024-05-01"
  },
  {
    IdCliente: 9,
    Nombre: "Valentina Castro",
    Telefono: "3187654321",
    Correo: "vale.castro1995@hotmail.com",
    Clave: "vale123",
    Departamento: "Bolívar",
    Ciudad: "Cartagena",
    Direccion: "Calle del Espíritu Santo #32-18",
    SaldoaFavor: "76400",
    Estado: true,
    Pedidos: 7,
    FechaRegistro: "2024-03-20"
  },
  {
    IdCliente: 10,
    Nombre: "Fernando Pardo",
    Telefono: "3134567890",
    Correo: "fpardo_negocios@gmail.com",
    Clave: "fernando123",
    Departamento: "Norte de Santander",
    Ciudad: "Cúcuta",
    Direccion: "Avenida 5 #22-88, Edificio Central, Of. 302",
    SaldoaFavor: "0",
    Estado: false,
    Pedidos: 0,
    FechaRegistro: "2024-01-30"
  }
];

// =================================================================
// FUNCIONES DE CLIENTES - CORREGIDAS
// =================================================================
export const validateCustomerCredentials = (email, password) => {
  const cleanEmail = email.toLowerCase().trim();
  const cleanPassword = password.trim();
  
  // Buscar en initialCustomers
  const customer = initialCustomers.find(c => {
    const customerEmail = c.Correo ? c.Correo.toLowerCase().trim() : '';
    const customerPassword = c.Clave ? c.Clave.trim() : '';
    return customerEmail === cleanEmail && customerPassword === cleanPassword;
  });
  
  if (customer) {
    return {
      success: true,
      customer: {
        ...customer,
        role: 'cliente',
        Rol: 'cliente',
        userType: 'cliente',
        Pedidos: customer.Pedidos || 0,
        Devoluciones: 0
      }
    };
  }
  
  // Buscar también en localStorage
  try {
    const storedCustomers = JSON.parse(localStorage.getItem('customers') || '[]');
    const localCustomer = storedCustomers.find(c => {
      const customerEmail = c.Correo ? c.Correo.toLowerCase().trim() : '';
      const customerPassword = c.Clave ? c.Clave.trim() : '';
      return customerEmail === cleanEmail && customerPassword === cleanPassword;
    });
    
    if (localCustomer) {
      return {
        success: true,
        customer: {
          ...localCustomer,
          role: 'cliente',
          Rol: 'cliente',
          userType: 'cliente',
          Pedidos: localCustomer.Pedidos || 0,
          Devoluciones: localCustomer.Devoluciones || 0
        }
      };
    }
  } catch (error) {
    console.error("Error al leer clientes de localStorage:", error);
  }
  
  return {
    success: false,
    message: 'Correo o contraseña incorrectos'
  };
};

export const registerCustomer = (customerData) => {
  const { name, email, password, phone, address } = customerData;
  const cleanEmail = email.toLowerCase().trim();
  
  // Verificar si el email ya existe en initialCustomers
  const emailExistsInInitial = initialCustomers.some(c => {
    const customerEmail = c.Correo ? c.Correo.toLowerCase().trim() : '';
    return customerEmail === cleanEmail;
  });
  
  // Verificar en localStorage
  const storedCustomers = JSON.parse(localStorage.getItem('customers') || '[]');
  const emailExistsInLocal = storedCustomers.some(c => {
    const customerEmail = c.Correo ? c.Correo.toLowerCase().trim() : '';
    return customerEmail === cleanEmail;
  });
  
  if (emailExistsInInitial || emailExistsInLocal) {
    return {
      success: false,
      message: 'Este correo ya está registrado'
    };
  }
  
  // Crear nuevo cliente
  const newCustomerId = Math.max(
    ...initialCustomers.map(c => c.IdCliente),
    ...storedCustomers.map(c => c.IdCliente || 0),
    0
  ) + 1;
  
  const newCustomer = {
    IdCliente: newCustomerId,
    Nombre: name.trim(),
    Correo: cleanEmail,
    Clave: password.trim(),
    Telefono: phone.trim(),
    Direccion: address.trim(),
    Departamento: 'N/A',
    Ciudad: 'N/A',
    SaldoaFavor: "0",
    Estado: true,
    Pedidos: 0,
    Devoluciones: 0,
    FechaRegistro: new Date().toISOString().split('T')[0],
    role: 'cliente',
    Rol: 'cliente',
    userType: 'cliente'
  };
  
  // Guardar en localStorage
  storedCustomers.push(newCustomer);
  localStorage.setItem('customers', JSON.stringify(storedCustomers));
  
  return {
    success: true,
    customer: newCustomer
  };
};

// =================================================================
// ROLES (CORREGIDO - SIN ESPACIOS)
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

// =================================================================
// USUARIOS (CORREGIDO - SIN ESPACIOS)
// =================================================================
export const initialUsers = [
  {
    IdUsuario: 1,
    Nombre: "Andrés Guzmán",
    Correo: "admin@mail.com",
    IdRol: 1,
    Clave: "Admin#GM2024!Secure",
    Estado: true,
    Permisos: roles[0].Permisos
  },
  {
    IdUsuario: 2,
    Nombre: "Imanol López",
    Correo: "ventas@mail.com",
    IdRol: 2,
    Clave: "Ventas@Caps2024!",
    Estado: true,
    Permisos: roles[1].Permisos
  },
  {
    IdUsuario: 3,
    Nombre: "Carolina Méndez",
    Correo: "inventario@mail.com",
    IdRol: 3,
    Clave: "Inv#Stock2024!Safe",
    Estado: true,
    Permisos: roles[2].Permisos
  },
  {
    IdUsuario: 4,
    Nombre: "Sebastián Torres",
    Correo: "sebastorres053@gmail.com",
    IdRol: 2,
    Clave: "Ven$Torres2024!",
    Estado: true,
    Permisos: roles[1].Permisos
  },
  {
    IdUsuario: 5,
    Nombre: "Andrés Guzmán 2",
    Correo: "andres.guzman23@gmail.com",
    IdRol: 1,
    Clave: "Admin2#Caps2024!",
    Estado: true,
    Permisos: roles[0].Permisos
  },
  {
    IdUsuario: 6,
    Nombre: "Diana Ríos",
    Correo: "diana.rios@rh.local",
    IdRol: 4,
    Clave: "RH#Diana2024!Safe",
    Estado: true,
    Permisos: roles[3].Permisos
  },
  {
    IdUsuario: 7,
    Nombre: "Carlos Pérez",
    Correo: "carlos@clientes.local",
    IdRol: 5,
    Clave: "Cli@Carlos2024!GM",
    Estado: true,
    Permisos: roles[4].Permisos
  },
  {
    IdUsuario: 8,
    Nombre: "Ana Auditora",
    Correo: "ana@auditoria.local",
    IdRol: 6,
    Clave: "Aud#Ana2024!View",
    Estado: true,
    Permisos: roles[5].Permisos
  }
];

// =================================================================
// MÓDULOS DEL SISTEMA (CORREGIDO - SIN ESPACIOS)
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
// FUNCIONES DE AUTENTICACIÓN Y PERMISOS
// =================================================================
export const getCurrentUser = () => {
  if (typeof window === 'undefined') return null;
  try {
    const userData = localStorage.getItem('user');
    return userData ? JSON.parse(userData) : null;
  } catch (error) {
    console.error("Error al obtener usuario actual:", error);
    return null;
  }
};

export const getCurrentPermissions = () => {
  const user = getCurrentUser();
  if (!user) return [];
  return user.Permisos || [];
};

export const getVisibleModules = () => {
  const user = getCurrentUser();
  if (!user) return [];
  
  if (user.IdRol === 1) return modules;
  
  const role = roles.find(r => r.IdRol === user.IdRol);
  if (!role || !role.Permisos) return [];
  
  return modules.filter((module) => role.Permisos.includes(module.id));
};

export const hasPermission = (permission) => {
  const user = getCurrentUser();
  if (!user) return false;
  if (user.IdRol === 1) return true;
  
  const role = roles.find(r => r.IdRol === user.IdRol);
  if (!role) return false;
  
  return role.Permisos?.includes(permission) || false;
};

export const canViewModule = (moduleId) => {
  return hasPermission(moduleId);
};

// =================================================================
// DATOS DE CONFIGURACIÓN
// =================================================================
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
  
  if (user.IdRol === 1) return allItems;
  
  const role = roles.find(r => r.IdRol === user.IdRol);
  if (!role || !role.Permisos) return [];
  
  return allItems.filter(item => role.Permisos.includes(item.permission));
};

// =================================================================
// DATOS TRANSACCIONALES (CORREGIDOS - SIN ESPACIOS)
// =================================================================
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

export const initialSuppliers = [
  { IdProveedor: 1, Nombre: "Distribuidora ABC", TipoDocumento: "NIT", NumeroDocumento: "900123456-7", Telefono: "+57 300 123 4567", Direccion: "Calle 10 #23-45, Medellín", Correo: "ventas@abc.com.co", Estado: true },
  { IdProveedor: 2, Nombre: "Importaciones XYZ", TipoDocumento: "NIT", NumeroDocumento: "900234567-8", Telefono: "+57 301 234 5678", Direccion: "Av. Las Vegas #78-12, Medellín", Correo: "contacto@xyzimport.com", Estado: true },
  { IdProveedor: 3, Nombre: "Gorras del Valle", TipoDocumento: "NIT", NumeroDocumento: "900345678-9", Telefono: "+57 302 345 6789", Direccion: "Calle 56 #34-21, Cali", Correo: "info@gorrasvalle.com", Estado: false },
  { IdProveedor: 4, Nombre: "Textiles Norte", TipoDocumento: "NIT", NumeroDocumento: "900456789-0", Telefono: "+57 303 456 7890", Direccion: "Av. Boyacá #45-67, Bogotá", Correo: "pedidos@textilesnorte.com", Estado: true },
  { IdProveedor: 5, Nombre: "Alimentos Andinos S.A.", TipoDocumento: "NIT", NumeroDocumento: "901234567-1", Telefono: "+57 310 567 8901", Direccion: "Carrera 45 #90-23, Medellín", Correo: "ventas@alimentosandinos.co", Estado: true },
  { IdProveedor: 6, Nombre: "Electrónicos del Futuro", TipoDocumento: "NIT", NumeroDocumento: "902345678-2", Telefono: "+57 311 678 9012", Direccion: "Calle 78 #12-34, Envigado", Correo: "soporte@electronicosfuturo.com", Estado: true },
  { IdProveedor: 7, Nombre: "Papelería Creativa Ltda.", TipoDocumento: "NIT", NumeroDocumento: "903456789-3", Telefono: "+57 312 789 0123", Direccion: "Carrera 30 #56-78, Itagüí", Correo: "pedidos@papeleriacreativa.com", Estado: true },
  { IdProveedor: 8, Nombre: "Confecciones Antioquia", TipoDocumento: "NIT", NumeroDocumento: "904567890-4", Telefono: "+57 313 890 1234", Direccion: "Av. Oriental #23-45, Medellín", Correo: "produccion@confeccionesantioquia.com", Estado: false },
  { IdProveedor: 9, Nombre: "Empaques EcoSostenibles", TipoDocumento: "NIT", NumeroDocumento: "905678901-5", Telefono: "+57 314 901 2345", Direccion: "Calle 120 #45-67, Sabaneta", Correo: "info@empaqueseco.co", Estado: true },
  { IdProveedor: 10, Nombre: "Ferretería La Estrella", TipoDocumento: "NIT", NumeroDocumento: "906789012-6", Telefono: "+57 315 012 3456", Direccion: "Carrera 52 #89-01, Medellín", Correo: "ventas@ferreterialaestrella.com", Estado: true },
  { IdProveedor: 11, Nombre: "Dulces Regionales SAS", TipoDocumento: "NIT", NumeroDocumento: "907890123-7", Telefono: "+57 316 123 4567", Direccion: "Calle 65 #22-11, Bello", Correo: "distribucion@dulcesregionales.co", Estado: true },
  { IdProveedor: 12, Nombre: "Muebles Artesanales", TipoDocumento: "NIT", NumeroDocumento: "908901234-8", Telefono: "+57 317 234 5678", Direccion: "Vereda El Porvenir, La Ceja", Correo: "contacto@mueblesartesanales.com", Estado: false },
  { IdProveedor: 13, Nombre: "Cosméticos Naturales", TipoDocumento: "NIT", NumeroDocumento: "909012345-9", Telefono: "+57 318 345 6789", Direccion: "Carrera 70 #34-56, Medellín", Correo: "ventas@cosmeticosnaturales.co", Estado: true },
  { IdProveedor: 14, Nombre: "Herramientas Profesionales", TipoDocumento: "NIT", NumeroDocumento: "900123457-0", Telefono: "+57 319 456 7890", Direccion: "Av. 80 #67-89, Medellín", Correo: "soporte@herramientaspro.com", Estado: true },
  { IdProveedor: 15, Nombre: "Café Premium Antioqueño", TipoDocumento: "NIT", NumeroDocumento: "901234568-1", Telefono: "+57 320 567 8901", Direccion: "Finca El Roble, Fredonia", Correo: "export@cafepremium.co", Estado: true }
];

export const initialCategories = [
  { IdCategoria: 1, Nombre: "NIKE 1.1", Descripcion: "Gorras Nike oficiales, edición limitada y premium", Estado: true },
  { IdCategoria: 2, Nombre: "A/N 1.1", Descripcion: "Colección A/N - Diseños exclusivos y modernos", Estado: true },
  { IdCategoria: 3, Nombre: "BEISBOLERA PREMIUM", Descripcion: "Gorras beisboleras de alta calidad, materiales premium", Estado: true },
  { IdCategoria: 4, Nombre: "DIAMANTE IMPORTADA", Descripcion: "Gorras importadas con acabado diamante, estilo urbano", Estado: true },
  { IdCategoria: 5, Nombre: "EQUINAS-AGROPECUARIAS", Descripcion: "Gorras para uso agropecuario y campo, resistentes y funcionales", Estado: true },
  { IdCategoria: 6, Nombre: "EXCLUSIVA 1.1", Descripcion: "Línea exclusiva, ediciones limitadas y diseños únicos", Estado: true },
  { IdCategoria: 7, Nombre: "MONASTERY 1.1", Descripcion: "Colección Monastery, estilos minimalistas y urbanos", Estado: true },
  { IdCategoria: 8, Nombre: "MULTIMARCA", Descripcion: "Gorras de múltiples marcas, variedad amplia y precios accesibles", Estado: true },
  { IdCategoria: 9, Nombre: "PLANA CERRADA 1.1", Descripcion: "Gorras planas con visera cerrada, ideal para streetwear", Estado: true },
  { IdCategoria: 10, Nombre: "PLANA IMPORTADA", Descripcion: "Gorras planas importadas, diseños internacionales y tendencia global", Estado: true },
  { IdCategoria: 11, Nombre: "PORTAGORRAS", Descripcion: "Accesorios y organizadores para almacenar gorras", Estado: true },
  { IdCategoria: 12, Nombre: "PREMIUM", Descripcion: "Gorras premium, bordados 3D, materiales de lujo y ajuste perfecto", Estado: true },
  { IdCategoria: 13, Nombre: "CAMISETAS", Descripcion: "Camisetas complementarias a la colección de gorras, diseño coordinado", Estado: true },
  { IdCategoria: 14, Nombre: "RELOJES", Descripcion: "Relojes deportivos y de moda", Estado: true }
];

// =================================================================
// FUNCIONES DE VALIDACIÓN DE LOGIN (CORREGIDAS - AHORA SÍ FUNCIONA)
// =================================================================
export const validateUserCredentials = (email, password) => {
  const cleanEmail = email.toLowerCase().trim();
  const cleanPassword = password.trim();
  
  console.log("🔍 Validando credenciales:", { cleanEmail, cleanPassword });
  console.log("📋 Usuarios disponibles:", initialUsers.map(u => ({ 
    email: u.Correo, 
    pass: u.Clave,
    estado: u.Estado 
  })));
  
  // Verificar usuarios de initialUsers
  const user = initialUsers.find(u => {
    const userEmail = u.Correo ? u.Correo.toLowerCase().trim() : '';
    const userPassword = u.Clave ? u.Clave.trim() : '';
    const match = userEmail === cleanEmail && u.Estado === true && userPassword === cleanPassword;
    if (match) console.log("✅ Usuario encontrado:", u.Nombre);
    return match;
  });
  
  if (user) {
    return {
      ...user,
      Correo: user.Correo.trim(),
      Nombre: user.Nombre.trim(),
      Clave: user.Clave.trim(),
      Permisos: user.Permisos || []
    };
  }
  
  console.log("❌ Usuario no encontrado en initialUsers");
  
  // Verificar usuarios registrados en localStorage
  try {
    const storedUsers = JSON.parse(localStorage.getItem('users') || '[]');
    const storedUser = storedUsers.find(u => {
      const userEmail = u.Correo ? u.Correo.toLowerCase().trim() : '';
      const userPassword = u.Clave ? u.Clave.trim() : '';
      return userEmail === cleanEmail && userPassword === cleanPassword;
    });
    
    if (storedUser) {
      console.log("✅ Usuario encontrado en localStorage:", storedUser.Nombre);
      return storedUser;
    }
  } catch (error) {
    console.error("Error al leer usuarios de localStorage:", error);
  }
  
  return null;
};

export const getModulesByRole = (roleId) => {
  const role = roles.find(r => r.IdRol === roleId);
  if (!role) return [];
  return modules.filter(module => role.Permisos.includes(module.id));
};

// =================================================================
// FUNCIONES DE AYUDA Y UTILIDADES
// =================================================================
export const getStatusColor = (status) => {
  const statusClean = status ? status.toString().trim() : '';
  switch (statusClean) {
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
    .filter(sale => {
      const estado = sale.estado ? sale.estado.trim() : '';
      return estado === "Completada" && sale.isActive;
    })
    .reduce((total, sale) => total + sale.total, 0);
};

// =================================================================
// FUNCIONES DE FILTRADO AVANZADO
// =================================================================
export const getProductsByColorAndSize = (color, size) => {
  return initialProducts.filter(product => {
    if (!product.isActive) return false;
    
    const colorMatch = !color || (product.colores && product.colores.some(c => 
      c.toLowerCase().includes(color.toLowerCase())
    ));
    
    const sizeMatch = !size || (product.tallas && product.tallas.some(t => 
      t.toLowerCase().includes(size.toLowerCase())
    ));
    
    return colorMatch && sizeMatch;
  });
};

export const getFilteredProductsOnSale = (filters = {}) => {
  let filtered = getProductsOnSale();
  
  if (filters.color) {
    filtered = filtered.filter(p => p.colores && p.colores.some(c => 
      c.toLowerCase().includes(filters.color.toLowerCase())
    ));
  }
  
  if (filters.category) {
    filtered = filtered.filter(p => p.categoria && p.categoria.toLowerCase().includes(filters.category.toLowerCase()));
  }
  
  return filtered;
};

// =================================================================
// FUNCIONES DE EXPORTACIÓN
// =================================================================
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

export const resetToInitialData = () => {
  localStorage.removeItem('user');
  localStorage.removeItem('userType');
  localStorage.removeItem('customers');
  localStorage.removeItem('users');
  return {
    success: true,
    message: "Datos reiniciados correctamente"
  };
};

// =================================================================
// FUNCIONES ADICIONALES
// =================================================================
export const getModuleName = (moduleId) => {
  const moduleClean = moduleId ? moduleId.trim() : '';
  const module = modules.find(m => m.id === moduleClean);
  return module ? module.label : moduleId;
};

export const getModuleIcon = (moduleId) => {
  const moduleClean = moduleId ? moduleId.trim() : '';
  const module = modules.find(m => m.id === moduleClean);
  return module ? module.icon : BarChart3;
};

export const checkRouteAccess = (route) => {
  const user = getCurrentUser();
  if (!user) return false;
  if (user.IdRol === 1) return true;
  
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
  
  const cleanRoute = route.split('?')[0];
  const baseRoute = cleanRoute.split('/')[1] ? `/${cleanRoute.split('/')[1]}` : cleanRoute;
  const requiredPermission = routePermissionMap[baseRoute];
  
  if (!requiredPermission) return true;
  return hasPermission(requiredPermission);
};

export const getCurrentUserRoleName = () => {
  const user = getCurrentUser();
  if (!user) return 'Invitado';
  const role = roles.find(r => r.IdRol === user.IdRol);
  return role ? role.Nombre : 'Usuario';
};

export const getCurrentUserRoleDescription = () => {
  const user = getCurrentUser();
  if (!user) return '';
  const role = initialRoles.find(r => r.IdRol === user.IdRol);
  return role ? role.Descripcion : '';
};

export const canPerformAction = (action) => {
  const user = getCurrentUser();
  if (!user) return false;
  if (user.IdRol === 1) return true;
  
  const actionPermissionMap = {
    'create_product': 'productos',
    'edit_product': 'productos',
    'delete_product': 'productos',
    'view_products': 'productos',
    'create_category': 'categorias',
    'edit_category': 'categorias',
    'delete_category': 'categorias',
    'view_categories': 'categorias',
    'create_supplier': 'proveedores',
    'edit_supplier': 'proveedores',
    'delete_supplier': 'proveedores',
    'view_suppliers': 'proveedores',
    'create_order': 'compras',
    'edit_order': 'compras',
    'delete_order': 'compras',
    'view_orders': 'compras',
    'create_customer': 'clientes',
    'edit_customer': 'clientes',
    'delete_customer': 'clientes',
    'view_customers': 'clientes',
    'create_sale': 'ventas',
    'edit_sale': 'ventas',
    'delete_sale': 'ventas',
    'view_sales': 'ventas',
    'create_return': 'devoluciones',
    'edit_return': 'devoluciones',
    'delete_return': 'devoluciones',
    'view_returns': 'devoluciones',
    'create_user': 'usuarios',
    'edit_user': 'usuarios',
    'delete_user': 'usuarios',
    'view_users': 'usuarios',
    'create_role': 'roles',
    'edit_role': 'roles',
    'delete_role': 'roles',
    'view_roles': 'roles'
  };
  
  const requiredPermission = actionPermissionMap[action];
  if (!requiredPermission) return false;
  return hasPermission(requiredPermission);
};

export const getPermissionsByRole = (roleId) => {
  const role = roles.find(r => r.IdRol === roleId);
  return role ? role.Permisos : [];
};

export const getAllModules = () => {
  return modules;
};

export const isAuthenticated = () => {
  return getCurrentUser() !== null;
};

export const logout = () => {
  localStorage.removeItem('user');
  localStorage.removeItem('userType');
  return true;
};

export const loginUser = (email, password) => {
  const user = validateUserCredentials(email, password);
  if (user) {
    const userWithType = {
      ...user,
      userType: user.IdRol === 1 ? "admin" : "usuario"
    };
    
    localStorage.setItem('user', JSON.stringify(userWithType));
    const visibleModules = getModulesByRole(user.IdRol);
    
    return {
      success: true,
      user: userWithType,
      modules: visibleModules,
      message: "Login exitoso"
    };
  }
  
  return {
    success: false,
    message: "Credenciales incorrectas"
  };
};

// =================================================================
// PRODUCTOS (MANTENIDO IGUAL PERO SIN ESPACIOS)
// =================================================================
const generateProductData = (basePrice, baseStock) => {
  const discount = Math.random() > 0.5;
  const price = basePrice * (0.8 + Math.random() * 0.4);
  const stock = Math.floor(baseStock * (0.5 + Math.random() * 1.5));
  const hasDiscount = discount && Math.random() > 0.7;
  const originalPrice = hasDiscount ? price * (1.2 + Math.random() * 0.3) : price;
  const isFeatured = Math.random() > 0.8;
  const sales = Math.floor(Math.random() * 100);
  
  return {
    precio: Math.round(price / 1000) * 1000,
    originalPrice: Math.round(originalPrice / 1000) * 1000,
    stock: Math.max(1, stock),
    hasDiscount,
    isFeatured,
    isActive: true,
    tags: isFeatured ? ["DESTACADO"] : [],
    sales: sales
  };
};

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

const getSizesByCategory = (category) => {
  const categoryClean = category ? category.trim() : '';
  
  if (categoryClean.includes("RELOJES")) {
    return ["Única"];
  } else if (categoryClean.includes("CAMISETAS")) {
    return ["S", "M", "L", "XL"];
  } else {
    const adjustable = Math.random() > 0.5;
    if (adjustable) {
      return ["Ajustable"];
    } else {
      const sizes = ["6 7/8", "7", "7 1/8", "7 1/4", "7 3/8", "7 1/2", "7 5/8", "7 3/4"];
      return sizes.slice(0, 3 + Math.floor(Math.random() * 4));
    }
  }
};

const productData = [
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

export const generateProductsFromJson = () => {
  return productData.map(product => {
    const productGenData = generateProductData(120000, 25);
    const colors = extractColorsFromFileName(product.nombre || '');
    const sizes = getSizesByCategory(product.categoria);
    
    return {
      ...product,
      ...productGenData,
      tallas: sizes,
      colores: colors.length > 0 ? colors : ["Negro"],
      descripcion: product.descripcion || `Gorra ${product.categoria} - ${product.nombre}`,
      destacado: product.isFeatured || false
    };
  });
};

export const initialProducts = generateProductsFromJson();

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