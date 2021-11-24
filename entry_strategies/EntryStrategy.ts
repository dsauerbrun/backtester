import { Aggregate, SymbolBar } from "../models";

interface StrategyOutput {
  enteredPositions: Position[]
  currentPositions: Position[]
  endMoney: number
  endGain: number
  daysInStrategy: number
}

interface Position {
  bar: SymbolBar
  dollars: number
  stopLossBar?: Aggregate
}

export default abstract class EntryStrategy {
  protected enteredPositions: Position[] = []
  protected currentPositions: Position[] = []
  protected freeDollars: number
  protected tiedUpDollars: number = 0

  constructor(protected stopLoss = .1, protected startMoney = 1000) {
    this.freeDollars = startMoney
  }

  abstract execute(entryBars: SymbolBar[]): StrategyOutput

  exitCompletedPositions(position: SymbolBar) {
    const completedPositions = this.currentPositions.filter(x => x.bar.endBar.datetime.isBefore(position.startBar.datetime)).sort((a, b) => a.bar.endBar.datetime.isBefore(b.bar.endBar.datetime) ? -1 : 1)

    completedPositions.forEach(completedPosition => {
      this.tiedUpDollars -= completedPosition.dollars
      this.freeDollars += completedPosition.dollars * completedPosition.bar.gain

      const currentPositionsIndex = this.currentPositions.indexOf(completedPosition)
      this.currentPositions.splice(currentPositionsIndex, 1)
    })
  }

  abstract enterPosition(entry: SymbolBar): void

  canEnterPosition(entry: SymbolBar, dollars: number): boolean {
    if (this.freeDollars < dollars) {
      return false
    }

    return true
  }

}