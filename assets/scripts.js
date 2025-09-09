// Script para el menú móvil mejorado
const menuBtn = document.getElementById('menuBtn');
const mobileMenu = document.getElementById('mobileMenu');
const closeMenu = document.getElementById('closeMenu');
const mainNav = document.getElementById('mainNav');

if (menuBtn && mobileMenu) {
    menuBtn.addEventListener('click', () => {
        mobileMenu.classList.remove('hidden');
    });
}
if (closeMenu && mobileMenu) {
    closeMenu.addEventListener('click', () => {
        mobileMenu.classList.add('hidden');
    });
}
// Cerrar menú móvil al hacer clic en un enlace
if (mobileMenu) {
    mobileMenu.querySelectorAll('a').forEach(link => {
        link.addEventListener('click', () => {
            mobileMenu.classList.add('hidden');
        });
    });
}
