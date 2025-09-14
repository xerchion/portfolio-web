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

1. Ve a **GitHub Settings** → **Developer settings** → **Personal access tokens** → **Tokens (classic)**
2. Click en **"Generate new token (classic)"**
3. Configuración del token:
   - **Note**: "Sync to public portfolio repo"
   - **Expiration**: 1 year (o el que prefieras)
   - **Scopes**: ✅ Marcar `repo` (acceso completo a repositorios)
4. **Copiar el token generado** (no lo perderás después)

### 3. Configurar Secret en Repositorio Privado

1. Ve a tu **repositorio privado** → **Settings** → **Secrets and variables** → **Actions**
2. Click en **"New repository secret"**
3. Configurar:
   - **Name**: `GH_TOKEN`
   - **Secret**: Pegar el token que copiaste
4. Click **"Add secret"**

### 4. Actualizar URLs en el Workflow

Edita el archivo `.github/workflows/sync-to-public.yml` y cambia:

```yaml
git clone https://${{ secrets.GH_TOKEN }}@github.com/xerchion/portfolio-web.git public-repo
```

Por la URL de TU repositorio público.

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