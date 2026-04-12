/**
 * Calculate Heat Index in Celsius using NOAA's official method.
 * 
 * Implementation follows NOAA Technical Attachment SR 90-23:
 * https://www.wpc.ncep.noaa.gov/html/heatindex_equation.shtml
 * 
 * The method:
 * 1. Convert Celsius to Fahrenheit
 * 2. Compute simple ("Steadman") formula
 * 3. Average simple result with actual temperature
 * 4. If average >= 80°F, apply full Rothfusz regression with adjustments
 * 5. Otherwise, use the averaged simple result
 * 6. Convert final result back to Celsius
 * 
 * @param {number} temperatureCelsius - Air temperature in degrees Celsius
 * @param {number} relativeHumidity - Relative humidity as a percentage (0-100)
 * @returns {number} Heat Index in degrees Celsius (rounded to 1 decimal place),
 *                   or null if inputs are invalid
 */
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
    
    // ========== CONVERT CELSIUS TO FAHRENHEIT ==========
    const temperatureFahrenheit = (temperatureCelsius * 9/5) + 32;
    const t = temperatureFahrenheit;
    const rh = humidity;
    
    // ========== STEP 1: COMPUTE SIMPLE FORMULA ==========
    // HI = 0.5 * {T + 61.0 + [(T-68.0)*1.2] + (RH*0.094)}
    const simpleFormula = 0.5 * (t + 61.0 + ((t - 68.0) * 1.2) + (rh * 0.094));
    
    // ========== STEP 2: AVERAGE SIMPLE FORMULA WITH ACTUAL TEMPERATURE ==========
    const averagedHI = (simpleFormula + t) / 2;
    
    // ========== STEP 3: DETERMINE IF ROTHFUSZ REGRESSION IS NEEDED ==========
    // If averaged result is below 80°F, use it as-is (no Rothfusz)
    if (averagedHI < 80) {
        return convertFahrenheitToCelsius(averagedHI);
    }
    
    // ========== STEP 4: APPLY ROTHFUSZ REGRESSION ==========
    // Only used when the averaged simple formula result is >= 80°F
    
    // Rothfusz regression coefficients
    const c1 = -42.379;
    const c2 = 2.04901523;
    const c3 = 10.14333127;
    const c4 = -0.22475541;
    const c5 = -0.00683783;
    const c6 = -0.05481717;
    const c7 = 0.00122874;
    const c8 = 0.00085282;
    const c9 = -0.00000199;
    
    // HI = c1 + c2*T + c3*RH + c4*T*RH + c5*T² + c6*RH² + c7*T²*RH + c8*T*RH² + c9*T²*RH²
    let heatIndexFahrenheit = c1 + 
                              (c2 * t) + 
                              (c3 * rh) + 
                              (c4 * t * rh) + 
                              (c5 * t * t) + 
                              (c6 * rh * rh) + 
                              (c7 * t * t * rh) + 
                              (c8 * t * rh * rh) + 
                              (c9 * t * t * rh * rh);
    
    // ========== STEP 5: APPLY LOW HUMIDITY ADJUSTMENT ==========
    // Subtracted from HI when: RH < 13% AND T is between 80°F and 112°F
    // ADJUSTMENT = [(13-RH)/4] * SQRT{[17-ABS(T-95)]/17}
    if (rh < 13 && t >= 80 && t <= 112) {
        const lowHumidityAdjustment = ((13 - rh) / 4) * 
                                      Math.sqrt((17 - Math.abs(t - 95)) / 17);
        heatIndexFahrenheit -= lowHumidityAdjustment;
    }
    // ========== STEP 6: APPLY HIGH HUMIDITY ADJUSTMENT ==========
    // Added to HI when: RH > 85% AND T is between 80°F and 87°F
    // ADJUSTMENT = [(RH-85)/10] * [(87-T)/5]
    else if (rh > 85 && t >= 80 && t <= 87) {
        const highHumidityAdjustment = ((rh - 85) / 10) * ((87 - t) / 5);
        heatIndexFahrenheit += highHumidityAdjustment;
    }
    
    // ========== CONVERT RESULT BACK TO CELSIUS ==========
    return convertFahrenheitToCelsius(heatIndexFahrenheit);
}

/**
 * Convert temperature from Fahrenheit to Celsius and round to 1 decimal place.
 * 
 * @param {number} fahrenheit - Temperature in degrees Fahrenheit
 * @returns {number} Temperature in degrees Celsius (rounded to 1 decimal place)
 */
function convertFahrenheitToCelsius(fahrenheit) {
    const celsius = (fahrenheit - 32) * 5/9;
    return Math.round(celsius * 10) / 10; // Round to 1 decimal place
}

/**
 * Determine the heat stress warning level based on heat index.
 * 
 * @param {number} heatIndexCelsius - Heat index in degrees Celsius
 * @returns {Object} Object with level, message, and color properties
 */
function getWarningLevel(heatIndexCelsius) {
    if (heatIndexCelsius == null) {
        return { 
            level: 'Error', 
            message: 'Invalid input values.', 
            color: '#808080' 
        };
    }
    
    if (heatIndexCelsius < 27) {
        return {
            level: 'Aman',
            message: 'Tidak ada resiko heatstroke.',
            color: '#31e048'
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
 * 
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
    
    if (!calculateBtn || !temperatureInput || !humidityInput) {
        console.error('Required DOM elements not found');
        return;
    }
    
    /**
     * Perform heat index calculation and display result.
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

    // ========== COLLAPSIBLE WARNING ITEMS ==========
    const warningItems = document.querySelectorAll('.warning-item');
    
    warningItems.forEach(item => {
        const header = item.querySelector('.warning-header');
        const details = item.querySelector('.warning-details');
        const arrow = item.querySelector('.arrow-toggle');
        
        header.addEventListener('click', function() {
            const isOpen = details.classList.contains('open');
            
            // Close all other open items
            warningItems.forEach(otherItem => {
                if (otherItem !== item) {
                    otherItem.querySelector('.warning-details').classList.remove('open');
                    otherItem.querySelector('.arrow-toggle').classList.remove('open');
                }
            });
            
            // Toggle current item
            if (isOpen) {
                details.classList.remove('open');
                arrow.classList.remove('open');
            } else {
                details.classList.add('open');
                arrow.classList.add('open');
            }
        });
    });
});
