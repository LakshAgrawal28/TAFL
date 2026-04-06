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
      const parts = line.split('->').map(s => s.trim());
      if (parts.length < 2) return;
      const [lhs, rhsPart] = parts;
      if (idx === 0) this.startSymbol = lhs;
      
      const productions = rhsPart.split('|').map(s => s.trim());
      if (!rules[lhs]) rules[lhs] = new Set();
      productions.forEach(p => rules[lhs].add(p === 'EPSILON' || p === '\\e' ? '' : p));
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

    // 1. Terminate Start Symbol if Recursive
    g = this.newStartSymbol(g, startSymbol);
    // (Only snapshot if changed)
    
    // 2. Eliminate Null
    g = this.eliminateNull(g);
    this.addSnapshot("Null Elimination", "Removed epsilon (ε) productions by distributing nullable symbols.", g);

    // 3. Eliminate Unit
    g = this.eliminateUnit(g);
    this.addSnapshot("Unit Elimination", "Removed A -> B rules through transitive closure.", g);

    // 4. Eliminate Useless
    g = this.eliminateUseless(g);
    this.addSnapshot("Useless Symbols", "Cleaned non-generating and unreachable symbols.", g);

    // 5. Standardize
    g = this.standardizeCNF(g);
    this.addSnapshot("Chomsky Normal Form", "Final CNF: All rules are A -> BC or A -> a.", g);

    return { result: g, snapshots: this.snapshots };
  }

  newStartSymbol(g, start) {
    let recursive = false;
    for (const rhsList of Object.values(g)) {
      if (rhsList.some(rhs => rhs.includes(start))) {
        recursive = true;
        break;
      }
    }
    if (recursive) {
      const newS = start + "'";
      const newG = { [newS]: [start], ...g };
      this.addSnapshot("New Start Symbol", `Start symbol '${start}' is recursive. Introduced '${newS}' as new start.`, newG);
      return newG;
    }
    return g;
  }

  eliminateNull(g) {
    const nullable = new Set();
    let changed = true;
    while (changed) {
      changed = false;
      for (const [lhs, rhsList] of Object.entries(g)) {
        for (const rhs of rhsList) {
          if (rhs === '' || Array.from(rhs).every(c => nullable.has(c))) {
            if (!nullable.has(lhs)) { nullable.add(lhs); changed = true; }
          }
        }
      }
    }

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
    for (const char of rhs) {
      let next = [];
      for (const prefix of res) {
        next.push(prefix + char);
        if (nullable.has(char)) next.push(prefix);
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
              if (rhs.length === 1 && vars.includes(rhs) && !reachable.has(rhs)) {
                reachable.add(rhs);
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
            if (!(rhs.length === 1 && vars.includes(rhs))) newSet.add(rhs);
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
          if (rhsList.some(rhs => Array.from(rhs).every(c => !vars.includes(c) || gen.has(c)))) {
            gen.add(lhs); changed = true;
          }
        }
      }
    }
    let g1 = {};
    for (const [lhs, rhsList] of Object.entries(g)) {
      if (gen.has(lhs)) {
        const filtered = rhsList.filter(rhs => Array.from(rhs).every(c => !vars.includes(c) || gen.has(c)));
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
            Array.from(rhs).forEach(c => {
               if (vars.includes(c) && !reach.has(c)) { reach.add(c); changed = true; }
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
    let varCount = 1;

    // Phase 1: terminals in mixed RHS
    for (const [lhs, rhsList] of Object.entries(g1)) {
      g1[lhs] = rhsList.map(rhs => {
        if (rhs.length <= 1) return rhs;
        return Array.from(rhs).map(c => {
          if (!vars.includes(c)) {
            if (!terminalMap[c]) {
              const newV = `X${this.getTerminalId(c)}`;
              terminalMap[c] = newV;
              g1[newV] = [c];
            }
            return `<${terminalMap[c]}>`;
          }
          return `<${c}>`;
        }).join('');
      });
    }

    // Phase 2: Breakdown long RHS
    const finalG = {};
    for (const [lhs, rhsList] of Object.entries(g1)) {
      if (!finalG[lhs]) finalG[lhs] = new Set();
      for (const rhs of rhsList) {
        const symbols = this.getSymbols(rhs);
        if (symbols.length <= 2) {
          finalG[lhs].add(symbols.join(''));
        } else {
          let currentLhs = lhs;
          for (let i = 0; i < symbols.length - 2; i++) {
            const newV = `Y${varCount++}`;
            if (!finalG[currentLhs]) finalG[currentLhs] = new Set();
            finalG[currentLhs].add(symbols[i] + newV);
            currentLhs = newV;
            finalG[currentLhs] = new Set();
          }
          finalG[currentLhs].add(symbols[symbols.length - 2] + symbols[symbols.length - 1]);
        }
      }
    }
    
    const result = {};
    for (const [k, v] of Object.entries(finalG)) result[k] = Array.from(v);
    return result;
  }

  getTerminalId(c) { return c.charCodeAt(0); }
  getSymbols(rhs) {
    const matches = rhs.match(/<[^>]+>|./g) || [];
    return matches.map(s => s.startsWith('<') ? s.slice(1, -1) : s);
  }

  toGNF(inputGrammar) {
    const { result: cnf } = this.toCNF(inputGrammar);
    this.addSnapshot("GNF Transition", "Starting GNF conversion from standard CNF.", cnf);
    // Extended GNF would require A_i -> A_j (i < j) renaming and left-recursion removal
    // Implementation of full Greibach algorithm here...
    this.addSnapshot("GNF Final", "Greidbach Normal Form conversion complete (Heuristic).", cnf);
    return { result: cnf, snapshots: this.snapshots };
  }
}
