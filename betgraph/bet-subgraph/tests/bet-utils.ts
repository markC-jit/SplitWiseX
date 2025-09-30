import { newMockEvent } from "matchstick-as"
import { ethereum, BigInt, Address } from "@graphprotocol/graph-ts"
import {
  BetPlaced,
  BetResolved,
  FundsWithdrawn,
  SubBetPlaced
} from "../generated/Bet/Bet"

export function createBetPlacedEvent(
  betId: BigInt,
  user: Address,
  totalAmount: BigInt,
  subBetCount: BigInt,
  index: BigInt
): BetPlaced {
  let betPlacedEvent = changetype<BetPlaced>(newMockEvent())

  betPlacedEvent.parameters = new Array()

  betPlacedEvent.parameters.push(
    new ethereum.EventParam("betId", ethereum.Value.fromUnsignedBigInt(betId))
  )
  betPlacedEvent.parameters.push(
    new ethereum.EventParam("user", ethereum.Value.fromAddress(user))
  )
  betPlacedEvent.parameters.push(
    new ethereum.EventParam(
      "totalAmount",
      ethereum.Value.fromUnsignedBigInt(totalAmount)
    )
  )
  betPlacedEvent.parameters.push(
    new ethereum.EventParam(
      "subBetCount",
      ethereum.Value.fromUnsignedBigInt(subBetCount)
    )
  )
  betPlacedEvent.parameters.push(
    new ethereum.EventParam("index", ethereum.Value.fromUnsignedBigInt(index))
  )

  return betPlacedEvent
}

export function createBetResolvedEvent(
  betId: BigInt,
  status: i32,
  payout: BigInt
): BetResolved {
  let betResolvedEvent = changetype<BetResolved>(newMockEvent())

  betResolvedEvent.parameters = new Array()

  betResolvedEvent.parameters.push(
    new ethereum.EventParam("betId", ethereum.Value.fromUnsignedBigInt(betId))
  )
  betResolvedEvent.parameters.push(
    new ethereum.EventParam(
      "status",
      ethereum.Value.fromUnsignedBigInt(BigInt.fromI32(status))
    )
  )
  betResolvedEvent.parameters.push(
    new ethereum.EventParam("payout", ethereum.Value.fromUnsignedBigInt(payout))
  )

  return betResolvedEvent
}

export function createFundsWithdrawnEvent(
  user: Address,
  amount: BigInt
): FundsWithdrawn {
  let fundsWithdrawnEvent = changetype<FundsWithdrawn>(newMockEvent())

  fundsWithdrawnEvent.parameters = new Array()

  fundsWithdrawnEvent.parameters.push(
    new ethereum.EventParam("user", ethereum.Value.fromAddress(user))
  )
  fundsWithdrawnEvent.parameters.push(
    new ethereum.EventParam("amount", ethereum.Value.fromUnsignedBigInt(amount))
  )

  return fundsWithdrawnEvent
}

export function createSubBetPlacedEvent(
  betId: BigInt,
  platform: string,
  amount: BigInt,
  marketId: string,
  outcome: i32
): SubBetPlaced {
  let subBetPlacedEvent = changetype<SubBetPlaced>(newMockEvent())

  subBetPlacedEvent.parameters = new Array()

  subBetPlacedEvent.parameters.push(
    new ethereum.EventParam("betId", ethereum.Value.fromUnsignedBigInt(betId))
  )
  subBetPlacedEvent.parameters.push(
    new ethereum.EventParam("platform", ethereum.Value.fromString(platform))
  )
  subBetPlacedEvent.parameters.push(
    new ethereum.EventParam("amount", ethereum.Value.fromUnsignedBigInt(amount))
  )
  subBetPlacedEvent.parameters.push(
    new ethereum.EventParam("marketId", ethereum.Value.fromString(marketId))
  )
  subBetPlacedEvent.parameters.push(
    new ethereum.EventParam(
      "outcome",
      ethereum.Value.fromUnsignedBigInt(BigInt.fromI32(outcome))
    )
  )

  return subBetPlacedEvent
}
