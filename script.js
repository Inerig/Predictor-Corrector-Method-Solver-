function eulerMethod(f, a, b, n, alpha) {
    // Compute step size
    let h = (b - a) / n;
    // Initialize arrays to store results
    let t = new Array(n + 1);
    let w = new Array(n + 1);
    // Set initial conditions
    t[0] = a;
    w[0] = alpha;
    // Perform Euler's method
    for (let i = 0; i < n; i++) {
        w[i + 1] = w[i] + h * f(t[i], w[i]);  // Update solution
        t[i + 1] = t[i] + h;                  // Update time
    }
    return { t: t, w: w };
}

function adamsBashforth4(f, a, b, n, alpha) {
    // Compute step size
    let h = (b - a) / n;
    // Initialize arrays to store results
    let t = new Array(n + 1);
    let w = new Array(n + 1);
    // Set initial conditions
    t[0] = a;
    w[0] = alpha;
    // Use Euler method to get the first three steps
    for (let i = 1; i < 4; i++) {
        w[i] = w[i - 1] + h * f(t[i - 1], w[i - 1]);
        t[i] = t[i - 1] + h;
    }

    // Perform Adams-Bashforth 4th Order method for subsequent steps
    for (let i = 3; i < n; i++) {
        let k1 = f(t[i], w[i]);
        let k2 = f(t[i - 1], w[i - 1]);
        let k3 = f(t[i - 2], w[i - 2]);
        let k4 = f(t[i - 3], w[i - 3]);
        w[i + 1] = w[i] + (h / 24) * (55 * k1 - 59 * k2 + 37 * k3 - 9 * k4);
        t[i + 1] = t[i] + h;
    }
    return { t: t, w: w };
}

function adamsMoulton4(f, a, b, n, alpha) {
    // Compute step size
    let h = (b - a) / n;
    // Initialize arrays to store results
    let t = new Array(n + 1);
    let w = new Array(n + 1);
    // Set initial conditions
    t[0] = a;
    w[0] = alpha;
    // Use Euler method to get the first three steps
    for (let i = 1; i < 4; i++) {
        w[i] = w[i - 1] + h * f(t[i - 1], w[i - 1]);
        t[i] = t[i - 1] + h;
    }

    // Perform Adams-Moulton 4th Order method for subsequent steps
    for (let i = 3; i < n; i++) {
        let k1 = f(t[i], w[i]);
        let k2 = f(t[i - 1], w[i - 1]);
        let k3 = f(t[i - 2], w[i - 2]);
        let k4 = f(t[i - 3], w[i - 3]);
        let k5 = f(t[i + 1], w[i + 1]); // Predict using Adams-Bashforth
        w[i + 1] = w[i] + (h / 24) * (9 * k5 + 19 * k1 - 5 * k2 + k3);
        t[i + 1] = t[i] + h;
    }
    return { t: t, w: w };
}

function parseFunction(funcStr) {
    try {
        // Validate the function string
        if (!/^[a-zA-Z0-9\s\+\-\*\/\(\)\.\,\[\]\^\%\&\|\!\<\>\=\~\`\@\#\$\^\\]+$/.test(funcStr)) {
            throw new Error("Invalid characters in function.");
        }
        // Create a safe function from the string input with predefined Math functions
        const mathFunctions = {
            Math: Math,
            exp: Math.exp,
            log: Math.log,
            sqrt: Math.sqrt,
            pow: Math.pow,
            sin: Math.sin,
            cos: Math.cos,
            tan: Math.tan,
            asin: Math.asin,
            acos: Math.acos,
            atan: Math.atan,
            sinh: Math.sinh,
            cosh: Math.cosh,
            tanh: Math.tanh,
            abs: Math.abs,
            floor: Math.floor,
            ceil: Math.ceil,
            round: Math.round,
            trunc: Math.trunc,
            random: Math.random
        };

        const functionString = `with(Math){return (${funcStr})}`;
        return new Function('t', 'y', functionString);
    } catch (error) {
        console.error("Error parsing function:", error);
        throw new Error("Invalid function input. Please make sure your function is correctly formatted.");
    }
}

function solveAndDisplay() {
    const a = parseFloat(document.getElementById('a').value);
    const b = parseFloat(document.getElementById('b').value);
    const n = parseInt(document.getElementById('n').value);
    const alpha = parseFloat(document.getElementById('alpha').value);
    const funcStr = document.getElementById('functionInput').value.trim();
    const decimalPlaces = parseInt(document.getElementById('decimalPlaces').value);

    if (!funcStr || isNaN(decimalPlaces) || decimalPlaces < 0) {
        alert("Please enter a valid function and a non-negative integer for decimal places.");
        return;
    }

    try {
        console.log("Function String:", funcStr);  // Debug: Check the input function string
        const f = parseFunction(funcStr);
        console.log("Parsed Function:", f.toString());  // Debug: Check the parsed function

        const eulerResult = eulerMethod(f, a, b, 3, alpha);
        const abResult = adamsBashforth4(f, a, b, n, alpha);
        const amResult = adamsMoulton4(f, a, b, n, alpha);

        // Display calculations for Euler Method for first three steps
        const eulerCalculationsContent = document.getElementById('eulerCalculationsContent');
        eulerCalculationsContent.innerHTML = '';

        // Compute h once and reuse
        const h = (b - a) / 3;

        for (let i = 0; i < 3; i++) {
            const step = document.createElement('div');
            step.className = 'step';
            step.innerHTML = `
                <div class="formula">Step ${i}: t = ${eulerResult.t[i].toFixed(decimalPlaces)}, ω = ${eulerResult.w[i].toFixed(decimalPlaces)}</div>
                <div class="formula">h = ${h.toFixed(decimalPlaces)}</div>
                <div class="formula">Calculate k1: k1 = h * f(${eulerResult.t[i].toFixed(decimalPlaces)}, ${eulerResult.w[i].toFixed(decimalPlaces)})</div>
                <div class="formula">k1 = ${h.toFixed(decimalPlaces)} * ${f(eulerResult.t[i], eulerResult.w[i]).toFixed(decimalPlaces)}</div>
                <div class="formula">Update ω: ω<sub>${i+1}</sub> = ω<sub>${i}</sub> + k1</div>
                <div class="formula">ω<sub>${i+1}</sub> = ${eulerResult.w[i].toFixed(decimalPlaces)} + ${k1.toFixed(decimalPlaces)}</div>
                <div class="formula">ω<sub>${i+1}</sub> = ${eulerResult.w[i+1].toFixed(decimalPlaces)}</div>
                <div class="formula">Update t: t<sub>${i+1}</sub> = t<sub>${i}</sub> + h</div>
                <div class="formula">t<sub>${i+1}</sub> = ${eulerResult.t[i].toFixed(decimalPlaces)} + ${h.toFixed(decimalPlaces)}</div>
                <div class="formula">t<sub>${i+1}</sub> = ${eulerResult.t[i+1].toFixed(decimalPlaces)}</div>
            `;
            eulerCalculationsContent.appendChild(step);
        }

        // Display calculations for Adams-Bashforth 4th Order
        const abCalculationsContent = document.getElementById('abCalculationsContent');
        abCalculationsContent.innerHTML = '';

        for (let i = 3; i < n; i++) {
            let k1 = f(abResult.t[i], abResult.w[i]);
            let k2 = f(abResult.t[i - 1], abResult.w[i - 1]);
            let k3 = f(abResult.t[i - 2], abResult.w[i - 2]);
            let k4 = f(abResult.t[i - 3], abResult.w[i - 3]);

            const step = document.createElement('div');
            step.className = 'step';
            step.innerHTML = `
                <div class="formula">Step ${i}: t = ${abResult.t[i].toFixed(decimalPlaces)}, ω = ${abResult.w[i].toFixed(decimalPlaces)}</div>
                <div class="formula">h = ${h.toFixed(decimalPlaces)}</div>
                <div class="formula">Calculate k1: k1 = f(${abResult.t[i].toFixed(decimalPlaces)}, ${abResult.w[i].toFixed(decimalPlaces)})</div>
                <div class="formula">k1 = ${k1.toFixed(decimalPlaces)}</div>
                <div class="formula">Calculate k2: k2 = f(${abResult.t[i - 1].toFixed(decimalPlaces)}, ${abResult.w[i - 1].toFixed(decimalPlaces)})</div>
                <div class="formula">k2 = ${k2.toFixed(decimalPlaces)}</div>
                <div class="formula">Calculate k3: k3 = f(${abResult.t[i - 2].toFixed(decimalPlaces)}, ${abResult.w[i - 2].toFixed(decimalPlaces)})</div>
                <div class="formula">k3 = ${k3.toFixed(decimalPlaces)}</div>
                <div class="formula">Calculate k4: k4 = f(${abResult.t[i - 3].toFixed(decimalPlaces)}, ${abResult.w[i - 3].toFixed(decimalPlaces)})</div>
                <div class="formula">k4 = ${k4.toFixed(decimalPlaces)}</div>
                <div class="formula">Predict ω: ω<sub>${i+1}</sub> = ω<sub>${i}</sub> + (h / 24) * (55 * k1 - 59 * k2 + 37 * k3 - 9 * k4)</div>
                <div class="formula">ω<sub>${i+1}</sub> = ${abResult.w[i].toFixed(decimalPlaces)} + (0.0416666667 * ${h.toFixed(decimalPlaces)}) * (55 * ${k1.toFixed(decimalPlaces)} - 59 * ${k2.toFixed(decimalPlaces)} + 37 * ${k3.toFixed(decimalPlaces)} - 9 * ${k4.toFixed(decimalPlaces)})</div>
                <div class="formula">ω<sub>${i+1}</sub> = ${abResult.w[i+1].toFixed(decimalPlaces)}</div>
                <div class="formula">Update t: t<sub>${i+1}</sub> = t<sub>${i}</sub> + h</div>
                <div class="formula">t<sub>${i+1}</sub> = ${abResult.t[i].toFixed(decimalPlaces)} + ${h.toFixed(decimalPlaces)}</div>
                <div class="formula">t<sub>${i+1}</sub> = ${abResult.t[i+1].toFixed(decimalPlaces)}</div>
            `;
            abCalculationsContent.appendChild(step);
        }

        // Display calculations for Adams-Moulton 4th Order
        const amCalculationsContent = document.getElementById('amCalculationsContent');
        amCalculationsContent.innerHTML = '';

        for (let i = 3; i < n; i++) {
            let k1 = f(amResult.t[i], amResult.w[i]);
            let k2 = f(amResult.t[i - 1], amResult.w[i - 1]);
            let k3 = f(amResult.t[i - 2], amResult.w[i - 2]);
            let k4 = f(amResult.t[i - 3], amResult.w[i - 3]);
            let k5 = f(amResult.t[i + 1], amResult.w[i + 1]); // Predict using Adams-Bashforth

            const step = document.createElement('div');
            step.className = 'step';
            step.innerHTML = `
                <div class="formula">Step ${i}: t = ${amResult.t[i].toFixed(decimalPlaces)}, ω = ${amResult.w[i].toFixed(decimalPlaces)}</div>
                <div class="formula">h = ${h.toFixed(decimalPlaces)}</div>
                <div class="formula">Calculate k1: k1 = f(${amResult.t[i].toFixed(decimalPlaces)}, ${amResult.w[i].toFixed(decimalPlaces)})</div>
                <div class="formula">k1 = ${k1.toFixed(decimalPlaces)}</div>
                <div class="formula">Calculate k2: k2 = f(${amResult.t[i - 1].toFixed(decimalPlaces)}, ${amResult.w[i - 1].toFixed(decimalPlaces)})</div>
                <div class="formula">k2 = ${k2.toFixed(decimalPlaces)}</div>
                <div class="formula">Calculate k3: k3 = f(${amResult.t[i - 2].toFixed(decimalPlaces)}, ${amResult.w[i - 2].toFixed(decimalPlaces)})</div>
                <div class="formula">k3 = ${k3.toFixed(decimalPlaces)}</div>
                <div class="formula">Calculate k4: k4 = f(${amResult.t[i - 3].toFixed(decimalPlaces)}, ${amResult.w[i - 3].toFixed(decimalPlaces)})</div>
                <div class="formula">k4 = ${k4.toFixed(decimalPlaces)}</div>
                <div class="formula">Predict ω: ω<sub>${i+1}</sub> = ω<sub>${i}</sub> + (h / 24) * (9 * k5 + 19 * k1 - 5 * k2 + k3)</div>
                <div class="formula">ω<sub>${i+1}</sub> = ${amResult.w[i].toFixed(decimalPlaces)} + (0.0416666667 * ${h.toFixed(decimalPlaces)}) * (9 * ${k5.toFixed(decimalPlaces)} + 19 * ${k1.toFixed(decimalPlaces)} - 5 * ${k2.toFixed(decimalPlaces)} + ${k3.toFixed(decimalPlaces)})</div>
                <div class="formula">ω<sub>${i+1}</sub> = ${amResult.w[i+1].toFixed(decimalPlaces)}</div>
                <div class="formula">Update t: t<sub>${i+1}</sub> = t<sub>${i}</sub> + h</div>
                <div class="formula">t<sub>${i+1}</sub> = ${amResult.t[i].toFixed(decimalPlaces)} + ${h.toFixed(decimalPlaces)}</div>
                <div class="formula">t<sub>${i+1}</sub> = ${amResult.t[i+1].toFixed(decimalPlaces)}</div>
            `;
            amCalculationsContent.appendChild(step);
        }

        // Populate the table for Euler Method
        const eulerTableBody = document.querySelector('#eulerResultTable tbody');
        eulerTableBody.innerHTML = '';
        for (let i = 0; i <= 3; i++) {
            eulerTableBody.innerHTML += `<tr><td>${i}</td><td>${eulerResult.t[i].toFixed(decimalPlaces)}</td><td>${eulerResult.w[i].toFixed(decimalPlaces)}</td></tr>`;
        }

        // Populate the table for Adams-Bashforth 4th Order
        const abTableBody = document.querySelector('#abResultTable tbody');
        abTableBody.innerHTML = '';
        for (let i = 0; i <= n; i++) {
            abTableBody.innerHTML += `<tr><td>${i}</td><td>${abResult.t[i].toFixed(decimalPlaces)}</td><td>${abResult.w[i].toFixed(decimalPlaces)}</td></tr>`;
        }

        // Populate the table for Adams-Moulton 4th Order
        const amTableBody = document.querySelector('#amResultTable tbody');
        amTableBody.innerHTML = '';
        for (let i = 0; i <= n; i++) {
            amTableBody.innerHTML += `<tr><td>${i}</td><td>${amResult.t[i].toFixed(decimalPlaces)}</td><td>${amResult.w[i].toFixed(decimalPlaces)}</td></tr>`;
        }
    } catch (e) {
        alert(`Error: ${e.message}`);
    }
}

function adjustWidth(input) {
    // Calculate the width based on the number of characters
    const charCount = input.value.length;
    const minWidth = 100;
    const maxWidth = 300;
    const stepSize = (maxWidth - minWidth) / 100; // Assuming maximum character count is 100

    const newWidth = Math.min(maxWidth, minWidth + charCount * stepSize);
    input.style.width = `${newWidth}px`;
}
