/* ==========================================================================
   4-BIT BINARY MULTI-CALCULATOR ENGINE (app.js)
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {
    // ----------------------------------------------------------------------
    // 1. NAVIGATION & VIEW SWITCHING SYSTEM
    // ----------------------------------------------------------------------
    const navButtons = document.querySelectorAll('.nav-btn');
    const homeCards = document.querySelectorAll('.module-card');
    const backButtons = document.querySelectorAll('.back-to-home-btn');
    const views = document.querySelectorAll('.view-container');
    const brand = document.getElementById('nav-brand');

    function switchView(targetId) {
        views.forEach(v => v.classList.remove('active'));
        navButtons.forEach(b => b.classList.remove('active'));

        const targetView = document.getElementById(targetId);
        if (targetView) {
            targetView.classList.add('active');
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }

        // Highlight top navbar button
        const activeNavBtn = document.querySelector(`.nav-btn[data-target="${targetId}"]`);
        if (activeNavBtn) {
            activeNavBtn.classList.add('active');
        } else if (targetId === 'home-view') {
            document.getElementById('nav-home-btn').classList.add('active');
        }
    }

    navButtons.forEach(btn => {
        btn.addEventListener('click', () => switchView(btn.getAttribute('data-target')));
    });

    homeCards.forEach(card => {
        card.addEventListener('click', () => {
            const targetModule = card.getAttribute('data-module');
            switchView(targetModule);
        });
    });

    backButtons.forEach(btn => {
        btn.addEventListener('click', () => switchView('home-view'));
    });

    if (brand) {
        brand.addEventListener('click', () => switchView('home-view'));
    }


    // ----------------------------------------------------------------------
    // 2. HELPER UTILITIES (4-Bit Word Length Logic & Formatting)
    // ----------------------------------------------------------------------
    function pad4(str) {
        let clean = (str || '').toString().replace(/[^01]/g, '');
        if (clean.length > 4) clean = clean.slice(-4);
        return clean.padStart(4, '0');
    }

    function binToUnsigned4(bin4Str) {
        const padded = pad4(bin4Str);
        return parseInt(padded, 2) & 0xF;
    }

    function binToSigned4(bin4Str) {
        const unsigned = binToUnsigned4(bin4Str);
        return (unsigned & 0x8) ? (unsigned - 16) : unsigned;
    }

    function decToBin4(decNum) {
        let val = parseInt(decNum, 10);
        if (isNaN(val)) return '0000';
        if (val < 0) {
            val = (val & 0xF) >>> 0;
        } else {
            val = val & 0xF;
        }
        return val.toString(2).padStart(4, '0');
    }

    function renderBitStrip(containerId, bin4Str, onToggleCallback) {
        const container = document.getElementById(containerId);
        if (!container) return;
        container.innerHTML = '';
        const padded = pad4(bin4Str);

        for (let i = 0; i < 4; i++) {
            const bitVal = padded[i];
            const bitIndex = 3 - i;
            
            const bitBox = document.createElement('div');
            bitBox.className = `bit-box ${bitVal === '1' ? 'active-one' : ''}`;
            bitBox.setAttribute('title', `Bit ${bitIndex} (Weight: 2^${bitIndex} = ${Math.pow(2, bitIndex)})`);
            
            bitBox.innerHTML = `
                <span class="bit-val">${bitVal}</span>
                <span class="bit-idx">b${bitIndex}</span>
            `;

            bitBox.addEventListener('click', () => {
                const newBits = padded.split('');
                newBits[i] = newBits[i] === '1' ? '0' : '1';
                const updatedStr = newBits.join('');
                onToggleCallback(updatedStr);
            });

            container.appendChild(bitBox);
        }
    }

    // 16-Bit Helper Utilities (Dedicated for Arithmetic Module)
    function pad16(str) {
        let clean = (str || '').toString().replace(/[^01]/g, '');
        if (clean.length > 16) clean = clean.slice(-16);
        return clean.padStart(16, '0');
    }

    function formatBin16(bin16Str) {
        const p = pad16(bin16Str);
        return `${p.slice(0, 4)} ${p.slice(4, 8)} ${p.slice(8, 12)} ${p.slice(12, 16)}`;
    }

    function binToUnsigned16(bin16Str) {
        const padded = pad16(bin16Str);
        return parseInt(padded, 2) & 0xFFFF;
    }

    function binToSigned16(bin16Str) {
        const unsigned = binToUnsigned16(bin16Str);
        return (unsigned & 0x8000) ? (unsigned - 65536) : unsigned;
    }

    function decToBin16(decNum) {
        let val = parseInt(decNum, 10);
        if (isNaN(val)) return '0000000000000000';
        if (val < 0) {
            val = (val & 0xFFFF) >>> 0;
        } else {
            val = val & 0xFFFF;
        }
        return val.toString(2).padStart(16, '0');
    }

    function renderBitStrip16(containerId, bin16Str, onToggleCallback) {
        const container = document.getElementById(containerId);
        if (!container) return;
        container.innerHTML = '';
        const padded = pad16(bin16Str);

        for (let i = 0; i < 16; i++) {
            const bitVal = padded[i];
            const bitIndex = 15 - i;

            const bitBox = document.createElement('div');
            bitBox.className = `bit-box bit-box-16 ${bitVal === '1' ? 'active-one' : ''}`;
            bitBox.setAttribute('title', `Bit ${bitIndex} (Weight: 2^${bitIndex} = ${Math.pow(2, bitIndex)})`);

            bitBox.innerHTML = `
                <span class="bit-val">${bitVal}</span>
                <span class="bit-idx">b${bitIndex}</span>
            `;

            bitBox.addEventListener('click', () => {
                const newBits = padded.split('');
                newBits[i] = newBits[i] === '1' ? '0' : '1';
                const updatedStr = newBits.join('');
                onToggleCallback(updatedStr);
            });

            container.appendChild(bitBox);
        }
    }


    // ----------------------------------------------------------------------
    // 3. MODULE 1: ARITHMETIC OPERATIONS LOGIC (16-Bit with Mode Toggle & Screenshot)
    // ----------------------------------------------------------------------
    const arithInputA = document.getElementById('arith-bin-a');
    const arithInputB = document.getElementById('arith-bin-b');
    const arithClearA = document.getElementById('arith-clear-a');
    const arithClearB = document.getElementById('arith-clear-b');
    const arithErrA = document.getElementById('arith-err-a');
    const arithErrB = document.getElementById('arith-err-b');
    const arithDecA = document.getElementById('arith-dec-a');
    const arithDecB = document.getElementById('arith-dec-b');
    const arithOpBtns = document.querySelectorAll('.op-btn');
    const arithCalcBtn = document.getElementById('arith-calc-btn');

    const arithResBin = document.getElementById('arith-res-bin');
    const arithStatusBadge = document.getElementById('arith-status-badge');
    const arithOverflowAlert = document.getElementById('arith-overflow-alert');
    const arithAlertText = document.getElementById('arith-alert-text');
    const arithExplanation = document.getElementById('arith-explanation');
    const arithScreenshotBtn = document.getElementById('arith-screenshot-btn');
    const workingBody = document.getElementById('arith-working-body');
    const workingOpBadge = document.getElementById('working-op-badge');

    let currentArithOp = 'add';
    let arithModeA = 'bin'; // 'bin' or 'dec'
    let arithModeB = 'bin'; // 'bin' or 'dec'

    // Render step-by-step paper-style working
    function renderWorkingSteps(binA, binB, resultBin, numA, numB, rawResult, opSymbol, opName, currentOp) {
        if (!workingBody) return;
        workingOpBadge.textContent = `${opName} (${opSymbol})`;

        const fmtA = formatBin16(binA);
        const fmtB = formatBin16(binB);
        const fmtR = formatBin16(resultBin);

        if (currentOp === 'add') {
            // Show carry bits for addition
            let carry = 0;
            let carryBits = [];
            const bitsA = pad16(binA).split('').map(Number);
            const bitsB = pad16(binB).split('').map(Number);
            
            for (let i = 15; i >= 0; i--) {
                const sum = bitsA[i] + bitsB[i] + carry;
                carryBits[i] = carry;
                carry = sum >= 2 ? 1 : 0;
            }
            const carryStr = carryBits.map(c => c).join('');
            const fmtCarry = `${carryStr.slice(0,4)} ${carryStr.slice(4,8)} ${carryStr.slice(8,12)} ${carryStr.slice(12,16)}`;

            workingBody.innerHTML = `
                <div class="binary-paper">
                    <div class="paper-row carry-row">
                        <span class="carry-label">C</span>
                        <span class="bits">${fmtCarry}</span>
                        <span class="dec-label">(carry)</span>
                    </div>
                    <div class="paper-row operand-row">
                        <span class="op-symbol">&nbsp;</span>
                        <span class="bits">${fmtA}</span>
                        <span class="dec-label">(${numA})</span>
                    </div>
                    <div class="paper-row operand-row">
                        <span class="op-symbol">${opSymbol}</span>
                        <span class="bits">${fmtB}</span>
                        <span class="dec-label">(${numB})</span>
                    </div>
                    <hr class="paper-divider">
                    <div class="paper-row result-row">
                        <span class="op-symbol">=</span>
                        <span class="bits">${fmtR}</span>
                        <span class="dec-label">(${rawResult})</span>
                    </div>
                </div>
                <div class="working-explanation">
                    <strong>How it works:</strong> Add each column from right to left. If sum ≥ 2, write (sum − 2) and carry 1 to the next column.
                    ${numA} + ${numB} = ${rawResult}
                </div>
            `;
        } else if (currentOp === 'sub') {
            // Subtraction via 2's complement addition
            const twosCompB = pad16(decToBin16(-numB));
            const fmtTwos = formatBin16(twosCompB);

            workingBody.innerHTML = `
                <div class="binary-paper">
                    <div class="paper-row operand-row">
                        <span class="op-symbol">&nbsp;</span>
                        <span class="bits">${fmtA}</span>
                        <span class="dec-label">(A = ${numA})</span>
                    </div>
                    <div class="paper-row operand-row">
                        <span class="op-symbol">${opSymbol}</span>
                        <span class="bits">${fmtB}</span>
                        <span class="dec-label">(B = ${numB})</span>
                    </div>
                    <hr class="paper-divider">
                    <div class="paper-row result-row">
                        <span class="op-symbol">=</span>
                        <span class="bits">${fmtR}</span>
                        <span class="dec-label">(${rawResult})</span>
                    </div>
                </div>
                <div class="working-explanation">
                    <strong>How it works:</strong> Subtraction uses 2's complement. Take 2's complement of B:
                    <br>B = ${fmtB} → 1's complement = ${formatBin16(pad16(binB).split('').map(b => b === '0' ? '1' : '0').join(''))} → +1 = ${fmtTwos}
                    <br>Then add A + (−B): ${numA} + (${-numB}) = ${rawResult}
                </div>
            `;
        } else if (currentOp === 'mul') {
            workingBody.innerHTML = `
                <div class="binary-paper">
                    <div class="paper-row operand-row">
                        <span class="op-symbol">&nbsp;</span>
                        <span class="bits">${fmtA}</span>
                        <span class="dec-label">(A = ${numA})</span>
                    </div>
                    <div class="paper-row operand-row">
                        <span class="op-symbol">${opSymbol}</span>
                        <span class="bits">${fmtB}</span>
                        <span class="dec-label">(B = ${numB})</span>
                    </div>
                    <hr class="paper-divider">
                    <div class="paper-row result-row">
                        <span class="op-symbol">=</span>
                        <span class="bits">${fmtR}</span>
                        <span class="dec-label">(${rawResult})</span>
                    </div>
                </div>
                <div class="working-explanation">
                    <strong>How it works:</strong> Binary multiplication follows shift-and-add. For each '1' bit in B, shift A left by that bit position and add the partial products.
                    <br>${numA} × ${numB} = ${rawResult}
                </div>
            `;
        } else if (currentOp === 'div') {
            const quotient = Math.trunc(numA / numB);
            const remainder = numA - (quotient * numB);
            workingBody.innerHTML = `
                <div class="binary-paper">
                    <div class="paper-row operand-row">
                        <span class="op-symbol">&nbsp;</span>
                        <span class="bits">${fmtA}</span>
                        <span class="dec-label">(A = ${numA})</span>
                    </div>
                    <div class="paper-row operand-row">
                        <span class="op-symbol">${opSymbol}</span>
                        <span class="bits">${fmtB}</span>
                        <span class="dec-label">(B = ${numB})</span>
                    </div>
                    <hr class="paper-divider">
                    <div class="paper-row result-row">
                        <span class="op-symbol">=</span>
                        <span class="bits">${fmtR}</span>
                        <span class="dec-label">(Q = ${quotient}, R = ${remainder})</span>
                    </div>
                </div>
                <div class="working-explanation">
                    <strong>How it works:</strong> Binary division uses repeated subtraction. Divide A by B:
                    <br>Quotient = ${quotient}, Remainder = ${remainder}
                    <br>${numA} ÷ ${numB} = ${quotient} remainder ${remainder}
                </div>
            `;
        }
    }

    function renderWorkingError(msg) {
        if (!workingBody) return;
        workingBody.innerHTML = `<div class="working-explanation">${msg}</div>`;
    }

    // Mode toggles for Arithmetic (Binary | Decimal)
    const arithModeBtns = document.querySelectorAll('.mode-btn[data-arith-input]');
    arithModeBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const inputTarget = btn.getAttribute('data-arith-input');
            const selectedMode = btn.getAttribute('data-mode');

            document.querySelectorAll(`.mode-btn[data-arith-input="${inputTarget}"]`).forEach(b => b.classList.remove('active'));
            btn.classList.add('active');

            if (inputTarget === 'a') {
                if (arithModeA !== selectedMode) {
                    const currentVal = arithInputA.value.trim().replace(/\s+/g, '');
                    if (selectedMode === 'dec') {
                        arithInputA.value = /^[01]{1,16}$/.test(currentVal) ? binToSigned16(currentVal) : '5';
                    } else {
                        arithInputA.value = formatBin16(decToBin16(currentVal));
                    }
                    arithModeA = selectedMode;
                }
            } else if (inputTarget === 'b') {
                if (arithModeB !== selectedMode) {
                    const currentVal = arithInputB.value.trim().replace(/\s+/g, '');
                    if (selectedMode === 'dec') {
                        arithInputB.value = /^[01]{1,16}$/.test(currentVal) ? binToSigned16(currentVal) : '3';
                    } else {
                        arithInputB.value = formatBin16(decToBin16(currentVal));
                    }
                    arithModeB = selectedMode;
                }
            }

            updateArithmeticModule();
        });
    });

    function parseArithOperand(valueStr, mode) {
        if (!valueStr) return { valid: false, bin: '0000000000000000', dec: 0 };

        if (mode === 'bin') {
            const clean = valueStr.replace(/\s+/g, '');
            const isValid = /^[01]{1,16}$/.test(clean);
            if (!isValid) return { valid: false, bin: '0000000000000000', dec: 0 };
            const bin = pad16(clean);
            const dec = binToSigned16(bin);
            return { valid: true, bin, dec };
        } else {
            const num = parseInt(valueStr, 10);
            if (isNaN(num) || num < -32768 || num > 65535) {
                return { valid: false, bin: '0000000000000000', dec: 0 };
            }
            const bin = decToBin16(num);
            return { valid: true, bin, dec: num };
        }
    }

    function updateArithmeticModule() {
        const rawA = arithInputA.value.trim();
        const rawB = arithInputB.value.trim();

        const opA = parseArithOperand(rawA, arithModeA);
        const opB = parseArithOperand(rawB, arithModeB);

        arithErrA.classList.toggle('visible', !opA.valid);
        arithErrB.classList.toggle('visible', !opB.valid);

        arithInputA.classList.toggle('invalid', !opA.valid);
        arithInputB.classList.toggle('invalid', !opB.valid);

        // 16-Bit Interactive bit strips
        renderBitStrip16('bit-strip-arith-a', opA.bin, (updatedBin) => {
            if (arithModeA === 'bin') {
                arithInputA.value = formatBin16(updatedBin);
            } else {
                arithInputA.value = binToSigned16(updatedBin);
            }
            updateArithmeticModule();
        });

        renderBitStrip16('bit-strip-arith-b', opB.bin, (updatedBin) => {
            if (arithModeB === 'bin') {
                arithInputB.value = formatBin16(updatedBin);
            } else {
                arithInputB.value = binToSigned16(updatedBin);
            }
            updateArithmeticModule();
        });

        arithDecA.textContent = opA.dec;
        arithDecB.textContent = opB.dec;

        if (!opA.valid || !opB.valid) {
            arithResBin.textContent = '----';
            arithStatusBadge.textContent = 'Invalid Input';
            arithStatusBadge.style.background = '#FEF2F2';
            arithStatusBadge.style.color = '#B91C1C';
            arithOverflowAlert.classList.add('hidden');
            arithExplanation.textContent = 'Please enter valid 16-bit inputs (Binary: 0s & 1s up to 16 bits, or Decimal: -32768 to 65535).';
            renderWorkingError('Enter valid operands to see step-by-step binary working.');
            return;
        }

        const numA = opA.dec;
        const numB = opB.dec;
        const binA = opA.bin;
        const binB = opB.bin;

        // Perform 16-Bit Arithmetic
        let rawResult = 0;
        let isDivZero = false;
        let opSymbol = '+';
        let opName = 'Addition';

        if (currentArithOp === 'add') {
            rawResult = numA + numB;
            opSymbol = '+';
            opName = 'Addition';
        } else if (currentArithOp === 'sub') {
            rawResult = numA - numB;
            opSymbol = '−';
            opName = 'Subtraction';
        } else if (currentArithOp === 'mul') {
            rawResult = numA * numB;
            opSymbol = '×';
            opName = 'Multiplication';
        } else if (currentArithOp === 'div') {
            opSymbol = '÷';
            opName = 'Division';
            if (numB === 0) {
                isDivZero = true;
            } else {
                rawResult = Math.trunc(numA / numB);
            }
        }

        if (isDivZero) {
            arithResBin.textContent = 'ERR: DIV 0';
            arithStatusBadge.textContent = 'Error: Divide by Zero';
            arithStatusBadge.style.background = '#FEF2F2';
            arithStatusBadge.style.color = '#B91C1C';
            arithOverflowAlert.classList.remove('hidden');
            arithAlertText.textContent = 'Error: Cannot divide a number by zero!';
            arithExplanation.textContent = `Attempted ${numA} ÷ 0. Division by zero is undefined.`;
            renderWorkingError('<strong>Error:</strong> Division by zero is undefined. Please enter a non-zero divisor.');
            return;
        }

        // 16-bit Signed Range is -32768 to 32767
        const isOverflow = rawResult < -32768 || rawResult > 32767;

        // Truncate to 16 bits
        const truncatedBin = decToBin16(rawResult);
        const signedRes = binToSigned16(truncatedBin);

        arithResBin.textContent = formatBin16(truncatedBin);

        if (isOverflow) {
            arithStatusBadge.textContent = 'Overflow Truncated (16-Bit)';
            arithStatusBadge.style.background = '#FEF2F2';
            arithStatusBadge.style.color = '#B91C1C';
            arithOverflowAlert.classList.remove('hidden');
            arithAlertText.textContent = `Overflow Warning: Calculation result (${rawResult}) exceeds signed 16-bit range [-32768, 32767]. Truncated to 16 bits!`;
        } else {
            arithStatusBadge.textContent = 'Valid 16-Bit Result';
            arithStatusBadge.style.background = '#ECFDF5';
            arithStatusBadge.style.color = '#047857';
            arithOverflowAlert.classList.add('hidden');
        }

        arithExplanation.innerHTML = `
            <strong>Operation Breakdown (${opName}):</strong> ${numA} ${opSymbol} ${numB} = ${rawResult}${isOverflow ? ` (Truncated to 16-bit 2's comp: ${signedRes})` : ''}.
            <br><span style="font-family: var(--font-mono); font-size: 0.85rem; color: #475569;">Binary: ${formatBin16(binA)} ${opSymbol} ${formatBin16(binB)} = ${formatBin16(truncatedBin)}</span>
        `;

        // Render step-by-step working
        renderWorkingSteps(binA, binB, truncatedBin, numA, numB, rawResult, opSymbol, opName, currentArithOp);
    }

    // 1-Click Screenshot Capture & Download
    if (arithScreenshotBtn) {
        arithScreenshotBtn.addEventListener('click', () => {
            const targetCard = document.getElementById('arith-result-card');
            if (!targetCard) return;

            const origHtml = arithScreenshotBtn.innerHTML;
            arithScreenshotBtn.innerHTML = `
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="animation: spin 1s linear infinite;"><circle cx="12" cy="12" r="10"></circle><path d="M12 2a10 10 0 0 1 10 10"></path></svg>
                Capturing...
            `;
            arithScreenshotBtn.disabled = true;

            if (typeof html2canvas === 'function') {
                html2canvas(targetCard, {
                    scale: 2,
                    backgroundColor: '#FFFFFF',
                    useCORS: true
                }).then(canvas => {
                    const link = document.createElement('a');
                    link.download = `arithmetic_16bit_calculation_${Date.now()}.png`;
                    link.href = canvas.toDataURL('image/png');
                    link.click();

                    arithScreenshotBtn.innerHTML = `
                        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="20 6 9 17 4 12"></polyline></svg>
                        Saved PNG!
                    `;
                    arithScreenshotBtn.classList.add('success');
                    setTimeout(() => {
                        arithScreenshotBtn.innerHTML = origHtml;
                        arithScreenshotBtn.classList.remove('success');
                        arithScreenshotBtn.disabled = false;
                    }, 2000);
                }).catch(err => {
                    console.error('Screenshot capture failed:', err);
                    arithScreenshotBtn.innerHTML = origHtml;
                    arithScreenshotBtn.disabled = false;
                });
            } else {
                alert('Screenshot library is loading. Please try again.');
                arithScreenshotBtn.innerHTML = origHtml;
                arithScreenshotBtn.disabled = false;
            }
        });
    }

    arithOpBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            arithOpBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            currentArithOp = btn.getAttribute('data-op');
            updateArithmeticModule();
        });
    });

    arithInputA.addEventListener('input', updateArithmeticModule);
    arithInputB.addEventListener('input', updateArithmeticModule);
    arithClearA.addEventListener('click', () => { 
        arithInputA.value = arithModeA === 'bin' ? formatBin16('0') : '0'; 
        updateArithmeticModule(); 
    });
    arithClearB.addEventListener('click', () => { 
        arithInputB.value = arithModeB === 'bin' ? formatBin16('0') : '0'; 
        updateArithmeticModule(); 
    });
    if (arithCalcBtn) arithCalcBtn.addEventListener('click', updateArithmeticModule);


    // ----------------------------------------------------------------------
    // 4. MODULE 2: BITWISE OPERATIONS LOGIC (4-Bit)
    // ----------------------------------------------------------------------
    const bitInputA = document.getElementById('bit-input-a');
    const bitInputB = document.getElementById('bit-input-b');
    const bitErrA = document.getElementById('bit-err-a');
    const bitErrB = document.getElementById('bit-err-b');
    const bitPrevBinA = document.getElementById('bit-prev-bin-a');
    const bitPrevBinB = document.getElementById('bit-prev-bin-b');
    const bitPrevDecA = document.getElementById('bit-prev-dec-a');
    const bitPrevDecB = document.getElementById('bit-prev-dec-b');

    const bitGateBtns = document.querySelectorAll('.gate-btn');
    const bitwiseCardB = document.getElementById('bitwise-card-b');
    const activeGateName = document.getElementById('active-gate-name');

    const bitwiseResBin = document.getElementById('bitwise-res-bin');
    const bitLogicTable = document.getElementById('bit-logic-table');

    let currentGate = 'AND';
    let modeA = 'bin'; // 'bin' or 'dec'
    let modeB = 'bin'; // 'bin' or 'dec'

    const modeBtns = document.querySelectorAll('.mode-btn[data-input]');
    modeBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const inputTarget = btn.getAttribute('data-input');
            const selectedMode = btn.getAttribute('data-mode');

            document.querySelectorAll(`.mode-btn[data-input="${inputTarget}"]`).forEach(b => b.classList.remove('active'));
            btn.classList.add('active');

            if (inputTarget === 'a') {
                if (modeA !== selectedMode) {
                    const currentVal = bitInputA.value.trim();
                    if (selectedMode === 'dec') {
                        bitInputA.value = /^[01]{1,4}$/.test(currentVal) ? binToSigned4(currentVal) : '12';
                    } else {
                        bitInputA.value = decToBin4(currentVal);
                    }
                    modeA = selectedMode;
                }
            } else if (inputTarget === 'b') {
                if (modeB !== selectedMode) {
                    const currentVal = bitInputB.value.trim();
                    if (selectedMode === 'dec') {
                        bitInputB.value = /^[01]{1,4}$/.test(currentVal) ? binToSigned4(currentVal) : '10';
                    } else {
                        bitInputB.value = decToBin4(currentVal);
                    }
                    modeB = selectedMode;
                }
            }

            updateBitwiseModule();
        });
    });

    function parseBitwiseOperand(valueStr, mode) {
        if (!valueStr) return { valid: false, bin: '0000', dec: 0 };

        if (mode === 'bin') {
            const isValid = /^[01]{1,4}$/.test(valueStr);
            if (!isValid) return { valid: false, bin: '0000', dec: 0 };
            const bin = pad4(valueStr);
            const dec = binToSigned4(bin);
            return { valid: true, bin, dec };
        } else {
            const num = parseInt(valueStr, 10);
            if (isNaN(num) || num < -8 || num > 15) {
                return { valid: false, bin: '0000', dec: 0 };
            }
            const bin = decToBin4(num);
            return { valid: true, bin, dec: num };
        }
    }

    function updateBitwiseModule() {
        const isUnary = currentGate === 'NOT';

        if (isUnary) {
            bitwiseCardB.classList.add('disabled');
        } else {
            bitwiseCardB.classList.remove('disabled');
        }

        const opA = parseBitwiseOperand(bitInputA.value.trim(), modeA);
        const opB = parseBitwiseOperand(bitInputB.value.trim(), modeB);

        bitErrA.classList.toggle('visible', !opA.valid);
        bitErrB.classList.toggle('visible', !opB.valid && !isUnary);

        bitInputA.classList.toggle('invalid', !opA.valid);
        bitInputB.classList.toggle('invalid', !opB.valid && !isUnary);

        // Previews
        bitPrevBinA.textContent = opA.bin;
        bitPrevDecA.textContent = opA.dec;

        bitPrevBinB.textContent = opB.bin;
        bitPrevDecB.textContent = opB.dec;

        // Render Strips
        renderBitStrip('bit-strip-bitwise-a', opA.bin, (updatedBin) => {
            if (modeA === 'bin') bitInputA.value = updatedBin;
            else bitInputA.value = binToSigned4(updatedBin);
            updateBitwiseModule();
        });

        renderBitStrip('bit-strip-bitwise-b', opB.bin, (updatedBin) => {
            if (modeB === 'bin') bitInputB.value = updatedBin;
            else bitInputB.value = binToSigned4(updatedBin);
            updateBitwiseModule();
        });

        if (!opA.valid || (!opB.valid && !isUnary)) {
            bitwiseResBin.textContent = '----';
            bitLogicTable.innerHTML = '<tr><td>Invalid input data.</td></tr>';
            return;
        }

        const binA = opA.bin;
        const binB = opB.bin;

        let resBinArr = [];

        for (let i = 0; i < 4; i++) {
            const bA = parseInt(binA[i], 10);
            const bB = parseInt(binB[i], 10);
            let bOut = 0;

            switch (currentGate) {
                case 'AND': bOut = bA & bB; break;
                case 'OR': bOut = bA | bB; break;
                case 'XOR': bOut = bA ^ bB; break;
                case 'NOT': bOut = bA === 1 ? 0 : 1; break;
                case 'NAND': bOut = (bA & bB) === 1 ? 0 : 1; break;
                case 'NOR': bOut = (bA | bB) === 1 ? 0 : 1; break;
                case 'XNOR': bOut = (bA ^ bB) === 1 ? 0 : 1; break;
            }

            resBinArr.push(bOut.toString());
        }

        const resBinStr = resBinArr.join('');

        bitwiseResBin.textContent = resBinStr;
        activeGateName.textContent = currentGate;

        // Render 4-Bit Truth Table
        renderBitLogicTable(binA, binB, resBinStr, currentGate, isUnary);

        // Render Gate Diagram
        renderGateDiagram(binA, binB, resBinStr, currentGate, isUnary);
    }

    // Gate SVG templates for the large diagram display
    const gateSvgTemplates = {
        AND: `<svg viewBox="0 0 120 80" width="120" height="80">
            <line x1="0" y1="25" x2="25" y2="25" stroke="currentColor" stroke-width="3"/>
            <line x1="0" y1="55" x2="25" y2="55" stroke="currentColor" stroke-width="3"/>
            <path d="M25 10 L55 10 A30 30 0 0 1 55 70 L25 70 Z" fill="rgba(5,150,105,0.1)" stroke="currentColor" stroke-width="3" stroke-linejoin="round"/>
            <line x1="85" y1="40" x2="120" y2="40" stroke="currentColor" stroke-width="3"/>
        </svg>`,
        OR: `<svg viewBox="0 0 120 80" width="120" height="80">
            <line x1="0" y1="25" x2="30" y2="25" stroke="currentColor" stroke-width="3"/>
            <line x1="0" y1="55" x2="30" y2="55" stroke="currentColor" stroke-width="3"/>
            <path d="M25 10 Q40 40 25 70 Q55 70 85 40 Q55 10 25 10 Z" fill="rgba(5,150,105,0.1)" stroke="currentColor" stroke-width="3"/>
            <line x1="85" y1="40" x2="120" y2="40" stroke="currentColor" stroke-width="3"/>
        </svg>`,
        XOR: `<svg viewBox="0 0 120 80" width="120" height="80">
            <line x1="0" y1="25" x2="30" y2="25" stroke="currentColor" stroke-width="3"/>
            <line x1="0" y1="55" x2="30" y2="55" stroke="currentColor" stroke-width="3"/>
            <path d="M18 10 Q33 40 18 70" fill="none" stroke="currentColor" stroke-width="3"/>
            <path d="M25 10 Q40 40 25 70 Q55 70 85 40 Q55 10 25 10 Z" fill="rgba(5,150,105,0.1)" stroke="currentColor" stroke-width="3"/>
            <line x1="85" y1="40" x2="120" y2="40" stroke="currentColor" stroke-width="3"/>
        </svg>`,
        NOT: `<svg viewBox="0 0 120 80" width="120" height="80">
            <line x1="0" y1="40" x2="25" y2="40" stroke="currentColor" stroke-width="3"/>
            <path d="M25 15 L25 65 L80 40 Z" fill="rgba(5,150,105,0.1)" stroke="currentColor" stroke-width="3" stroke-linejoin="round"/>
            <circle cx="86" cy="40" r="6" fill="rgba(5,150,105,0.1)" stroke="currentColor" stroke-width="3"/>
            <line x1="92" y1="40" x2="120" y2="40" stroke="currentColor" stroke-width="3"/>
        </svg>`,
        NAND: `<svg viewBox="0 0 120 80" width="120" height="80">
            <line x1="0" y1="25" x2="25" y2="25" stroke="currentColor" stroke-width="3"/>
            <line x1="0" y1="55" x2="25" y2="55" stroke="currentColor" stroke-width="3"/>
            <path d="M25 10 L50 10 A30 30 0 0 1 50 70 L25 70 Z" fill="rgba(5,150,105,0.1)" stroke="currentColor" stroke-width="3" stroke-linejoin="round"/>
            <circle cx="86" cy="40" r="6" fill="rgba(5,150,105,0.1)" stroke="currentColor" stroke-width="3"/>
            <line x1="92" y1="40" x2="120" y2="40" stroke="currentColor" stroke-width="3"/>
        </svg>`,
        NOR: `<svg viewBox="0 0 120 80" width="120" height="80">
            <line x1="0" y1="25" x2="30" y2="25" stroke="currentColor" stroke-width="3"/>
            <line x1="0" y1="55" x2="30" y2="55" stroke="currentColor" stroke-width="3"/>
            <path d="M25 10 Q40 40 25 70 Q55 70 82 40 Q55 10 25 10 Z" fill="rgba(5,150,105,0.1)" stroke="currentColor" stroke-width="3"/>
            <circle cx="88" cy="40" r="6" fill="rgba(5,150,105,0.1)" stroke="currentColor" stroke-width="3"/>
            <line x1="94" y1="40" x2="120" y2="40" stroke="currentColor" stroke-width="3"/>
        </svg>`,
        XNOR: `<svg viewBox="0 0 120 80" width="120" height="80">
            <line x1="0" y1="25" x2="30" y2="25" stroke="currentColor" stroke-width="3"/>
            <line x1="0" y1="55" x2="30" y2="55" stroke="currentColor" stroke-width="3"/>
            <path d="M18 10 Q33 40 18 70" fill="none" stroke="currentColor" stroke-width="3"/>
            <path d="M25 10 Q40 40 25 70 Q55 70 82 40 Q55 10 25 10 Z" fill="rgba(5,150,105,0.1)" stroke="currentColor" stroke-width="3"/>
            <circle cx="88" cy="40" r="6" fill="rgba(5,150,105,0.1)" stroke="currentColor" stroke-width="3"/>
            <line x1="94" y1="40" x2="120" y2="40" stroke="currentColor" stroke-width="3"/>
        </svg>`
    };

    function renderGateDiagram(binA, binB, resBin, gateName, isUnary) {
        const diagramCanvas = document.getElementById('gate-diagram-canvas');
        if (!diagramCanvas) return;

        const gateSvg = gateSvgTemplates[gateName] || gateSvgTemplates['AND'];

        const inputsHtml = isUnary
            ? `<div class="diagram-inputs">
                   <div class="input-label">A: ${binA}</div>
               </div>`
            : `<div class="diagram-inputs">
                   <div class="input-label">A: ${binA}</div>
                   <div class="input-label">B: ${binB}</div>
               </div>`;

        diagramCanvas.innerHTML = `
            <div class="diagram-wrapper">
                ${inputsHtml}
                <div class="diagram-gate-svg">
                    ${gateSvg}
                    <div class="diagram-gate-name">${gateName} Gate</div>
                </div>
                <div class="diagram-output">
                    <div class="output-label">OUT: ${resBin}</div>
                </div>
            </div>
        `;
    }

    function renderBitLogicTable(binA, binB, resBin, gateName, isUnary) {
        let html = '<thead><tr><th>Bit Position</th>';
        for (let i = 3; i >= 0; i--) {
            html += `<th>b${i}</th>`;
        }
        html += '</tr></thead><tbody>';

        // Row A
        html += '<tr><td><strong>Operand A</strong></td>';
        for (let i = 0; i < 4; i++) html += `<td>${binA[i]}</td>`;
        html += '</tr>';

        // Row B (if not NOT)
        if (!isUnary) {
            html += '<tr><td><strong>Operand B</strong></td>';
            for (let i = 0; i < 4; i++) html += `<td>${binB[i]}</td>`;
            html += '</tr>';
        }

        // Result Row
        html += `<tr class="res-row"><td><strong>Result (${gateName})</strong></td>`;
        for (let i = 0; i < 4; i++) html += `<td>${resBin[i]}</td>`;
        html += '</tr></tbody>';

        bitLogicTable.innerHTML = html;
    }

    bitGateBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            bitGateBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            currentGate = btn.getAttribute('data-gate');
            updateBitwiseModule();
        });
    });

    bitInputA.addEventListener('input', updateBitwiseModule);
    bitInputB.addEventListener('input', updateBitwiseModule);


    // ----------------------------------------------------------------------
    // 5. MODULE 3: CONVERSION OF NUMBERS LOGIC (Variable Bit Length + Hex A–F)
    // ----------------------------------------------------------------------
    const convDecInput    = document.getElementById('conv-dec-input');
    const convErrMsg      = document.getElementById('conv-err-msg');
    const convValBin      = document.getElementById('conv-val-bin');
    const convValOct      = document.getElementById('conv-val-oct');
    const convValHex      = document.getElementById('conv-val-hex');
    const convNibbleGrid  = document.getElementById('conv-nibble-grid');
    const convRangeHint   = document.getElementById('conv-range-hint');
    const convInputLabel  = document.getElementById('conv-input-label');
    const convBinSubtext  = document.getElementById('conv-bin-subtext');
    const convBreakTitle  = document.getElementById('conv-breakdown-title');
    const convModuleTitle = document.getElementById('conv-module-title');
    const convHexPad      = document.getElementById('conv-hex-pad');
    const convBitstripLbl = document.getElementById('conv-bitstrip-label');

    // State
    let convBitWidth  = 4;   // any integer 1–32
    let convInputMode = 'dec'; // 'dec' | 'hex' | 'bin'

    // Hex letter map: A=10 … F=15
    const HEX_MAP = { A:10, B:11, C:12, D:13, E:14, F:15,
                      a:10, b:11, c:12, d:13, e:14, f:15 };

    // Bit-width helpers — use Number for ≤30 bits, BigInt for 31–32
    function convMaxUnsignedN() {
        if (convBitWidth <= 30) return (1 << convBitWidth) - 1;
        return Number((BigInt(1) << BigInt(convBitWidth)) - BigInt(1));
    }
    function convMinSignedN()   {
        if (convBitWidth <= 30) return -(1 << (convBitWidth - 1));
        return -Number(BigInt(1) << BigInt(convBitWidth - 1));
    }
    function convMaxUnsigned() { return convMaxUnsignedN(); }
    function convMinSigned()   { return convMinSignedN(); }

    function convPad(str) {
        let clean = (str || '').replace(/[^01]/g, '');
        if (clean.length > convBitWidth) clean = clean.slice(-convBitWidth);
        return clean.padStart(convBitWidth, '0');
    }
    function convDecToBin(decNum) {
        let val = parseInt(decNum, 10);
        if (isNaN(val)) return '0'.repeat(convBitWidth);
        // Handle via BigInt for correctness across all widths
        const bigMask = (BigInt(1) << BigInt(convBitWidth)) - BigInt(1);
        let bigVal = BigInt(Math.trunc(val));
        bigVal = bigVal & bigMask;
        return bigVal.toString(2).padStart(convBitWidth, '0');
    }
    function convBinToUnsigned(binStr) {
        const p = convPad(binStr);
        // Use BigInt for large widths to avoid JS bitwise 32-bit limit
        return Number(BigInt('0b' + p));
    }
    function convBinToSigned(binStr) {
        const u = convBinToUnsigned(binStr);
        const signBit = Number(BigInt(1) << BigInt(convBitWidth - 1));
        return u >= signBit ? u - signBit * 2 : u;
    }

    // Format binary with spaces every 4 bits
    function convFormatBin(binStr) {
        const p = convPad(binStr);
        return p.match(/.{1,4}/g).join(' ');
    }

    // Dynamic bit-strip renderer (any width)
    function renderConvBitStrip(binStr, onToggle) {
        const container = document.getElementById('bit-strip-conv');
        if (!container) return;
        container.innerHTML = '';
        const padded = convPad(binStr);
        // Choose size class: ≤8 normal, ≤16 small, >16 tiny
        const sizeClass = convBitWidth <= 8 ? '' : convBitWidth <= 16 ? 'bit-box-16' : 'bit-box-tiny';
        for (let i = 0; i < convBitWidth; i++) {
            const bitVal  = padded[i];
            const bitIdx  = convBitWidth - 1 - i;
            const bitBox  = document.createElement('div');
            bitBox.className = `bit-box ${sizeClass} ${bitVal === '1' ? 'active-one' : ''}`;
            bitBox.setAttribute('title', `Bit ${bitIdx} (2^${bitIdx} = ${Math.pow(2, bitIdx)})`);
            bitBox.innerHTML = `<span class="bit-val">${bitVal}</span><span class="bit-idx">b${bitIdx}</span>`;
            bitBox.addEventListener('click', () => {
                const bits = padded.split('');
                bits[i] = bits[i] === '1' ? '0' : '1';
                onToggle(bits.join(''));
            });
            container.appendChild(bitBox);
        }
    }

    // Parse whatever the user typed depending on current mode
    function parseConvInput(raw) {
        if (!raw) return { valid: false, num: 0 };
        const str = raw.trim().toUpperCase();

        if (convInputMode === 'hex') {
            // Allow "0x" prefix or bare hex: any length up to 8 hex chars
            const clean = str.replace(/^0X/, '');
            if (!/^[0-9A-F]{1,8}$/.test(clean)) return { valid: false, num: 0 };
            const num = parseInt(clean, 16);
            if (num < 0 || num > convMaxUnsigned()) return { valid: false, num };
            return { valid: true, num };
        }

        if (convInputMode === 'bin') {
            if (!/^[01]{1,32}$/.test(str)) return { valid: false, num: 0 };
            const num = convBinToSigned(str);
            return { valid: true, num };
        }

        // decimal mode — also allow single hex letters A-F as shorthand
        if (/^[A-F]$/.test(str)) {
            const num = HEX_MAP[str];
            if (num > convMaxUnsigned()) return { valid: false, num };
            return { valid: true, num };
        }
        const num = parseInt(str, 10);
        if (isNaN(num)) return { valid: false, num: 0 };
        const inRange = num >= convMinSigned() && num <= convMaxUnsigned();
        return { valid: inRange, num };
    }

    // Update all output fields given a resolved integer
    function renderConvOutputs(num) {
        const binStr   = convDecToBin(num);
        const unsigned = convBinToUnsigned(binStr);
        const octStr   = '0' + unsigned.toString(8);
        const hexStr   = '0x' + unsigned.toString(16).toUpperCase();
        const hexLetter = unsigned <= 15 ? unsigned.toString(16).toUpperCase() : '';

        convValBin.textContent = convFormatBin(binStr);
        convValOct.textContent = octStr;
        convValHex.textContent = hexStr + (hexLetter && unsigned < 16 ? ` (${hexLetter})` : '');

        // Bit strip
        renderConvBitStrip(binStr, (updatedBin) => {
            const updatedNum = convInputMode === 'bin'
                ? updatedBin
                : convBinToSigned(updatedBin).toString();
            convDecInput.value = convInputMode === 'hex'
                ? convBinToUnsigned(updatedBin).toString(16).toUpperCase()
                : updatedNum;
            updateConversionModule();
        });

        // Breakdown nibbles
        let nibbleHtml = '';
        const bitsPerNibble = 4;
        const nibbleCount = Math.ceil(convBitWidth / bitsPerNibble);
        const padded = convPad(binStr);
        for (let n = 0; n < nibbleCount; n++) {
            const start   = n * bitsPerNibble;
            const chunk   = padded.slice(start, start + bitsPerNibble);
            const nibVal  = parseInt(chunk, 2);
            const bitHigh = convBitWidth - 1 - (n * bitsPerNibble);
            const bitLow  = bitHigh - (bitsPerNibble - 1);
            const nibHex  = nibVal.toString(16).toUpperCase();
            nibbleHtml += `
                <div class="nibble-card">
                    <div class="nibble-title">Nibble ${n+1} — Bits ${bitHigh}–${bitLow}</div>
                    <div class="nibble-val" style="font-size: 1.4rem; letter-spacing:0.1em;">${chunk}</div>
                    <div class="nibble-hex">Dec: ${nibVal} | Hex: ${nibHex}${nibVal >= 10 ? ` (${['','','','','','','','','','','A','B','C','D','E','F'][nibVal]})` : ''}</div>
                </div>`;
        }
        convNibbleGrid.innerHTML = nibbleHtml;
    }

    function updateConversionModule() {
        const raw = convDecInput.value;
        const { valid, num } = parseConvInput(raw);

        convErrMsg.classList.toggle('visible', !valid && raw.trim().length > 0);
        convDecInput.classList.toggle('invalid', !valid && raw.trim().length > 0);

        if (!valid) {
            convValBin.textContent = '----';
            convValOct.textContent = '---';
            convValHex.textContent = '0x-';
            convNibbleGrid.innerHTML = '';
            return;
        }
        renderConvOutputs(num);
    }

    // --- Shared helper: apply a new bit-width and refresh ---
    function applyBitWidth(newWidth) {
        convBitWidth = Math.max(1, Math.min(32, newWidth));

        // Sync numeric input
        const bwInput = document.getElementById('conv-bit-width-input');
        if (bwInput) bwInput.value = convBitWidth;

        // Sync preset chip active state
        document.querySelectorAll('.bit-preset-btn').forEach(b => {
            b.classList.toggle('active', parseInt(b.getAttribute('data-bits'), 10) === convBitWidth);
        });

        // Update labels
        const maxU = convMaxUnsigned();
        const minS = convMinSigned();
        if (convModuleTitle) convModuleTitle.textContent = `${convBitWidth}-Bit Number Base Conversions`;
        if (convRangeHint)   convRangeHint.textContent   = `${convBitWidth}-Bit | Unsigned: 0 – ${maxU} | Signed: ${minS} – ${maxU - Math.floor(maxU/2)}`;
        if (convBinSubtext)  convBinSubtext.textContent  = `${convBitWidth}-Bit Zero-Padded / 2's Complement`;
        if (convBreakTitle)  convBreakTitle.textContent  = `${convBitWidth}-Bit Binary Breakdown`;
        if (convBitstripLbl) convBitstripLbl.textContent = `Interactive ${convBitWidth}-Bit Switch (Updates Value Live):`;

        convDecInput.value = '0';
        updateConversionModule();
    }

    // --- Free numeric input ---
    const bitWidthInput = document.getElementById('conv-bit-width-input');
    if (bitWidthInput) {
        bitWidthInput.addEventListener('change', () => {
            const v = parseInt(bitWidthInput.value, 10);
            if (!isNaN(v) && v >= 1 && v <= 32) applyBitWidth(v);
            else bitWidthInput.value = convBitWidth; // revert invalid
        });
        bitWidthInput.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') bitWidthInput.dispatchEvent(new Event('change'));
        });
    }

    // --- Preset chips ---
    document.querySelectorAll('.bit-preset-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            applyBitWidth(parseInt(btn.getAttribute('data-bits'), 10));
        });
    });

    // --- Input mode toggle (Decimal / Hex / Binary) ---
    const convModeBtns = document.querySelectorAll('.conv-mode-btn');
    convModeBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            convModeBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            convInputMode = btn.getAttribute('data-conv-mode');

            // Show/hide hex A–F quick-pad
            if (convHexPad) {
                convHexPad.style.display = (convInputMode === 'hex') ? '' : 'none';
            }

            // Update placeholder & label
            const placeholders = {
                dec: 'e.g. 12 or A (=10)',
                hex: 'e.g. C or 0xF or 1A',
                bin: 'e.g. 1100 or 11001010'
            };
            convDecInput.placeholder = placeholders[convInputMode] || '';
            convDecInput.value = '';
            updateConversionModule();
        });
    });

    // --- Hex A–F quick pad buttons ---
    document.querySelectorAll('.hex-pad-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            convDecInput.value = btn.getAttribute('data-hex');
            updateConversionModule();
        });
    });

    if (convDecInput) {
        convDecInput.addEventListener('input', updateConversionModule);
    }

    // Copy to clipboard feature
    const copyBtns = document.querySelectorAll('.copy-btn');
    copyBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const targetId = btn.getAttribute('data-copy');
            const targetElem = document.getElementById(targetId);
            if (targetElem) {
                const textToCopy = targetElem.textContent.replace(/\s+/g, '');
                navigator.clipboard.writeText(textToCopy).then(() => {
                    const origText = btn.textContent;
                    btn.textContent = 'Copied!';
                    btn.style.background = '#10B981';
                    btn.style.color = '#FFFFFF';
                    setTimeout(() => {
                        btn.textContent = origText;
                        btn.style.background = '';
                        btn.style.color = '';
                    }, 1500);
                });
            }
        });
    });


    // ----------------------------------------------------------------------
    // 6. MODULE 4: BCD • EXCESS-3 CONVERTER
    // ----------------------------------------------------------------------
    const bcdInput = document.getElementById('bcd-input-field');
    const bcdClear = document.getElementById('bcd-clear');
    const bcdErrMsg = document.getElementById('bcd-err-msg');
    const bcdResultDisplay = document.getElementById('bcd-result-display');
    const bcdNibbleMap = document.getElementById('bcd-nibble-map');
    const bcdDirBtns = document.querySelectorAll('.dir-btn[data-bcd-dir]');
    const bcdInputLabel = document.getElementById('bcd-input-label');
    const bcdResTitle = document.getElementById('bcd-res-title');
    const bcdTableBody = document.getElementById('bcd-table-body');

    let bcdDirection = 'bcd2xs3'; // 'bcd2xs3' or 'xs32bcd'

    // Populate BCD Reference Table
    function initBcdTable() {
        if (!bcdTableBody) return;
        let html = '';
        for (let i = 0; i < 16; i++) {
            const bcdBin = i.toString(2).padStart(4, '0');
            const isValidBcd = i <= 9;
            const xs3Str = isValidBcd ? (i + 3).toString(2).padStart(4, '0') : 'XXXX';
            const statusLabel = isValidBcd 
                ? '<span class="status-badge-table status-valid">Valid BCD</span>' 
                : '<span class="status-badge-table status-invalid">Don\'t Care (X)</span>';
            
            html += `
                <tr id="bcd-row-${i}" data-val="${i}">
                    <td><strong>${i}</strong></td>
                    <td class="mono">${bcdBin}</td>
                    <td class="mono">${xs3Str}</td>
                    <td>${statusLabel}</td>
                </tr>
            `;
        }
        bcdTableBody.innerHTML = html;
    }
    initBcdTable();

    bcdDirBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            bcdDirBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            bcdDirection = btn.getAttribute('data-bcd-dir');

            if (bcdDirection === 'bcd2xs3') {
                bcdInputLabel.textContent = 'Enter BCD Code (up to 4 bits):';
                bcdResTitle.textContent = 'Excess-3 Output Code';
            } else {
                bcdInputLabel.textContent = 'Enter Excess-3 Code (up to 4 bits):';
                bcdResTitle.textContent = 'BCD Output Code';
            }

            updateBcdModule();
        });
    });

    if (bcdClear) {
        bcdClear.addEventListener('click', () => {
            bcdInput.value = '0000';
            updateBcdModule();
        });
    }

    function updateBcdModule() {
        const rawStr = bcdInput.value.trim().replace(/\s+/g, '');
        const isValid = /^[01]{1,4}$/.test(rawStr);

        bcdErrMsg.classList.toggle('visible', !isValid && rawStr.length > 0);
        bcdInput.classList.toggle('invalid', !isValid && rawStr.length > 0);

        // Highlight table row helper
        document.querySelectorAll('#bcd-table-body tr').forEach(r => r.classList.remove('active-row-bcd'));

        if (!isValid || rawStr.length === 0) {
            bcdResultDisplay.textContent = '----';
            bcdNibbleMap.innerHTML = '<div style="font-size:0.85rem; color:#64748B;">Enter a valid 4-bit binary value.</div>';
            return;
        }

        const nib = rawStr.padStart(4, '0');
        const val = parseInt(nib, 2);
        let outNib = '';
        let isInvalidBcd = false;

        // Render interactive bit switch
        renderBitStrip('bit-strip-bcd', nib, (updatedBin) => {
            bcdInput.value = updatedBin;
            updateBcdModule();
        });

        if (bcdDirection === 'bcd2xs3') {
            // BCD -> Excess 3 (Add 3)
            // Values 1010 to 1111 (10-15) are Don't Care (X)
            if (val > 9) {
                isInvalidBcd = true;
                outNib = 'XXXX';
            } else {
                outNib = (val + 3).toString(2).padStart(4, '0');
            }
            // Highlight row in reference table
            const rowElem = document.getElementById(`bcd-row-${val}`);
            if (rowElem) rowElem.classList.add('active-row-bcd');
        } else {
            // Excess-3 -> BCD (Subtract 3)
            // Values < 3 or > 12 are Don't Care (X)
            if (val < 3 || val > 12) {
                isInvalidBcd = true;
                outNib = 'XXXX';
            } else {
                outNib = (val - 3).toString(2).padStart(4, '0');
            }
            const bcdVal = isInvalidBcd ? -1 : val - 3;
            if (bcdVal >= 0 && bcdVal <= 9) {
                const rowElem = document.getElementById(`bcd-row-${bcdVal}`);
                if (rowElem) rowElem.classList.add('active-row-bcd');
            }
        }

        bcdResultDisplay.textContent = outNib;

        let bcdStepsHtml = '';

        if (bcdDirection === 'bcd2xs3') {
            if (!isInvalidBcd) {
                bcdStepsHtml = `
                    <!-- Method & Algorithm Guide Card -->
                    <div class="how-to-solve-card">
                        <div class="how-to-solve-header">
                            <span class="how-to-solve-title">
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line></svg>
                                Process &amp; Method: How to Convert BCD &rarr; Excess-3 Code
                            </span>
                            <div class="xor-cheat-pill-group">
                                <span class="xor-pill">BCD Range: 0000–1001 (0–9)</span>
                                <span class="xor-pill">Formula: XS-3 = BCD + 3</span>
                                <span class="xor-pill">Binary: + 0011₂</span>
                            </div>
                        </div>
                        <div class="rule-steps-list">
                            <div class="rule-step-item">
                                <span class="rule-step-badge">Rule 1 (Valid Range)</span>
                                <span>8421 BCD only encodes single decimal digits from <strong>0 to 9</strong> (0000₂ to 1001₂). States 10 to 15 (1010₂–1111₂) are invalid and produce <strong>Don't Care (XXXX)</strong>.</span>
                            </div>
                            <div class="rule-step-item">
                                <span class="rule-step-badge">Rule 2 (Add 3 Offset)</span>
                                <span>Add decimal <strong>3</strong> (binary <strong>0011₂</strong>) to the 4-bit BCD digit to obtain the self-complementing Excess-3 code.</span>
                            </div>
                        </div>
                    </div>

                    <!-- Step-by-Step Calculation Cards -->
                    <div class="calc-steps-grid">
                        <div class="calc-step-item">
                            <div class="calc-step-top">
                                <span class="calc-step-tag">Step 1 &bull; Decode BCD Digit</span>
                                <span class="calc-step-eval">Decimal = ${val}</span>
                            </div>
                            <div class="calc-step-formula">Input BCD: ${nib}₂ = ${val}₁₀</div>
                            <div class="calc-step-desc">Convert the 4-bit 8421 binary code to its decimal digit value.</div>
                        </div>

                        <div class="calc-step-item">
                            <div class="calc-step-top">
                                <span class="calc-step-tag">Step 2 &bull; Range Validation</span>
                                <span class="calc-step-eval">Status = Valid BCD</span>
                            </div>
                            <div class="calc-step-formula">0 &le; ${val} &le; 9 &rarr; Legal BCD Digit</div>
                            <div class="calc-step-desc">Value lies within the permissible 0 to 9 range for a single decimal digit.</div>
                        </div>

                        <div class="calc-step-item">
                            <div class="calc-step-top">
                                <span class="calc-step-tag">Step 3 &bull; Add 3 (0011₂ in Binary)</span>
                                <span class="calc-step-eval">XS-3 = ${outNib}</span>
                            </div>
                            <div class="calc-step-formula">Decimal: ${val} + 3 = ${val + 3} | Binary: ${nib}₂ + 0011₂ = ${outNib}₂</div>
                            <div class="calc-step-desc">Perform 4-bit binary addition of the BCD digit with 0011₂:</div>
                            <div class="binary-math-display">
                                <div class="binary-math-row"><span>&nbsp; BCD Digit:</span><span>${nib}₂ &nbsp;(${val})</span></div>
                                <div class="binary-math-row"><span>+ Offset (+3):</span><span>0011₂ &nbsp;(3)</span></div>
                                <div class="binary-math-hr"></div>
                                <div class="binary-math-row"><span>= Excess-3:</span><span>${outNib}₂ &nbsp;(${val + 3})</span></div>
                            </div>
                        </div>
                    </div>

                    <div class="calc-summary-bar">
                        <span class="calc-summary-label">Final Excess-3 Output:</span>
                        <span class="calc-summary-val">${outNib}</span>
                    </div>
                `;
            } else {
                bcdStepsHtml = `
                    <div class="how-to-solve-card" style="background:#FEF2F2; border-color:#FECACA;">
                        <div class="how-to-solve-header">
                            <span class="how-to-solve-title" style="color:#DC2626;">
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><line x1="15" y1="9" x2="9" y2="15"></line><line x1="9" y1="9" x2="15" y2="15"></line></svg>
                                Invalid BCD Detected (Don't Care State)
                            </span>
                            <div class="xor-cheat-pill-group">
                                <span class="xor-pill" style="color:#DC2626; border-color:#FECACA;">Illegal BCD: 1010–1111</span>
                                <span class="xor-pill" style="color:#DC2626; border-color:#FECACA;">Output: XXXX</span>
                            </div>
                        </div>
                        <div class="rule-steps-list">
                            <div class="rule-step-item">
                                <span class="rule-step-badge" style="background:#DC2626;">Rule Violation</span>
                                <span>Input binary <strong>${nib}₂ = ${val}₁₀</strong> exceeds the maximum valid BCD digit (9). The 8421 BCD system cannot represent 10–15 within a single 4-bit nibble.</span>
                            </div>
                        </div>
                    </div>

                    <div class="calc-steps-grid">
                        <div class="calc-step-item">
                            <div class="calc-step-top">
                                <span class="calc-step-tag" style="color:#DC2626;">Step 1 &bull; Decode Input</span>
                                <span class="calc-step-eval" style="color:#DC2626; background:#FEF2F2; border-color:#FECACA;">Decimal = ${val}</span>
                            </div>
                            <div class="calc-step-formula">Input: ${nib}₂ = ${val}₁₀</div>
                            <div class="calc-step-desc">Binary 4-bit value decoded to decimal.</div>
                        </div>

                        <div class="calc-step-item">
                            <div class="calc-step-top">
                                <span class="calc-step-tag" style="color:#DC2626;">Step 2 &bull; Range Check Failed</span>
                                <span class="calc-step-eval" style="color:#DC2626; background:#FEF2F2; border-color:#FECACA;">Status = Invalid (X)</span>
                            </div>
                            <div class="calc-step-formula">${val} &gt; 9 &rarr; Outside Permissible BCD Range</div>
                            <div class="calc-step-desc">Because 10–15 are invalid BCD digits, standard digital logic treats this state as a <strong>Don't Care</strong>.</div>
                        </div>

                        <div class="calc-step-item">
                            <div class="calc-step-top">
                                <span class="calc-step-tag" style="color:#DC2626;">Step 3 &bull; Assign Don't Care Output</span>
                                <span class="calc-step-eval" style="color:#DC2626; background:#FEF2F2; border-color:#FECACA;">Output = XXXX</span>
                            </div>
                            <div class="calc-step-formula">Excess-3 Output = XXXX (Don't Care)</div>
                            <div class="calc-step-desc">In truth tables and Karnaugh maps, this condition is designated with an 'X'.</div>
                        </div>
                    </div>

                    <div class="calc-summary-bar" style="background:#FEF2F2; border-color:#FECACA; color:#DC2626;">
                        <span class="calc-summary-label">Final Excess-3 Output:</span>
                        <span class="calc-summary-val">XXXX (Don't Care)</span>
                    </div>
                `;
            }
        } else {
            // XS-3 -> BCD
            if (!isInvalidBcd) {
                bcdStepsHtml = `
                    <!-- Method & Algorithm Guide Card -->
                    <div class="how-to-solve-card">
                        <div class="how-to-solve-header">
                            <span class="how-to-solve-title">
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line></svg>
                                Process &amp; Method: How to Convert Excess-3 &rarr; BCD Code
                            </span>
                            <div class="xor-cheat-pill-group">
                                <span class="xor-pill">XS-3 Range: 0011–1100 (3–12)</span>
                                <span class="xor-pill">Formula: BCD = XS-3 − 3</span>
                                <span class="xor-pill">Binary: − 0011₂</span>
                            </div>
                        </div>
                        <div class="rule-steps-list">
                            <div class="rule-step-item">
                                <span class="rule-step-badge">Rule 1 (Valid XS-3 Range)</span>
                                <span>Valid single-digit Excess-3 codes must lie between <strong>3 and 12</strong> (0011₂ to 1100₂), which map to decimal digits 0 to 9. Values &lt; 3 or &gt; 12 are invalid and produce <strong>Don't Care (XXXX)</strong>.</span>
                            </div>
                            <div class="rule-step-item">
                                <span class="rule-step-badge">Rule 2 (Subtract 3 Offset)</span>
                                <span>Subtract decimal <strong>3</strong> (binary <strong>0011₂</strong>) from the Excess-3 code to restore the original 8421 BCD code.</span>
                            </div>
                        </div>
                    </div>

                    <!-- Step-by-Step Calculation Cards -->
                    <div class="calc-steps-grid">
                        <div class="calc-step-item">
                            <div class="calc-step-top">
                                <span class="calc-step-tag">Step 1 &bull; Decode Excess-3 Digit</span>
                                <span class="calc-step-eval">Decimal = ${val}</span>
                            </div>
                            <div class="calc-step-formula">Input XS-3: ${nib}₂ = ${val}₁₀</div>
                            <div class="calc-step-desc">Convert the 4-bit Excess-3 code to its decimal equivalent.</div>
                        </div>

                        <div class="calc-step-item">
                            <div class="calc-step-top">
                                <span class="calc-step-tag">Step 2 &bull; Range Validation</span>
                                <span class="calc-step-eval">Status = Valid XS-3</span>
                            </div>
                            <div class="calc-step-formula">3 &le; ${val} &le; 12 &rarr; Legal Single-Digit XS-3</div>
                            <div class="calc-step-desc">Value lies within the valid 3 to 12 range (corresponding to decimal digits 0–9).</div>
                        </div>

                        <div class="calc-step-item">
                            <div class="calc-step-top">
                                <span class="calc-step-tag">Step 3 &bull; Subtract 3 (−0011₂ in Binary)</span>
                                <span class="calc-step-eval">BCD = ${outNib}</span>
                            </div>
                            <div class="calc-step-formula">Decimal: ${val} − 3 = ${val - 3} | Binary: ${nib}₂ − 0011₂ = ${outNib}₂</div>
                            <div class="calc-step-desc">Subtract 0011₂ from the Excess-3 code to restore standard 8421 BCD:</div>
                            <div class="binary-math-display">
                                <div class="binary-math-row"><span>&nbsp; Excess-3:</span><span>${nib}₂ &nbsp;(${val})</span></div>
                                <div class="binary-math-row"><span>− Offset (−3):</span><span>0011₂ &nbsp;(3)</span></div>
                                <div class="binary-math-hr"></div>
                                <div class="binary-math-row"><span>= 8421 BCD:</span><span>${outNib}₂ &nbsp;(${val - 3})</span></div>
                            </div>
                        </div>
                    </div>

                    <div class="calc-summary-bar">
                        <span class="calc-summary-label">Final BCD Output:</span>
                        <span class="calc-summary-val">${outNib}</span>
                    </div>
                `;
            } else {
                bcdStepsHtml = `
                    <div class="how-to-solve-card" style="background:#FEF2F2; border-color:#FECACA;">
                        <div class="how-to-solve-header">
                            <span class="how-to-solve-title" style="color:#DC2626;">
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><line x1="15" y1="9" x2="9" y2="15"></line><line x1="9" y1="9" x2="15" y2="15"></line></svg>
                                Invalid Excess-3 Code Detected (Don't Care State)
                            </span>
                            <div class="xor-cheat-pill-group">
                                <span class="xor-pill" style="color:#DC2626; border-color:#FECACA;">Valid XS-3 Range: 3–12</span>
                                <span class="xor-pill" style="color:#DC2626; border-color:#FECACA;">Output: XXXX</span>
                            </div>
                        </div>
                        <div class="rule-steps-list">
                            <div class="rule-step-item">
                                <span class="rule-step-badge" style="background:#DC2626;">Rule Violation</span>
                                <span>Input binary <strong>${nib}₂ = ${val}₁₀</strong> is ${val < 3 ? 'less than 3 (0011₂)' : 'greater than 12 (1100₂)'}. Excess-3 codes for single decimal digits only exist from 3 to 12.</span>
                            </div>
                        </div>
                    </div>

                    <div class="calc-steps-grid">
                        <div class="calc-step-item">
                            <div class="calc-step-top">
                                <span class="calc-step-tag" style="color:#DC2626;">Step 1 &bull; Decode Input</span>
                                <span class="calc-step-eval" style="color:#DC2626; background:#FEF2F2; border-color:#FECACA;">Decimal = ${val}</span>
                            </div>
                            <div class="calc-step-formula">Input: ${nib}₂ = ${val}₁₀</div>
                            <div class="calc-step-desc">Binary 4-bit value decoded to decimal.</div>
                        </div>

                        <div class="calc-step-item">
                            <div class="calc-step-top">
                                <span class="calc-step-tag" style="color:#DC2626;">Step 2 &bull; Range Check Failed</span>
                                <span class="calc-step-eval" style="color:#DC2626; background:#FEF2F2; border-color:#FECACA;">Status = Invalid (X)</span>
                            </div>
                            <div class="calc-step-formula">${val < 3 ? val + ' &lt; 3' : val + ' &gt; 12'} &rarr; Outside Permissible XS-3 Range</div>
                            <div class="calc-step-desc">This code does not map to any valid single decimal digit (0–9), resulting in a <strong>Don't Care</strong>.</div>
                        </div>

                        <div class="calc-step-item">
                            <div class="calc-step-top">
                                <span class="calc-step-tag" style="color:#DC2626;">Step 3 &bull; Assign Don't Care Output</span>
                                <span class="calc-step-eval" style="color:#DC2626; background:#FEF2F2; border-color:#FECACA;">Output = XXXX</span>
                            </div>
                            <div class="calc-step-formula">BCD Output = XXXX (Don't Care)</div>
                            <div class="calc-step-desc">Unused state designated as 'X' (Don't Care).</div>
                        </div>
                    </div>

                    <div class="calc-summary-bar" style="background:#FEF2F2; border-color:#FECACA; color:#DC2626;">
                        <span class="calc-summary-label">Final BCD Output:</span>
                        <span class="calc-summary-val">XXXX (Don't Care)</span>
                    </div>
                `;
            }
        }

        if (bcdNibbleMap) {
            bcdNibbleMap.innerHTML = bcdStepsHtml;
        }
    }

    if (bcdInput) bcdInput.addEventListener('input', updateBcdModule);


    // ----------------------------------------------------------------------
    // 7. MODULE 5: BINARY • GRAY CODE CONVERTER
    // ----------------------------------------------------------------------
    const grayInput = document.getElementById('gray-input-field');
    const grayClear = document.getElementById('gray-clear');
    const grayErrMsg = document.getElementById('gray-err-msg');
    const grayResultDisplay = document.getElementById('gray-result-display');
    const grayDirBtns = document.querySelectorAll('.dir-btn[data-gray-dir]');
    const grayInputLabel = document.getElementById('gray-input-label');
    const grayResTitle = document.getElementById('gray-res-title');
    const grayStepsContainer = document.getElementById('gray-steps-container');
    const grayTableBody = document.getElementById('gray-table-body');

    let grayDirection = 'bin2gray'; // 'bin2gray' or 'gray2bin'

    // Populate Gray Code Reference Table (0 to 15)
    function initGrayTable() {
        if (!grayTableBody) return;
        let html = '';
        const bitChangeNames = [
            'Init (0000)', 'Bit 0 (LSB)', 'Bit 1', 'Bit 0',
            'Bit 2', 'Bit 0', 'Bit 1', 'Bit 0',
            'Bit 3 (MSB)', 'Bit 0', 'Bit 1', 'Bit 0',
            'Bit 2', 'Bit 0', 'Bit 1', 'Bit 0'
        ];

        for (let i = 0; i < 16; i++) {
            const binStr = i.toString(2).padStart(4, '0');
            const grayVal = i ^ (i >> 1);
            const grayStr = grayVal.toString(2).padStart(4, '0');
            const changeDesc = bitChangeNames[i];

            html += `
                <tr id="gray-row-${i}" data-val="${i}">
                    <td><strong>${i}</strong></td>
                    <td class="mono">${binStr}</td>
                    <td class="mono">${grayStr}</td>
                    <td><span class="status-badge-table status-valid">${changeDesc}</span></td>
                </tr>
            `;
        }
        grayTableBody.innerHTML = html;
    }
    initGrayTable();

    grayDirBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            grayDirBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            grayDirection = btn.getAttribute('data-gray-dir');

            if (grayDirection === 'bin2gray') {
                grayInputLabel.textContent = 'Enter Binary Number (up to 4 bits):';
                grayResTitle.textContent = 'Gray Code Output';
            } else {
                grayInputLabel.textContent = 'Enter Gray Code (up to 4 bits):';
                grayResTitle.textContent = 'Binary Output';
            }

            updateGrayModule();
        });
    });

    if (grayClear) {
        grayClear.addEventListener('click', () => {
            grayInput.value = '0000';
            updateGrayModule();
        });
    }

    function updateGrayModule() {
        const rawStr = grayInput.value.trim().replace(/\s+/g, '');
        const isValid = /^[01]{1,4}$/.test(rawStr);

        grayErrMsg.classList.toggle('visible', !isValid && rawStr.length > 0);
        grayInput.classList.toggle('invalid', !isValid && rawStr.length > 0);

        // Clear active rows in reference table
        document.querySelectorAll('#gray-table-body tr').forEach(r => r.classList.remove('active-row'));

        if (!isValid || rawStr.length === 0) {
            grayResultDisplay.textContent = '----';
            if (grayStepsContainer) {
                grayStepsContainer.innerHTML = '<div style="font-size:0.85rem; color:#64748B;">Enter a valid 4-bit binary value to view XOR logic.</div>';
            }
            return;
        }

        const paddedStr = rawStr.padStart(4, '0');
        const b = paddedStr.split('').map(x => parseInt(x, 10)); // [b3, b2, b1, b0]

        // Render interactive 4-bit switch
        renderBitStrip('bit-strip-gray', paddedStr, (updatedBin) => {
            grayInput.value = updatedBin;
            updateGrayModule();
        });

        let outArr = [];
        let stepsHtml = '';

        if (grayDirection === 'bin2gray') {
            // Binary -> Gray:
            // G3 = B3
            // G2 = B3 ^ B2
            // G1 = B2 ^ B1
            // G0 = B1 ^ B0
            const g3 = b[0];
            const g2 = b[0] ^ b[1];
            const g1 = b[1] ^ b[2];
            const g0 = b[2] ^ b[3];
            outArr = [g3, g2, g1, g0];

            stepsHtml = `
                <!-- Method & Algorithm Guide Card -->
                <div class="how-to-solve-card">
                    <div class="how-to-solve-header">
                        <span class="how-to-solve-title">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line></svg>
                            Process &amp; Method: How to Convert Binary &rarr; Gray Code
                        </span>
                        <div class="xor-cheat-pill-group" title="XOR Rule: Same bits = 0, Different bits = 1">
                            <span class="xor-pill">0 ⊕ 0 = 0</span>
                            <span class="xor-pill">0 ⊕ 1 = 1</span>
                            <span class="xor-pill">1 ⊕ 0 = 1</span>
                            <span class="xor-pill">1 ⊕ 1 = 0</span>
                        </div>
                    </div>
                    <div class="rule-steps-list">
                        <div class="rule-step-item">
                            <span class="rule-step-badge">Rule 1 (MSB)</span>
                            <span>The Most Significant Bit of Gray Code is identical to Binary: <strong>G₃ = B₃</strong>.</span>
                        </div>
                        <div class="rule-step-item">
                            <span class="rule-step-badge">Rule 2 (Next Bits)</span>
                            <span>Each subsequent Gray bit is obtained by XOR-ing the current binary bit with the binary bit to its left: <strong>Gᵢ = Bᵢ₊₁ ⊕ Bᵢ</strong>.</span>
                        </div>
                    </div>
                </div>

                <!-- Step-by-Step Calculation Cards -->
                <div class="calc-steps-grid">
                    <div class="calc-step-item">
                        <div class="calc-step-top">
                            <span class="calc-step-tag">Step 1 &bull; MSB (Bit 3)</span>
                            <span class="calc-step-eval">G₃ = ${g3}</span>
                        </div>
                        <div class="calc-step-formula">G₃ = B₃ = ${b[0]}</div>
                        <div class="calc-step-desc">Bring down the binary MSB directly without modification.</div>
                    </div>

                    <div class="calc-step-item">
                        <div class="calc-step-top">
                            <span class="calc-step-tag">Step 2 &bull; Bit 2</span>
                            <span class="calc-step-eval">G₂ = ${g2}</span>
                        </div>
                        <div class="calc-step-formula">G₂ = B₃ ⊕ B₂ = ${b[0]} ⊕ ${b[1]} = ${g2}</div>
                        <div class="calc-step-desc">XOR Binary Bit 3 (${b[0]}) with Binary Bit 2 (${b[1]}).</div>
                    </div>

                    <div class="calc-step-item">
                        <div class="calc-step-top">
                            <span class="calc-step-tag">Step 3 &bull; Bit 1</span>
                            <span class="calc-step-eval">G₁ = ${g1}</span>
                        </div>
                        <div class="calc-step-formula">G₁ = B₂ ⊕ B₁ = ${b[1]} ⊕ ${b[2]} = ${g1}</div>
                        <div class="calc-step-desc">XOR Binary Bit 2 (${b[1]}) with Binary Bit 1 (${b[2]}).</div>
                    </div>

                    <div class="calc-step-item">
                        <div class="calc-step-top">
                            <span class="calc-step-tag">Step 4 &bull; LSB (Bit 0)</span>
                            <span class="calc-step-eval">G₀ = ${g0}</span>
                        </div>
                        <div class="calc-step-formula">G₀ = B₁ ⊕ B₀ = ${b[2]} ⊕ ${b[3]} = ${g0}</div>
                        <div class="calc-step-desc">XOR Binary Bit 1 (${b[2]}) with Binary Bit 0 (${b[3]}).</div>
                    </div>
                </div>

                <div class="calc-summary-bar">
                    <span class="calc-summary-label">Final Gray Code (G₃G₂G₁G₀):</span>
                    <span class="calc-summary-val">${g3}${g2}${g1}${g0}</span>
                </div>
            `;

            // Highlight corresponding row in table
            const intVal = parseInt(paddedStr, 2);
            const rowElem = document.getElementById(`gray-row-${intVal}`);
            if (rowElem) {
                rowElem.classList.add('active-row');
                rowElem.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
            }
        } else {
            // Gray -> Binary:
            // B3 = G3
            // B2 = B3 ^ G2
            // B1 = B2 ^ G1
            // B0 = B1 ^ G0
            const b3 = b[0];
            const b2 = b3 ^ b[1];
            const b1 = b2 ^ b[2];
            const b0 = b1 ^ b[3];
            outArr = [b3, b2, b1, b0];

            stepsHtml = `
                <!-- Method & Algorithm Guide Card -->
                <div class="how-to-solve-card">
                    <div class="how-to-solve-header">
                        <span class="how-to-solve-title">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line></svg>
                            Process &amp; Method: How to Convert Gray Code &rarr; Binary
                        </span>
                        <div class="xor-cheat-pill-group" title="XOR Rule: Same bits = 0, Different bits = 1">
                            <span class="xor-pill">0 ⊕ 0 = 0</span>
                            <span class="xor-pill">0 ⊕ 1 = 1</span>
                            <span class="xor-pill">1 ⊕ 0 = 1</span>
                            <span class="xor-pill">1 ⊕ 1 = 0</span>
                        </div>
                    </div>
                    <div class="rule-steps-list">
                        <div class="rule-step-item">
                            <span class="rule-step-badge">Rule 1 (MSB)</span>
                            <span>The Most Significant Bit of Binary is identical to Gray Code: <strong>B₃ = G₃</strong>.</span>
                        </div>
                        <div class="rule-step-item">
                            <span class="rule-step-badge">Rule 2 (Diagonal XOR)</span>
                            <span>Each successive binary bit is found by XOR-ing the <em>previously calculated binary bit</em> with the <em>current Gray bit</em>: <strong>Bᵢ = Bᵢ₊₁ ⊕ Gᵢ</strong>.</span>
                        </div>
                    </div>
                </div>

                <!-- Step-by-Step Calculation Cards -->
                <div class="calc-steps-grid">
                    <div class="calc-step-item">
                        <div class="calc-step-top">
                            <span class="calc-step-tag">Step 1 &bull; MSB (Bit 3)</span>
                            <span class="calc-step-eval">B₃ = ${b3}</span>
                        </div>
                        <div class="calc-step-formula">B₃ = G₃ = ${b[0]}</div>
                        <div class="calc-step-desc">Bring down the Gray Code MSB directly without modification.</div>
                    </div>

                    <div class="calc-step-item">
                        <div class="calc-step-top">
                            <span class="calc-step-tag">Step 2 &bull; Bit 2</span>
                            <span class="calc-step-eval">B₂ = ${b2}</span>
                        </div>
                        <div class="calc-step-formula">B₂ = B₃ ⊕ G₂ = ${b3} ⊕ ${b[1]} = ${b2}</div>
                        <div class="calc-step-desc">XOR previously calculated Binary Bit 3 (${b3}) with Gray Bit 2 (${b[1]}).</div>
                    </div>

                    <div class="calc-step-item">
                        <div class="calc-step-top">
                            <span class="calc-step-tag">Step 3 &bull; Bit 1</span>
                            <span class="calc-step-eval">B₁ = ${b1}</span>
                        </div>
                        <div class="calc-step-formula">B₁ = B₂ ⊕ G₁ = ${b2} ⊕ ${b[2]} = ${b1}</div>
                        <div class="calc-step-desc">XOR previously calculated Binary Bit 2 (${b2}) with Gray Bit 1 (${b[2]}).</div>
                    </div>

                    <div class="calc-step-item">
                        <div class="calc-step-top">
                            <span class="calc-step-tag">Step 4 &bull; LSB (Bit 0)</span>
                            <span class="calc-step-eval">B₀ = ${b0}</span>
                        </div>
                        <div class="calc-step-formula">B₀ = B₁ ⊕ G₀ = ${b1} ⊕ ${b[3]} = ${b0}</div>
                        <div class="calc-step-desc">XOR previously calculated Binary Bit 1 (${b1}) with Gray Bit 0 (${b[3]}).</div>
                    </div>
                </div>

                <div class="calc-summary-bar">
                    <span class="calc-summary-label">Final Binary Output (B₃B₂B₁B₀):</span>
                    <span class="calc-summary-val">${b3}${b2}${b1}${b0}</span>
                </div>
            `;

            // Result is binary, highlight matching row
            const resBinStr = outArr.join('');
            const intVal = parseInt(resBinStr, 2);
            const rowElem = document.getElementById(`gray-row-${intVal}`);
            if (rowElem) {
                rowElem.classList.add('active-row');
                rowElem.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
            }
        }

        grayResultDisplay.textContent = outArr.join('');
        if (grayStepsContainer) {
            grayStepsContainer.innerHTML = stepsHtml;
        }
    }

    if (grayInput) grayInput.addEventListener('input', updateGrayModule);


    // ----------------------------------------------------------------------
    // INITIALIZE ALL MODULES ON LOAD
    // ----------------------------------------------------------------------
    updateArithmeticModule();
    updateBitwiseModule();
    updateConversionModule();
    updateBcdModule();
    updateGrayModule();
});
