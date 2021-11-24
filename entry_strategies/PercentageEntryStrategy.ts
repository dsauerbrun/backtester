import { EntryStrategy } from ".";
import { SymbolBar } from "../models";

  /*enteredPositions: SymbolBar[]
  currentPositions: SymbolBar[]
  endMoney: number
  endGain: number*/
export default class PercentageEntryStrategy extends EntryStrategy {
  constructor(protected percentagePositions = .05, protected stopLoss = .1, protected startMoney = 1000) {
    super(stopLoss, startMoney)
  }

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
    const dollarsToInvest = this.freeDollars * this.percentagePositions
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

    // check to see if our last position is the same symbol and within the last 30 days
    const lastPosition = this.currentPositions[this.currentPositions.length - 1]
    if (lastPosition?.bar.symbol === entry.symbol && entry.startBar.datetime.diff(lastPosition.bar.startBar.datetime, 'days') < 30) {
      return false
    }

    return true
  }

}