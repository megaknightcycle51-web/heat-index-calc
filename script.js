function calculateHeatIndexCelsius(temperatureCelsius, relativeHumidity) {
    // ========== INPUT VALIDATION ==========
    if (typeof temperatureCelsius !== 'number' || typeof relativeHumidity !== 'number') {
        return null;
    }
    
    if (!isFinite(temperatureCelsius) || !isFinite(relativeHumidity)) {
        return null;
    }
    
    // Clamp humidity to valid range [0, 100]
    const humidity = Math.max(0, Math.min(100, relativeHumidity));
    
    // ========== TEMPERATURE CONVERSION ==========
    // Convert Celsius to Fahrenheit (Rothfusz formula requires Fahrenheit)
    const temperatureFahrenheit = (temperatureCelsius * 9/5) + 32;
    
    // ========== SPECIAL CASE: LOW TEMPERATURE ==========
    // Below 80°F (26.67°C), use simplified formula and average with actual temp
    if (temperatureFahrenheit < 80) {
        const simplifiedHI = 0.5 * (temperatureFahrenheit + 61.0 + 
                                    ((temperatureFahrenheit - 68.0) * 1.2) + 
                                    (humidity * 0.094));
        const heatIndexFahrenheit = (simplifiedHI + temperatureFahrenheit) / 2;
        return convertFahrenheitToCelsius(heatIndexFahrenheit);
    }
    
    // ========== ROTHFUSZ REGRESSION (for T >= 80°F) ==========
    const t = temperatureFahrenheit;
    const rh = humidity;
    
    // Regression coefficients
    const c1 = -42.379;
    const c2 = 2.04901523;
    const c3 = 10.14333127;
    const c4 = -0.22475541;
    const c5 = -0.00683783;
    const c6 = -0.05481717;
    const c7 = 0.00122874;
    const c8 = 0.00085282;
    const c9 = -0.00000199;
    
    // Calculate base heat index using Rothfusz regression
    let heatIndexFahrenheit = c1 + 
                              (c2 * t) + 
                              (c3 * rh) + 
                              (c4 * t * rh) + 
                              (c5 * t * t) + 
                              (c6 * rh * rh) + 
                              (c7 * t * t * rh) + 
                              (c8 * t * rh * rh) + 
                              (c9 * t * t * rh * rh);
    
    // ========== LOW HUMIDITY ADJUSTMENT ==========
    // Applied when RH < 13% and temp is between 80°F and 112°F
    if (rh < 13 && t >= 80 && t <= 112) {
        const lowHumidityAdjustment = ((13 - rh) / 4) * 
                                      Math.sqrt((17 - Math.abs(t - 95)) / 17);
        heatIndexFahrenheit -= lowHumidityAdjustment;
    }
    
    // ========== HIGH HUMIDITY ADJUSTMENT ==========
    // Applied when RH > 85% and temp is between 80°F and 87°F
    else if (rh > 85 && t >= 80 && t <= 87) {
        const highHumidityAdjustment = ((rh - 85) / 10) * ((87 - t) / 5);
        heatIndexFahrenheit += highHumidityAdjustment;
    }
    
    // ========== CONVERT BACK TO CELSIUS ==========
    return convertFahrenheitToCelsius(heatIndexFahrenheit);
}

/**
 * Convert temperature from Fahrenheit to Celsius.
 * @param {number} fahrenheit - Temperature in degrees Fahrenheit
 * @returns {number} Temperature in degrees Celsius (rounded to 1 decimal place)
 */
function convertFahrenheitToCelsius(fahrenheit) {
    const celsius = (fahrenheit - 32) * 5/9;
    return Math.round(celsius * 10) / 10; // Round to 1 decimal place
}

/**
 * Determine the heat stress warning level based on heat index.
 * @param {number} heatIndexCelsius - Heat index in degrees Celsius
 * @returns {Object} Object with level, message, and color properties
 */
function getWarningLevel(heatIndexCelsius) {
    if (heatIndexCelsius == null) {
        return { level: 'Error', message: 'Invalid input values.', color: '#808080' };
    }
    
    if (heatIndexCelsius < 27) {
        return {
            level: 'Aman',
            message: 'Tidak ada resiko heatstroke.',
            color: '#00ff22'
        };
    } else if (heatIndexCelsius < 32) {
        return {
            level: 'Peringatan',
            message: 'Kemungkinan kecil terjadi kelelahan dan heat cramp bila melakukan aktivitas berat.',
            color: '#ff9d00'
        };
    } else if (heatIndexCelsius < 41) {
        return {
            level: 'Waspada',
            message: 'Kemungkinan besar terjadi kelelahan dan heat cramp.',
            color: '#ff1900'
        };
    } else if (heatIndexCelsius < 54) {
        return {
            level: 'Bahaya',
            message: 'Kemungkinan terjadi heatstroke bila terlalu lama terekspos.',
            color: '#b300ff'
        };
    } else {
        return {
            level: 'Ancaman',
            message: 'Heat stroke akan terjadi tanpa perlindungan!',
            color: '#1f2933'
        };
    }
}

/**
 * Display the calculated heat index and warning level on the page.
 * @param {number} heatIndexCelsius - Heat index in degrees Celsius
 * @param {Object} warning - Warning level object from getWarningLevel()
 */
function displayResult(heatIndexCelsius, warning) {
    const resultSection = document.getElementById('resultSection');
    const resultValue = document.getElementById('resultValue');
    const resultWarning = document.getElementById('resultWarning');
    const resultBox = document.getElementById('resultBox');
    
    if (!resultSection || !resultValue || !resultWarning || !resultBox) {
        console.error('Result display elements not found in DOM');
        return;
    }
    
    resultValue.textContent = heatIndexCelsius.toFixed(1) + '°C';
    resultWarning.textContent = warning.level + ': ' + warning.message;
    
    // Set colors based on warning level
    resultBox.style.borderColor = warning.color;
    resultBox.style.backgroundColor = warning.color;
    
    resultSection.style.display = 'block';
}

// ========== EVENT LISTENERS & DOM INITIALIZATION ==========
document.addEventListener('DOMContentLoaded', function() {
    const calculateBtn = document.querySelector('.btn-calculate');
    const temperatureInput = document.getElementById('temperature');
    const humidityInput = document.getElementById('humidity');
    
    if (!calculateBtn) {
        console.error('Calculate button not found');
        return;
    }
    
    /**
     * Handle the calculation when the button is clicked or Enter is pressed.
     */
    function performCalculation() {
        const temperature = parseFloat(temperatureInput.value);
        const humidity = parseFloat(humidityInput.value);
        
        // Validate inputs
        if (isNaN(temperature) || isNaN(humidity)) {
            alert('Please enter both temperature and humidity values');
            return;
        }
        
        if (humidity < 0 || humidity > 100) {
            alert('Humidity must be between 0 and 100%');
            return;
        }
        
        // Calculate heat index
        const heatIndex = calculateHeatIndexCelsius(temperature, humidity);
        
        if (heatIndex === null) {
            alert('An error occurred during calculation. Please check your inputs.');
            return;
        }
        
        // Get warning level and display result
        const warning = getWarningLevel(heatIndex);
        displayResult(heatIndex, warning);
    }
    
    // Calculate on button click
    calculateBtn.addEventListener('click', performCalculation);
    
    // Calculate on Enter key press in input fields
    temperatureInput.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            performCalculation();
        }
    });
    
    humidityInput.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            performCalculation();
        }
    });
});
