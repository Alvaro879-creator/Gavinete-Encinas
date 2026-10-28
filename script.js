// Configuración de tramos de tarde de 30 minutos (16:00 a 20:30)
const afternoonSlots = [
  "16:00 - 16:30",
  "16:30 - 17:00",
  "17:00 - 17:30",
  "17:30 - 18:00",
  "18:00 - 18:30",
  "18:30 - 19:00",
  "19:00 - 19:30",
  "19:30 - 20:00",
  "20:00 - 20:30"
];

// Estado global de la aplicación
let selectedSlot = null;
let appointments = JSON.parse(localStorage.getItem('barber_appointments')) || [];

// Inicialización de la aplicación
document.addEventListener('DOMContentLoaded', () => {
  const dateInput = document.getElementById('bookingDate');
  
  // Establecer fecha por defecto a HOY y limitar fechas pasadas
  const today = new Date().toISOString().split('T')[0];
  dateInput.value = today;
  dateInput.min = today;

  // Renderizar horas al cargar y al cambiar fecha
  renderSlots();
  dateInput.addEventListener('change', renderSlots);

  // Escuchar evento de envío de formulario
  document.getElementById('bookingForm').addEventListener('submit', handleBookingSubmit);
  
  // Escuchar filtro de citas por fecha
  document.getElementById('filterDate').addEventListener('change', renderAppointmentsList);
});

// Cambiar entre pestañas
function switchTab(tabName) {
  document.querySelectorAll('.tab-content').forEach(tab => tab.classList.remove('active'));
  document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));

  if (tabName === 'booking') {
    document.getElementById('bookingTab').classList.add('active');
    event.currentTarget.classList.add('active');
  } else if (tabName === 'appointments') {
    document.getElementById('appointmentsTab').classList.add('active');
    event.currentTarget.classList.add('active');
    renderAppointmentsList();
  }
}

// Generar botones de tramos horarios según el día seleccionado
function renderSlots() {
  const selectedDate = document.getElementById('bookingDate').value;
  const slotsContainer = document.getElementById('slotsContainer');
  slotsContainer.innerHTML = '';
  selectedSlot = null;
  document.getElementById('slotError').style.display = 'none';

  if (!selectedDate) return;

  // Filtrar citas correspondientes a la fecha elegida
  const bookedSlotsForDate = appointments
    .filter(app => app.date === selectedDate)
    .map(app => app.slot);

  afternoonSlots.forEach(slot => {
    const isBooked = bookedSlotsForDate.includes(slot);
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = `slot-btn ${isBooked ? 'disabled' : ''}`;
    
    btn.innerHTML = `
      ${slot}
      <span class="slot-status">${isBooked ? 'Ocupado' : 'Disponible'}</span>
    `;

    if (!isBooked) {
      btn.onclick = () => selectSlot(btn, slot);
    } else {
      btn.disabled = true;
    }

    slotsContainer.appendChild(btn);
  });
}

// Seleccionar un tramo horario
function selectSlot(buttonElement, slotTime) {
  document.querySelectorAll('.slot-btn').forEach(btn => btn.classList.remove('selected'));
  buttonElement.classList.add('selected');
  selectedSlot = slotTime;
  document.getElementById('slotError').style.display = 'none';
}

// Procesar el envío del formulario de reserva
function handleBookingSubmit(event) {
  event.preventDefault();

  if (!selectedSlot) {
    document.getElementById('slotError').style.display = 'block';
    return;
  }

  const name = document.getElementById('clientName').value.trim();
  const phone = document.getElementById('clientPhone').value.trim();
  const service = document.getElementById('serviceSelect').value;
  const date = document.getElementById('bookingDate').value;

  // Crear objeto de reserva
  const newAppointment = {
    id: Date.now(),
    name,
    phone,
    service,
    date,
    slot: selectedSlot
  };

  // Guardar en la lista y actualizar localStorage
  appointments.push(newAppointment);
  localStorage.setItem('barber_appointments', JSON.stringify(appointments));

  // Limpiar campos y notificar al usuario
  alert(`¡Reserva confirmada con éxito!\n\nCliente: ${name}\nFecha: ${date}\nHora: ${selectedSlot}`);
  document.getElementById('clientName').value = '';
  document.getElementById('clientPhone').value = '';
  
  // Actualizar tramos
  renderSlots();
}

// Mostrar lista de citas guardadas
function renderAppointmentsList() {
  const container = document.getElementById('appointmentsList');
  const filterDate = document.getElementById('filterDate').value;
  
  container.innerHTML = '';

  let filteredApps = appointments;
  if (filterDate) {
    filteredApps = appointments.filter(app => app.date === filterDate);
  }

  // Ordenar citas por fecha y hora
  filteredApps.sort((a, b) => new Date(a.date + ' ' + a.slot.split(' - ')[0]) - new Date(b.date + ' ' + b.slot.split(' - ')[0]));

  if (filteredApps.length === 0) {
    container.innerHTML = '<div class="empty-msg"><i class="fa-regular fa-calendar-xmark"></i> No hay reservas encontradas.</div>';
    return;
  }

  filteredApps.forEach(app => {
    const card = document.createElement('div');
    card.className = 'appointment-card';
    card.innerHTML = `
      <div class="appointment-info">
        <h3>${app.name} (${app.phone})</h3>
        <p><i class="fa-regular fa-calendar"></i> ${app.date} | <i class="fa-regular fa-clock"></i> <strong>${app.slot}</strong></p>
        <p><i class="fa-solid fa-scissors"></i> ${app.service}</p>
      </div>
      <button class="btn-delete" onclick="cancelAppointment(${app.id})" title="Cancelar Cita">
        <i class="fa-solid fa-trash-can"></i>
      </button>
    `;
    container.appendChild(card);
  });
}

// Cancelar una cita
function cancelAppointment(id) {
  if (confirm('¿Estás seguro de que deseas cancelar esta reserva?')) {
    appointments = appointments.filter(app => app.id !== id);
    localStorage.setItem('barber_appointments', JSON.stringify(appointments));
    renderAppointmentsList();
    renderSlots();
  }
}

// Reiniciar el filtro de fecha
function resetFilter() {
  document.getElementById('filterDate').value = '';
  renderAppointmentsList();
}