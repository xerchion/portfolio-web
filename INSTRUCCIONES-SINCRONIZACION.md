# Configuración de Sincronización Automática

## 📋 Pasos para Configurar

### 1. Crear Repositorio Público

1. Ve a [GitHub](https://github.com/new)
2. Crea un nuevo repositorio:
   - **Nombre**: `portfolio-web` (o el que prefieras)
   - **Visibilidad**: ✅ Público
   - **Descripción**: "Portfolio web público para GitHub Pages"
   - ❌ No marcar "Add a README file"
   - ❌ No añadir .gitignore o license

### 2. Crear Personal Access Token

**Opción A: Ruta Nueva (Recomendada)**
1. Ve a tu **perfil de GitHub** (click en tu avatar arriba a la derecha)
2. **Settings** → **Developer settings** → **Personal access tokens** → **Fine-grained tokens**
3. Click en **"Generate new token"**
4. Configuración del token:
   - **Token name**: "Sync to public portfolio repo"
   - **Expiration**: 1 year (o el que prefieras)
   - **Repository access**: "Selected repositories" → Selecciona tu repositorio público
   - **Permissions**:
     - Repository permissions → **Contents**: Read and write
     - Repository permissions → **Metadata**: Read
5. Click **"Generate token"**
6. **Copiar el token generado** (no podrás verlo después)

**Opción B: Ruta Clásica (Si no encuentras la anterior)**
1. Ve a tu **perfil de GitHub** → **Settings**
2. Scroll hacia abajo en el menú izquierdo hasta **"Developer settings"** (al final)
3. **Personal access tokens** → **Tokens (classic)**
4. Click en **"Generate new token (classic)"**
5. Configuración del token:
   - **Note**: "Sync to public portfolio repo"
   - **Expiration**: 1 year
   - **Scopes**: ✅ Marcar `repo` (acceso completo a repositorios)
6. **Copiar el token generado**

**Si aún no encuentras "Developer settings":**
- Ve directamente a: https://github.com/settings/tokens

### 3. Configurar Secret en Repositorio Privado

1. Ve a tu **repositorio privado** → **Settings** → **Secrets and variables** → **Actions**
2. Click en **"New repository secret"**
3. Configurar:
   - **Name**: `GH_TOKEN`
   - **Secret**: Pegar el token que copiaste
4. Click **"Add secret"**

### 4. Actualizar URLs en el Workflow

**¿Qué necesitas hacer?**
Cambiar el nombre del repositorio público en el código de automatización para que coincida con el que creaste.

**Pasos detallados:**

1. **Abre el archivo**: `.github/workflows/sync-to-public.yml` en VS Code
2. **Busca la línea 26** que dice:
   ```yaml
   git clone https://${{ secrets.GH_TOKEN }}@github.com/xerchion/portfolio-web.git public-repo
   ```
3. **Cambia `portfolio-web`** por el nombre de TU repositorio público
4. **Ejemplo**: Si creaste un repo llamado `mi-portfolio`, cambiarías por:
   ```yaml
   git clone https://${{ secrets.GH_TOKEN }}@github.com/xerchion/mi-portfolio.git public-repo
   ```

**También actualiza las líneas de los comentarios:**
- Línea 35 en README.md
- Línea 41 en echo (si las tienes)

**📝 Ejemplo completo:**
Si tu repositorio público se llama `sergio-portfolio`, la línea quedaría:
```yaml
git clone https://${{ secrets.GH_TOKEN }}@github.com/xerchion/sergio-portfolio.git public-repo
```

### 5. Configurar GitHub Pages

1. Ve a tu **repositorio público** → **Settings** → **Pages**
2. En **"Source"** selecciona: **"Deploy from a branch"**
3. En **"Branch"** selecciona: **`main`**
4. Click **"Save"**

## 🔄 Cómo Funciona

### Sincronización Automática
- **Trigger**: Cada vez que hagas push a la rama `produccion`
- **Acción**: GitHub Actions copiará automáticamente los archivos esenciales al repo público
- **Resultado**: Tu web se actualiza automáticamente en GitHub Pages

### Sincronización Manual
También puedes ejecutar manualmente:
1. Ve a **Actions** en tu repo privado
2. Selecciona **"Sync Production to Public Repository"**
3. Click **"Run workflow"**

## 📁 Estructura Final

### Repositorio Privado (`WebPortfolio2.0`)
```
├── main (rama completa)
│   ├── index.html
│   ├── doc-algoritmo.html
│   ├── assets/
│   ├── documentación.md
│   ├── notas-desarrollo.txt
│   └── .github/workflows/
├── produccion (solo web)
│   ├── index.html
│   ├── doc-algoritmo.html
│   └── assets/
```

### Repositorio Público (`portfolio-web`)
```
├── index.html
├── doc-algoritmo.html
├── assets/
└── README.md
```

## 🌐 URLs Finales

- **Desarrollo**: Repo privado en GitHub
- **Web publicada**: `https://xerchion.github.io/portfolio-web/`

## 🔧 Solución de Problemas

### Error: "remote: Repository not found"
- Verificar que el nombre del repositorio público coincida en el workflow
- Verificar que el token tenga permisos de `repo`

### Error: "Permission denied"
- Verificar que el secret `GH_TOKEN` esté configurado correctamente
- Regenerar el token si es necesario

### La web no se actualiza
- Verificar que GitHub Pages esté habilitado
- Verificar que la fuente sea la rama `main`
- Puede tardar unos minutos en actualizarse

---

¡Una vez configurado, tu workflow estará listo! 🚀