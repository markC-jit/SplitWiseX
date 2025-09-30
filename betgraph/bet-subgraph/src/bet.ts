import {
  BetPlaced as BetPlacedEvent,
  BetResolved as BetResolvedEvent,
  FundsWithdrawn as FundsWithdrawnEvent,
  SubBetPlaced as SubBetPlacedEvent
} from "../generated/Bet/Bet"
import {
  BetPlaced,
  BetResolved,
  FundsWithdrawn,
  SubBetPlaced
} from "../generated/schema"

export function handleBetPlaced(event: BetPlacedEvent): void {
  let entity = new BetPlaced(
    event.transaction.hash.concatI32(event.logIndex.toI32())
  )
  entity.betId = event.params.betId
  entity.user = event.params.user
  entity.totalAmount = event.params.totalAmount
  entity.subBetCount = event.params.subBetCount
  entity.index = event.params.index

  entity.blockNumber = event.block.number
  entity.blockTimestamp = event.block.timestamp
  entity.transactionHash = event.transaction.hash

  entity.save()
}

export function handleBetResolved(event: BetResolvedEvent): void {
  let entity = new BetResolved(
    event.transaction.hash.concatI32(event.logIndex.toI32())
  )
  entity.betId = event.params.betId
  entity.status = event.params.status
  entity.payout = event.params.payout

  entity.blockNumber = event.block.number
  entity.blockTimestamp = event.block.timestamp
  entity.transactionHash = event.transaction.hash

  entity.save()
}

export function handleFundsWithdrawn(event: FundsWithdrawnEvent): void {
  let entity = new FundsWithdrawn(
    event.transaction.hash.concatI32(event.logIndex.toI32())
  )
  entity.user = event.params.user
  entity.amount = event.params.amount

  entity.blockNumber = event.block.number
  entity.blockTimestamp = event.block.timestamp
  entity.transactionHash = event.transaction.hash

  entity.save()
}

export function handleSubBetPlaced(event: SubBetPlacedEvent): void {
  let entity = new SubBetPlaced(
    event.transaction.hash.concatI32(event.logIndex.toI32())
  )
  entity.betId = event.params.betId
  entity.platform = event.params.platform
  entity.amount = event.params.amount
  entity.marketId = event.params.marketId
  entity.outcome = event.params.outcome

  entity.blockNumber = event.block.number
  entity.blockTimestamp = event.block.timestamp
  entity.transactionHash = event.transaction.hash

  entity.save()
}
