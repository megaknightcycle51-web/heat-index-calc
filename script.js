// script.js content with updated warning labels

// Assuming there's a function to display warnings
function displayWarning(level, message) {
    let color;

    switch (level) {
        case 'Aman':
            color = '#229954';
            break;
        case 'Peringatan':
            color = '#f39c12';
            break;
        case 'Waspada':
            color = '#e74c3c';
            break;
        case 'Bahaya':
            color = '#8e44ad';
            break;
        case 'Ancaman':
            color = '#2c3e50';
            break;
        default:
            color = 'black';
    }

    // Here should be the logic to display the colored label with the message
    console.log(`%c${level}: ${message}`, `color: ${color};`);
}

// Example usage:
displayWarning('Aman', 'Tidak ada masalah.');
displayWarning('Peringatan', 'Perhatikan suhu tubuh.');
displayWarning('Waspada', 'Suhu tinggi — kemungkinan masalah!');
displayWarning('Bahaya', 'Suhu sangat tinggi — segera ambil tindakan!');
displayWarning('Ancaman', 'Suhu mengancam kesehatan — perlu diwaspadai!');