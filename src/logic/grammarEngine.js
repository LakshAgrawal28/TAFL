// grammarEngine.js

export class GrammarSnapshot {
  constructor(stepName, description, grammar) {
    this.stepName = stepName;
    this.description = description;
    this.grammar = JSON.parse(JSON.stringify(grammar));
  }
}

export class GrammarEngine {
  constructor() {
    this.snapshots = [];
    this.startSymbol = null;
  }

  addSnapshot(stepName, description, grammar) {
    this.snapshots.push(new GrammarSnapshot(stepName, description, grammar));
  }

  parse(input) {
    const rules = {};
    const lines = input.split('\n').map(l => l.trim()).filter(l => l);
    
    lines.forEach((line, idx) => {
      const parts = line.split(/[=-]>|→|:/).map(s => s.trim());
      if (parts.length < 2) return;
      const [lhs, rhsPart] = parts;
      if (!this.startSymbol) this.startSymbol = lhs;
      
      const productions = rhsPart.split('|').map(s => s.trim());
      if (!rules[lhs]) rules[lhs] = new Set();
      productions.forEach(p => {
        const cleaned = p.replace(/^['"]|['"]$/g, '').trim();
        rules[lhs].add(cleaned === 'EPSILON' || cleaned === 'ε' || cleaned === '\\e' ? '' : cleaned);
      });
    });

    const parsedGrammar = {};
    for (const [key, set] of Object.entries(rules)) {
      parsedGrammar[key] = Array.from(set);
    }
    return parsedGrammar;
  }

  // --- CNF PHASES ---
  toCNF(inputGrammar) {
    this.snapshots = [];
    let g = JSON.parse(JSON.stringify(inputGrammar));
    const startSymbol = Object.keys(g)[0];
    this.addSnapshot("Parsed Grammar", "Initial Context-Free Grammar parsed from input.", g);

    // 1. Identify Nullable Symbols & Language Nullability
    const { nullable, isLanguageNullable } = this.getNullableInfo(g, startSymbol);

    // 2. Eliminate Null (Safe without S -> epsilon)
    g = this.eliminateNull(g, nullable);
    this.addSnapshot("Null Elimination", "Removed epsilon (ε) productions by distributing nullable symbols.", g);

    // 3. New Start Symbol (Handle recursive or nullable)
    g = this.newStartSymbol(g, startSymbol, isLanguageNullable);

    // 4. Eliminate Unit
    g = this.eliminateUnit(g);
    this.addSnapshot("Unit Elimination", "Removed A -> B rules through transitive closure.", g);

    // 5. Eliminate Useless
    g = this.eliminateUseless(g);
    this.addSnapshot("Useless Symbols", "Cleaned non-generating and unreachable symbols.", g);

    // 6. Standardize
    g = this.standardizeCNF(g);
    this.addSnapshot("Chomsky Normal Form", "Final CNF: All rules are A -> BC or A -> a.", g);

    return { result: g, snapshots: this.snapshots };
  }

  newStartSymbol(g, start, isLanguageNullable) {
    let recursive = false;
    for (const rhsList of Object.values(g)) {
      if (rhsList.some(rhs => this.getSymbols(rhs).includes(start))) {
        recursive = true;
        break;
      }
    }
    
    if (recursive || isLanguageNullable) {
      const newS = start + "'";
      const newG = { [newS]: isLanguageNullable ? [start, ''] : [start], ...g };
      this.addSnapshot("New Start Symbol", `Start symbol '${start}' is ${recursive ? 'recursive' : 'nullable'}. Introduced '${newS}' as new start${isLanguageNullable ? ' with EPSILON production' : ''}.`, newG);
      return newG;
    }
    return g;
  }

  getNullableInfo(g, startSymbol) {
    const nullable = new Set();
    let changed = true;
    while (changed) {
      changed = false;
      for (const [lhs, rhsList] of Object.entries(g)) {
        for (const rhs of rhsList) {
          const symbols = this.getSymbols(rhs);
          if (rhs === '' || (symbols.length > 0 && symbols.every(s => nullable.has(s)))) {
            if (!nullable.has(lhs)) { nullable.add(lhs); changed = true; }
          }
        }
      }
    }
    return { nullable, isLanguageNullable: nullable.has(startSymbol) };
  }

  eliminateNull(g, nullable) {
    const newG = {};
    for (const [lhs, rhsList] of Object.entries(g)) {
      const newRhsSet = new Set();
      for (const rhs of rhsList) {
        if (rhs === '') continue;
        const combs = this.getNullableCombs(rhs, nullable);
        combs.forEach(c => { if (c !== '') newRhsSet.add(c); });
      }
      if (newRhsSet.size > 0) newG[lhs] = Array.from(newRhsSet);
    }
    return newG;
  }

  getNullableCombs(rhs, nullable) {
    let res = [''];
    const symbols = this.getSymbols(rhs);
    for (const s of symbols) {
      let next = [];
      for (const prefix of res) {
        next.push((prefix + ' ' + s).trim());
        if (nullable.has(s)) next.push(prefix);
      }
      res = next;
    }
    return res;
  }

  eliminateUnit(g) {
    const vars = Object.keys(g);
    const unitMap = {};
    vars.forEach(v => {
      const reachable = new Set([v]);
      let changed = true;
      while (changed) {
        changed = false;
        for (const u of reachable) {
          if (g[u]) {
            g[u].forEach(rhs => {
              const symbols = this.getSymbols(rhs);
              if (symbols.length === 1 && vars.includes(symbols[0]) && !reachable.has(symbols[0])) {
                reachable.add(symbols[0]);
                changed = true;
              }
            });
          }
        }
      }
      unitMap[v] = Array.from(reachable);
    });

    const newG = {};
    for (const v of vars) {
      const newSet = new Set();
      unitMap[v].forEach(target => {
        if (g[target]) {
          g[target].forEach(rhs => {
            const symbols = this.getSymbols(rhs);
            if (!(symbols.length === 1 && vars.includes(symbols[0]))) newSet.add(rhs);
          });
        }
      });
      if (newSet.size > 0) newG[v] = Array.from(newSet);
    }
    return newG;
  }

  eliminateUseless(g) {
    // Generating
    const gen = new Set();
    const vars = Object.keys(g);
    let changed = true;
    while (changed) {
      changed = false;
      for (const [lhs, rhsList] of Object.entries(g)) {
        if (!gen.has(lhs)) {
          if (rhsList.some(rhs => this.getSymbols(rhs).every(s => !vars.includes(s) || gen.has(s)))) {
            gen.add(lhs); changed = true;
          }
        }
      }
    }
    let g1 = {};
    for (const [lhs, rhsList] of Object.entries(g)) {
      if (gen.has(lhs)) {
        const filtered = rhsList.filter(rhs => this.getSymbols(rhs).every(s => !vars.includes(s) || gen.has(s)));
        if (filtered.length > 0) g1[lhs] = filtered;
      }
    }

    // Reachable
    const reach = new Set();
    const start = Object.keys(g1)[0];
    if (start) reach.add(start);
    changed = true;
    while (changed) {
      changed = false;
      for (const v of Array.from(reach)) {
        if (g1[v]) {
          g1[v].forEach(rhs => {
            this.getSymbols(rhs).forEach(s => {
               if (vars.includes(s) && !reach.has(s)) { reach.add(s); changed = true; }
            });
          });
        }
      }
    }
    const finalG = {};
    for (const v of Array.from(reach)) if (g1[v]) finalG[v] = g1[v];
    return finalG;
  }

  standardizeCNF(g) {
    const vars = Object.keys(g);
    const terminalMap = {};
    let g1 = JSON.parse(JSON.stringify(g));
    let divCounter = 1;

    // Phase 1: terminals in mixed RHS (Replacing 'a' with 'X_a')
    for (const [lhs, rhsList] of Object.entries(g1)) {
      g1[lhs] = rhsList.map(rhs => {
        const symbols = this.getSymbols(rhs);
        if (symbols.length <= 1) return rhs; // a or B
        return symbols.map(s => {
          if (!vars.includes(s) && this.isTerminal(s)) {
            if (!terminalMap[s]) {
              const newV = `X_${s}`; // Scholastic terminal-variable
              terminalMap[s] = newV;
              g1[newV] = [s];
            }
            return terminalMap[s];
          }
          return s;
        }).join(' ');
      });
    }

    // Phase 2: Breakdown long RHS (A -> B C D ... => A -> B D_1, D_1 -> C D_2, ...)
    const finalG = {};
    for (const [lhs, rhsList] of Object.entries(g1)) {
      if (!finalG[lhs]) finalG[lhs] = new Set();
      for (const rhs of rhsList) {
        const symbols = this.getSymbols(rhs);
        if (symbols.length <= 2) {
          finalG[lhs].add(symbols.join(' '));
        } else {
          let currentLhs = lhs;
          for (let i = 0; i < symbols.length - 2; i++) {
            const nextDiv = `D_${divCounter++}`;
            if (!finalG[currentLhs]) finalG[currentLhs] = new Set();
            finalG[currentLhs].add(`${symbols[i]} ${nextDiv}`);
            currentLhs = nextDiv;
            finalG[currentLhs] = new Set();
          }
          finalG[currentLhs].add(`${symbols[symbols.length - 2]} ${symbols[symbols.length - 1]}`);
        }
      }
    }
    
    const result = {};
    for (const [k, v] of Object.entries(finalG)) {
      result[k] = Array.from(v);
    }
    return result;
  }

  isTerminal(s) {
    return !/^[A-Z](?:_[a-z0-9]+)?'?$/.test(s);
  }

  cykParse(g, text) {
    if (!text) return null;
    const n = text.length;
    // Triangular matrix: table[len-1][start]
    const table = Array.from({ length: n }, (_, len) => 
      Array.from({ length: n - len }, () => new Set())
    );

    // Initial fill for terminals (Length 1)
    for (let i = 0; i < n; i++) {
      const char = text[i];
      for (const [lhs, rhsList] of Object.entries(g)) {
        if (rhsList.includes(char)) {
          table[0][i].add(lhs);
        }
      }
    }

    // Dynamic programming for lengths 2 to n
    for (let len = 2; len <= n; len++) {
      for (let start = 0; start <= n - len; start++) {
        for (let split = 1; split < len; split++) {
          const leftSet = table[split - 1][start];
          const rightSet = table[len - split - 1][start + split];

          for (const B of Array.from(leftSet)) {
            for (const C of Array.from(rightSet)) {
              const pair = `${B} ${C}`;
              for (const [lhs, rhsList] of Object.entries(g)) {
                if (rhsList.includes(pair)) {
                  table[len - 1][start].add(lhs);
                }
              }
            }
          }
        }
      }
    }

    return { 
      table: table.map(row => row.map(cell => Array.from(cell))),
      accepted: n > 0 && table[n - 1][0].has(Object.keys(g)[0] || 'S'),
      string: text
    };
  }

  getTerminalId(c) { return c.charCodeAt(0); }
  getSymbols(rhs) {
    // Math-grade regex: matches Non-terminals with optional subscripts (e.g. S_a, N_1, Z_12)
    // and terminals/epsilon.
    const matches = rhs.match(/[A-Z](?:_[a-z0-9]+)?'?|[a-z0-9]+|\\e|EPSILON/g) || [];
    return matches.filter(s => s && !s.match(/^\s+$/));
  }

  toGNF(inputGrammar) {
    this.snapshots = [];
    const engine = new GrammarEngine();
    const { result: gCnf, snapshots: cnfSnaps } = engine.toCNF(inputGrammar);
    
    // Import CNF snapshots but prefix them
    cnfSnaps.forEach(s => {
      this.addSnapshot(`CNF Phase: ${s.stepName}`, s.description, s.grammar);
    });

    let g = gCnf;
    this.addSnapshot("Initial GNF State", "GNF starts from the Chomsky Normal Form provided above.", g);
    
    // 1. Rename non-terminals to indexed names A_1, A_2, ...
    const allVars = Object.keys(g);
    const varIndices = {};
    allVars.forEach((v, i) => varIndices[v] = i + 1);

    this.addSnapshot("Indexing", "Variables indexed for ordering: " + allVars.map((v, i) => `${v}=A_${i+1}`).join(', '), g);

    // 2. Eliminate Ai -> Aj where j <= i
    let currentG = JSON.parse(JSON.stringify(g));
    const indexedVars = allVars;

    for (let i = 0; i < indexedVars.length; i++) {
        const Ai = indexedVars[i];
        
        for (let j = 0; j < i; j++) {
            const Aj = indexedVars[j];
            const newRhs = [];
            currentG[Ai].forEach(rhs => {
                const symbols = this.getSymbols(rhs);
                if (symbols[0] === Aj) {
                    const gamma = symbols.slice(1).join(' ');
                    currentG[Aj].forEach(ajRhs => {
                        newRhs.push(`${ajRhs}${gamma ? ' ' + gamma : ''}`);
                    });
                } else {
                    newRhs.push(rhs);
                }
            });
            currentG[Ai] = Array.from(new Set(newRhs));
        }
        
        // 3. Eliminate direct left recursion Ai -> Ai gamma
        const alphas = []; // parts with left recursion
        const betas = [];  // parts without
        currentG[Ai].forEach(rhs => {
            const symbols = this.getSymbols(rhs);
            if (symbols[0] === Ai) {
                alphas.push(symbols.slice(1).join(' '));
            } else {
                betas.push(rhs);
            }
        });

        if (alphas.length > 0) {
            const Zi = `Z_${i+1}`; // Subscripted Z
            const newAiRhs = [];
            const newZiRhs = [];
            
            betas.forEach(b => {
                newAiRhs.push(b);
                newAiRhs.push(`${b} ${Zi}`);
            });
            alphas.forEach(a => {
                newZiRhs.push(a);
                newZiRhs.push(`${a} ${Zi}`);
            });
            
            currentG[Ai] = Array.from(new Set(newAiRhs));
            currentG[Zi] = Array.from(new Set(newZiRhs));
            this.addSnapshot(`Left Recursion (${Ai})`, `Removed left recursion from ${Ai}, introduced ${Zi}.`, currentG);
        }
    }

    // 4. Backward Substitution
    for (let i = indexedVars.length - 2; i >= 0; i--) {
        const Ai = indexedVars[i];
        const newRhs = [];
        currentG[Ai].forEach(rhs => {
            const symbols = this.getSymbols(rhs);
            const first = symbols[0];
            if (indexedVars.includes(first) && indexedVars.indexOf(first) > i) {
                const gamma = symbols.slice(1).join(' ');
                currentG[first].forEach(fRhs => {
                    newRhs.push(`${fRhs}${gamma ? ' ' + gamma : ''}`);
                });
            } else {
                newRhs.push(rhs);
            }
        });
        currentG[Ai] = Array.from(new Set(newRhs));
    }
    this.addSnapshot("Backward Substitution", "Back-substituted productions to ensure every rule starts with a terminal.", currentG);

    // 5. Final Pass for Z variables
    Object.keys(currentG).forEach(v => {
        if (v.startsWith('Z_')) {
            const newRhs = [];
            currentG[v].forEach(rhs => {
                const symbols = this.getSymbols(rhs);
                const first = symbols[0];
                if (indexedVars.includes(first)) {
                    const gamma = symbols.slice(1).join(' ');
                    currentG[first].forEach(fRhs => {
                        newRhs.push(`${fRhs}${gamma ? ' ' + gamma : ''}`);
                    });
                } else {
                    newRhs.push(rhs);
                }
            });
            currentG[v] = Array.from(new Set(newRhs));
        }
    });

    this.addSnapshot("Greibach Normal Form", "Final GNF: Every production is A -> a α.", currentG);
    return { result: currentG, snapshots: this.snapshots };
  }

  generatePDA(gnf) {
    if (!gnf) return null;
    const vars = Object.keys(gnf);
    const terminals = new Set();
    const transitions = [];
    const startVar = vars[0] || 'S';

    transitions.push({
      from: 'q_{start}',
      input: 'ε',
      pop: 'Z_{0}',
      to: 'q_{loop}',
      push: `${startVar} Z_{0}`
    });

    for (const [lhs, rhsList] of Object.entries(gnf)) {
      for (const rhs of rhsList) {
        const symbols = this.getSymbols(rhs);
        const a = symbols[0];
        const alpha = symbols.slice(1).join(' ') || 'ε';
        
        if (this.isTerminal(a)) {
          terminals.add(a);
          transitions.push({
            from: 'q_{loop}',
            input: a,
            pop: lhs,
            to: 'q_{loop}',
            push: alpha
          });
        }
      }
    }

    transitions.push({
      from: 'q_{loop}',
      input: 'ε',
      pop: 'Z_{0}',
      to: 'q_{accept}',
      push: 'ε'
    });

    return {
      states: ['q_{start}', 'q_{loop}', 'q_{accept}'],
      alphabet: Array.from(terminals),
      stackAlphabet: [...vars, 'Z_{0}'],
      transitions,
      initialState: 'q_{start}',
      initialStack: 'Z_{0}',
      finalStates: ['q_{accept}']
    };
  }
  gnfVerify(gnf, text) {
    const startVar = Object.keys(gnf)[0];
    const memo = new Map();
    const check = (str, stack) => {
      const key = `${str}|${stack.join(',')}`;
      if (memo.has(key)) return memo.get(key);
      if (str === '' && stack.length === 0) return true;
      if (str === '' || stack.length === 0) return false;
      if (stack.length > str.length + 5) return false;
      const top = stack[0];
      const remainingStack = stack.slice(1);
      if (!this.isTerminal(top)) {
        const productions = gnf[top] || [];
        for (const rhs of productions) {
          const symbols = this.getSymbols(rhs);
          if (check(str, [...symbols, ...remainingStack])) {
            memo.set(key, true);
            return true;
          }
        }
      } else if (top === str[0]) {
        const res = check(str.slice(1), remainingStack);
        memo.set(key, res);
        return res;
      }
      memo.set(key, false);
      return false;
    };
    return { accepted: check(text, [startVar]), string: text };
  }
}
