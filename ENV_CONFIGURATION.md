# Configuración de Variables de Entorno

## Descripción

Todas las configuraciones de API y entorno están centralizadas en variables de entorno para facilitar el deployment en diferentes ambientes (desarrollo, staging, producción).

## Archivos de Configuración

### `.env.example`
Plantilla con todas las variables disponibles. **Nunca comitear secretos aquí.**

### `.env.local`
Configuración local para desarrollo. **Agregado a .gitignore, no se comitea.**

### `.env.production`
Configuración para producción. Se configura en el servidor de deployment.

## Variables Disponibles

### API Configuration

```env
# URL base del backend
VITE_API_BASE_URL=http://localhost:8080/core/v1

# Timeout en milisegundos
VITE_API_TIMEOUT=10000
```

### App Configuration

```env
# Nombre de la aplicación
VITE_APP_NAME=Banquito Intranet

# Ambiente (development, staging, production)
VITE_ENVIRONMENT=development

# Debug mode (muestra logs en consola)
VITE_DEBUG_MODE=false

# Habilitar analytics
VITE_ENABLE_ANALYTICS=false
```

## Configuración por Ambiente

### Desarrollo

```env
VITE_API_BASE_URL=http://localhost:8080/core/v1
VITE_API_TIMEOUT=10000
VITE_ENVIRONMENT=development
VITE_DEBUG_MODE=true
```

### Staging

```env
VITE_API_BASE_URL=https://staging-api.banquito.com/core/v1
VITE_API_TIMEOUT=15000
VITE_ENVIRONMENT=staging
VITE_DEBUG_MODE=false
```

### Producción

```env
VITE_API_BASE_URL=https://api.banquito.com/core/v1
VITE_API_TIMEOUT=15000
VITE_ENVIRONMENT=production
VITE_DEBUG_MODE=false
VITE_ENABLE_ANALYTICS=true
```

## Cómo Usar

### 1. Lectura de Variables en Código

```javascript
import ENV from '@/config/environment';

// Acceder a variables
const apiUrl = ENV.API_BASE_URL;
const timeout = ENV.API_TIMEOUT;
const isDevelopment = ENV.ENVIRONMENT === 'development';
```

### 2. Endpoints Centralizados

```javascript
import { ENDPOINTS } from '@/config/environment';

// Usar endpoints organizados por módulo
axiosInstance.post(ENDPOINTS.AUTH.LOGIN_STAFF, payload);
axiosInstance.get(ENDPOINTS.CUSTOMERS.SEARCH(type, id));
axiosInstance.post(ENDPOINTS.TRANSACTIONS.TRANSFER, data);
```

### 3. Archivos de API

Todos los archivos en `src/api/` importan automáticamente `ENDPOINTS`:

```javascript
import axiosInstance from './axiosInstance';
import { ENDPOINTS } from '../config/environment';

export const loginStaff = (username) =>
  axiosInstance.post(ENDPOINTS.AUTH.LOGIN_STAFF, {
    username,
    password: ''
  });
```

## Deployment

### Docker

```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY . .
RUN npm install
RUN npm run build
ENV VITE_API_BASE_URL=https://api.banquito.com/core/v1
ENV VITE_ENVIRONMENT=production
EXPOSE 3000
CMD ["npm", "run", "preview"]
```

### Vercel / Netlify

1. Ir a Settings → Environment Variables
2. Agregar variables:
   - `VITE_API_BASE_URL`
   - `VITE_ENVIRONMENT`
   - Otras según necesidad

3. Desplegar

### GitHub Actions

```yaml
name: Deploy to Production
on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      
      - run: npm install
      
      - run: npm run build
        env:
          VITE_API_BASE_URL: ${{ secrets.PROD_API_URL }}
          VITE_ENVIRONMENT: production
      
      - run: npm run deploy
```

## Ventajas de Esta Configuración

✅ **Centralizado**: Todos los endpoints en un solo archivo  
✅ **Seguro**: Variables sensibles no en el código  
✅ **Flexible**: Fácil cambiar entre ambientes  
✅ **Mantenible**: Cambios en un solo lugar afectan toda la app  
✅ **Production-ready**: Sigue mejores prácticas  

## Agregar Nuevas Variables

1. Agregar a `.env.example`
2. Agregar a `src/config/environment.js`
3. Usar en el código mediante `import ENV from '@/config/environment'`

Ejemplo:

```javascript
// .env.example
VITE_API_TIMEOUT=10000
VITE_NEW_FEATURE_ENABLED=false

// src/config/environment.js
export default {
  // ... existing
  NEW_FEATURE_ENABLED: import.meta.env.VITE_NEW_FEATURE_ENABLED === 'true',
}
```

## Troubleshooting

### Variables no se cargan

Asegurar que:
1. El nombre comienza con `VITE_`
2. Están en `.env.local` o `.env.production`
3. El servidor fue reiniciado después de cambiar variables

### Producción muestra valores de desarrollo

Verificar que `.env.production` tiene los valores correctos y que Vite está usando la build de producción.
