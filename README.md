# Banquito Intranet - Frontend Core

Sistema de gestión interna para operaciones bancarias. Frontend desarrollado con React, Vite y Tailwind CSS.

## Descripción General

Aplicación web moderna para gestión de clientes, cuentas, transacciones y operaciones internas de Banquito. Incluye autenticación segura, gestión de roles y control de acceso basado en permisos.

---

## Tabla de Contenidos

- [Requisitos](#requisitos)
- [Instalación](#instalación)
- [Configuración](#configuración)
- [Ejecución](#ejecución)
- [Estructura del Proyecto](#estructura-del-proyecto)
- [Módulos Principales](#módulos-principales)
- [Seguridad](#seguridad)
- [Despliegue a Producción](#despliegue-a-producción)
- [Credenciales de Prueba](#credenciales-de-prueba)
- [Solución de Problemas](#solución-de-problemas)

---

## Requisitos

- Node.js 16.x o superior
- npm 8.x o superior
- Backend ejecutándose en `http://localhost:8080`

## Instalación

```bash
# Clonar el repositorio
git clone https://github.com/aeherrera16/grupo1_frontend_core.git
cd grupo1_frontend_core

# Instalar dependencias
npm install
```

## Configuración

### Variables de Entorno

El proyecto usa un sistema de configuración basado en variables de entorno. El archivo `.env.local` se carga automáticamente en desarrollo.

#### Desarrollo (.env.local)

```ini
VITE_API_TIMEOUT=10000
VITE_APP_NAME=Banquito Intranet
VITE_ENVIRONMENT=development
VITE_DEBUG_MODE=true
VITE_ENABLE_ANALYTICS=false
```

#### Producción (.env.production.local)

```ini
VITE_API_BASE_URL=https://api.tudominio.com/core/v1
VITE_API_TIMEOUT=10000
VITE_APP_NAME=Banquito Intranet
VITE_ENVIRONMENT=production
VITE_DEBUG_MODE=false
VITE_ENABLE_ANALYTICS=true
```

## Ejecución

### Desarrollo

```bash
npm run dev
```

La aplicación estará disponible en `http://localhost:5179`

El servidor incluye:
- Hot Module Replacement (HMR)
- Proxy automático para `/core/v1` → `http://localhost:8080`
- Recarga en tiempo real

### Producción

```bash
npm run build
npm run preview
npm run lint
```

---

## Estructura del Proyecto

```
src/
├── api/                    # Servicios de API
│   ├── axiosInstance.js
│   ├── authApi.js
│   ├── accountApi.js
│   ├── customerApi.js
│   └── transactionApi.js
│
├── components/             # Componentes reutilizables
│   ├── layout/
│   ├── ui/
│   └── ...
│
├── context/                # Estado global
│   └── AuthContext.jsx
│
├── pages/                  # Páginas de la aplicación
│   ├── LoginPage.jsx
│   ├── DashboardPage.jsx
│   ├── customers/
│   ├── accounts/
│   └── transactions/
│
├── hooks/                  # Hooks personalizados
├── config/                 # Configuración
├── helpers/                # Funciones utilitarias
├── router/                 # Configuración de rutas
├── services/               # Servicios especializados
│
├── App.jsx                 # Componente raíz
└── main.jsx                # Punto de entrada
```

---

## Módulos Principales

### Autenticación

Sistema de autenticación con credenciales de usuario.

**Credenciales de prueba:**
- Usuario: `admin.core`
- Contraseña: `admin`

**Flujo:**
1. Usuario ingresa credenciales en formulario
2. Frontend valida campos requeridos
3. Solicitud POST a `/core/v1/auth/core-users/login`
4. Backend valida y devuelve datos del usuario
5. Sesión almacenada en localStorage
6. Redirección a dashboard

### Gestión de Clientes

Crear, buscar y editar clientes del banco.

- Crear nuevo cliente
- Buscar por identificación
- Ver detalles
- Editar información

### Gestión de Cuentas

Control de cuentas bancarias y estados.

**Estados:**
- ACTIVA
- INACTIVA
- BLOQUEADA
- SUSPENDIDA

### Transacciones

Registro de operaciones bancarias: débitos, créditos y transferencias.

---

## Seguridad

### Prácticas Implementadas

1. **Autenticación Segura**
   - Validación cliente y servidor
   - Sesión en localStorage
   - Logout automático en 401

2. **Manejo de Errores**
   - Logging filtrado por entorno
   - No expone información sensible en producción
   - Mensajes genéricos para usuarios
   - Detalles solo en desarrollo

3. **Comunicación Segura**
   - HTTPS obligatorio en producción
   - Headers de seguridad
   - CORS configurado

4. **Almacenamiento**
   - Sesión en localStorage
   - Sin almacenamiento de credenciales
   - Limpieza al logout

### Configuración CORS Backend

```javascript
cors({
  origin: 'http://localhost:5179',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
})
```

---

## Despliegue a Producción

### 1. Preparación

```bash
cat > .env.production.local << EOF
VITE_API_BASE_URL=https://api.tudominio.com/core/v1
VITE_ENVIRONMENT=production
VITE_DEBUG_MODE=false
VITE_ENABLE_ANALYTICS=true
EOF

npm install
npm run lint
```

### 2. Build

```bash
npm run build
# Resultado en carpeta 'dist/'
```

### 3. Configuración Nginx

```nginx
server {
  listen 443 ssl http2;
  server_name api.tudominio.com;
  
  ssl_certificate /path/to/cert.pem;
  ssl_certificate_key /path/to/key.pem;
  
  root /var/www/dist;
  
  location / {
    try_files $uri /index.html;
  }
  
  location ~* ^/index\.html$ {
    add_header Cache-Control "public, max-age=0, must-revalidate";
  }
  
  location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2)$ {
    add_header Cache-Control "public, max-age=31536000, immutable";
  }
}
```

### 4. Docker

```dockerfile
FROM node:18-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

FROM nginx:alpine
COPY --from=builder /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

---

## Solución de Problemas

### CORS en desarrollo

**Síntoma:** Error de CORS

**Solución:**
1. Verificar que `npm run dev` está corriendo
2. Verificar que la URL en `environment.js` es relativa (`/core/v1`)
3. Verificar que `vite.config.js` tiene proxy configurado
4. Reiniciar: `npm run dev`

### Error 403 en login

**Síntoma:** Acceso denegado al iniciar sesión

**Solución:**
1. Verificar que backend está en `http://localhost:8080`
2. Usar credenciales correctas: `admin.core` / `admin`
3. Revisar logs del backend

### Error: "Cannot GET /"

**Síntoma:** No se carga la aplicación

**Solución:**
- Configurar servidor web para servir SPA
- Asegurar que todos los routes van a `index.html`

### Módulos no encontrados

**Síntoma:** Error "Module not found"

**Solución:**
```bash
rm -rf node_modules package-lock.json
npm install
npm run dev
```

---

## Tecnologías

- React 19.x
- Vite 5.x
- React Router 6.x
- Axios 1.x
- Tailwind CSS 3.x
- ESLint

---

## Scripts

```bash
npm run dev       # Desarrollo
npm run build     # Build para producción
npm run preview   # Previsualizar build
npm run lint      # Ejecutar linter
```

---

## Información General

- **Licencia:** Propiedad intelectual de Banquito
- **Última actualización:** 14 de mayo de 2026
- **Versión:** 1.0.0
- **Estado:** Producción
