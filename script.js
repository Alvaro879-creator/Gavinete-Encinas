// Tramos horarios de tarde en intervalos de 20 minutos (16:00 a 20:40)
const afternoonSlots = [
  "16:00 - 16:20",
  "16:20 - 16:40",
  "16:40 - 17:00",
  "17:00 - 17:20",
  "17:20 - 17:40",
  "17:40 - 18:00",
  "18:00 - 18:20",
  "18:20 - 18:40",
  "18:40 - 19:00",
  "19:00 - 19:20",
  "19:20 - 19:40",
  "19:40 - 20:00",
  "20:00 - 20:20",
  "20:20 - 20:40"
];

// Variable para guardar el turno seleccionado
let selectedSlot = null;

// Obtener horas ocupadas guardadas en localStorage
let bookedSlots = JSON.parse(localStorage.getItem('barber_booked_slots')) || [];

document.addEventListener('DOMContentLoaded', () => {
  renderSlots();
  document.getElementById('bookingForm').addEventListener('submit', handleBooking);
});

// Renderizar la lista de botones con las horas
function renderSlots() {
  const slotsContainer = document.getElementById('slotsContainer');
  slotsContainer.innerHTML = '';
  selectedSlot = null;
  document.getElementById('slotError').style.display = 'none';

  afternoonSlots.forEach(slot => {
    const isBooked = bookedSlots.includes(slot);
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
      btn.disabled = true; // Bloquea el botón si ya está cogido
    }

    slotsContainer.appendChild(btn);
  });
}

// Marcar la hora seleccionada
function selectSlot(buttonElement, slotTime) {
  document.querySelectorAll('.slot-btn').forEach(btn => btn.classList.remove('selected'));
  buttonElement.classList.add('selected');
  selectedSlot = slotTime;
  document.getElementById('slotError').style.display = 'none';
}

// Confirmar la reserva
function handleBooking(event) {
  event.preventDefault();

  if (!selectedSlot) {
    document.getElementById('slotError').style.display = 'block';
    return;
  }

  // Guardar la hora como ocupada
  bookedSlots.push(selectedSlot);
  localStorage.setItem('barber_booked_slots', JSON.stringify(bookedSlots));

  alert(`¡Turno reservado correctamente para las ${selectedSlot}!`);

  // Volver a renderizar los botones (el tramo elegido ahora estará ocupado)
  renderSlots();
}

// Función para borrar todas las reservas y liberar todos los horarios
function resetAllSlots() {
  if (confirm('¿Quieres liberar todos los horarios de nuevo?')) {
    bookedSlots = [];
    localStorage.removeItem('barber_booked_slots');
    renderSlots();
  }
}