import { SymbolBar } from ".";
import { EntryStrategy } from "../entry_strategies";

export default class EntryPointCalculator {
  private entries: SymbolBar[] = []

  addEntry(entry: SymbolBar) {
    this.entries.push(entry)
  }

  addEntries(entries: SymbolBar[]) {
    this.entries.push(...entries)
  }

  runStrategy(strategy: EntryStrategy, startMoney = 1000) {
    const orderedPlays = this.entries.sort((a, b) => a.startBar.datetime.isAfter(b.startBar.datetime) ? 1 : -1)

    const output = strategy.execute(orderedPlays)

    console.log(output, 'is output')

    return output
  }

}


