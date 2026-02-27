const temperatureInput = document.getElementById('temperature');
const humidityInput = document.getElementById('humidity');
const calculateBtn = document.querySelector('.btn-calculate');
const resultSection = document.getElementById('resultSection');
const resultBox = document.getElementById('resultBox');
const resultValue = document.getElementById('resultValue');
const resultWarning = document.getElementById('resultWarning');

calculateBtn.addEventListener('click', calculateHeatIndex);

function calculateHeatIndex() {
    const tempC = parseFloat(temperatureInput.value);
    const humidity = parseFloat(humidityInput.value);

    // Validate inputs
    if (isNaN(tempC) || isNaN(humidity)) {
        alert('Please enter both temperature and humidity values');
        return;
    }

    if (humidity < 0 || humidity > 100) {
        alert('Humidity must be between 0 and 100%');
        return;
    }

    // Convert Celsius to Fahrenheit for calculation
    const tempF = (tempC * 9/5) + 32;

    // Heat Index Formula (Steadman)
    let heatIndexF;

    if (tempF < 80) {
        // Below 80°F, heat index is approximately equal to temperature
        heatIndexF = tempF;
    } else {
        // Heat Index Formula
        const c1 = -42.379;
        const c2 = 2.04901523;
        const c3 = 10.14333127;
        const c4 = -0.22475541;
        const c5 = -0.00683783;
        const c6 = -0.05481717;
        const c7 = 0.00122874;
        const c8 = 0.00085282;
        const c9 = -0.00000199;

        const T = tempF;
        const RH = humidity;

        heatIndexF = c1 + 
                     (c2 * T) + 
                     (c3 * RH) + 
                     (c4 * T * RH) + 
                     (c5 * T * T) + 
                     (c6 * RH * RH) + 
                     (c7 * T * T * RH) + 
                     (c8 * T * RH * RH) + 
                     (c9 * T * T * RH * RH);
    }

    // Convert back to Celsius
    const heatIndexC = (heatIndexF - 32) * 5/9;

    // Display result
    displayResult(heatIndexC);
}

function displayResult(heatIndexC) {
    resultValue.textContent = heatIndexC.toFixed(1) + '°C';
    
    // Remove all color classes
    resultBox.classList.remove('aman', 'peringatan', 'waspada', 'bahaya', 'ancaman');
    
    // Add appropriate color and warning
    if (heatIndexC < 27) {
        resultBox.classList.add('aman');
        resultWarning.textContent = 'Aman: Tidak ada resiko heatstroke.';
    } else if (heatIndexC < 32) {
        resultBox.classList.add('peringatan');
        resultWarning.textContent = 'Peringatan: Kemungkinan kecil terjadi kelelahan dan heat cramp bila melakukan aktvitas berat.';
    } else if (heatIndexC < 41) {
        resultBox.classList.add('waspada');
        resultWarning.textContent = 'Waspada: Kemungkinan besar terjadi kelelahan dan heat cramp.';
    } else if (heatIndexC < 54) {
        resultBox.classList.add('bahaya');
        resultWarning.textContent = 'BAHAYA: Kemungkinan terjadi heatstroke bila terlalu lama terkspos.';
    } else {
        resultBox.classList.add('ancaman');
        resultWarning.textContent = 'ANCAMAN: Heat stroke akan terjadi tanpa perlindungan!';
    }

    // Show result section
    resultSection.style.display = 'block';
}

// Allow Enter key to calculate
temperatureInput.addEventListener('keypress', function(e) {
    if (e.key === 'Enter') calculateHeatIndex();
});

humidityInput.addEventListener('keypress', function(e) {
    if (e.key === 'Enter') calculateHeatIndex();
});