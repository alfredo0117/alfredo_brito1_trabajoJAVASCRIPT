// JavaScript para el formulario de presupuesto - Versión simplificada

console.log('Cargando budget.js...');

document.addEventListener('DOMContentLoaded', function() {
    console.log('DOM cargado, inicializando formulario de presupuesto');
    initBudgetForm();
});

function initBudgetForm() {
    const form = document.getElementById('budget-form');
    const productoSelect = document.getElementById('producto');
    const plazoInput = document.getElementById('plazo');
    const extrasCheckboxes = document.querySelectorAll('input[name="extras"]');
    const resetBtn = document.getElementById('reset-btn');
    const submitBtn = document.getElementById('submit-btn');

    if (!form) {
        console.error('No se encontró el formulario de presupuesto');
        return;
    }

    console.log('Formulario encontrado, configurando eventos...');

    // Event listeners para cálculo automático
    if (productoSelect) {
        productoSelect.addEventListener('change', calculateBudget);
        console.log('Event listener agregado para producto');
    }

    if (plazoInput) {
        plazoInput.addEventListener('input', calculateBudget);
        console.log('Event listener agregado para plazo');
    }

    extrasCheckboxes.forEach(checkbox => {
        checkbox.addEventListener('change', calculateBudget);
        console.log('Event listener agregado para extra:', checkbox.value);
    });

    // Event listener para resetear
    if (resetBtn) {
        resetBtn.addEventListener('click', resetForm);
    }

    // Event listener para envío del formulario
    if (form) {
        form.addEventListener('submit', handleFormSubmit);
    }

    // Validación en tiempo real
    const requiredInputs = form.querySelectorAll('input[required], select[required]');
    requiredInputs.forEach(input => {
        input.addEventListener('blur', () => validateField(input));
        input.addEventListener('input', () => clearError(input));
    });

    console.log('Eventos configurados correctamente');
    
    // Calcular presupuesto inicial
    calculateBudget();
}

function calculateBudget() {
    console.log('Calculando presupuesto...');
    
    const productoSelect = document.getElementById('producto');
    const plazoInput = document.getElementById('plazo');
    const extrasCheckboxes = document.querySelectorAll('input[name="extras"]:checked');
    
    // Elementos de visualización
    const basePriceEl = document.getElementById('base-price');
    const extrasPriceEl = document.getElementById('extras-price');
    const discountEl = document.getElementById('discount-amount');
    const totalPriceEl = document.getElementById('total-price');

    // Precio base
    let basePrice = 0;
    if (productoSelect && productoSelect.value) {
        const selectedOption = productoSelect.options[productoSelect.selectedIndex];
        if (selectedOption && selectedOption.dataset.price) {
            basePrice = parseFloat(selectedOption.dataset.price) || 0;
            console.log('Precio base seleccionado:', basePrice);
        }
    }

    // Precio de extras
    let extrasPrice = 0;
    extrasCheckboxes.forEach(checkbox => {
        if (checkbox.dataset.price) {
            const extraPrice = parseFloat(checkbox.dataset.price) || 0;
            extrasPrice += extraPrice;
            console.log('Extra seleccionado:', checkbox.value, 'Precio:', extraPrice);
        }
    });

    // Cálculo del descuento
    let discountAmount = 0;
    const plazo = parseInt(plazoInput?.value) || 0;
    if (plazo > 0) {
        const discountPercent = Math.min((plazo / 365) * 20, 20);
        const subtotal = basePrice + extrasPrice;
        discountAmount = (subtotal * discountPercent) / 100;
        console.log('Descuento calculado:', discountPercent + '%', '=', discountAmount);
    }

    const totalPrice = basePrice + extrasPrice - discountAmount;

    // Actualizar visualización
    if (basePriceEl) {
        basePriceEl.textContent = `€${basePrice.toFixed(2)}`;
        console.log('Precio base actualizado en UI:', basePriceEl.textContent);
    }
    if (extrasPriceEl) {
        extrasPriceEl.textContent = `€${extrasPrice.toFixed(2)}`;
        console.log('Precio extras actualizado en UI:', extrasPriceEl.textContent);
    }
    if (discountEl) {
        discountEl.textContent = `-€${discountAmount.toFixed(2)}`;
        console.log('Descuento actualizado en UI:', discountEl.textContent);
    }
    if (totalPriceEl) {
        totalPriceEl.textContent = `€${totalPrice.toFixed(2)}`;
        console.log('Total actualizado en UI:', totalPriceEl.textContent);
    }

    console.log('Presupuesto calculado:', { basePrice, extrasPrice, discountAmount, totalPrice });
}

function validateField(field) {
    if (!field) return true;

    const fieldGroup = field.closest('.form-group');
    const errorElement = document.getElementById(field.name + '-error');
    
    // Limpiar estados previos
    clearError(field);
    
    let isValid = true;
    let errorMessage = '';

    // Validar campo requerido
    if (field.hasAttribute('required') && !field.value.trim()) {
        isValid = false;
        errorMessage = 'Este campo es obligatorio';
    } else if (field.value.trim()) {
        // Validaciones específicas
        switch (field.name) {
            case 'nombre':
                if (!/^[a-zA-ZáéíóúüñÁÉÍÓÚÜÑ\s]{1,15}$/.test(field.value)) {
                    isValid = false;
                    errorMessage = 'Solo letras, máximo 15 caracteres';
                }
                break;
                
            case 'apellidos':
                if (!/^[a-zA-ZáéíóúüñÁÉÍÓÚÜÑ\s]{1,40}$/.test(field.value)) {
                    isValid = false;
                    errorMessage = 'Solo letras, máximo 40 caracteres';
                }
                break;
                
            case 'telefono':
                if (!/^\d{1,9}$/.test(field.value)) {
                    isValid = false;
                    errorMessage = 'Solo números, máximo 9 dígitos';
                }
                break;
                
            case 'email':
                if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(field.value)) {
                    isValid = false;
                    errorMessage = 'Formato de email inválido';
                }
                break;
                
            case 'plazo':
                const plazo = parseInt(field.value);
                if (plazo < 1 || plazo > 365) {
                    isValid = false;
                    errorMessage = 'Plazo debe estar entre 1 y 365 días';
                }
                break;
        }
    }

    // Mostrar error si hay
    if (!isValid) {
        field.classList.add('error');
        if (errorElement) {
            errorElement.textContent = errorMessage;
        }
    } else if (field.value.trim()) {
        if (fieldGroup) {
            fieldGroup.classList.add('valid');
        }
    }

    return isValid;
}

function clearError(field) {
    if (!field) return;
    
    field.classList.remove('error');
    const fieldGroup = field.closest('.form-group');
    if (fieldGroup) {
        fieldGroup.classList.remove('valid');
    }
    
    const errorElement = document.getElementById(field.name + '-error');
    if (errorElement) {
        errorElement.textContent = '';
    }
}

function validateForm() {
    const form = document.getElementById('budget-form');
    const requiredFields = form.querySelectorAll('input[required], select[required]');
    const conditionsCheckbox = document.getElementById('conditions');
    
    let isFormValid = true;

    // Validar campos requeridos
    requiredFields.forEach(field => {
        if (!validateField(field)) {
            isFormValid = false;
        }
    });

    // Validar condiciones
    if (!conditionsCheckbox || !conditionsCheckbox.checked) {
        isFormValid = false;
        alert('Debes aceptar las condiciones de privacidad para continuar.');
    }

    return isFormValid;
}

function handleFormSubmit(event) {
    event.preventDefault();
    console.log('Enviando formulario...');

    if (!validateForm()) {
        console.log('Formulario no válido');
        return;
    }

    const formData = new FormData(event.target);
    const budgetData = {
        contacto: {
            nombre: formData.get('nombre'),
            apellidos: formData.get('apellidos'),
            telefono: formData.get('telefono'),
            email: formData.get('email')
        },
        presupuesto: {
            producto: formData.get('producto'),
            plazo: formData.get('plazo'),
            extras: formData.getAll('extras'),
            total: document.getElementById('total-price')?.textContent || '€0.00'
        },
        fecha: new Date().toISOString()
    };

    console.log('Datos del presupuesto:', budgetData);
    submitBudget(budgetData);
}

async function submitBudget(budgetData) {
    const submitBtn = document.getElementById('submit-btn');
    
    try {
        // Mostrar loading
        if (submitBtn) {
            submitBtn.disabled = true;
            submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Enviando...';
        }

        // Simular envío
        await new Promise(resolve => setTimeout(resolve, 2000));

        console.log('Presupuesto enviado exitosamente');
        showSuccessModal(budgetData);

    } catch (error) {
        console.error('Error enviando presupuesto:', error);
        alert('Error al enviar el presupuesto. Por favor, inténtalo de nuevo.');
    } finally {
        // Restaurar botón
        if (submitBtn) {
            submitBtn.disabled = false;
            submitBtn.innerHTML = '<i class="fas fa-paper-plane"></i> Enviar Presupuesto';
        }
    }
}

function showSuccessModal(budgetData) {
    const modal = document.getElementById('success-modal');
    const budgetDetails = document.getElementById('budget-details');
    
    if (!modal || !budgetDetails) {
        console.error('Modal o detalles no encontrados');
        return;
    }

    // Obtener nombre del producto
    const productoSelect = document.getElementById('producto');
    let productName = 'No seleccionado';
    if (productoSelect && productoSelect.value) {
        const selectedOption = productoSelect.options[productoSelect.selectedIndex];
        productName = selectedOption ? selectedOption.textContent : 'No seleccionado';
    }

    const extras = budgetData.presupuesto.extras.length > 0 
        ? budgetData.presupuesto.extras.join(', ') 
        : 'Ninguno';

    budgetDetails.innerHTML = `
        <h4>Resumen de tu Solicitud:</h4>
        <p><strong>Cliente:</strong> ${budgetData.contacto.nombre} ${budgetData.contacto.apellidos}</p>
        <p><strong>Email:</strong> ${budgetData.contacto.email}</p>
        <p><strong>Teléfono:</strong> ${budgetData.contacto.telefono}</p>
        <p><strong>Producto:</strong> ${productName}</p>
        <p><strong>Plazo:</strong> ${budgetData.presupuesto.plazo} días</p>
        <p><strong>Extras:</strong> ${extras}</p>
        <p><strong>Total:</strong> ${budgetData.presupuesto.total}</p>
    `;

    modal.classList.add('show');
    document.body.style.overflow = 'hidden';
}

function closeSuccessModal() {
    const modal = document.getElementById('success-modal');
    
    if (modal) {
        modal.classList.remove('show');
        document.body.style.overflow = 'auto';
        
        // Resetear formulario después de cerrar
        setTimeout(resetForm, 300);
    }
}

function resetForm() {
    if (!confirm('¿Estás seguro de que quieres resetear el formulario?')) {
        return;
    }

    const form = document.getElementById('budget-form');
    if (!form) return;

    // Resetear campos
    form.reset();

    // Limpiar estados de validación
    const fields = form.querySelectorAll('input, select');
    fields.forEach(field => {
        clearError(field);
    });

    // Resetear precios
    const basePriceEl = document.getElementById('base-price');
    const extrasPriceEl = document.getElementById('extras-price');
    const discountEl = document.getElementById('discount-amount');
    const totalPriceEl = document.getElementById('total-price');

    if (basePriceEl) basePriceEl.textContent = '€0.00';
    if (extrasPriceEl) extrasPriceEl.textContent = '€0.00';
    if (discountEl) discountEl.textContent = '€0.00';
    if (totalPriceEl) totalPriceEl.textContent = '€0.00';

    console.log('Formulario reseteado');
}

// Event listeners para el modal
document.addEventListener('DOMContentLoaded', function() {
    const modal = document.getElementById('success-modal');
    
    // Cerrar modal al hacer clic fuera
    if (modal) {
        window.addEventListener('click', function(event) {
            if (event.target === modal) {
                closeSuccessModal();
            }
        });
    }
});

// Hacer función global para el onclick del HTML
window.closeSuccessModal = closeSuccessModal;

console.log('Budget.js cargado completamente');