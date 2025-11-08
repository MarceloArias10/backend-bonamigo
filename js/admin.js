// JavaScript común para el panel administrativo

// Función helper para API requests
const apiFetch = window.apiRequest || fetch;

// Verificar autenticación en todas las páginas
document.addEventListener('DOMContentLoaded', () => {
  // Solo verificar si NO estamos en la página de login
  if (!window.location.pathname.includes('login.html')) {
    apiFetch('/api/session')
      .then(res => res.json())
      .then(data => {
        if (!data.authenticated) {
          // Forzar logout y redirigir a login
          apiFetch('/api/logout', { method: 'POST' }).finally(() => {
            window.location.href = 'login.html';
          });
        } else if (data.authenticated) {
          const userName = document.getElementById('user-name');
          if (userName) {
            userName.textContent = data.usuario;
          }
          const sidebarUserName = document.getElementById('sidebar-user-name');
          if (sidebarUserName) {
            sidebarUserName.textContent = data.usuario;
          }
        }
      })
      .catch(() => {
        // Si hay error, redirigir a login
        window.location.href = 'login.html';
      });
  }
});
  
  // Configurar logout
  const logoutBtn = document.getElementById('logout-btn');
  if (logoutBtn) {
    logoutBtn.addEventListener('click', async () => {
      await apiFetch('/api/logout', { method: 'POST' });
      window.location.href = 'login.html';
    });
  }
  
  // Marcar página activa en el menú
  const currentPage = window.location.pathname.split('/').pop() || 'dashboard.html';
  const navItems = document.querySelectorAll('.nav-item');
  navItems.forEach(item => {
    const href = item.getAttribute('href');
    if (href && href.includes(currentPage)) {
      item.classList.add('active');
    } else {
      item.classList.remove('active');
    }
  });
});


