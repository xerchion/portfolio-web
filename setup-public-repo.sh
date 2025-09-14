#!/bin/bash

# Script para configurar la sincronización inicial del repositorio público
# Ejecutar este script después de crear el repositorio público en GitHub

echo "🚀 Configurando sincronización con repositorio público..."

# Variables - ACTUALIZA ESTAS URLs
PRIVATE_REPO="https://github.com/xerchion/WebPortfolio2.0.git"
PUBLIC_REPO="https://github.com/xerchion/portfolio-web.git"  # ACTUALIZA con tu repo público

# Crear directorio temporal
mkdir -p temp-sync
cd temp-sync

# Clonar el repositorio privado (rama producción)
echo "📥 Clonando rama de producción..."
git clone --single-branch --branch produccion $PRIVATE_REPO private-repo

# Clonar el repositorio público (o crear si no existe)
echo "📥 Preparando repositorio público..."
git clone $PUBLIC_REPO public-repo 2>/dev/null || {
    echo "Creando nuevo repositorio público..."
    mkdir public-repo
    cd public-repo
    git init
    git remote add origin $PUBLIC_REPO
    cd ..
}

# Copiar archivos de producción
echo "📁 Copiando archivos..."
cd private-repo
cp index.html ../public-repo/
cp doc-algoritmo.html ../public-repo/
cp -r assets/ ../public-repo/

# Crear README
echo "📝 Creando README..."
cat > ../public-repo/README.md << 'EOF'
# Portfolio Web

Portfolio web profesional desarrollado con tecnologías modernas.

🌐 **Ver en vivo**: [GitHub Pages](https://xerchion.github.io/portfolio-web/)

## Tecnologías

- HTML5, CSS3, JavaScript
- Tailwind CSS
- Diseño responsivo
- Optimizado para rendimiento

---

*Este repositorio se sincroniza automáticamente desde mi repositorio privado de desarrollo.*
EOF

# Commit y push
echo "💾 Subiendo a GitHub..."
cd ../public-repo
git add .
git commit -m "🎉 Configuración inicial del portfolio web público"
git push -u origin main

echo "✅ ¡Sincronización inicial completada!"
echo "🌐 Tu portfolio estará disponible en: https://xerchion.github.io/portfolio-web/"
echo ""
echo "📋 Próximos pasos:"
echo "1. Ve a Settings > Pages en tu repositorio público"
echo "2. Selecciona 'Deploy from a branch'"
echo "3. Selecciona 'main' como fuente"
echo "4. Configura el token GH_TOKEN en tu repositorio privado"

# Limpiar
cd ../..
rm -rf temp-sync