import { EntryStrategy } from ".";
import { SymbolBar } from "../models";

  /*enteredPositions: SymbolBar[]
  currentPositions: SymbolBar[]
  endMoney: number
  endGain: number*/
export default class AllInStrategy extends EntryStrategy {
  execute(entryBars: SymbolBar[]) {

    for (const play of entryBars) {
      this.exitCompletedPositions(play)

      this.enterPosition(play)
    }

    const endMoney = this.freeDollars + this.tiedUpDollars

    const firstDay = this.enteredPositions[0].bar.startBar.datetime
    const lastDay = this.enteredPositions[this.enteredPositions.length - 1].bar.endBar.datetime
    const daysInStrategy = lastDay.diff(firstDay, 'days')
    return {
      enteredPositions: this.enteredPositions,
      currentPositions: this.currentPositions,
      endMoney, endGain: endMoney / this.startMoney,
      daysInStrategy
    }
  }

  enterPosition(entry: SymbolBar) {
    const dollarsToInvest = this.freeDollars
    if(!this.canEnterPosition(entry, dollarsToInvest)) {
      return
    }

    this.freeDollars -= dollarsToInvest
    this.tiedUpDollars += dollarsToInvest

    const stopLossAmount = entry.startBar.open * (1 - this.stopLoss)
    const stopLossBar = entry.betweenBars.find(x => x.close < stopLossAmount)

    this.enteredPositions.push({bar: entry, dollars: dollarsToInvest, stopLossBar})
    this.currentPositions.push({bar: entry, dollars: dollarsToInvest, stopLossBar})
  }

  canEnterPosition(entry: SymbolBar, dollars: number): boolean {
    const superCheck = super.canEnterPosition(entry, dollars)
    if (!superCheck) {
      return false
    }

    if (this.currentPositions.length) {
      return false
    }

    return true
  }

}