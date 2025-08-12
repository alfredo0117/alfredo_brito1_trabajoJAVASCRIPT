// JavaScript para la galería dinámica

document.addEventListener('DOMContentLoaded', function() {
    initializeGallery();
    initializeModals();
});

function initializeGallery() {
    const filterButtons = document.querySelectorAll('.filter-btn');
    const galleryItems = document.querySelectorAll('.gallery-item');
    
    // Event listeners para los filtros
    filterButtons.forEach(button => {
        button.addEventListener('click', function() {
            const filter = this.getAttribute('data-filter');
            
            // Actualizar botón activo
            filterButtons.forEach(btn => btn.classList.remove('active'));
            this.classList.add('active');
            
            // Filtrar elementos
            filterGalleryItems(filter, galleryItems);
        });
    });
    
    // Animación inicial
    animateGalleryItems(galleryItems);
}

function filterGalleryItems(filter, items) {
    items.forEach((item, index) => {
        const category = item.getAttribute('data-category');
        
        if (filter === 'all' || category === filter) {
            // Mostrar elemento con delay
            setTimeout(() => {
                item.classList.remove('hidden');
                item.style.animationDelay = `${index * 0.1}s`;
            }, index * 50);
        } else {
            // Ocultar elemento
            item.classList.add('hidden');
        }
    });
}

function animateGalleryItems(items) {
    const observer = new IntersectionObserver(function(entries) {
        entries.forEach((entry, index) => {
            if (entry.isIntersecting) {
                setTimeout(() => {
                    entry.target.style.opacity = '1';
                    entry.target.style.transform = 'translateY(0)';
                }, index * 100);
            }
        });
    }, { threshold: 0.1 });
    
    items.forEach(item => {
        item.style.opacity = '0';
        item.style.transform = 'translateY(30px)';
        item.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
        observer.observe(item);
    });
}

function initializeModals() {
    // Cerrar modal al hacer click fuera
    window.addEventListener('click', function(event) {
        if (event.target.classList.contains('modal')) {
            event.target.classList.remove('show');
            document.body.style.overflow = 'auto';
        }
    });
    
    // Cerrar modal con ESC
    document.addEventListener('keydown', function(event) {
        if (event.key === 'Escape') {
            const openModal = document.querySelector('.modal.show');
            if (openModal) {
                openModal.classList.remove('show');
                document.body.style.overflow = 'auto';
            }
        }
    });
}

function openModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.classList.add('show');
        document.body.style.overflow = 'hidden';
        
        // Animación de entrada
        const modalContent = modal.querySelector('.modal-content');
        modalContent.style.transform = 'translateY(-50px)';
        modalContent.style.opacity = '0';
        
        setTimeout(() => {
            modalContent.style.transform = 'translateY(0)';
            modalContent.style.opacity = '1';
        }, 10);
    }
}

function closeModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        const modalContent = modal.querySelector('.modal-content');
        
        // Animación de salida
        modalContent.style.transform = 'translateY(-50px)';
        modalContent.style.opacity = '0';
        
        setTimeout(() => {
            modal.classList.remove('show');
            document.body.style.overflow = 'auto';
        }, 300);
    }
}

// Función para cargar más proyectos dinámicamente (para uso futuro)
function loadMoreProjects() {
    const galleryGrid = document.getElementById('gallery-grid');
    
    // Simulación de nuevos proyectos
    const newProjects = [
        {
            category: 'web',
            title: 'Plataforma E-learning',
            description: 'Sistema de gestión de aprendizaje online',
            icon: 'fa-graduation-cap'
        },
        {
            category: 'mobile',
            title: 'App de Fitness',
            description: 'Aplicación para seguimiento de ejercicios',
            icon: 'fa-dumbbell'
        }
    ];
    
    newProjects.forEach((project, index) => {
        const projectHTML = createProjectHTML(project, index);
        galleryGrid.insertAdjacentHTML('beforeend', projectHTML);
    });
    
    // Re-inicializar animaciones para nuevos elementos
    const newItems = galleryGrid.querySelectorAll('.gallery-item:not(.animated)');
    animateGalleryItems(newItems);
    newItems.forEach(item => item.classList.add('animated'));
}

function createProjectHTML(project, index) {
    const modalId = `modal${Date.now()}-${index}`;
    
    return `
        <div class="gallery-item" data-category="${project.category}">
            <div class="gallery-image">
                <div class="project-placeholder ${project.category}-project">
                    <i class="fas ${project.icon}"></i>
                </div>
                <div class="gallery-overlay">
                    <div class="gallery-content">
                        <h3>${project.title}</h3>
                        <p>${project.description}</p>
                        <button class="view-btn" onclick="openModal('${modalId}')">
                            <i class="fas fa-eye"></i> Ver Detalles
                        </button>
                    </div>
                </div>
            </div>
        </div>
    `;
}

// Función de búsqueda en la galería (para uso futuro)
function searchGallery(query) {
    const galleryItems = document.querySelectorAll('.gallery-item');
    
    galleryItems.forEach(item => {
        const title = item.querySelector('h3').textContent.toLowerCase();
        const description = item.querySelector('p').textContent.toLowerCase();
        
        if (title.includes(query.toLowerCase()) || description.includes(query.toLowerCase())) {
            item.style.display = 'block';
        } else {
            item.style.display = 'none';
        }
    });
}

// Función para compartir proyecto
function shareProject(projectTitle, projectUrl) {
    if (navigator.share) {
        navigator.share({
            title: projectTitle,
            text: `Mira este increíble proyecto: ${projectTitle}`,
            url: projectUrl
        }).then(() => {
            console.log('Proyecto compartido exitosamente');
        }).catch((error) => {
            console.log('Error al compartir:', error);
        });
    } else {
        // Fallback para navegadores que no soportan Web Share API
        const shareUrl = `mailto:?subject=${encodeURIComponent(projectTitle)}&body=${encodeURIComponent(`Mira este increíble proyecto: ${projectTitle} - ${projectUrl}`)}`;
        window.open(shareUrl);
    }
}

console.log('Gallery.js cargado correctamente');
