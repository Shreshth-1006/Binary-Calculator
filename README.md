# Binary-Calculator
Interactive binary calculator and digital logic suite featuring multi-bit arithmetic, logic gates, number base conversions, BCD, Excess-3, and Gray code transformations with real-time bit toggles and step-by-step visualizers
# BinaryCraft — Binary & Digital Logic Suite

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![Vanilla JS](https://img.shields.io/badge/Vanilla-JavaScript-F7DF1E?logo=javascript&logoColor=black)](https://developer.mozilla.org/en-US/docs/Web/JavaScript)
[![HTML5](https://img.shields.io/badge/HTML5-E34F26?logo=html5&logoColor=white)](https://developer.mozilla.org/en-US/docs/Web/HTML)
[![CSS3](https://img.shields.io/badge/CSS3-1572B6?logo=css3&logoColor=white)](https://developer.mozilla.org/en-US/docs/Web/CSS)
[![Zero Dependencies](https://img.shields.io/badge/Dependencies-0-brightgreen.svg)](#features)

**BinaryCraft** is an interactive, browser-based digital electronics workbench designed for students, educators, and engineers. It provides interactive bit manipulation, real-time calculation, column-wise arithmetic working, and dynamic truth tables across 5 specialized digital logic modules.

---

## Table of Contents
- [System Architecture](#system-architecture)
- [Module Workflows & Flowcharts](#module-workflows--flowcharts)
  - [1. Global Navigation & View Routing](#1-global-navigation--view-routing)
  - [2. Multi-Bit Arithmetic Engine](#2-multi-bit-arithmetic-engine)
  - [3. Bitwise Logic & Truth Table Pipeline](#3-bitwise-logic--truth-table-pipeline)
  - [4. Number Base & Radix Converter](#4-number-base--radix-converter)
  - [5. BCD & Excess-3 Code Converter](#5-bcd--excess-3-code-converter)
  - [6. Binary & Gray Code Transformer](#6-binary--gray-code-transformer)
- [Modules & Feature Matrix](#modules--feature-matrix)
- [Digital Logic Specifications](#digital-logic-specifications)
- [File Structure](#file-structure)
- [Getting Started](#getting-started)
- [Presentation Slide Deck](#presentation-slide-deck)
- [License](#license)

---

## System Architecture

```mermaid
graph TD
    UI["Web UI Client (index.html)"] --> EVENT["Event Listeners & State Dispatcher (app.js)"]
    
    subgraph UI_Components ["Interactive UI Layer"]
        TOGGLE["Clickable Bit Toggles"]
        NUM_IN["Decimal / Binary Text Inputs"]
        WORD_SEL["Word Length Selectors (4, 8, 16, 32-bit)"]
        GATE_SEL["Gate & Operation Switches"]
    end
    
    TOGGLE --> EVENT
    NUM_IN --> EVENT
    WORD_SEL --> EVENT
    GATE_SEL --> EVENT
    
    subgraph Processing_Engines ["Computational Engines"]
        ARITH["Arithmetic Core (+, -, *, /)"]
        BITWISE["Bitwise Logic Core (7 Gates)"]
        CONV["Radix Converter (2, 8, 10, 16)"]
        BCD_ENG["BCD 8421 & Excess-3 Engine"]
        GRAY_ENG["Gray Code XOR Transformer"]
    end
    
    EVENT --> ARITH
    EVENT --> BITWISE
    EVENT --> CONV
    EVENT --> BCD_ENG
    EVENT --> GRAY_ENG
    
    subgraph Output_Renderers ["Visual & Export Renderers"]
        STEP_RENDER["Step-by-Step Column Working"]
        TRUTH_RENDER["Live Truth Table Generator"]
        ALERT_RENDER["Carry & Overflow Flags"]
        EXPORT["Screenshot Exporter (html2canvas.js)"]
    end
    
    ARITH --> STEP_RENDER
    ARITH --> ALERT_RENDER
    BITWISE --> TRUTH_RENDER
    CONV --> STEP_RENDER
    BCD_ENG --> STEP_RENDER
    GRAY_ENG --> STEP_RENDER
    
    STEP_RENDER --> EXPORT
    TRUTH_RENDER --> EXPORT
```

---

## Module Workflows & Flowcharts

### 1. Global Navigation & View Routing

The application functions as a high-performance Single Page Application (SPA) driven by semantic DOM containers with modular CSS themes:

```mermaid
flowchart TD
    START([User Opens App]) --> HOME[Home Overview Dashboard]
    HOME --> NAV{Select Navigation Option}
    
    NAV -->|Module 01| M1[Arithmetic View]
    NAV -->|Module 02| M2[Bitwise Logic View]
    NAV -->|Module 03| M3[Radix Conversions View]
    NAV -->|Module 04| M4[BCD • Excess-3 View]
    NAV -->|Module 05| M5[Binary • Gray Code View]
    NAV -->|Presentation| SLIDES[Interactive Slide Deck presentation.html]
    
    M1 --> RETURN[Click Nav Brand or Home Button]
    M2 --> RETURN
    M3 --> RETURN
    M4 --> RETURN
    M5 --> RETURN
    RETURN --> HOME
```

---

### 2. Multi-Bit Arithmetic Engine

Performs unsigned and signed (2's complement) arithmetic operations with overflow heuristics and column-by-column visual carry breakdowns:

```mermaid
flowchart TD
    IN_A[Operand A: Dec or Bin] --> PARSE_A[Parse & Normalize to N-bit Binary]
    IN_B[Operand B: Dec or Bin] --> PARSE_B[Parse & Normalize to N-bit Binary]
    
    PARSE_A --> OP_CHECK{Selected Operation}
    PARSE_B --> OP_CHECK
    
    OP_CHECK -->|Addition +| ADD_LOGIC["Binary Full-Adder Cascade (Sum & Carry)"]
    OP_CHECK -->|Subtraction -| SUB_LOGIC["Compute 2's Complement of B & Add"]
    OP_CHECK -->|Multiplication *| MUL_LOGIC["Partial Product Shift & Accumulate"]
    OP_CHECK -->|Division /| DIV_LOGIC{Is Divisor 0?}
    
    DIV_LOGIC -->|Yes| DIV_ERR["Display Division by Zero Error"]
    DIV_LOGIC -->|No| DIV_CALC["Calculate Quotient & Remainder"]
    
    ADD_LOGIC --> FLAG_EVAL["Evaluate Flags: Carry Out, 2's Complement Overflow"]
    SUB_LOGIC --> FLAG_EVAL
    MUL_LOGIC --> FLAG_EVAL
    DIV_CALC --> FLAG_EVAL
    
    FLAG_EVAL --> OUTPUT["Render Binary Result, Decimal Value, and Step Working"]
    OUTPUT --> EXPORT_PNG["Optional: Export Card Snapshot to PNG"]
```

---

### 3. Bitwise Logic & Truth Table Pipeline

Evaluates bit-level operations across dual 4-bit operands or single-operand unary gates:

```mermaid
flowchart LR
    GATE_SEL{Select Gate}
    
    GATE_SEL -->|AND / OR / XOR / NAND / NOR / XNOR| BINARY_MODE["Binary Mode (2 Operands Required)"]
    GATE_SEL -->|NOT| UNARY_MODE["Unary Mode (Operand B Disabled)"]
    
    BINARY_MODE --> BIT_LOOP["Loop Bit-by-Bit: i = 3 down to 0"]
    UNARY_MODE --> NOT_LOOP["Invert Operand A Bits: ~A"]
    
    BIT_LOOP --> TRUTH_ROW["Compute output bit = Gate(A_i, B_i)"]
    TRUTH_ROW --> TABLE_GEN["Generate Dynamic Truth Table Matrix"]
    NOT_LOOP --> TABLE_GEN
    
    TABLE_GEN --> DISPLAY_RES["Display Result in Binary, Hex, & Decimal"]
```

---

### 4. Number Base & Radix Converter

Supports conversion across **Binary (Base 2)**, **Octal (Base 8)**, **Decimal (Base 10)**, and **Hexadecimal (Base 16)** with customizable word-length masking:

```mermaid
flowchart TD
    INPUT_VAL["User Input in Selected Radix"] --> SANITIZE["Input Sanitizer & Validation"]
    SANITIZE --> DEC_INT["Standardize to Internal BigInt/Integer"]
    
    DEC_INT --> MASK["Apply Word-Length Bit Mask (4, 8, 16, 32-bit)"]
    
    MASK --> BIN_OUT["Base 2 (Binary with Bit-Spacing)"]
    MASK --> OCT_OUT["Base 8 (Octal Notation)"]
    MASK --> DEC_OUT["Base 10 (Signed & Unsigned)"]
    MASK --> HEX_OUT["Base 16 (Uppercase Hexadecimal)"]
    
    BIN_OUT --> SYNC_TOGGLE["Sync Interactive Bit Toggle Switches"]
```

---

### 5. BCD & Excess-3 Code Converter

Handles conversion between standard **8421 Binary Coded Decimal** and **Self-Complementing Excess-3 code** with Don't Care condition handling:

```mermaid
flowchart TD
    INPUT_BCD["Enter 4-Bit Nibble"] --> BCD_DIR{Conversion Mode}
    
    BCD_DIR -->|BCD to Excess-3| VAL_CHECK{"Is Value > 9 (1010-1111)?"}
    VAL_CHECK -->|Yes| DONT_CARE["Flag 'Don't Care' Condition (Invalid BCD Digit)"]
    VAL_CHECK -->|No| ADD_THREE["Add +3 (0011): E = B + 3"]
    
    BCD_DIR -->|Excess-3 to BCD| EX3_CHECK{"Is Value < 3?"}
    EX3_CHECK -->|Yes| EX3_INVALID["Flag Out of Range Condition"]
    EX3_CHECK -->|No| SUB_THREE["Subtract -3 (0011): B = E - 3"]
    
    ADD_THREE --> RENDER_CODE["Render 4-Bit Output Nibbles & Mathematical Proof"]
    SUB_THREE --> RENDER_CODE
    DONT_CARE --> RENDER_CODE
    EX3_INVALID --> RENDER_CODE
```

---

### 6. Binary & Gray Code Transformer

Converts between natural binary and reflected unit-distance Gray code:

```mermaid
flowchart TD
    subgraph Bin_to_Gray ["Binary to Gray Conversion"]
        B_IN["Binary Bits: B3, B2, B1, B0"]
        G3["G3 = B3 (MSB Remains Identical)"]
        G2["G2 = B3 XOR B2"]
        G1["G1 = B2 XOR B1"]
        G0["G0 = B1 XOR B0"]
        B_IN --> G3
        B_IN --> G2
        B_IN --> G1
        B_IN --> G0
    end
    
    subgraph Gray_to_Bin ["Gray to Binary Conversion"]
        G_IN["Gray Bits: G3, G2, G1, G0"]
        B3_OUT["B3 = G3 (MSB Remains Identical)"]
        B2_OUT["B2 = B3 XOR G2"]
        B1_OUT["B1 = B2 XOR G1"]
        B0_OUT["B0 = B1 XOR G0"]
        G_IN --> B3_OUT
        G_IN --> B2_OUT
        G_IN --> B1_OUT
        G_IN --> B0_OUT
    end
```

---

## Modules & Feature Matrix

| Module | Primary Operations | Input Modes | Word Lengths | Key Highlights |
| :--- | :--- | :--- | :--- | :--- |
| **01. Arithmetic** | `+`, `−`, `×`, `÷` | Decimal, Binary | 4-bit, 16-bit | 2's Complement, Overflow & Carry detection, PNG screenshot export |
| **02. Bitwise Logic** | AND, OR, XOR, NOT, NAND, NOR, XNOR | Decimal, Binary | 4-bit | Dynamic truth table generator, auto-disable for unary NOT |
| **03. Base Conversions** | Bin, Oct, Dec, Hex | Any Radix | 4, 8, 16, 32-bit | Real-time 4-way synchronization, interactive bit switches |
| **04. BCD • Excess-3** | BCD ⇄ Excess-3 | Binary, Decimal | 4-bit nibbles | Don't Care $(X)$ detection for values $10$ through $15$ |
| **05. Gray Code** | Binary ⇄ Gray Code | Binary, Decimal | 4-bit nibbles | XOR tree breakdown, Hamming distance $(=1)$ verification |

---

## Digital Logic Specifications

### Arithmetic 2's Complement Range
- **4-Bit Unsigned Range**: $0 \le N \le 15$ ($2^4 - 1$)
- **4-Bit Signed Range**: $-8 \le N \le +7$ ($-2^3$ to $+2^3 - 1$)
- **Overflow Detection Rule**: Occurs when two operands of the same sign yield a result with the opposite sign.

### Logic Gate Truth Formulas
| Operation | Formula | Behavior |
| :--- | :--- | :--- |
| **AND** | $Y = A \cdot B$ | Output is $1$ only when all inputs are $1$ |
| **OR** | $Y = A + B$ | Output is $1$ if at least one input is $1$ |
| **XOR** | $Y = A \oplus B$ | Output is $1$ if inputs differ (odd parity) |
| **NOT** | $Y = \overline{A}$ | Bitwise inversion |
| **NAND** | $Y = \overline{A \cdot B}$ | Universal gate; inverse of AND |
| **NOR** | $Y = \overline{A + B}$ | Universal gate; inverse of OR |
| **XNOR** | $Y = \overline{A \oplus B}$ | Output is $1$ when inputs are identical |

---

## File Structure

```plaintext
Binary_Calculator/
├── index.html              # Main single-page application structure & views
├── styles.css              # Curated CSS design system with module color themes
├── app.js                  # Computation engines, bit switchers, and UI state
├── presentation.html       # Standalone interactive presentation slide deck
├── html2canvas.min.js      # Client-side screenshot exporter
├── package-lock.json       # Project package lock metadata
└── README.md               # Architecture documentation & flowcharts
```

---

## Getting Started

### Prerequisites
BinaryCraft is built with pure web technologies and requires **no external build steps or server dependencies**.

### Running the App
1. Clone or download the repository:
   ```bash
   git clone https://github.com/your-username/binary-calculator.git
   cd binary-calculator
   ```
2. Open `index.html` directly in any modern web browser:
   - Double click `index.html`, or
   - Use VS Code Live Server extension, or
   - Run a quick local HTTP server:
     ```bash
     # Using Python
     python -m http.server 8000
     # Using Node.js
     npx serve .
     ```
3. Navigate to `http://localhost:8000` (or local file URI).

---

## Presentation Slide Deck

An integrated presentation deck is included in `presentation.html` for project demonstrations, lectures, or academic reviews:
- **Slide Controls**: Use the on-screen arrows, navigation dots, or keyboard arrow keys ($\leftarrow$ / $\rightarrow$).
- **Features Highlighted**: Color-coded slide themes corresponding to each module, interactive toggle cards, and mathematical proofs.

---

## License

This project is licensed under the [MIT License](LICENSE) — free for educational and open-source use.
